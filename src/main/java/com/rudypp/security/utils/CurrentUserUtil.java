package com.rudypp.security.utils;

import com.rudypp.system.entity.User;
import com.rudypp.system.exception.UserNameNotFoundException;
import com.rudypp.system.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * @author Rudy Lyu
 * @description Gets the user of the current request
 */
@Component
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
@Slf4j
public class CurrentUserUtil {

    private final UserService userService;

    public User getCurrentUser() {
        String username = getCurrentUserName();
        if (username == null || username.isEmpty()) {
            log.error("No username found in security context");
            Map<String, Object> data = new HashMap<>();
            data.put("message", "Current user not found, please make sure you are logged in");
            throw new UserNameNotFoundException(data);
        }
        log.debug("Getting current user with username: {}", username);
        return userService.find(username);
    }

    private String getCurrentUserName() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() != null) {
            log.debug("Authentication principal: {}, type: {}",
                     authentication.getPrincipal(), 
                     authentication.getPrincipal().getClass().getName());
            return (String) authentication.getPrincipal();
        }
        return null;
    }
}
