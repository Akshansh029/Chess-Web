package com.akshansh.chessweb.service;

import com.akshansh.chessweb.model.entity.GameSession;
import com.akshansh.chessweb.model.dto.RequestMoveDto;
import com.akshansh.chessweb.model.dto.MoveRequest;
import com.akshansh.chessweb.model.dto.MoveResult;
import com.akshansh.chessweb.model.enums.Color;
import com.akshansh.chessweb.model.enums.GameStatus;
import com.akshansh.chessweb.model.enums.PieceType;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static com.akshansh.chessweb.utils.ChessConstants.STARTING_FEN;
import static org.assertj.core.api.Assertions.assertThat;

class MoveValidatorServiceTest {

    private final MoveValidatorService service = new MoveValidatorService();

    @Test
    void validateReturnsNewFenAfterLegalMove() {
        UUID whitePlayerId = UUID.randomUUID();
        GameSession session = GameSession.builder()
                .id(UUID.randomUUID())
                .whitePlayerId(whitePlayerId)
                .blackPlayerId(UUID.randomUUID())
                .currentFen(STARTING_FEN)
                .currentTurn(Color.WHITE)
                .status(GameStatus.ACTIVE)
                .build();
        MoveRequest request = MoveRequest.builder()
                .gameId(session.getId())
                .move(RequestMoveDto.builder()
                        .from("e2")
                        .to("e4")
                        .piece(PieceType.P)
                        .build())
                .color(Color.WHITE)
                .build();

        MoveResult result = service.validate(session, request, whitePlayerId);

        assertThat(result.isValid()).isTrue();
        assertThat(result.getNewFen()).isEqualTo("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1");
        assertThat(result.isCapture()).isFalse();
    }

    @Test
    void validateDetectsCaptureOnlyWhenDestinationHasOpponentPiece() {
        UUID whitePlayerId = UUID.randomUUID();
        GameSession session = GameSession.builder()
                .id(UUID.randomUUID())
                .whitePlayerId(whitePlayerId)
                .blackPlayerId(UUID.randomUUID())
                .currentFen("rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2")
                .currentTurn(Color.WHITE)
                .status(GameStatus.ACTIVE)
                .build();
        MoveRequest request = MoveRequest.builder()
                .gameId(session.getId())
                .move(RequestMoveDto.builder()
                        .from("e4")
                        .to("d5")
                        .piece(PieceType.P)
                        .build())
                .color(Color.WHITE)
                .build();

        MoveResult result = service.validate(session, request, whitePlayerId);

        assertThat(result.isValid()).isTrue();
        assertThat(result.isCapture()).isTrue();
    }
}
