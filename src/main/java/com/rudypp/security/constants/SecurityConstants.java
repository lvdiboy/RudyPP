package com.rudypp.security.constants;

/**
 * @author Rudy Lyu
 * @description Spring Security相关配置常量
 */
public final class SecurityConstants {

    /**
     * 角色的key
     **/
    public static final String ROLE_CLAIMS = "rol";

    /**
     * rememberMe 为 false 的时候过期时间是1个小时
     */
    public static final long EXPIRATION = 60 * 60L;

    /**
     * rememberMe 为 true 的时候过期时间是7天
     */
    public static final long EXPIRATION_REMEMBER = 60 * 60 * 24 * 7L;

    /**
     * JWT签名密钥，优先读取环境变量 JWT_SECRET_KEY，未设置时使用仅供本地开发的默认值（至少 32 字节）。
     */
    public static final String JWT_SECRET_KEY = System.getenv().getOrDefault("JWT_SECRET_KEY",
            "C*F-JaNdRgUkXn2r5u8x/A?D(G+KbPeShVmYq3s6v9y$B&E)H@McQfTjWnZr4u7w");

    // JWT token defaults
    public static final String TOKEN_HEADER = "Authorization";
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String TOKEN_TYPE = "JWT";

    public static final String H2_CONSOLE = "/h2-console/**";

    // 登录成功后跳转的页面（相对于 context-path）
    public static final String HOME_PAGE = "/home.html";

    // 登录页面等静态资源，无需认证即可访问（home.html 的登录校验在前端通过 Token 完成）
    public static final String[] STATIC_WHITELIST = {
            "/",
            "/index.html",
            HOME_PAGE,
            "/css/**",
            "/js/**"
    };

    // System WHITELIST
    public static final String[] SYSTEM_WHITELIST = {
            "/auth/login",
            "/users/sign-up"
    };

    private SecurityConstants() {
    }

}
