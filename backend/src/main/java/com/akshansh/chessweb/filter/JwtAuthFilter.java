package com.akshansh.chessweb.filter;

import com.akshansh.chessweb.service.UserDetailsServiceImpl;
import com.akshansh.chessweb.utils.JwtUtil;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String servletPath = request.getServletPath();

        // Skip JWT filter for OAuth2 paths
        return servletPath.startsWith("/api/v1/oauth2/") ||
                servletPath.startsWith("/api/v1/login/oauth2/") ||
                servletPath.startsWith("/api/v1/auth/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // Read authorization header
        String authHeader = request.getHeader("Authorization");

        // If no bearer token, then skip this filter
        if(authHeader == null || !authHeader.startsWith("Bearer ")){
            filterChain.doFilter(request, response);
            return;
        }

        // Extract token
        String token = authHeader.substring(7);

        // Validate jwt token
        try{
            if(jwtUtil.isTokenValid(token)){
                String email = jwtUtil.extractEmail(token);
                UserDetails principal = userDetailsService.loadUserByUsername(email);

                // Create auth object and store it
                var authToken = new UsernamePasswordAuthenticationToken(
                        principal, null, principal.getAuthorities()
                );

                // Adding request object in auth token (best practice)
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (JwtException e) {
            // Store exception as request attribute, then let Spring Security handle it
            request.setAttribute("jwt_exception", e);
            SecurityContextHolder.clearContext();
            return;
        } catch (UsernameNotFoundException e) {
            request.setAttribute("username_not_found_exception", e);
            SecurityContextHolder.clearContext();
            return;
        }

        // Pass to the next filter
        filterChain.doFilter(request, response);
    }
}
