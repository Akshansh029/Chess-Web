package com.akshansh.chessweb.exception;

public class InvalidAuthCodeException extends RuntimeException {
    public InvalidAuthCodeException(String message) {
        super(message);
    }
}
