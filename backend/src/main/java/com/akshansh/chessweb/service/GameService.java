package com.akshansh.chessweb.service;

import com.akshansh.chessweb.exception.GameNotActiveException;
import com.akshansh.chessweb.exception.PlayerNotInGameException;
import com.akshansh.chessweb.model.dto.*;
import com.akshansh.chessweb.model.entity.*;
import com.akshansh.chessweb.model.enums.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicLong;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameService {

    private final GameStore gameStore;
    private final MoveValidatorService moveValidator;
    private final GamePersistenceService gamePersistenceService;

    public GameSession processMove(MoveRequest request, UserPrincipal currentUser){

        GameSession snapshot = gameStore.withGameLock(request.getGameId(), session -> {

            long elapsedMs = Duration.between(session.getTurnStartedAt(), Instant.now()).toMillis();

            long newTimeRemainingMs = request.getColor() == Color.WHITE ?
                        session.getWhiteTimeRemainingMs() - elapsedMs + session.getIncrementMs()
                        : session.getBlackTimeRemainingMs() - elapsedMs + session.getIncrementMs();

            // Check whether requester is part of the game
            if(!currentUser.getUserId().equals(session.getWhitePlayerId()) && !currentUser.getUserId().equals(session.getBlackPlayerId())){
                throw new PlayerNotInGameException("Player " + currentUser.getUsername() + " is not part of the game " + session.getId().toString().substring(0,5));
            }

            if(session.getStatus() != GameStatus.ACTIVE){
                throw new GameNotActiveException("This game is not in active state");
            }

            // Validate the move using chess rules
            MoveResult result = moveValidator.validate(session, request, currentUser.getUserId());
            if (!result.isValid()) {
                return session; // invalid move
            }

            PieceType promotionPiece = null;
            if (request.getMove().getPromotionPiece() != null && !request.getMove().getPromotionPiece().isBlank()) {
                try {
                    promotionPiece = PieceType.valueOf(request.getMove().getPromotionPiece().toUpperCase());
                } catch (IllegalArgumentException e) {
                    log.error("event=pawnPromotionFailed userId={}", MDC.get("userId"));
                }
            }

            MoveDto moveDto = MoveDto.builder()
                    .moveNumber(session.getMoveDtoHistory().size() / 2 + 1)
                    .color(request.getColor())
                    .fromSquare(request.getMove().getFrom())
                    .toSquare(request.getMove().getTo())
                    .piece(request.getMove().getPiece())
                    .promotionPiece(promotionPiece)
                    .sanNotation(result.getSan())
                    .fenAfter(result.getNewFen())
                    .isCheck(result.isCheck())
                    .isCheckmate(result.isCheckmate())
                    .isCastling(result.isCastling())
                    .isCapture(result.isCapture())
                    .playedAt(Instant.now())
                    .build();

            session.getMoveDtoHistory().add(moveDto);
            session.setCurrentFen(result.getNewFen());
            session.setCurrentTurn(request.getColor().equals(Color.WHITE) ? Color.BLACK : Color.WHITE);
            session.setDrawOfferBy(null); // Any move declines the draw offer

            // Check if game over
            if (result.isCheckmate() || result.isStalemate() || result.isInsufficientMaterial() || result.isRepetition() || newTimeRemainingMs <= 0) {
                GameTerminationReason terminationReason = getTerminationReason(result, newTimeRemainingMs);

                session.setStatus(GameStatus.ENDED);
                session.setTerminationReason(terminationReason);

                if (newTimeRemainingMs <= 0) {
                    session.setResult(request.getColor() == Color.WHITE ? GameResult.BLACK_WON : GameResult.WHITE_WON);
                } else {
                    session.setResult(result.isCheckmate() ? request.getColor() == Color.WHITE ? GameResult.WHITE_WON : GameResult.BLACK_WON : GameResult.DRAW);
                }
            }

            // set new time remaining and turn started at
            if (request.getColor() == Color.WHITE) {
                session.setWhiteTimeRemainingMs(newTimeRemainingMs);
            } else {
                session.setBlackTimeRemainingMs(newTimeRemainingMs);
            }
            session.setTurnStartedAt(Instant.now());

            return session;
        });

        // save in db if game ended
        if (snapshot.getStatus() == GameStatus.ENDED) {
            int[] eloResults = gamePersistenceService.persist(snapshot);
            snapshot.setWhitePlayerNewElo(eloResults[0]);
            snapshot.setBlackPlayerNewElo(eloResults[1]);
            gameStore.remove(snapshot.getId().toString());
        }

        return snapshot;
    }

    public GameSession processResignation(ResignRequest request, UserPrincipal currentUser){
        GameSession snapshot = gameStore.withGameLock(request.getGameId(), session -> {
            // Check whether requester is part of the game
            if(!currentUser.getUserId().equals(session.getWhitePlayerId()) && !currentUser.getUserId().equals(session.getBlackPlayerId())){
                throw new PlayerNotInGameException("Player " + request.getPlayerName() + " is not part of the game " + session.getId().toString().substring(0,5));
            }

            session.setStatus(GameStatus.ENDED);
            session.setTerminationReason(GameTerminationReason.RESIGNATION);

            if(currentUser.getUserId().equals(session.getWhitePlayerId())){
                session.setResult(GameResult.BLACK_WON);
            } else if (currentUser.getUserId().equals(session.getBlackPlayerId())){
                session.setResult(GameResult.WHITE_WON);
            }

            return session;
        });

        // save the game session
        int[] eloResults = gamePersistenceService.persist(snapshot);
        snapshot.setWhitePlayerNewElo(eloResults[0]);
        snapshot.setBlackPlayerNewElo(eloResults[1]);

        gameStore.remove(snapshot.getId().toString());

        return snapshot;
    }

    public GameSession processDrawOffer(@Valid DrawOfferRequest request, UserPrincipal currentUser) {
        return gameStore.withGameLock(request.getGameId(), session -> {

            // Check whether requester is part of the game
            if(!currentUser.getUserId().equals(session.getWhitePlayerId()) && !currentUser.getUserId().equals(session.getBlackPlayerId())){
                throw new PlayerNotInGameException("Player " + request.getPlayerName() + " is not part of the game " + session.getId().toString().substring(0,5));
            }

            session.setDrawOfferBy(currentUser.getUserId());

            return session;
        });
    }

    public GameSession processDrawAccepted(
            @Valid DrawOfferAcceptRequest request,
            UserPrincipal currentUser
    ) {
        GameSession snapshot = gameStore.withGameLock(request.getGameId(), session -> {
            // Check whether requester is part of the game
            if(!currentUser.getUserId().equals(session.getWhitePlayerId()) && !currentUser.getUserId().equals(session.getBlackPlayerId())){
                throw new PlayerNotInGameException("Player " + currentUser.getUsername() + " is not part of the game " + session.getId().toString().substring(0,5));
            }

            session.setStatus(GameStatus.ENDED);
            session.setResult(GameResult.DRAW);
            session.setTerminationReason(GameTerminationReason.DRAW_ACCEPTED);
            session.setDrawOfferBy(null);
            return session;
        });

        // save the game session
        int[] eloResults = gamePersistenceService.persist(snapshot);
        snapshot.setWhitePlayerNewElo(eloResults[0]);
        snapshot.setBlackPlayerNewElo(eloResults[1]);

        gameStore.remove(snapshot.getId().toString());

        return snapshot;
    }

    public GameSession processDrawDeclined(
            @Valid DrawOfferAcceptRequest request,
            UserPrincipal currentUser
    ) {
        return gameStore.withGameLock(request.getGameId(), session -> {
            // Check whether requester is part of the game
            if(!currentUser.getUserId().equals(session.getWhitePlayerId()) && !currentUser.getUserId().equals(session.getBlackPlayerId())){
                throw new PlayerNotInGameException("Player " + currentUser.getUsername() + " is not part of the game " + session.getId().toString().substring(0,5));
            }

            session.setDrawOfferBy(null);
            return session;
        });
    }

    private static @NonNull GameTerminationReason getTerminationReason(
            MoveResult result, long newTimeRemainingMs
    ) {
        GameTerminationReason terminationReason = GameTerminationReason.CHECKMATE;

        if(result.isInsufficientMaterial()){
            terminationReason = GameTerminationReason.INSUFFICIENT_MATERIAL;
        } else if (result.isStalemate()) {
            terminationReason = GameTerminationReason.STALEMATE;
        } else if (result.isRepetition()){
            terminationReason = GameTerminationReason.REPETITION;
        } else if (newTimeRemainingMs <= 0) {
            terminationReason = GameTerminationReason.TIMEOUT;
        }
        return terminationReason;
    }
}
