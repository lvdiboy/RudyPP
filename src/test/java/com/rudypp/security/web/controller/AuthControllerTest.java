package com.rudypp.security.web.controller;

import com.rudypp.BaseTest;
import com.rudypp.security.constants.SecurityConstants;
import com.rudypp.security.web.request.LoginRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


/**
 * @author Rudy Lyu
 */
public class AuthControllerTest extends BaseTest {
    @Test
    public void should_login_success_and_get_token_in_header() throws Exception {
        LoginRequest loginRequest = new LoginRequest("root", "root", true);
        this.mockMvc.perform(post("/api/auth/login")
                .content(objectMapper.writeValueAsString(loginRequest))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(header().exists(SecurityConstants.TOKEN_HEADER))
                .andExpect(jsonPath("$.redirect").value(SecurityConstants.HOME_PAGE));
    }

    @Test
    public void should_login_fail_and_get_401_when_password_is_wrong() throws Exception {
        LoginRequest loginRequest = new LoginRequest("root", "wrong-password", false);
        this.mockMvc.perform(post("/api/auth/login")
                .content(objectMapper.writeValueAsString(loginRequest))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void should_access_protected_api_with_token_and_be_rejected_after_logout() throws Exception {
        String token = login("root", "root");

        this.mockMvc.perform(get("/api/users").header(SecurityConstants.TOKEN_HEADER, token))
                .andExpect(status().isOk());

        this.mockMvc.perform(post("/api/auth/logout").header(SecurityConstants.TOKEN_HEADER, token))
                .andExpect(status().isOk());

        // Logout removes the token from Redis, so the same token no longer works
        this.mockMvc.perform(get("/api/users").header(SecurityConstants.TOKEN_HEADER, token))
                .andExpect(status().isUnauthorized());
    }

    private String login(String username, String password) throws Exception {
        LoginRequest loginRequest = new LoginRequest(username, password, false);
        return this.mockMvc.perform(post("/api/auth/login")
                .content(objectMapper.writeValueAsString(loginRequest))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn().getResponse().getHeader(SecurityConstants.TOKEN_HEADER);
    }

}
