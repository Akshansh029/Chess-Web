package com.akshansh.chessweb.service;

import com.akshansh.chessweb.exception.ResourceNotFoundException;
import com.akshansh.chessweb.model.GameSession;
import com.akshansh.chessweb.model.dto.CreateGameReqDto;
import com.akshansh.chessweb.model.dto.JoinGameReqDto;
import com.akshansh.chessweb.model.enums.Color;
import com.akshansh.chessweb.model.enums.GameStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static com.akshansh.chessweb.utils.ChessConstants.STARTING_FEN;

@Service
@RequiredArgsConstructor
public class GameService {

    private final GameStore store;
    private final SimpMessagingTemplate messagingTemplate;

    public UUID createGame(CreateGameReqDto request){
        GameSession newSession = GameSession.builder()
                .id(UUID.randomUUID())
                .whitePlayerId(request.getPlayerColor().equals(Color.WHITE) ? request.getPlayerId() : null)
                .blackPlayerId(request.getPlayerColor().equals(Color.BLACK) ? request.getPlayerId() : null)
                .whitePlayerName(request.getPlayerColor().equals(Color.WHITE) ? request.getPlayerName() : null)
                .blackPlayerName(request.getPlayerColor().equals(Color.BLACK) ? request.getPlayerName() : null)
                .moveHistory(new ArrayList<>())
                .currentTurn(Color.WHITE)
                .currentFen(STARTING_FEN)
                .status(GameStatus.WAITING)
                .build();

        store.saveGame(newSession);

        return newSession.getId();
    }

    public GameSession joinGame(JoinGameReqDto request){
        GameSession session = store.findById(request.getGameId())
                .orElseThrow(() -> new ResourceNotFoundException("Game session not found"));

        if(request.getPlayerColor().equals(Color.BLACK)){
            session.setBlackPlayerId(request.getPlayerId());
            session.setBlackPlayerName(request.getPlayerName());
        } else{
            session.setWhitePlayerId(request.getPlayerId());
            session.setWhitePlayerName(request.getPlayerName());
        }

        session.setStatus(GameStatus.ACTIVE);
        session.setStartedAt(Instant.now());

        messagingTemplate.convertAndSend(
                "/topic/game." + session.getId(),
                session
        );

        return session;
    }

    public List<GameSession> getWaitingSessions(){
        return store.findWaitingGames();
    }
}
