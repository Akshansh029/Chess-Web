package com.akshansh.chessweb.controller;

import com.akshansh.chessweb.model.entity.GameSession;
import com.akshansh.chessweb.model.entity.UserPrincipal;
import com.akshansh.chessweb.model.dto.*;
import com.akshansh.chessweb.service.GameService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Tag(name = "Game Controller", description = "Handler for in-game operations")
public class GameController {

    private final SimpMessagingTemplate messagingTemplate;
    private final GameService gameService;

    @MessageMapping("/game.move")
    public void handleMove(@Payload @Valid MoveRequest request, Authentication authentication) {
        GameSession session = gameService.processMove(request, getPrincipal(authentication));

        // Broadcast updated state
        messagingTemplate.convertAndSend(
                "/topic/game." + session.getId(),
                session
        );
    }

    @MessageMapping("/game.resign")
    public void resignGame(@Payload @Valid ResignRequest request, Authentication authentication){
        GameSession session = gameService.processResignation(request, getPrincipal(authentication));

        messagingTemplate.convertAndSend(
                "/topic/game." + session.getId(),
                session
        );
    }

    @MessageMapping("/game.draw.offer")
    public void offerDraw(@Payload @Valid DrawOfferRequest request, Authentication authentication){
        GameSession session = gameService.processDrawOffer(request, getPrincipal(authentication));

        messagingTemplate.convertAndSend("/topic/game." + request.getGameId(), session);
    }

    @MessageMapping("/game.draw.accept")
    public void acceptDraw(@Payload @Valid DrawOfferAcceptRequest request, Authentication authentication){
        GameSession session = gameService.processDrawAccepted(request, getPrincipal(authentication));

        messagingTemplate.convertAndSend("/topic/game." + request.getGameId(), session);
    }

    @MessageMapping("/game.draw.decline")
    public void declineDraw(@Payload @Valid DrawOfferAcceptRequest request, Authentication authentication){
        GameSession session = gameService.processDrawDeclined(request, getPrincipal(authentication));

        messagingTemplate.convertAndSend("/topic/game." + request.getGameId(), session);
    }

    private UserPrincipal getPrincipal(Authentication authentication) {
        return (UserPrincipal) authentication.getPrincipal();
    }
}
