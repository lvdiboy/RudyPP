package com.rudypp.system.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;


/**
 * @author Rudy Lyu
 */
@ControllerAdvice
@ResponseBody
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Handles business exceptions (user name already exists, user or role not found, ...); the status code comes from ErrorCode
     */
    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ErrorResponse> handleBaseException(BaseException ex, HttpServletRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(ex.getErrorCode(), request.getRequestURI(), ex.getData());
        log.error("occur BaseException: {}", errorResponse);
        return ResponseEntity.status(ex.getErrorCode().getStatus()).body(errorResponse);
    }

    /**
     * Handles invalid request arguments
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, Object> errors = new HashMap<>(8);
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String name = error instanceof FieldError fieldError ? fieldError.getField() : error.getObjectName();
            errors.put(name, error.getDefaultMessage());
        });
        ErrorResponse errorResponse = new ErrorResponse(ErrorCode.METHOD_ARGUMENT_NOT_VALID, request.getRequestURI(), errors);
        log.error("occur MethodArgumentNotValidException: {}", errorResponse);
        return ResponseEntity.status(ErrorCode.METHOD_ARGUMENT_NOT_VALID.getStatus()).body(errorResponse);
    }

    /**
     * Login failed (wrong user name or password, or the user is disabled)
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(AuthenticationException ex, HttpServletRequest request) {
        Map<String, Object> data = new HashMap<>(2);
        data.put("detail", ex.getMessage());
        ErrorResponse errorResponse = new ErrorResponse(ErrorCode.BAD_CREDENTIALS, request.getRequestURI(), data);
        log.warn("occur AuthenticationException: {}", errorResponse);
        return ResponseEntity.status(ErrorCode.BAD_CREDENTIALS.getStatus()).body(errorResponse);
    }
}
