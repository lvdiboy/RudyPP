package com.rudypp.security.filter;

import com.rudypp.security.constants.SecurityConstants;
import com.rudypp.security.utils.JwtTokenUtil;
import io.jsonwebtoken.JwtException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * @author Rudy Lyu
 * @description Filters every HTTP request and checks for an Authorization header with a valid token, i.e. one that has not expired and has a correct signature.
 */
@Slf4j
public class JwtAuthorizationFilter extends BasicAuthenticationFilter {

    private final StringRedisTemplate stringRedisTemplate;

    public JwtAuthorizationFilter(AuthenticationManager authenticationManager, StringRedisTemplate stringRedisTemplate) {
        super(authenticationManager);
        this.stringRedisTemplate = stringRedisTemplate;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws IOException, ServletException {

        String token = request.getHeader(SecurityConstants.TOKEN_HEADER);
        if (token == null || !token.startsWith(SecurityConstants.TOKEN_PREFIX)) {
            log.debug("No token found in request header or invalid format");
            SecurityContextHolder.clearContext();
            chain.doFilter(request, response);
            return;
        }
        
        String tokenValue = token.substring(SecurityConstants.TOKEN_PREFIX.length());
        UsernamePasswordAuthenticationToken authentication = null;
        try {
            String previousToken = stringRedisTemplate.opsForValue().get(JwtTokenUtil.getId(tokenValue));
            if (previousToken == null) {
                log.warn("Token not found in Redis - user may be logged out or token expired");
                SecurityContextHolder.clearContext();
                chain.doFilter(request, response);
                return;
            }
            
            if (!token.equals(previousToken)) {
                log.warn("Token in request doesn't match stored token - possible token reuse attempt");
                SecurityContextHolder.clearContext();
                chain.doFilter(request, response);
                return;
            }
            
            authentication = JwtTokenUtil.getAuthentication(tokenValue);
            if (authentication != null && authentication.getPrincipal() != null) {
                log.debug("Successfully authenticated user: {}", authentication.getPrincipal());
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else {
                log.warn("Could not create authentication from token");
                SecurityContextHolder.clearContext();
            }
        } catch (JwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            SecurityContextHolder.clearContext();
        } catch (Exception e) {
            log.error("Error processing authentication: {}", e.getMessage());
            SecurityContextHolder.clearContext();
        }
        
        chain.doFilter(request, response);
    }
}


