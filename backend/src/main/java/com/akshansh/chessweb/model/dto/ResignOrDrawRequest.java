package com.akshansh.chessweb.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResignDrawRequest {
    @NotBlank
    private UUID gameId;

    @NotBlank
    private UUID playerId;

    @NotBlank
    private String playerName;
}
