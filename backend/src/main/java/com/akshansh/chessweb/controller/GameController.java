package com.akshansh.chessweb.controller;

import com.akshansh.chessweb.model.entity.GameSession;
import com.akshansh.chessweb.model.dto.*;
import com.akshansh.chessweb.service.GameService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class GameController {

    private final SimpMessagingTemplate messagingTemplate;
    private final GameService gameService;

    @MessageMapping("/game.move")
    public void handleMove(@Payload @Valid MoveRequest request) {
        GameSession session = gameService.processMove(request);

        // Broadcast updated state
        messagingTemplate.convertAndSend(
                "/topic/game." + session.getId(),
                session
        );
    }

    @MessageMapping("/game.resign")
    public void resignGame(@Payload @Valid ResignRequest request){
        GameSession session = gameService.processResignation(request);

        messagingTemplate.convertAndSend(
                "/topic/game." + session.getId(),
                session
        );
    }

    @MessageMapping("/game.draw.offer")
    public void offerDraw(@Payload @Valid DrawOfferRequest request){
        GameSession session = gameService.processDrawOffer(request);

        messagingTemplate.convertAndSend("/topic/game." + request.getGameId(), session);
    }

    @MessageMapping("/game.draw.accept")
    public void acceptDraw(@Payload @Valid DrawOfferAcceptRequest request){
        GameSession session = gameService.processDrawAccepted(request);

        messagingTemplate.convertAndSend("/topic/game." + request.getGameId(), session);
    }

    @MessageMapping("/game.draw.decline")
    public void declineDraw(@Payload @Valid DrawOfferAcceptRequest request){
        GameSession session = gameService.processDrawDeclined(request);

        messagingTemplate.convertAndSend("/topic/game." + request.getGameId(), session);
    }
}
