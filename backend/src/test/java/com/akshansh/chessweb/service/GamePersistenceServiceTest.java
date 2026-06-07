package com.akshansh.chessweb.service;

import com.akshansh.chessweb.model.entity.GameSession;
import com.akshansh.chessweb.model.entity.MoveDto;
import com.akshansh.chessweb.model.entity.MoveRecord;
import com.akshansh.chessweb.model.entity.User;
import com.akshansh.chessweb.model.enums.Color;
import com.akshansh.chessweb.model.enums.GameResult;
import com.akshansh.chessweb.model.enums.GameStatus;
import com.akshansh.chessweb.model.enums.GameTerminationReason;
import com.akshansh.chessweb.model.enums.PieceType;
import com.akshansh.chessweb.repository.GameRepository;
import com.akshansh.chessweb.repository.MoveRepository;
import com.akshansh.chessweb.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class GamePersistenceServiceTest {

    private GameRepository gameRepository;
    private MoveRepository moveRepository;
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        gameRepository = mock(GameRepository.class);
        moveRepository = mock(MoveRepository.class);
        userRepository = mock(UserRepository.class);
    }

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
                .moveDtoHistory(List.of(
                        moveDto(1, Color.WHITE, "e4"),
                        moveDto(1, Color.BLACK, "e5"),
                        moveDto(2, Color.WHITE, "Nf3")
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
                .moveDtoHistory(List.of())
                .build();

        String pgn = ReflectionTestUtils.invokeMethod(service, "buildPgn", session);

        assertThat(pgn).contains("[White \"Alice \\\"The Queen\\\"\"]");
        assertThat(pgn).contains("[Black \"Bob\\\\Black\"]");
        assertThat(pgn).endsWith("1/2-1/2");
    }

    @Test
    void persistSavesFreshMoveRecordsWithoutReusingSessionMoveIds() {
        GamePersistenceService service = new GamePersistenceService(gameRepository, moveRepository, userRepository);
        UUID whitePlayerId = UUID.randomUUID();
        UUID blackPlayerId = UUID.randomUUID();
        MoveDto staleMove = moveDto(1, Color.WHITE, "e4");

        when(userRepository.findById(whitePlayerId)).thenReturn(Optional.of(user(whitePlayerId, "Alice")));
        when(userRepository.findById(blackPlayerId)).thenReturn(Optional.of(user(blackPlayerId, "Bob")));
        when(gameRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        GameSession session = GameSession.builder()
                .id(UUID.randomUUID())
                .whitePlayerId(whitePlayerId)
                .blackPlayerId(blackPlayerId)
                .whitePlayerName("Alice")
                .blackPlayerName("Bob")
                .status(GameStatus.ENDED)
                .result(GameResult.WHITE_WON)
                .terminationReason(GameTerminationReason.CHECKMATE)
                .startedAt(Instant.parse("2026-06-04T12:30:00Z"))
                .currentFen("final fen")
                .moveDtoHistory(List.of(staleMove))
                .build();

        service.persist(session);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<Iterable<MoveRecord>> movesCaptor = ArgumentCaptor.forClass(Iterable.class);
        verify(moveRepository).saveAll(movesCaptor.capture());

        List<MoveRecord> savedMoves = (List<MoveRecord>) movesCaptor.getValue();
        assertThat(savedMoves).hasSize(1);
        assertThat(savedMoves.getFirst().getId()).isNull();
    }

    private static MoveDto moveDto(int moveNumber, Color color, String sanNotation) {
        return MoveDto.builder()
                .moveNumber(moveNumber)
                .color(color)
                .fromSquare("e2")
                .toSquare("e4")
                .piece(PieceType.P)
                .isCapture(false)
                .isCheck(false)
                .isCheckmate(false)
                .isCastling(false)
                .sanNotation(sanNotation)
                .fenAfter("fen")
                .playedAt(Instant.parse("2026-06-04T12:31:00Z"))
                .build();
    }

    private static User user(UUID id, String username) {
        return User.builder()
                .id(id)
                .username(username)
                .email(username.toLowerCase() + "@example.com")
                .passwordHash("hash")
                .eloRating(1200)
                .createdAt(Instant.parse("2026-06-04T12:00:00Z"))
                .isActive(true)
                .build();
    }
}
