package com.rudypp.security.constants;

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

    // Page to go to after a successful login (relative to the context path)
    public static final String HOME_PAGE = "/home.html";

    // Static resources such as the login page are public (home.html checks the token in the browser)
    public static final String[] STATIC_WHITELIST = {
            "/",
            "/index.html",
            HOME_PAGE,
            "/css/**",
            "/js/**"
    };

    // Health check for the deploy script and load balancers (only health is exposed, see management.* in application.yaml)
    public static final String[] ACTUATOR_WHITELIST = {
            "/actuator/health",
            "/actuator/health/**"
    };

    // System WHITELIST
    public static final String[] SYSTEM_WHITELIST = {
            "/auth/login",
            "/users/sign-up"
    };

    private SecurityConstants() {
    }

}
