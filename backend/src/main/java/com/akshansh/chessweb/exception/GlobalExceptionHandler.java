package com.akshansh.chessweb.exception;

import com.akshansh.chessweb.model.dto.ErrorResponse;
import com.akshansh.chessweb.model.dto.ValidationErrorResponse;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ValidationException;
import org.jspecify.annotations.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import tools.jackson.databind.exc.InvalidFormatException;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

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
    public ResponseEntity<ErrorResponse> handlePlayerNotInGame(PlayerNotInGameException ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.FORBIDDEN.value(),
                "Unauthorized action",
                ex.getMessage(),
                request.getRequestURI()
        );
        log.warn("Client error event=playerNotInGame status=403 method={} uri={} errorType={} message=\"{}\" requestId={}",
                request.getMethod(),
                request.getRequestURI(),
                ex.getClass().getSimpleName(),
                ex.getMessage(),
                MDC.get("requestId")
        );
        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex, HttpServletRequest request) {

        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(DefaultMessageSourceResolvable::getDefaultMessage)
                .collect(Collectors.toList());

        ValidationErrorResponse error = new ValidationErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                "Validation failed of incorrect field types or values",
                errors
        );
        log.warn("Client error event=fieldValidationFailed status=404 method={} uri={} errorType={} message=\"{}\" requestId={}",
                request.getMethod(),
                request.getRequestURI(),
                ex.getClass().getSimpleName(),
                ex.getMessage(),
                MDC.get("requestId")
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(InvalidAuthCodeException.class)
    public ResponseEntity<ErrorResponse> handleInvalidAuthCode(InvalidAuthCodeException ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.UNAUTHORIZED.value(),
                HttpStatus.UNAUTHORIZED.getReasonPhrase(),
                ex.getMessage(),
                request.getRequestURI()
        );
        log.warn("Client error event=invalidAuthCode status=401 method={} uri={} errorType={} message=\"{}\" requestId={}",
                request.getMethod(),
                request.getRequestURI(),
                ex.getClass().getSimpleName(),
                ex.getMessage(),
                MDC.get("requestId")
        );
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(AuthenticationCredentialsNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUnauthenticatedUser(AuthenticationCredentialsNotFoundException ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.UNAUTHORIZED.value(),
                HttpStatus.UNAUTHORIZED.getReasonPhrase(),
                ex.getMessage(),
                request.getRequestURI()
        );
        log.warn("Client error event=unauthenticatedUser status=401 method={} uri={} errorType={} message=\"{}\" requestId={}",
                request.getMethod(),
                request.getRequestURI(),
                ex.getClass().getSimpleName(),
                ex.getMessage(),
                MDC.get("requestId")
        );
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleUserAlreadyExists(UserAlreadyExistsException ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "User already exists",
                ex.getMessage(),
                request.getRequestURI()
        );
        log.warn("Client error event=userAlreadyExists status=400 method={} uri={} userId={} errorType={} message=\"{}\" requestId={}",
                request.getMethod(),
                request.getRequestURI(),
                MDC.get("userId"),
                ex.getClass().getSimpleName(),
                ex.getMessage(),
                MDC.get("requestId")
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleInvalidAuthentication(AuthenticationException ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.UNAUTHORIZED.value(),
                "Invalid email or password",
                ex.getMessage(),
                request.getRequestURI()
        );
        log.warn("Client error event=invalidAuthentication status=401 method={} uri={} errorType={} message=\"{}\" requestId={}",
                request.getMethod(),
                request.getRequestURI(),
                ex.getClass().getSimpleName(),
                ex.getMessage(),
                MDC.get("requestId")
        );
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(JwtException.class)
    public ResponseEntity<ErrorResponse> handleJwtException(JwtException ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.UNAUTHORIZED.value(),
                "JWT Exception",
                ex.getMessage(),
                request.getRequestURI()
        );
        log.warn("Client error event=jwtException status=401 method={} uri={} userId={} errorType={} message=\"{}\" requestId={}",
                request.getMethod(),
                request.getRequestURI(),
                MDC.get("userId"),
                ex.getClass().getSimpleName(),
                ex.getMessage(),
                MDC.get("requestId")
        );
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(ValidationException ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Validation Failed",
                ex.getMessage(),
                request.getRequestURI()
        );
        log.warn("Client error event=validationFailed status=400 method={} uri={} errorType={} message=\"{}\" requestId={}",
                request.getMethod(),
                request.getRequestURI(),
                ex.getClass().getSimpleName(),
                ex.getMessage(),
                MDC.get("requestId")
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ErrorResponse> handleForbidden(ForbiddenException ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.FORBIDDEN.value(),
                "Unauthorized action",
                ex.getMessage(),
                request.getRequestURI()
        );
        log.warn("Client error event=actionForbidden status=403 method={} uri={} userId={} errorType={} message=\"{}\" requestId={}",
                request.getMethod(),
                request.getRequestURI(),
                MDC.get("userId"),
                ex.getClass().getSimpleName(),
                ex.getMessage(),
                MDC.get("requestId")
        );
        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<ErrorResponse> handleHeaderNotFound(MissingRequestHeaderException ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(),
                "Invalid required request header",
                ex.getMessage(),
                request.getRequestURI()
        );
        log.warn("Client error event=headerNotFound status=400 method={} uri={} errorType={} message=\"{}\" requestId={}",
                request.getMethod(),
                request.getRequestURI(),
                ex.getClass().getSimpleName(),
                ex.getMessage(),
                MDC.get("requestId")
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(HttpStatus.FORBIDDEN.value(),
                "Access denied: You do not have permission to access this resource.",
                ex.getMessage(),
                request.getRequestURI()
        );
        log.warn("Client error event=accessDenied status=403 method={} uri={} userId={} errorType={} message=\"{}\" requestId={}",
                request.getMethod(),
                request.getRequestURI(),
                MDC.get("userId"),
                ex.getClass().getSimpleName(),
                ex.getMessage(),
                MDC.get("requestId")
        );
        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<ErrorResponse> handleInvalidRequest(InvalidRequestException ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                ex.getMessage(),
                request.getRequestURI()
        );
        log.warn("Client error event=invalidRequest status=400 method={} uri={} errorType={} message=\"{}\" requestId={}",
                request.getMethod(),
                request.getRequestURI(),
                ex.getClass().getSimpleName(),
                ex.getMessage(),
                MDC.get("requestId")
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadable(HttpMessageNotReadableException ex, HttpServletRequest request) {
        Throwable cause = ex.getCause();
        if (cause instanceof InvalidFormatException invalidEx && invalidEx.getTargetType().isEnum()) {
            ErrorResponse error = getErrorResponse(request, invalidEx);
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
        // Fallback for other JSON parse errors
        ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(),
                "Bad Request", ex.getMessage(), request.getRequestURI());
        log.warn("Client error event=httpMessageNotReadable status=400 method={} uri={} errorType={} message=\"{}\" requestId={}",
                request.getMethod(),
                request.getRequestURI(),
                ex.getClass().getSimpleName(),
                ex.getMessage(),
                MDC.get("requestId")
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    private static @NonNull ErrorResponse getErrorResponse(HttpServletRequest request, InvalidFormatException invalidEx) {
        String message = String.format("Invalid value '%s' for field '%s'. Must be one of %s.",
                invalidEx.getValue(),
                invalidEx.getPath().getLast().getPropertyName(),
                Arrays.toString(invalidEx.getTargetType().getEnumConstants())
        );
        ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(), message, request.getRequestURI());
        return error;
    }

    @ExceptionHandler(InvalidVerificationCode.class)
    public ResponseEntity<ErrorResponse> handleInvalidVerificationCode(InvalidVerificationCode ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                ex.getMessage(),
                request.getRequestURI()
        );
        log.warn("Client error event=invalidVerificationCode status=400 method={} uri={} userId={} errorType={} message=\"{}\" requestId={}",
                request.getMethod(),
                request.getRequestURI(),
                MDC.get("userId"),
                ex.getClass().getSimpleName(),
                ex.getMessage(),
                MDC.get("requestId")
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                ex.getMessage(),
                request.getRequestURI()
        );
        log.warn("Client error event=illegalState status=400 method={} uri={} userId={} errorType={} message=\"{}\" requestId={}",
                request.getMethod(),
                request.getRequestURI(),
                MDC.get("userId"),
                ex.getClass().getSimpleName(),
                ex.getMessage(),
                MDC.get("requestId")
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Bad Credentials",
                "Invalid username or password",
                request.getRequestURI()
        );
        log.warn("Client error event=badCredentials status=400 method={} uri={} userId={} errorType={} message=\"{}\" requestId={}",
                request.getMethod(),
                request.getRequestURI(),
                MDC.get("userId"),
                ex.getClass().getSimpleName(),
                ex.getMessage(),
                MDC.get("requestId")
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<ErrorResponse> handleNullPointer(NullPointerException ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Failed to send email",
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(ResendEmailException.class)
    public ResponseEntity<ErrorResponse> handleResendEmail(ResendEmailException ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Something went wrong",
                "Something went wrong",
                request.getRequestURI()
        );
        log.error("Server error event=nullPointer status=500 method={} uri={} userId={} errorType={} message=\"{}\" requestId={}",
                request.getMethod(),
                request.getRequestURI(),
                MDC.get("userId"),
                ex.getClass().getSimpleName(),
                ex.getMessage(),
                MDC.get("requestId")
        );
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                ex.getMessage(),
                request.getRequestURI()
        );
        log.error("Server error event=illegalState status=500 method={} uri={} userId={} errorType={} message=\"{}\" requestId={}",
                request.getMethod(),
                request.getRequestURI(),
                MDC.get("userId"),
                ex.getClass().getSimpleName(),
                ex.getMessage(),
                MDC.get("requestId")
        );
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntime(RuntimeException ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                ex.getMessage(),
                request.getRequestURI()
        );
        log.error("Server error event=runtimeError status=500 method={} uri={} userId={} errorType={} message=\"{}\" requestId={}",
                request.getMethod(),
                request.getRequestURI(),
                MDC.get("userId"),
                ex.getClass().getSimpleName(),
                ex.getMessage(),
                MDC.get("requestId")
        );
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                ex.getMessage(),
                request.getRequestURI()
        );
        log.error("Server error event=unexpectedError status=500 method={} uri={} userId={} errorType={} message=\"{}\" requestId={}",
                request.getMethod(),
                request.getRequestURI(),
                MDC.get("userId"),
                ex.getClass().getSimpleName(),
                ex.getMessage(),
                MDC.get("requestId")
        );
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
