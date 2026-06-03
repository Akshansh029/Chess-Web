package com.akshansh.chessweb.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TokenResponse {
    private String message;
    private String accessToken;
    private String refreshToken;
}
