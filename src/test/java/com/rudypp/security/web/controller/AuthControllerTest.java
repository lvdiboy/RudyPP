package com.rudypp.security.web.controller;

import com.rudypp.BaseTest;
import com.rudypp.security.constants.SecurityConstants;
import com.rudypp.security.web.request.LoginRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

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
        this.mockMvc.perform(post("/auth/login")
                .content(objectMapper.writeValueAsString(loginRequest))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(header().exists(SecurityConstants.TOKEN_HEADER))
                .andExpect(jsonPath("$.redirect").value(SecurityConstants.HOME_PAGE));
    }

}
