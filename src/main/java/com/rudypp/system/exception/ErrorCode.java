package com.rudypp.system.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * @author Rudy Lyu
 */
@Getter
public enum ErrorCode {
    USER_NAME_ALREADY_EXIST(1001, HttpStatus.BAD_REQUEST, "User name already exists"),
    ROLE_NOT_FOUND(1002, HttpStatus.NOT_FOUND, "Role not found"),
    METHOD_ARGUMENT_NOT_VALID(1003, HttpStatus.BAD_REQUEST, "Method argument validation failed"),
    USER_NAME_NOT_FOUND(1004, HttpStatus.NOT_FOUND, "User not found"),
    VERIFY_JWT_FAILED(1005, HttpStatus.UNAUTHORIZED, "Token verification failed"),
    BAD_CREDENTIALS(1006, HttpStatus.UNAUTHORIZED, "Wrong user name or password");
    private final int code;

    private final HttpStatus status;

    private final String message;

    ErrorCode(int code, HttpStatus status, String message) {
        this.code = code;
        this.status = status;
        this.message = message;
    }
}
