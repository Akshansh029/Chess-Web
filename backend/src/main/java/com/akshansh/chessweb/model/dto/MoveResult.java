package com.akshansh.chessweb.model.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MoveResult {

    private boolean valid;

    private String newFen;              // full FEN after the move is applied
    private String san;                 // Standard Algebraic Notation: "Nf3", "O-O", "exd5+"

    private String pieceMoved;          // "P", "N", "B", "R", "Q", "K"
    private String capturedPiece;       // null if not a capture

    private boolean capture;
    private boolean check;
    private boolean checkmate;
    private boolean stalemate;
    private boolean insufficientMaterial;
    private boolean repetition;
    private boolean castling;
    private boolean enPassant;
    private boolean promotion;

    // if valid = false
    private String rejectionReason;
}

