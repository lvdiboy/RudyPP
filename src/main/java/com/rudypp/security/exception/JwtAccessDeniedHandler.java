package com.rudypp.security.exception;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * @author Rudy Lyu
 * @description AccessDeniedHandler for authenticated users who access a resource without enough permission
 */
public class JwtAccessDeniedHandler implements AccessDeniedHandler {
    /**
     * Called when a user tries to access a protected REST resource without enough permission;
     * sends a 403 response with the error message
     */
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException {
        accessDeniedException = new AccessDeniedException("Sorry you don not enough permissions to access it!");
        response.sendError(HttpServletResponse.SC_FORBIDDEN, accessDeniedException.getMessage());
    }
}
