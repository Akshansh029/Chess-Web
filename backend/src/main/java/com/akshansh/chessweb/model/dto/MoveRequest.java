package com.akshansh.chessweb.model.dto;

import com.akshansh.chessweb.model.enums.Color;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
    @NotNull
    private UUID gameId;

    private MoveDto move;

    private Color color;
}
