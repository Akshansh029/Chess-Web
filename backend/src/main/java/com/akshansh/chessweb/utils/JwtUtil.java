package com.akshansh.chessweb.utils;

import com.akshansh.chessweb.model.entity.UserPrincipal;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {
    @Value("${jwt.secret-key}")
    private String jwtSecretKey;
    @Value("${jwt.issuer}")
    private String jwtIssuer;

    private final long ACCESS_EXPIRY_MS = 1000 * 60 * 10;      // 10 mins
    private final long REFRESH_EXPIRY_MS = 1000L * 60 * 60 * 24 * 30;      // 30 days

    @PostConstruct
    private void validateSecret() {
        if (jwtSecretKey == null || jwtSecretKey.isBlank()) {
            throw new IllegalStateException("JWT secret is missing. Configure JWT_SECRET_KEY environment variable.");
        }
    }

    private SecretKey getSecretKey(){
        return Keys.hmacShaKeyFor(jwtSecretKey.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(UserPrincipal principal){
        return Jwts.builder()
                .issuer(jwtIssuer)
                .subject(principal.getUserId().toString())
                .claim("userName", principal.getUsername())
                .claim("email", principal.getEmail())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + ACCESS_EXPIRY_MS))
                .signWith(getSecretKey())
                .compact();
    }

    public String extractEmail(String token){
        return Jwts.parser().verifyWith(getSecretKey()).build()
                .parseSignedClaims(token).getPayload().get("email").toString();
    }

    public boolean isTokenValid(String token){
        try{
            Jwts.parser().verifyWith(getSecretKey()).build().parseSignedClaims(token);
            return true;
        } catch (JwtException e){
            return false;
        }
    }

    // SHA-256 hash utility
    public String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hashBytes) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
