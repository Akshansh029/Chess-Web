package com.akshansh.chessweb.model.dto;

import com.akshansh.chessweb.model.enums.Color;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateGameReqDto {
    private UUID playerId;
    private String playerName;
    private Color playerColor;
}
