> **Note:** The code samples in this article use the older Spring Security 5 API (for example `WebSecurityConfigurerAdapter`, which was removed in Spring Security 6). The concepts still apply, but this project's current code is different; see `src/main/java/com/rudypp/security`.

## Introduction to Spring Security

Spring Security is one of the Spring modules with a steeper learning curve. Below is a short introduction to where it came from and what it is.

- **Origin:** Spring Security started as Acegi Security, a framework that gave Spring-based enterprise applications a powerful, flexible security and access control solution. It made full use of Spring's IoC and AOP features to provide declarative access control. As the project grew, Acegi Security became an official Spring subproject and was later renamed "Spring Security".
- **Definition:** Spring Security is a powerful and highly customizable framework that focuses on providing both authentication and authorization to Java applications. ([official description](https://spring.io/projects/spring-security))

## Session vs. Token Authentication

### Session authentication

A common approach is to identify a user by a session ID, which is usually stored in Redis. For example: the user logs in successfully, and the server returns a cookie that contains the session ID. Every request from the user then carries the session ID, so the backend knows who the user is.

In more detail:

![Session Based Authentication flow](https://my-blog-to-use.oss-cn-beijing.aliyuncs.com/2019-7/Session-Based-Authentication-flow.png)

1. The user sends a user name and password to the server to log in.
2. After verifying them, the server creates a session for the user and stores the session data.
3. The server returns a session ID to the user, which is written to a cookie.
4. While the user stays logged in, the cookie is sent with every following request.
5. The server compares the session ID in the cookie with the session data stored in memory or in a database to verify the user, and includes the user's current state in its response.

### Token authentication

In an application that uses token-based authentication, the server creates a token from a `Payload`, a `Header` and a `secret`, and sends the token to the client. The client stores the token in a cookie or in localStorage and includes it in every later request. You could put it in a cookie so it's sent automatically, but that doesn't work across domains. A better approach is to put it in the `Authorization` HTTP header: `Authorization: Bearer Token`.

In more detail:

![Token Based Authentication flow](https://my-blog-to-use.oss-cn-beijing.aliyuncs.com/2019-7/Token-Based-Authentication.png)

1. The user sends a user name and password to the server to log in.
2. The authentication service responds with a signed JWT that says who the user is.
3. From then on, the user sends the JWT in the header of every request to the backend.
4. The server checks the JWT and reads the user's information from it.

## Key Classes in the Project

### Configuration class

In this project, our custom `SecurityConfig` extends `WebSecurityConfigurerAdapter`. `WebSecurityConfigurerAdapter` provides `HttpSecurity` to configure CORS, CSRF, session management and the rules for protected resources.

The configuration class mainly sets up:

1. The password encoder, `BCryptPasswordEncoder` (passwords stored in the database must be hashed).
2. The custom `UserDetailsService` and the password encoder for the `AuthenticationManager`.
3. Which paths require an authenticated user, which don't, and which can only be accessed by specific roles.
4. Our two custom filters.
5. Our two custom exception handlers for authentication and authorization errors.

```java
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    UserDetailsServiceImpl userDetailsServiceImpl;

    /**
     * Password encoder
     */
    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService createUserDetailsService() {
        return userDetailsServiceImpl;
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        // Set the custom userDetailsService and the password encoder
        auth.userDetailsService(userDetailsServiceImpl).passwordEncoder(bCryptPasswordEncoder());
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.cors().and()
                // Disable CSRF
                .csrf().disable()
                .authorizeRequests()
                .antMatchers(HttpMethod.POST, "/auth/login").permitAll()
                // Resources under these paths require an authenticated user
                .antMatchers("/api/**").authenticated()
                .antMatchers(HttpMethod.DELETE, "/api/**").hasRole("ADMIN")
                // Everything else is allowed
                .anyRequest().permitAll()
                .and()
                // Add the custom filters
                .addFilter(new JWTAuthenticationFilter(authenticationManager()))
                .addFilter(new JWTAuthorizationFilter(authenticationManager()))
                // Stateless: never create a session
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
                // Handle authentication and authorization errors
                .exceptionHandling().authenticationEntryPoint(new JWTAuthenticationEntryPoint())
                .accessDeniedHandler(new JWTAccessDeniedHandler());

    }

}

```

**CORS:**

One pitfall here: if you don't call `exposedHeaders("Authorization")` to expose the "Authorization" header to client applications, the frontend can't read the token.

```java
@Configuration
public class CorsConfiguration implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                // Expose other headers to client applications.
                // Without this, the frontend can't read Authorization (the token) from the response headers.
                .exposedHeaders("Authorization")
                .allowCredentials(true)
                .allowedMethods("GET", "POST", "DELETE", "PUT")
                .maxAge(3600);
    }
}
```

### Utility class

```java
public class JwtTokenUtils {


    /**
     * Signing key that is strong enough for a spec-compliant signature
     */
    private static byte[] apiKeySecretBytes = DatatypeConverter.parseBase64Binary(SecurityConstants.JWT_SECRET_KEY);
    private static SecretKey secretKey = Keys.hmacShaKeyFor(apiKeySecretBytes);

    public static String createToken(String username, List<String> roles, boolean isRememberMe) {
        long expiration = isRememberMe ? SecurityConstants.EXPIRATION_REMEMBER : SecurityConstants.EXPIRATION;

        String tokenPrefix = Jwts.builder()
                .setHeaderParam("typ", SecurityConstants.TOKEN_TYPE)
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .claim(SecurityConstants.ROLE_CLAIMS, String.join(",", roles))
                .setIssuer("SnailClimb")
                .setIssuedAt(new Date())
                .setSubject(username)
                .setExpiration(new Date(System.currentTimeMillis() + expiration * 1000))
                .compact();
        return SecurityConstants.TOKEN_PREFIX + tokenPrefix;
    }

    private boolean isTokenExpired(String token) {
        Date expiredDate = getTokenBody(token).getExpiration();
        return expiredDate.before(new Date());
    }

    public static String getUsernameByToken(String token) {
        return getTokenBody(token).getSubject();
    }

    /**
     * Gets all of the user's roles
     */
    public static List<SimpleGrantedAuthority> getUserRolesByToken(String token) {
        String role = (String) getTokenBody(token)
                .get(SecurityConstants.ROLE_CLAIMS);
        return Arrays.stream(role.split(","))
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }

    private static Claims getTokenBody(String token) {
        return Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody();
    }
}
```



### Loading the user stored on the server

Spring Security's `UserDetailsService` has one method, `loadUserByUsername()`, which returns a `UserDetails` object, found by user name, that Spring Security can use for authentication.

```java
package org.springframework.security.core.userdetails;
/**
 * Core interface which loads user-specific data.
 */
public interface UserDetailsService {
	UserDetails loadUserByUsername(String username) throws UsernameNotFoundException;
}
```

`UserDetails` holds the information needed to build an authentication object (for example, the user name and password).

```java
package org.springframework.security.core.userdetails;
/**
 * Provides core user information.
 */
public interface UserDetails extends Serializable {
  Collection<? extends GrantedAuthority> getAuthorities();
  String getPassword();
  String getUsername();
  boolean isAccountNonExpired();
  boolean isAccountNonLocked();
  boolean isCredentialsNonExpired();
  boolean isEnabled();
}
```

Usually we implement the `UserDetailsService` interface and override its `loadUserByUsername()` method.

```java
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserService userService;

    public UserDetailsServiceImpl(UserService userService) {
        this.userService = userService;
    }
    @Override
    public UserDetails loadUserByUsername(String name) throws UsernameNotFoundException {
        User user = userService.findUserByUserName(name);
        return new JwtUser(user);
    }

}
```

### Authentication filter (important)

> Before reading about the filters below, it helps to know the basics of filters and how to implement one in Spring Boot. Recommended reading: [Implementing filters in Spring Boot](https://github.com/Snailclimb/springboot-guide/blob/master/docs/basis/springboot-filter.md) (in Chinese).

The first filter, `JWTAuthenticationFilter`, logs the user in with their user name and password (the request must contain both). To do this, it extends `UsernamePasswordAuthenticationFilter` and overrides these three methods:

1. `attemptAuthentication()`: authenticates the user.
2. `successfulAuthentication()`: called after the user is authenticated successfully.
3. `unsuccessfulAuthentication()`: called when authentication fails.

```java
/**
 * If the user name and password are correct, the filter creates a JWT and returns it in the HTTP response header,
 * in the format token: "Bearer <token>"
 */
public class JWTAuthenticationFilter extends UsernamePasswordAuthenticationFilter {

    private ThreadLocal<Boolean> rememberMe = new ThreadLocal<>();
    private AuthenticationManager authenticationManager;

    public JWTAuthenticationFilter(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
        // Set the login request URL
        super.setFilterProcessesUrl(SecurityConstants.AUTH_LOGIN_URL);
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request,
                                                HttpServletResponse response) throws AuthenticationException {

        ObjectMapper objectMapper = new ObjectMapper();
        try {
            // Read the login data from the input stream
            LoginUser loginRequest = objectMapper.readValue(request.getInputStream(), LoginUser.class);
            rememberMe.set(loginRequest.getRememberMe());
            // This is the same as the original attemptAuthentication source,
            // but that one hard-codes the user name and password parameter names, so we override it
            UsernamePasswordAuthenticationToken authRequest = new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(), loginRequest.getPassword());
            return authenticationManager.authenticate(authRequest);
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * If authentication succeeds, create and return the token
     */
    @Override
    protected void successfulAuthentication(HttpServletRequest request,
                                            HttpServletResponse response,
                                            FilterChain chain,
                                            Authentication authentication) {

        JwtUser jwtUser = (JwtUser) authentication.getPrincipal();
        List<String> roles = jwtUser.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
        // Create the token
        String token = JwtTokenUtils.createToken(jwtUser.getUsername(), roles, rememberMe.get());
        // Return the token in the HTTP response header
        response.setHeader(SecurityConstants.TOKEN_HEADER, token);
    }


    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response, AuthenticationException authenticationException) throws IOException {
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, authenticationException.getMessage());
    }
}
```

A few important points about this filter:

1. `UsernamePasswordAuthenticationToken`: holds the {user name, password} from the login request; the `AuthenticationManager` uses it to authenticate the account.
2. `authenticationManager.authenticate(authRequest)`: this authenticates the user. It calls `loadUserByUsername()` in `UserDetailsServiceImpl` to verify the user (the configuration class tells the `AuthenticationManager` to use our `UserDetailsServiceImpl`). On success it returns a fully populated `Authentication` object (including the granted authorities), and then `successfulAuthentication` is called.

```java
package org.springframework.security.authentication;
 /**
  * Attempts to authenticate the passed Authentication object, returning a fully populated
  * Authentication object (including granted authorities) if successful.
  */
public interface AuthenticationManager {
	Authentication authenticate(Authentication authentication)
			throws AuthenticationException;
}
```

### Authorization filter (important)

This filter extends `BasicAuthenticationFilter` and handles resources that require authentication. It checks whether the HTTP request has an Authorization header with a token, and validates the token.

This class does most of the work when a user accesses a protected resource with a token. Step by step:

1. When the user sends a request with the token issued by the system, it first goes through `doFilterInternal()`. This method reads the token from the request header and checks that it isn't empty and has the right format.
2. If the header contains a correctly formatted token, the filter parses it, checks that it's valid, and then sets the authentication globally in Spring Security: `SecurityContextHolder.getContext().setAuthentication(getAuthentication(authorization));`

```java
/**
 * Filters every HTTP request and checks for an Authorization header with a valid token,
 * i.e. one that has not expired and has a correct signature.
 */
public class JWTAuthorizationFilter extends BasicAuthenticationFilter {

    private static final Logger logger = Logger.getLogger(JWTAuthorizationFilter.class.getName());

    public JWTAuthorizationFilter(AuthenticationManager authenticationManager) {
        super(authenticationManager);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws IOException, ServletException {

        String authorization = request.getHeader(SecurityConstants.TOKEN_HEADER);
        // No Authorization header: let the request through
        if (authorization == null || !authorization.startsWith(SecurityConstants.TOKEN_PREFIX)) {
            chain.doFilter(request, response);
            return;
        }
        // The header has a token: parse it and set the authentication
        SecurityContextHolder.getContext().setAuthentication(getAuthentication(authorization));
        super.doFilterInternal(request, response, chain);
    }

    /**
     * Reads the user from the token and creates a new authentication token
     */
    private UsernamePasswordAuthenticationToken getAuthentication(String authorization) {
        String token = authorization.replace(SecurityConstants.TOKEN_PREFIX, "");

        try {
            String username = JwtTokenUtils.getUsernameByToken(token);
            // Get the user's roles from the token
            List<SimpleGrantedAuthority> userRolesByToken = JwtTokenUtils.getUserRolesByToken(token);
            if (!StringUtils.isEmpty(username)) {
                return new UsernamePasswordAuthenticationToken(username, null, userRolesByToken);
            }
        } catch (SignatureException | ExpiredJwtException exception) {
            logger.warning("Request to parse JWT with invalid signature . Detail : " + exception.getMessage());
        }
        return null;
    }
}
```

### Getting the current user

As described in the filter section, when an authenticated user accesses the system, their authentication is stored globally in Spring Security. That makes it easy to get the current user's authentication anywhere else: just call `SecurityContextHolder.getContext().getAuthentication();`.

`SecurityContextHolder` holds the `SecurityContext`, and the `SecurityContext` holds the authenticated `Authentication`.

So we wrote a class dedicated to getting the current user:

```java
/**
 * Gets the user of the current request
 */
@Component
public class CurrentUser {

    private final UserDetailsServiceImpl userDetailsService;

    public CurrentUser(UserDetailsServiceImpl userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    public JwtUser getCurrentUser() {
        return (JwtUser) userDetailsService.loadUserByUsername(getCurrentUserName());
    }

    /**
     * TODO: Injecting UserDetailsServiceImpl into JWTAuthorizationFilter kept failing, so the user couldn't be
     * looked up there. As a result, the principal stored in the Authentication is the current user's name taken from the token.
     */
    private static String getCurrentUserName() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() != null) {
            return (String) authentication.getPrincipal();
        }
        return null;
    }
}
```

### Exceptions

#### AccessDeniedHandler

`JWTAccessDeniedHandler` implements `AccessDeniedHandler` and handles authenticated users who access a resource they don't have permission for.

```java
/**
 * AccessDeniedHandler for authenticated users who access a resource without enough permission
 */
public class JWTAccessDeniedHandler implements AccessDeniedHandler {
    /**
     * Called when a user tries to access a protected REST resource without enough permission;
     * sends a 403 response with the error message
     */
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException {
        accessDeniedException = new AccessDeniedException("Sorry you don not enough permissions to access it!");
        response.sendError(HttpServletResponse.SC_FORBIDDEN, accessDeniedException.getMessage());
    }
}

```

#### AuthenticationEntryPoint

`JWTAuthenticationEntryPoint` implements `AuthenticationEntryPoint` and handles anonymous users who access a protected resource.

```java
/**
 * AuthenticationEntryPoint for anonymous users who access a protected resource
 */
public class JWTAuthenticationEntryPoint implements AuthenticationEntryPoint {
    /**
     * Called when a user tries to access a protected REST resource without a token or with an expired token;
     * sends a 401 response with the error message
     */
    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, authException.getMessage());
    }
}
```

### Controller for checking the permission setup

`UserController` is mainly used to check that the permission configuration works.

`getAllUser()` is annotated with `@PreAuthorize("hasAnyRole('ROLE_DEV','ROLE_PM')")`, so the DEV and PM roles can call it. `deleteUserById()` is annotated with `@PreAuthorize("hasAnyRole('ROLE_ADMIN')")`, so only ADMIN can call it.

```java
@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;

    private final CurrentUser currentUser;

    public UserController(UserService userService, CurrentUser currentUser) {
        this.userService = userService;
        this.currentUser = currentUser;
    }

    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('ROLE_DEV','ROLE_PM')")
    public ResponseEntity<Page<User>> getAllUser(@RequestParam(value = "pageNum", defaultValue = "0") int pageNum, @RequestParam(value = "pageSize", defaultValue = "10") int pageSize) {
        System.out.println("Current user calling this endpoint: " + currentUser.getCurrentUser().toString());
        Page<User> allUser = userService.getAllUser(pageNum, pageSize);
        return ResponseEntity.ok().body(allUser);
    }


    @DeleteMapping("/user")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    public ResponseEntity<User> deleteUserById(@RequestParam("username") String username) {
        userService.deleteUserByUserName(username);
        return ResponseEntity.ok().build();
    }
}
```

## Further Reading

- [Spring Security reference documentation](https://docs.spring.io/spring-security/reference/)
- [Spring Security (1): Architecture Overview](https://www.cnkirito.moe/spring-security-1/) (in Chinese)
