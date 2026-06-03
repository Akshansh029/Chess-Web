package com.akshansh.chessweb.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "user_verification")
public class UserVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String email;

    @Column(name = "verification_code", nullable = false)
    private String verificationCode;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;
}
