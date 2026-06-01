package com.akshansh.chessweb.model.enums;

public enum GameTerminationReason {
    CHECKMATE,
    RESIGNATION,
    TIMEOUT,
    STALEMATE,
    INSUFFICIENT_MATERIAL,
    FIFTY_MOVE_RULE,
    REPETITION,
    DRAW_ACCEPTED,
    ABANDONED;
}
