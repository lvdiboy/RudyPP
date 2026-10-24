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
     * 自定义业务异常处理（用户名已存在、用户/角色不存在等），状态码由 ErrorCode 决定
     */
    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ErrorResponse> handleBaseException(BaseException ex, HttpServletRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(ex.getErrorCode(), request.getRequestURI(), ex.getData());
        log.error("occur BaseException: {}", errorResponse);
        return ResponseEntity.status(ex.getErrorCode().getStatus()).body(errorResponse);
    }

    /**
     * 请求参数异常处理
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
     * 登录失败（用户名或密码错误、用户被禁用）
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
