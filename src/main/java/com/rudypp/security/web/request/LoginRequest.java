package com.rudypp.security.web.request;

import lombok.Value;

/**
 * @author Rudy Lyu
 * @description Login request DTO
 */
@Value
public class LoginRequest {
    String username;
    String password;
    Boolean rememberMe;
}
