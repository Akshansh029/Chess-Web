package com.akshansh.chessweb.exception;

public class GameNotActiveException extends RuntimeException {
    public GameNotActiveException(String message) {
        super(message);
    }
}
