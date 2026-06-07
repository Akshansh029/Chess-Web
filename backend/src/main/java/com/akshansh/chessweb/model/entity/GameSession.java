package com.akshansh.chessweb.model.entity;

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
    private int whitePlayerNewElo;
    private int blackPlayerNewElo;
    private int whitePlayerOldElo;
    private int blackPlayerOldElo;
    private GameStatus status;
    private GameResult result;
    private GameTerminationReason terminationReason;
    private Instant startedAt;
    private String currentFen;
    private Color currentTurn;
    private List<MoveDto> moveDtoHistory;
    private UUID drawOfferBy;
}
