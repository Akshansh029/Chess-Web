package com.akshansh.chessweb.config;

import com.akshansh.chessweb.service.UserDetailsServiceImpl;
import com.akshansh.chessweb.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.http.HttpHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    public @Nullable Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(
                message,
                StompHeaderAccessor.class
        );

        if (accessor == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authorization = accessor.getFirstNativeHeader(HttpHeaders.AUTHORIZATION);
            if (authorization == null) {
                authorization = accessor.getFirstNativeHeader(HttpHeaders.AUTHORIZATION.toLowerCase());
            }

            if (authorization == null || !authorization.startsWith(BEARER_PREFIX)) {
                throw new AuthenticationCredentialsNotFoundException(
                        "Missing Bearer token in WebSocket CONNECT headers"
                );
            }

            String token = authorization.substring(BEARER_PREFIX.length());
            if (!jwtUtil.isTokenValid(token)) {
                throw new AuthenticationCredentialsNotFoundException(
                        "Invalid or expired WebSocket access token"
                );
            }

            String email = jwtUtil.extractEmail(token);
            UserDetails principal = userDetailsService.loadUserByUsername(email);
            var authentication = new UsernamePasswordAuthenticationToken(
                    principal,
                    null,
                    principal.getAuthorities()
            );

            accessor.setUser(authentication);
        }

        return message;
    }
}
