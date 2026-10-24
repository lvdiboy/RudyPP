package com.rudypp.security.web.controller;

import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rudypp.security.constants.SecurityConstants;
import com.rudypp.security.web.request.LoginRequest;
import com.rudypp.security.service.AuthService;

/**
 * @author Rudy Lyu
 * @description 认证授权
 **/
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * 登录成功后 Token 放在 Authorization 响应头中，响应体中的 redirect 为登录后要跳转的页面。
     * 这里不使用 302 重定向：前端通过 fetch 调用时浏览器会自动跟随重定向，导致读取不到响应头中的 Token。
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        String token = authService.createToken(loginRequest);
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.set(SecurityConstants.TOKEN_HEADER, token);
        Map<String, String> body = Map.of("redirect", request.getContextPath() + SecurityConstants.HOME_PAGE);
        return new ResponseEntity<>(body, httpHeaders, HttpStatus.OK);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        authService.removeToken();
        return new ResponseEntity<>(HttpStatus.OK);
    }
    
}
