package com.akshansh.chessweb.exception;

public class PlayerNotInGameException extends RuntimeException {
    public PlayerNotInGameException(String message) {
        super(message);
    }
}
