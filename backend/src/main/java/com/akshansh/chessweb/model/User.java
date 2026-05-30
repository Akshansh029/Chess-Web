package com.akshansh.chessweb.model;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class User {
    private UUID id;
    private String username;
    private String email;
    private String passwordHash;
    private int eloRating;
    private Instant createAt;
    private Instant lastLoginAt;
    private boolean isActive;
}
