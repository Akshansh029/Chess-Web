package com.akshansh.chessweb.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@AllArgsConstructor
public class UserDetailsDto {
    private UUID id;
    private String username;
    private String email;
    private int eloRating;
    private boolean isActive;
    private Instant createdAt;
    private int gamesPlayed;
    private int gamesWon;
    private int gamesLost;
    private int gamesDraw;
    private float winPercentage;
}
