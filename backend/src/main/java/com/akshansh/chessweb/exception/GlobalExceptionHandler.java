package com.akshansh.chessweb.exception;

import com.akshansh.chessweb.model.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex, WebRequest request) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                HttpStatus.NOT_FOUND.getReasonPhrase(),
                ex.getMessage(),
                request.getDescription(false)
        );
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(GameNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleGameNotFound(GameNotFoundException ex, WebRequest request) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Game not found",
                ex.getMessage(),
                request.getDescription(false)
        );
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(PlayerNotInGameException.class)
    public ResponseEntity<ErrorResponse> handlePlayerNotInGame(PlayerNotInGameException ex, WebRequest request) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Player not part of the game",
                ex.getMessage(),
                request.getDescription(false)
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }
}
