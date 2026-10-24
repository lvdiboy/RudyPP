package com.rudypp.security.utils;

import com.rudypp.security.constants.SecurityConstants;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Rudy Lyu
 * @description JWT工具类
 */
public class JwtTokenUtil {

    /**
     * 生成足够的安全随机密钥，以适合符合规范的签名
     */
    private static final byte[] API_KEY_SECRET_BYTES = SecurityConstants.JWT_SECRET_KEY.getBytes(StandardCharsets.UTF_8);
    private static final SecretKey SECRET_KEY = Keys.hmacShaKeyFor(API_KEY_SECRET_BYTES);

    /**
     * token 有效期（秒）
     */
    public static long getExpiration(boolean isRememberMe) {
        return isRememberMe ? SecurityConstants.EXPIRATION_REMEMBER : SecurityConstants.EXPIRATION;
    }

    public static String createToken(String username, String id, List<String> roles, boolean isRememberMe) {
        long expiration = getExpiration(isRememberMe);
        final Date createdDate = new Date();
        final Date expirationDate = new Date(createdDate.getTime() + expiration * 1000);
        
        String tokenPrefix = Jwts.builder()
                .header()
                .type(SecurityConstants.TOKEN_TYPE)
                .and()
                .issuer("SnailClimb")
                .subject(username)
                .issuedAt(createdDate)
                .expiration(expirationDate)
                .id(id)
                .claim(SecurityConstants.ROLE_CLAIMS, String.join(",", roles))
                .signWith(SECRET_KEY)
                .compact();
                
        return SecurityConstants.TOKEN_PREFIX + tokenPrefix; // 添加 token 前缀 "Bearer ";
    }

    public static String getId(String token) {
        Claims claims = getClaims(token);
        return claims.getId();
    }

    public static UsernamePasswordAuthenticationToken getAuthentication(String token) {
        Claims claims = getClaims(token);
        List<SimpleGrantedAuthority> authorities = getAuthorities(claims);
        String userName = claims.getSubject();
        return new UsernamePasswordAuthenticationToken(userName, token, authorities);
    }

    private static List<SimpleGrantedAuthority> getAuthorities(Claims claims) {
        String role = claims.get(SecurityConstants.ROLE_CLAIMS, String.class);
        if (role == null || role.isBlank()) {
            return List.of();
        }
        return Arrays.stream(role.split(","))
                .filter(r -> !r.isBlank())
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }

    private static Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(SECRET_KEY)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
