package com.akshansh.chessweb.service;

import com.akshansh.chessweb.exception.ResourceNotFoundException;
import com.akshansh.chessweb.model.dto.GameDto;
import com.akshansh.chessweb.model.entity.*;
import com.akshansh.chessweb.model.enums.Color;
import com.akshansh.chessweb.model.enums.GameResult;
import com.akshansh.chessweb.repository.GameRepository;
import com.akshansh.chessweb.repository.MoveRepository;
import com.akshansh.chessweb.repository.UserRepository;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import static com.akshansh.chessweb.utils.UserUtil.getCurrentUser;

@Slf4j
@Service
@RequiredArgsConstructor
public class GamePersistenceService {

    private static final DateTimeFormatter PGN_DATE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy.MM.dd").withZone(ZoneOffset.UTC);
    private static final int K_VALUE = 15;

    private final GameRepository gameRepo;
    private final MoveRepository moveRepo;
    private final UserRepository userRepo;

    @Transactional
    public int[] persist(GameSession session){
        List<MoveDto> moveDtos = session.getMoveDtoHistory() == null
                ? Collections.emptyList()
                : session.getMoveDtoHistory();

        User whitePlayer = userRepo.findById(session.getWhitePlayerId())
                .orElseThrow(() -> new ResourceNotFoundException("White player user not found"));
        User blackPlayer = session.getBlackPlayerId() == null
                ? null
                : userRepo.findById(session.getBlackPlayerId())
                        .orElseThrow(() -> new ResourceNotFoundException("Black player user not found"));

        Game game = Game.builder()
                .id(session.getId())
                .whitePlayer(whitePlayer)
                .blackPlayer(blackPlayer)
                .status(session.getStatus())
                .result(session.getResult())
                .terminationReason(session.getTerminationReason())
                .pgn(buildPgn(session))
                .finalFen(session.getCurrentFen())
                .totalMoves(moveDtos.size())
                .startedAt(session.getStartedAt())
                .endedAt(Instant.now())
                .build();

        // save the game
        gameRepo.save(game);

        // set old elo ratings on session before calculation
        session.setWhitePlayerOldElo(whitePlayer.getEloRating());
        if (blackPlayer != null) {
            session.setBlackPlayerOldElo(blackPlayer.getEloRating());
        }

        // calculate new elo for players
        int[] results = calculate2PlayerElo(
                whitePlayer.getEloRating(),
                blackPlayer.getEloRating(),
                session.getResult());
        whitePlayer.setEloRating(results[0]);
        blackPlayer.setEloRating(results[1]);

        // save elo ratings
        userRepo.saveAll(List.of(whitePlayer, blackPlayer));

        // save moves
        moveRepo.saveAll(moveDtos.stream()
                .filter(Objects::nonNull)
                .map(moveDto -> copyMoveRecordForPersistence(moveDto, game))
                .toList());

        log.info("event=gameSaved userId={} gameId={}", MDC.get("userId"), game.getId());
        return results;
    }

    @Transactional
    public Page<GameDto> getAllGamesForUser(int pageNo, int pageSize){
        UUID currentUserId = getCurrentUser().getUserId();

        Pageable pageable = PageRequest.of(pageNo, pageSize);

        Page<GameDto> result = gameRepo.getGamesByWhitePlayerOrBlackPlayer(pageable, currentUserId);

        log.info("event=fetchedAllGamesForUser userId={} page={} size={} gamesCount={} totalPages={}",
                MDC.get("userId"),
                pageNo, pageSize, result.getTotalElements(), result.getTotalPages()
        );
        return result;
    }

    private MoveRecord copyMoveRecordForPersistence(MoveDto moveDto, Game game) {
        return MoveRecord.builder()
                .gameId(game)
                .moveNumber(moveDto.getMoveNumber())
                .color(moveDto.getColor())
                .fromSquare(moveDto.getFromSquare())
                .toSquare(moveDto.getToSquare())
                .piece(moveDto.getPiece())
                .promotionPiece(moveDto.getPromotionPiece())
                .isCapture(moveDto.isCapture())
                .isCheck(moveDto.isCheck())
                .isCheckmate(moveDto.isCheckmate())
                .isCastling(moveDto.isCastling())
                .sanNotation(moveDto.getSanNotation())
                .fenAfter(moveDto.getFenAfter())
                .playedAt(moveDto.getPlayedAt())
                .build();
    }

    private String buildPgn(GameSession session) {
        String result = toPgnResult(session.getResult());
        StringBuilder pgn = new StringBuilder()
                .append(tag("Event", "Chess Web Game"))
                .append(tag("Site", "Chess Web"))
                .append(tag("Date", formatPgnDate(session.getStartedAt())))
                .append(tag("Round", "-"))
                .append(tag("White", session.getWhitePlayerName()))
                .append(tag("Black", session.getBlackPlayerName()))
                .append(tag("Result", result));

        if (session.getTerminationReason() != null) {
            pgn.append(tag("Termination", session.getTerminationReason().name()));
        }

        String movetext = buildMovetext(session.getMoveDtoHistory(), result);
        return pgn.append('\n')
                .append(movetext)
                .toString();
    }

    private String buildMovetext(@NonNull List<MoveDto> moveDtos, String result) {
        StringBuilder movetext = new StringBuilder();

        int currentMoveNumber = -1;

        List<MoveDto> orderedMoveDtos = moveDtos.stream()
                .filter(Objects::nonNull)
                .sorted(Comparator
                        .comparingInt(MoveDto::getMoveNumber)
                        .thenComparing(moveDto -> moveDto.getColor() == Color.WHITE ? 0 : 1))
                .toList();

        for (MoveDto moveDto : orderedMoveDtos) {
            if (moveDto.getSanNotation() == null || moveDto.getSanNotation().isBlank()) {
                continue;
            }

            if (moveDto.getColor() == Color.WHITE) {
                if (!movetext.isEmpty()) {
                    movetext.append(' ');
                }
                movetext.append(moveDto.getMoveNumber())
                        .append(". ")
                        .append(moveDto.getSanNotation());
                currentMoveNumber = moveDto.getMoveNumber();
                continue;
            }

            if (!movetext.isEmpty()) {
                movetext.append(' ');
            }
            if (currentMoveNumber != moveDto.getMoveNumber()) {
                movetext.append(moveDto.getMoveNumber()).append("... ");
            }
            movetext.append(moveDto.getSanNotation());
            currentMoveNumber = moveDto.getMoveNumber();
        }

        if (!movetext.isEmpty()) {
            movetext.append(' ');
        }
        return movetext.append(result).toString();
    }

    private String tag(String name, String value) {
        return "[" + name + " \"" + escapeTagValue(value) + "\"]\n";
    }

    private String escapeTagValue(String value) {
        String safeValue = value == null || value.isBlank() ? "?" : value;
        return safeValue.replace("\\", "\\\\")
                .replace("\"", "\\\"");
    }

    private String formatPgnDate(Instant startedAt) {
        return startedAt == null ? "????.??.??" : PGN_DATE_FORMATTER.format(startedAt);
    }

    private String toPgnResult(GameResult result) {
        if (result == null) {
            return "*";
        }

        return switch (result) {
            case WHITE_WON -> "1-0";
            case BLACK_WON -> "0-1";
            case DRAW -> "1/2-1/2";
        };
    }

    private static int[] calculate2PlayerElo(double rating1, double rating2, GameResult result) {

        double outcome;

        if(result == GameResult.WHITE_WON) outcome = 1.0;
        else if (result == GameResult.BLACK_WON) outcome = 0.0;
        else outcome = 0.5;

        // expected score for Player 1
        // E1 = 1 / (1 + 10^((R2 - R1) / 400))
        double expected1 = 1.0 / (1.0 + Math.pow(10, (rating2 - rating1) / 400.0));

        // expected score for Player 2
        double expected2 = 1.0 / (1.0 + Math.pow(10, (rating1 - rating2) / 400.0));

        // Actual score for Player 2
        double actual2 = 1 - outcome;

        // NewRating = OldRating + K * (Actual - Expected)
        double newRating1 = rating1 + K_VALUE * (outcome - expected1);
        double newRating2 = rating2 + K_VALUE * (actual2 - expected2);

        return new int[]{(int) Math.round(newRating1), (int) Math.round(newRating2)};
    }
}
