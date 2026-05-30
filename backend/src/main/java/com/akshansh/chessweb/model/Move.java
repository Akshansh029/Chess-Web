package com.akshansh.chessweb.model;

import com.akshansh.chessweb.model.enums.Color;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class Move {
    private UUID id;
    private UUID gameId;
    private int moveNumber;
    private Color color;
    private String fromSquare;
    private String toSquare;
    private String piece;
    private String promotionPiece;
    private boolean isCapture;
    private boolean isCheck;
    private boolean isCheckmate;
    private boolean isCastling;
    private String sanNotation;
    private String fenAfter;
    private Instant playedAt;
}
