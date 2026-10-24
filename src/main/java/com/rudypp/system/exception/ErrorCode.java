package com.rudypp.system.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * @author Rudy Lyu
 */
@Getter
public enum ErrorCode {
    USER_NAME_ALREADY_EXIST(1001, HttpStatus.BAD_REQUEST, "用户名已经存在"),
    ROLE_NOT_FOUND(1002, HttpStatus.NOT_FOUND, "未找到指定角色"),
    METHOD_ARGUMENT_NOT_VALID(1003, HttpStatus.BAD_REQUEST, "方法参数验证失败"),
    USER_NAME_NOT_FOUND(1004, HttpStatus.NOT_FOUND, "未找到指定用户"),
    VERIFY_JWT_FAILED(1005, HttpStatus.UNAUTHORIZED, "token验证失败"),
    BAD_CREDENTIALS(1006, HttpStatus.UNAUTHORIZED, "用户名或密码错误");
    private final int code;

    private final HttpStatus status;

    private final String message;

    ErrorCode(int code, HttpStatus status, String message) {
        this.code = code;
        this.status = status;
        this.message = message;
    }
}
