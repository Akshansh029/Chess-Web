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
            u.id, u.username, u.email, u.eloRating, u.isActive, u.createdAt
        ) FROM User u
        WHERE u.id = :userId
""")
    public UserDetailsDto fetchUserDetails(@Param("userId") UUID userId);
}
