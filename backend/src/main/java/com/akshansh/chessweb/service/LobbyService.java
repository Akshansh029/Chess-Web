package com.akshansh.chessweb.service;

import com.akshansh.chessweb.exception.ResourceNotFoundException;
import com.akshansh.chessweb.model.entity.GameSession;
import com.akshansh.chessweb.model.dto.CreateGameReqDto;
import com.akshansh.chessweb.model.dto.JoinGameReqDto;
import com.akshansh.chessweb.model.entity.UserPrincipal;
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
import static com.akshansh.chessweb.utils.UserUtil.getCurrentUser;

@Service
@RequiredArgsConstructor
public class LobbyService {

    private final GameStore store;
    private final SimpMessagingTemplate messagingTemplate;

    public UUID createGame(CreateGameReqDto request){
        UserPrincipal currentUser = getCurrentUser();

        String[] timeControlValues = request.getTimeControl().split("\\+");

        GameSession newSession = GameSession.builder()
                .id(UUID.randomUUID())
                .whitePlayerId(request.getPlayerColor().equals(Color.WHITE) ? currentUser.getUserId() : null)
                .blackPlayerId(request.getPlayerColor().equals(Color.BLACK) ? currentUser.getUserId() : null)
                .whitePlayerName(request.getPlayerColor().equals(Color.WHITE) ? currentUser.getUsername() : null)
                .blackPlayerName(request.getPlayerColor().equals(Color.BLACK) ? currentUser.getUsername() : null)
                .moveDtoHistory(new ArrayList<>())
                .currentTurn(Color.WHITE)
                .currentFen(STARTING_FEN)
                .status(GameStatus.WAITING)
                .timeControl(request.getTimeControl())
                .incrementMs(Integer.parseInt(timeControlValues[1]) * 1000)
                .whiteTimeRemainingMs((long) Integer.parseInt(timeControlValues[0]) * 60 * 1000)
                .blackTimeRemainingMs((long) Integer.parseInt(timeControlValues[0]) * 60 * 1000)
                .build();

        store.saveGame(newSession);

        return newSession.getId();
    }

    public GameSession joinGame(JoinGameReqDto request){
        UserPrincipal currentUser = getCurrentUser();

        GameSession session = store.findById(request.getGameId())
                .orElseThrow(() -> new ResourceNotFoundException("Game session not found"));

        if(currentUser.getUserId().equals(session.getBlackPlayerId()) || currentUser.getUserId().equals(session.getWhitePlayerId())){
                throw new IllegalArgumentException("Players cannot join game with themselves");
        }

        if(request.getPlayerColor().equals(Color.BLACK)){
            session.setBlackPlayerId(request.getPlayerId());
            session.setBlackPlayerName(request.getPlayerName());
        } else{
            session.setWhitePlayerId(request.getPlayerId());
            session.setWhitePlayerName(request.getPlayerName());
        }

        session.setStatus(GameStatus.ACTIVE);
        session.setStartedAt(Instant.now());
        session.setTurnStartedAt(Instant.now());

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
