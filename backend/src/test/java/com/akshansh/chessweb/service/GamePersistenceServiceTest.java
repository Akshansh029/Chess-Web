package com.akshansh.chessweb.service;

import com.akshansh.chessweb.model.entity.GameSession;
import com.akshansh.chessweb.model.entity.MoveRecord;
import com.akshansh.chessweb.model.enums.Color;
import com.akshansh.chessweb.model.enums.GameResult;
import com.akshansh.chessweb.model.enums.GameTerminationReason;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class GamePersistenceServiceTest {

    @Test
    void buildPgnIncludesTagPairSectionAndMovetextResult() {
        GamePersistenceService service = new GamePersistenceService(null, null, null);
        GameSession session = GameSession.builder()
                .id(UUID.randomUUID())
                .whitePlayerName("Alice")
                .blackPlayerName("Bob")
                .startedAt(Instant.parse("2026-06-04T12:30:00Z"))
                .result(GameResult.WHITE_WON)
                .terminationReason(GameTerminationReason.CHECKMATE)
                .moveRecordHistory(List.of(
                        move(1, Color.WHITE, "e4"),
                        move(1, Color.BLACK, "e5"),
                        move(2, Color.WHITE, "Nf3")
                ))
                .build();

        String pgn = ReflectionTestUtils.invokeMethod(service, "buildPgn", session);

        assertThat(pgn).isEqualTo("""
                [Event "Chess Web Game"]
                [Site "Chess Web"]
                [Date "2026.06.04"]
                [Round "-"]
                [White "Alice"]
                [Black "Bob"]
                [Result "1-0"]
                [Termination "CHECKMATE"]

                1. e4 e5 2. Nf3 1-0""");
    }

    @Test
    void buildPgnEscapesTagValues() {
        GamePersistenceService service = new GamePersistenceService(null, null, null);
        GameSession session = GameSession.builder()
                .whitePlayerName("Alice \"The Queen\"")
                .blackPlayerName("Bob\\Black")
                .result(GameResult.DRAW)
                .moveRecordHistory(List.of())
                .build();

        String pgn = ReflectionTestUtils.invokeMethod(service, "buildPgn", session);

        assertThat(pgn).contains("[White \"Alice \\\"The Queen\\\"\"]");
        assertThat(pgn).contains("[Black \"Bob\\\\Black\"]");
        assertThat(pgn).endsWith("1/2-1/2");
    }

    private static MoveRecord move(int moveNumber, Color color, String sanNotation) {
        return MoveRecord.builder()
                .moveNumber(moveNumber)
                .color(color)
                .sanNotation(sanNotation)
                .build();
    }
}
