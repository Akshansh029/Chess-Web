package com.akshansh.chessweb.controller;

import com.akshansh.chessweb.model.entity.GameSession;
import com.akshansh.chessweb.model.dto.CreateGameReqDto;
import com.akshansh.chessweb.model.dto.JoinGameReqDto;
import com.akshansh.chessweb.service.GameService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RequestMapping("/api/games")
@RestController
@RequiredArgsConstructor
public class LobbyController {

    private final GameService gameService;

    @PostMapping("/create")
    public ResponseEntity<UUID> createGame(@Valid @RequestBody CreateGameReqDto request){
        UUID gameId = gameService.createGame(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(gameId);
    }

    @PostMapping("/join")
    public ResponseEntity<GameSession> joinGame(@Valid @RequestBody JoinGameReqDto request){
        GameSession session = gameService.joinGame(request);
        return ResponseEntity.ok(session);
    }

    @GetMapping("/waiting")
    public ResponseEntity<List<GameSession>> getWaitingGames(){
        List<GameSession> result = gameService.getWaitingSessions();
        return ResponseEntity.ok(result);
    }
}
