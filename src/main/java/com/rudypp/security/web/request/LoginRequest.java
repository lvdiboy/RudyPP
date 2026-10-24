package com.rudypp.security.web.request;

import lombok.Value;

/**
 * @author Rudy Lyu
 * @description 用户登录请求DTO
 */
@Value
public class LoginRequest {
    String username;
    String password;
    Boolean rememberMe;
}
