package com.akshansh.chessweb.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DrawOfferRequest {
    @NotNull
    private UUID gameId;

    @NotNull
    private UUID playerId;

    @NotBlank
    private String playerName;

    @NotNull
    private UUID opponentId;

    @NotBlank
    private String opponentName;
}
