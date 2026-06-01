package com.akshansh.chessweb.model;

import com.akshansh.chessweb.model.enums.Color;
import com.akshansh.chessweb.model.enums.GameResult;
import com.akshansh.chessweb.model.enums.GameStatus;
import com.akshansh.chessweb.model.enums.GameTerminationReason;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class GameSession {
    private UUID id;
    private UUID whitePlayerId;
    private UUID blackPlayerId;
    private String whitePlayerName;
    private String blackPlayerName;
    private GameStatus status;
    private GameResult result;
    private GameTerminationReason terminationReason;
//    private String pgn;
//    private int totalMoves;
//    private Instant endedAt;
    private Instant startedAt;

    private String currentFen;
    private Color currentTurn;
    private List<Move> moveHistory;
    private UUID drawOfferBy;

    private String whiteSessionId;   // Spring WS session ID
    private String blackSessionId;
}
