package com.rudypp.security.service;

import com.rudypp.security.utils.CurrentUserUtil;
import com.rudypp.security.utils.JwtTokenUtil;
import com.rudypp.security.web.request.LoginRequest;
import com.rudypp.security.entity.JwtUser;
import com.rudypp.system.entity.User;
import com.rudypp.system.exception.UserNameNotFoundException;
import com.rudypp.system.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Rudy Lyu
 */
@Service
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
@Slf4j
public class AuthService {
    private final UserService userService;
    private final StringRedisTemplate stringRedisTemplate;
    private final CurrentUserUtil currentUserUtil;

    public String createToken(LoginRequest loginRequest) {
        User user;
        try {
            user = userService.find(loginRequest.getUsername());
        } catch (UserNameNotFoundException ex) {
            // 用户不存在与密码错误返回相同的提示，避免泄露用户名是否存在
            throw new BadCredentialsException("The user name or password is not correct.");
        }
        if (loginRequest.getPassword() == null || !userService.check(loginRequest.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("The user name or password is not correct.");
        }
        JwtUser jwtUser = new JwtUser(user);
        if (!jwtUser.isEnabled()) {
            throw new BadCredentialsException("User is forbidden to login");
        }
        List<String> authorities = jwtUser.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
        boolean rememberMe = Boolean.TRUE.equals(loginRequest.getRememberMe());
        String token = JwtTokenUtil.createToken(user.getUserName(), user.getId().toString(), authorities, rememberMe);
        // redis 中 token 的过期时间与 JWT 保持一致
        stringRedisTemplate.opsForValue().set(user.getId().toString(), token,
                Duration.ofSeconds(JwtTokenUtil.getExpiration(rememberMe)));
        return token;
    }

    public void removeToken() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                log.warn("No authenticated user found for logout");
                return;
            }
            
            User currentUser = currentUserUtil.getCurrentUser();
            if (currentUser != null && currentUser.getId() != null) {
                String userId = currentUser.getId().toString();
                log.info("Removing token for user ID: {}", userId);
                Boolean deleted = stringRedisTemplate.delete(userId);
                log.info("Token deletion result: {}", deleted);
            } else {
                log.warn("User ID is null, cannot remove token");
            }
        } catch (UserNameNotFoundException ex) {
            log.error("User not found during logout: {}", ex.getMessage());
            throw ex;
        } catch (Exception ex) {
            log.error("Error during logout: {}", ex.getMessage());
            throw ex;
        }
    }
}
