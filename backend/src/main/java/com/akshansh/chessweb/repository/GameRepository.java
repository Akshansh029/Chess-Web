package com.akshansh.chessweb.repository;

import com.akshansh.chessweb.model.dto.GameDto;
import com.akshansh.chessweb.model.entity.Game;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface GameRepository extends JpaRepository<Game, UUID> {

    @Query("""
        SELECT NEW com.akshansh.chessweb.model.dto.GameDto(
            g.id, g.whitePlayer.username, g.blackPlayer.username,
            g.result, g.terminationReason, g.totalMoves, g.endedAt, g.pgn
        ) FROM Game g
        WHERE g.blackPlayer.id = :userId
        OR g.whitePlayer.id = :userId
        ORDER BY g.endedAt DESC
    """)
    Page<GameDto> getGamesByWhitePlayerOrBlackPlayer(
            Pageable pageable,
            @Param("userId") UUID userId
    );
}
