package com.rudypp.security.web.controller;

import com.rudypp.BaseTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * @author Rudy Lyu
 * The React UI is served at / and must be reachable without a token; the APIs live under /api.
 * The UI files are only in the classpath after the Maven UI build, so these tests check access rules
 * (never 401) instead of page content: a page that wasn't built gives 404, a built one gives 200.
 */
public class UiAccessTest extends BaseTest {

    @Test
    public void should_not_require_token_for_ui_home_page() throws Exception {
        this.mockMvc.perform(get("/"))
                .andExpect(result -> assertNotEquals(401, result.getResponse().getStatus()));
    }

    @Test
    public void should_not_require_token_for_ui_assets() throws Exception {
        this.mockMvc.perform(get("/assets/index.js"))
                .andExpect(result -> assertNotEquals(401, result.getResponse().getStatus()));
    }

    @Test
    public void should_forward_ui_routes_to_index_without_token() throws Exception {
        // Opening or refreshing a client-side route must load the React app, not a 401 or 404
        for (String route : new String[]{"/login", "/dashboard", "/dashboard/learning", "/dashboard/notes",
                "/dashboard/bookmarks", "/dashboard/tasks", "/account"}) {
            this.mockMvc.perform(get(route))
                    .andExpect(status().isOk())
                    .andExpect(forwardedUrl("/index.html"));
        }
    }

    @Test
    public void should_not_forward_unknown_paths_to_the_ui() throws Exception {
        // Only listed routes become the React app; unknown pages, APIs and assets keep real error responses
        for (String path : new String[]{"/dashboard/unknown", "/dashboard/notes/extra", "/api/no-such-endpoint"}) {
            this.mockMvc.perform(get(path))
                    .andExpect(status().isUnauthorized());
        }
        this.mockMvc.perform(get("/assets/missing-file.js"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void should_let_browsers_cache_hashed_assets_for_a_year() throws Exception {
        // src/test/resources/static/assets/cache-test-a1b2c3.txt stands in for a Vite-built, hashed file
        this.mockMvc.perform(get("/assets/cache-test-a1b2c3.txt"))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "max-age=31536000, public, immutable"));
    }

    @Test
    public void should_not_cache_the_index_page() throws Exception {
        // index.html has no content hash: every visit must check for a new deployment
        this.mockMvc.perform(get("/login"))
                .andExpect(header().string("Cache-Control", org.hamcrest.Matchers.containsString("no-cache")));
    }

    @Test
    public void should_require_token_for_other_paths() throws Exception {
        this.mockMvc.perform(get("/home.html"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void should_not_serve_api_without_api_prefix() throws Exception {
        // The old context-path-relative URL is no longer a public endpoint
        this.mockMvc.perform(post("/auth/login")
                .content("{}")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}
