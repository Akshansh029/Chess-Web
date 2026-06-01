package com.akshansh.chessweb.controller;

import com.akshansh.chessweb.exception.GameNotFoundException;
import com.akshansh.chessweb.exception.PlayerNotInGameException;
import com.akshansh.chessweb.model.entity.GameSession;
import com.akshansh.chessweb.model.entity.Move;
import com.akshansh.chessweb.model.dto.*;
import com.akshansh.chessweb.model.enums.Color;
import com.akshansh.chessweb.model.enums.GameResult;
import com.akshansh.chessweb.model.enums.GameStatus;
import com.akshansh.chessweb.model.enums.GameTerminationReason;
import com.akshansh.chessweb.service.GameStore;
import com.akshansh.chessweb.service.MoveValidatorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
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
    public void handleMove(@Payload @Valid MoveRequest request) {

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
        }

        // Broadcast updated state
        messagingTemplate.convertAndSend(
                "/topic/game." + session.getId(),
                session
        );
    }

    @MessageMapping("/game.resign")
    public void resignGame(@Payload @Valid ResignRequest request){
        GameSession session = gameStore.findById(request.getGameId())
                .orElseThrow(() -> new GameNotFoundException(request.getGameId()));

        session.setStatus(GameStatus.ENDED);
        session.setTerminationReason(GameTerminationReason.RESIGNATION);

        if(request.getPlayerId().equals(session.getWhitePlayerId())){
            session.setResult(GameResult.BLACK_WON);
        } else if (request.getPlayerId().equals(session.getBlackPlayerId())){
            session.setResult(GameResult.WHITE_WON);
        } else{
            throw new PlayerNotInGameException(
                    "Player " + request.getPlayerName() + " is not part of the game " + session.getId().toString().substring(0,5)
            );
        }

        messagingTemplate.convertAndSend(
                "/topic/game." + session.getId(),
                session
        );
    }

    @MessageMapping("/game.draw.offer")
    public void offerDraw(@Payload @Valid DrawOfferRequest request){
        GameSession session = gameStore.findById(request.getGameId())
                .orElseThrow(() -> new GameNotFoundException(request.getGameId()));

        if(!request.getPlayerId().equals(session.getWhitePlayerId()) && !request.getPlayerId().equals(session.getBlackPlayerId())){
            throw new PlayerNotInGameException(
                    "Player " + request.getPlayerName() + " is not part of the game " + session.getId().toString().substring(0,5)
            );
        }

        session.setDrawOfferBy(request.getPlayerId());
        messagingTemplate.convertAndSend("/topic/game." + request.getGameId(), session);
    }

    @MessageMapping("/game.draw.accept")
    public void acceptDraw(@Payload @Valid DrawOfferAcceptRequest request){
        GameSession session = gameStore.findById(request.getGameId())
                .orElseThrow(() -> new GameNotFoundException(request.getGameId()));

        if(!request.getOfferAccepterByPlayerId().equals(session.getWhitePlayerId()) && !request.getOfferAccepterByPlayerId().equals(session.getBlackPlayerId())){
            throw new PlayerNotInGameException(
                    "Player " + request.getOfferAcceptedByPlayerName() + " is not part of the game " + session.getId().toString().substring(0,5)
            );
        }

        session.setStatus(GameStatus.ENDED);
        session.setResult(GameResult.DRAW);
        session.setTerminationReason(GameTerminationReason.DRAW_ACCEPTED);
        session.setDrawOfferBy(null);

        messagingTemplate.convertAndSend("/topic/game." + request.getGameId(), session);
    }

    @MessageMapping("/game.draw.decline")
    public void declineDraw(@Payload @Valid DrawOfferAcceptRequest request){
        GameSession session = gameStore.findById(request.getGameId())
                .orElseThrow(() -> new GameNotFoundException(request.getGameId()));

        if(!request.getOfferAccepterByPlayerId().equals(session.getWhitePlayerId()) && !request.getOfferAccepterByPlayerId().equals(session.getBlackPlayerId())){
            throw new PlayerNotInGameException(
                    "Player " + request.getOfferAcceptedByPlayerName() + " is not part of the game " + session.getId().toString().substring(0,5)
            );
        }

        session.setDrawOfferBy(null);
        messagingTemplate.convertAndSend("/topic/game." + request.getGameId(), session);
    }
}
