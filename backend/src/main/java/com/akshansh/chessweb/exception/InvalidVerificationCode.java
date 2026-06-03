package com.akshansh.chessweb.exception;

public class InvalidVerificationCode extends RuntimeException {
    public InvalidVerificationCode(String message) {
        super(message);
    }
}
