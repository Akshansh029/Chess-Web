package com.akshansh.chessweb.controller;

import com.akshansh.chessweb.exception.GameNotFoundException;
import com.akshansh.chessweb.model.ChatMessage;
import com.akshansh.chessweb.model.GameSession;
import com.akshansh.chessweb.model.Move;
import com.akshansh.chessweb.model.dto.MoveRequest;
import com.akshansh.chessweb.model.dto.MoveResult;
import com.akshansh.chessweb.model.enums.Color;
import com.akshansh.chessweb.model.enums.GameResult;
import com.akshansh.chessweb.model.enums.GameStatus;
import com.akshansh.chessweb.model.enums.GameTerminationReason;
import com.akshansh.chessweb.service.GameStore;
import com.akshansh.chessweb.service.MoveValidatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.Instant;

@Controller
@RequiredArgsConstructor
public class GameController {

    private final GameStore gameStore;
    private final MoveValidatorService moveValidator;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/game.move")
    public void handleMove(@Payload MoveRequest request) {

        GameSession session = gameStore.findById(request.getGameId())
                .orElseThrow(() -> new GameNotFoundException(request.getGameId()));

        // Validate the move using chess rules
        MoveResult result = moveValidator.validate(session, request);
        if (!result.isValid()) {
            return; // invalid move
        }

        Move moveRecord = Move.builder()
                .moveNumber(session.getMoveHistory().size() / 2 + 1)
                .color(request.getColor())
                .fromSquare(request.getMove().getFrom())
                .toSquare(request.getMove().getTo())
                .piece(request.getMove().getPiece())
                .sanNotation(result.getSan())
                .fenAfter(result.getNewFen())
                .isCheck(result.isCheck())
                .isCheckmate(result.isCheckmate())
                .isCastling(result.isCastling())
                .isCapture(result.isCapture())
                .playedAt(Instant.now())
                .build();

        session.getMoveHistory().add(moveRecord);
        session.setCurrentFen(result.getNewFen());
        session.setCurrentTurn(request.getColor().equals(Color.WHITE) ? Color.BLACK : Color.WHITE);

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
        }

        // Broadcast updated state
        messagingTemplate.convertAndSend(
                "/topic/game." + session.getId(),
                session
        );
    }
}
