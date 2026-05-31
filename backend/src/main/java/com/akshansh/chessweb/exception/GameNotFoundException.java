package com.akshansh.chessweb.exception;

import java.util.UUID;

public class GameNotFoundException extends RuntimeException {
    public GameNotFoundException(UUID gameId) {
        super("Game id: " + gameId + " was not found");
    }
}
