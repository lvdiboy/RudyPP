package com.rudypp.security.constants;

import com.rudypp.system.config.WebConfig;

/**
 * @author Rudy Lyu
 * @description Spring Security constants
 */
public final class SecurityConstants {

    /**
     * Claim key for the roles
     **/
    public static final String ROLE_CLAIMS = "rol";

    /**
     * Token lifetime when rememberMe is false: 1 hour
     */
    public static final long EXPIRATION = 60 * 60L;

    /**
     * Token lifetime when rememberMe is true: 7 days
     */
    public static final long EXPIRATION_REMEMBER = 60 * 60 * 24 * 7L;

    /**
     * JWT signing key. Read from the JWT_SECRET_KEY environment variable; falls back to a local-development-only default (at least 32 bytes).
     */
    public static final String JWT_SECRET_KEY = System.getenv().getOrDefault("JWT_SECRET_KEY",
            "C*F-JaNdRgUkXn2r5u8x/A?D(G+KbPeShVmYq3s6v9y$B&E)H@McQfTjWnZr4u7w");

    // JWT token defaults
    public static final String TOKEN_HEADER = "Authorization";
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String TOKEN_TYPE = "JWT";

    // Page to go to after a successful login: the React UI's home page
    public static final String HOME_PAGE = "/";

    // The React UI is public: index.html at /, hashed JS/CSS under /assets, files from RudyPPUI/public,
    // and the client routes UiRouteController forwards to index.html (the pages themselves check the login)
    public static final String[] STATIC_WHITELIST = {
            HOME_PAGE,
            "/index.html",
            "/assets/**",
            "/favicon-32.png",
            "/favicon-192.png",
            "/apple-touch-icon.png",
            "/login",
            "/dashboard",
            "/dashboard/learning",
            "/dashboard/notes",
            "/dashboard/bookmarks",
            "/dashboard/tasks",
            "/account"
    };

    // Health check for the deploy script and load balancers (only health is exposed, see management.* in application.yaml)
    public static final String[] ACTUATOR_WHITELIST = {
            WebConfig.API_PREFIX + "/actuator/health",
            WebConfig.API_PREFIX + "/actuator/health/**"
    };

    // System WHITELIST
    public static final String[] SYSTEM_WHITELIST = {
            WebConfig.API_PREFIX + "/auth/login",
            WebConfig.API_PREFIX + "/users/sign-up"
    };

    private SecurityConstants() {
    }

}
