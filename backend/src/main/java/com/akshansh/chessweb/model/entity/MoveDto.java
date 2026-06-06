package com.akshansh.chessweb.model.entity;

import com.akshansh.chessweb.model.enums.Color;
import com.akshansh.chessweb.model.enums.PieceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MoveDto {
    private int moveNumber;
    private Color color;
    private String fromSquare;
    private String toSquare;
    private PieceType piece;
    private PieceType promotionPiece;
    private boolean isCapture;
    private boolean isCheck;
    private boolean isCheckmate;
    private boolean isCastling;
    private String sanNotation;
    private String fenAfter;
    private Instant playedAt;
}
