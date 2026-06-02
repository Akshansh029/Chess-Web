package com.akshansh.chessweb.service;

import com.akshansh.chessweb.model.entity.Game;
import com.akshansh.chessweb.model.entity.GameSession;
import com.akshansh.chessweb.model.entity.MoveRecord;
import com.akshansh.chessweb.model.entity.User;
import com.akshansh.chessweb.model.enums.Color;
import com.akshansh.chessweb.repository.GameRepository;
import com.akshansh.chessweb.repository.MoveRepository;
import com.akshansh.chessweb.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GamePersistenceService {

    private final GameRepository gameRepo;
    private final MoveRepository moveRepo;
    private final UserRepository userRepo;

    @Transactional
    public void persist(GameSession session){

        User whitePlayer = findOrCreateGuestUser(session.getWhitePlayerId(), session.getWhitePlayerName());
        User blackPlayer = session.getBlackPlayerId() == null
                ? null
                : findOrCreateGuestUser(session.getBlackPlayerId(), session.getBlackPlayerName());

        Game game = Game.builder()
                .id(session.getId())
                .whitePlayer(whitePlayer)
                .blackPlayer(blackPlayer)
                .status(session.getStatus())
                .result(session.getResult())
                .terminationReason(session.getTerminationReason())
                .pgn(buildPgn(session.getMoveRecordHistory()))
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
    }

    private User findOrCreateGuestUser(UUID playerId, String playerName) {
        return userRepo.findById(playerId)
                .orElseGet(() -> {
                    String guestEmail = "guest_" + compactId(playerId) + "@local.test";
                    return userRepo.findByEmail(guestEmail)
                            .orElseGet(() -> userRepo.save(User.builder()
                        .username(buildGuestUsername(playerId, playerName))
                        .email(guestEmail)
                        .passwordHash("GUEST_USER_NO_PASSWORD")
                        .eloRating(800)
                        .createdAt(Instant.now())
                        .isActive(true)
                        .build()));
                });
    }

    private String buildGuestUsername(UUID playerId, String playerName) {
        String suffix = compactId(playerId).substring(0, 12);
        String baseName = playerName == null || playerName.isBlank()
                ? "guest"
                : playerName.replaceAll("[^a-zA-Z0-9_]", "_");
        if (baseName.length() > 30) {
            baseName = baseName.substring(0, 30);
        }
        if (baseName.length() < 3) {
            baseName = "guest";
        }
        return baseName + "_" + suffix;
    }

    private String compactId(UUID id) {
        return id.toString().replace("-", "");
    }

    private String buildPgn(List<MoveRecord> moves) {
        if (moves == null || moves.isEmpty()) {
            return "";
        }

        StringBuilder pgn = new StringBuilder();
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
                if (!pgn.isEmpty()) {
                    pgn.append(' ');
                }
                pgn.append(move.getMoveNumber())
                        .append(". ")
                        .append(move.getSanNotation());
                currentMoveNumber = move.getMoveNumber();
                continue;
            }

            if (!pgn.isEmpty()) {
                pgn.append(' ');
            }
            if (currentMoveNumber != move.getMoveNumber()) {
                pgn.append(move.getMoveNumber()).append("... ");
            }
            pgn.append(move.getSanNotation());
            currentMoveNumber = move.getMoveNumber();
        }

        return pgn.toString();
    }
}
