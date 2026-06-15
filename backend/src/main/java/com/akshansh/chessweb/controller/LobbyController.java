package com.akshansh.chessweb.controller;

import com.akshansh.chessweb.model.dto.GameDto;
import com.akshansh.chessweb.model.entity.GameSession;
import com.akshansh.chessweb.model.dto.CreateGameReqDto;
import com.akshansh.chessweb.model.dto.JoinGameReqDto;
import com.akshansh.chessweb.service.GamePersistenceService;
import com.akshansh.chessweb.service.LobbyService;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RequestMapping("/api/games")
@RestController
@RequiredArgsConstructor
@Tag(name = "Lobby Controller", description = "APIs for lobby operations")
public class LobbyController {

    private final LobbyService lobbyService;
    private final GamePersistenceService gamePersistenceService;

    @Operation(summary = "Create a new game", description = "Create new game with specific player color and time controls")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Game created successfully",
                    content = @Content(schema = @Schema(implementation = UUID.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request data",
                    content = @Content(schema = @Schema())),
            @ApiResponse(responseCode = "401", description = "Unauthenticated user",
                    content = @Content(schema = @Schema()))
    })
    @PostMapping("/create")
    public ResponseEntity<UUID> createGame(@Valid @RequestBody CreateGameReqDto request){
        UUID gameId = lobbyService.createGame(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(gameId);
    }

    @Operation(summary = "Join a game", description = "Join an existing game as second player")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Game joined successfully",
                    content = @Content(schema = @Schema(implementation = GameSession.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request data",
                    content = @Content(schema = @Schema())),
            @ApiResponse(responseCode = "401", description = "Unauthenticated user",
                    content = @Content(schema = @Schema())),
            @ApiResponse(responseCode = "404", description = "Game session not found",
                    content = @Content(schema = @Schema())),
    })
    @PostMapping("/join")
    public ResponseEntity<GameSession> joinGame(@Valid @RequestBody JoinGameReqDto request){
        GameSession session = lobbyService.joinGame(request);
        return ResponseEntity.ok(session);
    }

    @Operation(summary = "Get all waiting games", description = "Fetch all the games which are in waiting games")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Waiting games fetched successfully",
                    content = @Content(schema = @Schema(implementation = List.class))),
            @ApiResponse(responseCode = "401", description = "Unauthenticated user",
                    content = @Content(schema = @Schema())),
    })
    @GetMapping("/waiting")
    public ResponseEntity<List<GameSession>> getWaitingGames(){
        List<GameSession> result = lobbyService.getWaitingSessions();
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Get all user's games", description = "Fetch all games played by the current user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Games fetched successfully",
                    content = @Content(schema = @Schema(implementation = Page.class))),
            @ApiResponse(responseCode = "401", description = "Unauthenticated user",
                    content = @Content(schema = @Schema())),
    })
    @GetMapping
    public ResponseEntity<Page<GameDto>> getUserGames(
        @RequestParam(name = "pageNo", defaultValue = "0") int pageNo,
        @RequestParam(name = "pageSize", defaultValue = "10") int pageSize
    ){
        Page<GameDto> result = gamePersistenceService.getAllGamesForUser(pageNo, pageSize);
        return ResponseEntity.ok(result);
    }
}
