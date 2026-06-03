package com.akshansh.chessweb.filter;

import com.akshansh.chessweb.model.entity.UserPrincipal;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String userId = extractUserIdFromSecurityContext();
        String requestId = UUID.randomUUID().toString().substring(0, 8);
        long start = System.currentTimeMillis();

        // requestId so every log line in this thread carries it
        MDC.put("requestId", requestId);
        MDC.put("userId", userId);

        log.info("IN method={} uri={} userId= {} ip={}",
                request.getMethod(),
                request.getRequestURI(),
                userId,
                request.getRemoteAddr());

        try {
            filterChain.doFilter(request, response);
        } finally {
            log.info("OUT method={} uri={} status={} userId={} duration={}ms",
                    request.getMethod(),
                    request.getRequestURI(),
                    response.getStatus(),
                    userId,
                    System.currentTimeMillis() - start);
            MDC.clear();
        }
    }

    private String extractUserIdFromSecurityContext() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return "anonymous";
        }

        Object principal = auth.getPrincipal();
        if (principal instanceof UserPrincipal userPrincipal) {
            return userPrincipal.getUserId().toString();
        }

        return auth.getName();
    }
}
