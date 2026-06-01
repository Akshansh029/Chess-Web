package com.akshansh.chessweb.model.entity;

import com.akshansh.chessweb.model.enums.GameResult;
import com.akshansh.chessweb.model.enums.GameStatus;
import com.akshansh.chessweb.model.enums.GameTerminationReason;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "games")
public class Game {
    @Id
    private UUID id;

    @NotNull
    @Column(name = "white_player_id", nullable = false)
    private UUID whitePlayerId;

    @Column(name = "black_player_id")
    private UUID blackPlayerId;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private GameStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "result")
    private GameResult result;

    @Enumerated(EnumType.STRING)
    @Column(name = "termination_reason")
    private GameTerminationReason terminationReason;

    @Column(name = "pgn")
    private String pgn;

    @Column(name = "final_fen")
    private String finalFen;

    @Column(name = "total_moves")
    private int totalMoves;

    @NotNull
    @Column(name = "started_at", nullable = false, updatable = false)
    private Instant startedAt;

    @Column(name = "ended_at", updatable = false)
    private Instant endedAt;

    @OneToMany(mappedBy = "gameId", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
    private List<MoveRecord> moveRecordList = new ArrayList<>();
}
