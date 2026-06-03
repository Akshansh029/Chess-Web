package com.akshansh.chessweb.model.dto;

import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class ValidationErrorResponse {
    private Instant timestamp;
    private int status;
    private String error;
    private String message;
    private List<String> errors;

    public ValidationErrorResponse(int status, String error, String message, List<String> errors) {
        this.timestamp = Instant.now();
        this.status = status;
        this.error = error;
        this.message = message;
        this.errors = errors;
    }
}
