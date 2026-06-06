package com.akshansh.chessweb.service;

import com.akshansh.chessweb.exception.GameNotFoundException;
import com.akshansh.chessweb.exception.PlayerNotInGameException;
import com.akshansh.chessweb.model.dto.*;
import com.akshansh.chessweb.model.entity.*;
import com.akshansh.chessweb.model.enums.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

import static com.akshansh.chessweb.utils.UserUtil.getCurrentUser;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameService {

    private final GameStore gameStore;
    private final MoveValidatorService moveValidator;
    private final GamePersistenceService gamePersistenceService;

    @Transactional
    public GameSession processMove(MoveRequest request){
        UserPrincipal currentUser = getCurrentUser();

        GameSession session = gameStore.findById(request.getGameId())
                .orElseThrow(() -> new GameNotFoundException(request.getGameId()));

        // Check whether requester is part of the game
        if(!currentUser.getUserId().equals(session.getWhitePlayerId()) && !currentUser.getUserId().equals(session.getBlackPlayerId())){
            throw new PlayerNotInGameException("Player " + currentUser.getUsername() + " is not part of the game " + session.getId().toString().substring(0,5));
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
        if (result.isCheckmate() || result.isStalemate() || result.isInsufficientMaterial() || result.isRepetition()) {
            GameTerminationReason terminationReason = GameTerminationReason.CHECKMATE;

            if(result.isInsufficientMaterial()){
                terminationReason = GameTerminationReason.INSUFFICIENT_MATERIAL;
            } else if (result.isStalemate()) {
                terminationReason = GameTerminationReason.STALEMATE;
            } else if (result.isRepetition()){
                terminationReason = GameTerminationReason.REPETITION;
            }

            session.setStatus(GameStatus.ENDED);
            session.setResult(result.isCheckmate() ? request.getColor() == Color.WHITE ? GameResult.WHITE_WON : GameResult.BLACK_WON : GameResult.DRAW);
            session.setTerminationReason(terminationReason);

            // save the game session
            gamePersistenceService.persist(session);

            // Free memory from game store
            gameStore.remove(session.getId().toString());
        }

        return session;
    }

    @Transactional
    public GameSession processResignation(ResignRequest request){
        UserPrincipal currentUser = getCurrentUser();

        GameSession session = gameStore.findById(request.getGameId())
                .orElseThrow(() -> new GameNotFoundException(request.getGameId()));

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

        // save the game session
        gamePersistenceService.persist(session);

        gameStore.remove(session.getId().toString());

        return session;
    }

    public GameSession processDrawOffer(@Valid DrawOfferRequest request) {
        UserPrincipal currentUser = getCurrentUser();

        GameSession session = gameStore.findById(request.getGameId())
                .orElseThrow(() -> new GameNotFoundException(request.getGameId()));

        // Check whether requester is part of the game
        if(!currentUser.getUserId().equals(session.getWhitePlayerId()) && !currentUser.getUserId().equals(session.getBlackPlayerId())){
            throw new PlayerNotInGameException("Player " + request.getPlayerName() + " is not part of the game " + session.getId().toString().substring(0,5));
        }

        session.setDrawOfferBy(currentUser.getUserId());

        return session;
    }

    @Transactional
    public GameSession processDrawAccepted(@Valid DrawOfferAcceptRequest request) {
        UserPrincipal currentUser = getCurrentUser();

        GameSession session = gameStore.findById(request.getGameId())
                .orElseThrow(() -> new GameNotFoundException(request.getGameId()));

        // Check whether requester is part of the game
        if(!currentUser.getUserId().equals(session.getWhitePlayerId()) && !currentUser.getUserId().equals(session.getBlackPlayerId())){
            throw new PlayerNotInGameException("Player " + currentUser.getUsername() + " is not part of the game " + session.getId().toString().substring(0,5));
        }

        session.setStatus(GameStatus.ENDED);
        session.setResult(GameResult.DRAW);
        session.setTerminationReason(GameTerminationReason.DRAW_ACCEPTED);
        session.setDrawOfferBy(null);

        // save the game session
        gamePersistenceService.persist(session);

        gameStore.remove(session.getId().toString());

        return session;
    }

    public GameSession processDrawDeclined(@Valid DrawOfferAcceptRequest request) {
        UserPrincipal currentUser = getCurrentUser();

        GameSession session = gameStore.findById(request.getGameId())
                .orElseThrow(() -> new GameNotFoundException(request.getGameId()));

        // Check whether requester is part of the game
        if(!currentUser.getUserId().equals(session.getWhitePlayerId()) && !currentUser.getUserId().equals(session.getBlackPlayerId())){
            throw new PlayerNotInGameException("Player " + currentUser.getUsername() + " is not part of the game " + session.getId().toString().substring(0,5));
        }

        session.setDrawOfferBy(null);
        return session;
    }
}
