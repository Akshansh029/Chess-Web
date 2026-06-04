package com.akshansh.chessweb.service;

import com.akshansh.chessweb.exception.ResourceNotFoundException;
import com.akshansh.chessweb.model.dto.GameDto;
import com.akshansh.chessweb.model.entity.Game;
import com.akshansh.chessweb.model.entity.GameSession;
import com.akshansh.chessweb.model.entity.MoveRecord;
import com.akshansh.chessweb.model.entity.User;
import com.akshansh.chessweb.model.enums.Color;
import com.akshansh.chessweb.model.enums.GameResult;
import com.akshansh.chessweb.repository.GameRepository;
import com.akshansh.chessweb.repository.MoveRepository;
import com.akshansh.chessweb.repository.UserRepository;
import jakarta.validation.constraints.NotBlank;
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

    private final GameRepository gameRepo;
    private final MoveRepository moveRepo;
    private final UserRepository userRepo;

    @Transactional
    public void persist(GameSession session){

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
                .totalMoves(session.getMoveRecordHistory().size())
                .startedAt(session.getStartedAt())
                .endedAt(Instant.now())
                .moveRecordList(session.getMoveRecordHistory())
                .build();

        if (session.getMoveRecordHistory() != null) {
            session.getMoveRecordHistory().forEach(move -> move.setGameId(game));
        }

        // save the game
        gameRepo.save(game);

        // save moves
        moveRepo.saveAll(session.getMoveRecordHistory());
        log.info("event=gameSaved userId={} gameId={}", MDC.get("userId"), game.getId());
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

        String movetext = buildMovetext(session.getMoveRecordHistory(), result);
        return pgn.append('\n')
                .append(movetext)
                .toString();
    }

    private String buildMovetext(@NonNull List<MoveRecord> moves, String result) {
        StringBuilder movetext = new StringBuilder();

        int currentMoveNumber = -1;

        List<MoveRecord> orderedMoves = moves.stream()
                .filter(Objects::nonNull)
                .sorted(Comparator
                        .comparingInt(MoveRecord::getMoveNumber)
                        .thenComparing(move -> move.getColor() == Color.WHITE ? 0 : 1))
                .toList();

        for (MoveRecord move : orderedMoves) {
            if (move.getSanNotation() == null || move.getSanNotation().isBlank()) {
                continue;
            }

            if (move.getColor() == Color.WHITE) {
                if (!movetext.isEmpty()) {
                    movetext.append(' ');
                }
                movetext.append(move.getMoveNumber())
                        .append(". ")
                        .append(move.getSanNotation());
                currentMoveNumber = move.getMoveNumber();
                continue;
            }

            if (!movetext.isEmpty()) {
                movetext.append(' ');
            }
            if (currentMoveNumber != move.getMoveNumber()) {
                movetext.append(move.getMoveNumber()).append("... ");
            }
            movetext.append(move.getSanNotation());
            currentMoveNumber = move.getMoveNumber();
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
}
