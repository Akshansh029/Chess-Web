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
public class DrawOfferAcceptRequest {
    @NotNull
    private UUID gameId;

    @NotNull
    private UUID offerAccepterByPlayerId;

    @NotBlank
    private String offerAcceptedByPlayerName;
}
