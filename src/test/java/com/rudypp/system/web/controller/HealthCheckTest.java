package com.rudypp.system.web.controller;

import com.rudypp.BaseTest;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * @author Rudy Lyu
 * deploy/validate.sh calls /api/actuator/health without a token; it must not need one
 */
public class HealthCheckTest extends BaseTest {

    @Test
    public void should_get_health_without_token() throws Exception {
        this.mockMvc.perform(get("/api/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    public void should_not_expose_other_actuator_endpoints() throws Exception {
        this.mockMvc.perform(get("/api/actuator/env"))
                .andExpect(status().isUnauthorized());
    }
}
