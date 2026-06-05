package com.akshansh.chessweb.repository;

import com.akshansh.chessweb.model.dto.UserDetailsDto;
import com.akshansh.chessweb.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("""
        SELECT NEW com.akshansh.chessweb.model.dto.UserDetailsDto(
            u.id,
            u.username,
            u.email,
            u.eloRating,
            u.isActive,
            u.createdAt,
            CAST(COUNT(g.id) AS int),
            CAST(SUM(CASE
                WHEN (g.whitePlayer.id = u.id AND CAST(g.result AS string) = 'WHITE_WON')
                  OR (g.blackPlayer.id = u.id AND CAST(g.result AS string) = 'BLACK_WON')
                THEN 1 ELSE 0
            END) AS int),
            CAST(SUM(CASE
                WHEN (g.whitePlayer.id = u.id AND CAST(g.result AS string) = 'BLACK_WON')
                  OR (g.blackPlayer.id = u.id AND CAST(g.result AS string) = 'WHITE_WON')
                THEN 1 ELSE 0
            END) AS int),
            CAST(SUM(CASE
                WHEN CAST(g.result AS string) = 'DRAW'
                THEN 1 ELSE 0
            END) AS int),
            CAST(CASE
                WHEN COUNT(g.id) = 0 THEN 0
                ELSE (
                    SUM(CASE
                        WHEN (g.whitePlayer.id = u.id AND CAST(g.result AS string) = 'WHITE_WON')
                          OR (g.blackPlayer.id = u.id AND CAST(g.result AS string) = 'BLACK_WON')
                        THEN 1 ELSE 0
                    END) * 100.0 / COUNT(g.id)
                )
            END AS float)
        ) FROM User u
        LEFT JOIN Game g
            ON (g.whitePlayer.id = u.id OR g.blackPlayer.id = u.id)
            AND g.result IS NOT NULL
        WHERE u.id = :userId
        GROUP BY u.id, u.username, u.email, u.eloRating, u.isActive, u.createdAt
    """)
    UserDetailsDto fetchUserDetails(@Param("userId") UUID userId);
}
