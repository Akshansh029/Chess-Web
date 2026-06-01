package com.akshansh.chessweb.model.dto;

import com.akshansh.chessweb.model.enums.PieceType;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MoveDto {

    @NotBlank
    private String from;

    @NotBlank
    private String to;

    @NotBlank
    private PieceType piece;

    private String promotionPiece;
}
