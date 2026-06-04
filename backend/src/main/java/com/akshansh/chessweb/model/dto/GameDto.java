package com.akshansh.chessweb.model.dto;

import com.akshansh.chessweb.model.enums.GameResult;
import com.akshansh.chessweb.model.enums.GameTerminationReason;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@AllArgsConstructor
public class GameDto {
    private UUID gameId;
    private String whitePlayerName;
    private String blackPlayerName;
    private GameResult result;
    private GameTerminationReason terminationReason;
    private int totalMoves;
    private Instant endedAt;
    private String pgn;
}
