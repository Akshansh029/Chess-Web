package com.akshansh.chessweb.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.akshansh.chessweb.model.enums.Color;
import com.akshansh.chessweb.model.enums.PieceType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.type.PostgreSQLEnumJdbcType;

import java.time.Instant;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "moves")
public class MoveRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    @JsonIgnore
    private Game gameId;

    @Column(name = "move_number", nullable = false)
    private int moveNumber;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "color", nullable = false, columnDefinition = "piece_color")
    private Color color;

    @Column(name = "from_square", nullable = false)
    private String fromSquare;

    @Column(name = "to_square", nullable = false)
    private String toSquare;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "piece", nullable = false, columnDefinition = "piece_type")
    private PieceType piece;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "promotion_piece", columnDefinition = "piece_type")
    private PieceType promotionPiece;

    @Column(name = "is_capture", nullable = false)
    private boolean isCapture;

    @Column(name = "is_check", nullable = false)
    private boolean isCheck;

    @Column(name = "is_checkmate", nullable = false)
    private boolean isCheckmate;

    @Column(name = "is_castling", nullable = false)
    private boolean isCastling;

    @Column(name = "san_notation", nullable = false)
    private String sanNotation;

    @Column(name = "fen_after", nullable = false)
    private String fenAfter;

    @Column(name = "played_at", nullable = false)
    private Instant playedAt;
}
