package com.rudypp.security.exception;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * @author Rudy Lyu
 * @description AuthenticationEntryPoint for anonymous users who access a protected resource
 */
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
    /**
     * Called when a user tries to access a protected REST resource with a missing, invalid or expired token;
     * sends a 401 response with the error message
     */
    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, authException.getMessage());
    }
}
