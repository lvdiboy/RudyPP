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
 * @description Authentication endpoints
 **/
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * On success the token is returned in the Authorization response header, and "redirect" in the body is the page to open next.
     * No 302 redirect here: fetch would follow it automatically, and the page could no longer read the token from the header.
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
