package com.akshansh.chessweb.model.dto;

import com.akshansh.chessweb.model.enums.Color;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MoveRequest {
    @NotBlank
    private UUID gameId;

    @NotBlank
    private UUID playerId;

    private MoveDto move;

    private Color color;
}
