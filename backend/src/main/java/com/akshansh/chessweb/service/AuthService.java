package com.akshansh.chessweb.service;

import com.akshansh.chessweb.exception.InvalidVerificationCode;
import com.akshansh.chessweb.exception.ResourceNotFoundException;
import com.akshansh.chessweb.exception.UserAlreadyExistsException;
import com.akshansh.chessweb.model.dto.LoginRequest;
import com.akshansh.chessweb.model.dto.RegisterUserRequest;
import com.akshansh.chessweb.model.dto.TokenResponse;
import com.akshansh.chessweb.model.entity.RefreshToken;
import com.akshansh.chessweb.model.entity.User;
import com.akshansh.chessweb.model.entity.UserPrincipal;
import com.akshansh.chessweb.model.entity.UserVerification;
import com.akshansh.chessweb.repository.RefreshTokenRepository;
import com.akshansh.chessweb.repository.UserRepository;
import com.akshansh.chessweb.repository.UserVerificationRepository;
import com.akshansh.chessweb.utils.JwtUtil;
import com.akshansh.chessweb.utils.VerificationCodeGenerator;
import io.jsonwebtoken.JwtException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepo;
    private final UserDetailsServiceImpl userDetailsService;
    private final UserVerificationRepository verificationRepo;
    private final RefreshTokenRepository refreshTokenRepo;
    private final VerificationCodeGenerator verificationCodeGenerator;
    private final ResendEmailService resendEmailService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Transactional
    public boolean checkEmail(String email) {
        if(userRepo.existsByEmail(email)){
            throw new UserAlreadyExistsException(
                    "User with email: " + email + " already exists");
        }

        String code = verificationCodeGenerator.generateVerificationCode();

        UserVerification userVerification = UserVerification.builder()
                .email(email)
                .verificationCode(code)
                .expiresAt(Instant.now().plus(2, ChronoUnit.MINUTES))
                .build();

        // Save verification token
        verificationRepo.save(userVerification);
        log.info("event=verificationTokenSaved tokenId={}", userVerification.getId());

        // Send email verification code to user
        resendEmailService.sendVerificationEmail(email, code);
        return true;
    }

    @Transactional
    public TokenResponse loginUser(@Valid LoginRequest request) {
        // Authenticate email and password
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserPrincipal userDetails = (UserPrincipal) userDetailsService.loadUserByUsername(request.getEmail());

        User savedUser = userRepo.findById(userDetails.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User " + userDetails.getUserId() + " not found"));

        // last login info saved
        savedUser.setLastLoginAt(Instant.now());
        userRepo.save(savedUser);

        log.info("event=successfulLogin userId={}", userDetails.getUserId());
        // Issue token and return response
        return issueTokens(userDetails, "Login successful");
    }

    @Transactional
    public TokenResponse refreshToken(String refreshToken) {
        // Hash the raw refresh token
        String tokenHash = jwtUtil.hashToken(refreshToken);

        RefreshToken stored = refreshTokenRepo.findByTokenHash(tokenHash)
                .orElseThrow(() -> new JwtException("Invalid refresh token"));

        User user = userRepo.findById(stored.getUserId())
                .orElseThrow(() -> new JwtException("Invalid refresh token"));

        // Reuse detected
        if (!stored.isValid()) {
            if (stored.isUsed()) {
                log.warn("event=refreshTokenReuse userId={} tokenId={}",
                        stored.getUserId(),
                        stored.getId()
                );
                refreshTokenRepo.deleteByFamilyId(stored.getFamilyId()); // nuke family
            }
            throw new JwtException("Invalid refresh token");
        }

        // Mark current token as used
        stored.setUsed(true);
        refreshTokenRepo.save(stored);

        // Issue new refresh token of same family
        String newRefreshToken = UUID.randomUUID().toString();
        RefreshToken newToken = RefreshToken.builder()
                .tokenHash(jwtUtil.hashToken(newRefreshToken))
                .userId(stored.getUserId())
                .familyId(stored.getFamilyId())
                .expiresAt(Instant.now().plus(30, ChronoUnit.DAYS))
                .build();
        refreshTokenRepo.save(newToken);
        log.info("event=newRefreshTokenCreated tokenId={}", newToken.getId());

        UserPrincipal userDetails = (UserPrincipal) userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtUtil.generateAccessToken(userDetails);

        log.info("event=accessTokenRefreshed userId={}", stored.getUserId());
        return new TokenResponse("Token refreshed", accessToken, newRefreshToken);
    }

    @Transactional
    public TokenResponse registerAndVerify(RegisterUserRequest request) {
        // Fetch the latest verification code for the requested mail
        UserVerification userVerification = verificationRepo
                .findFirstByEmailOrderByExpiresAtDesc(request.getEmail())
                .orElseThrow(() -> new InvalidVerificationCode("Invalid verification code! Try again"));

        // Check if code is valid
        if (userVerification.getVerificationCode().equals(request.getVerificationCode())
                && userVerification.getExpiresAt().isAfter(Instant.now())
        ) {
            // Delete all verification codes for the requested email when verified
            List<UserVerification> userVerificationList = verificationRepo.findAllByEmail(request.getEmail());
            verificationRepo.deleteAll(userVerificationList);

            User newUser = new User(
                    request.getName(),
                    request.getEmail(),
                    passwordEncoder.encode(request.getPassword()),
                    800,
                    Instant.now()
            );

            // last login info saved
            newUser.setLastLoginAt(Instant.now());
            userRepo.save(newUser);

            // Authenticate email and password
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            UserPrincipal userDetails = (UserPrincipal) userDetailsService.loadUserByUsername(request.getEmail());

            log.info("event=newUserRegistered userId={}", userDetails.getUserId());
            // Issue token and return response
            return issueTokens(userDetails, "User registered successfully");
        }
        throw new InvalidVerificationCode("Invalid verification code! Try again");
    }

    @Transactional
    public void logout(String refreshToken){
        String tokenHash = jwtUtil.hashToken(refreshToken);
        RefreshToken storedRefreshToken = refreshTokenRepo.findByTokenHash(tokenHash)
                        .orElseThrow(() -> new ResourceNotFoundException("Refresh token not found"));

        log.info("event=userLoggedOut userId={}", storedRefreshToken.getUserId());
        refreshTokenRepo.delete(storedRefreshToken);
    }

    private TokenResponse issueTokens(UserPrincipal userDetails, String message) {
        String accessToken = jwtUtil.generateAccessToken(userDetails);
        String refreshToken = UUID.randomUUID().toString();

        RefreshToken token = RefreshToken.builder()
                .tokenHash(jwtUtil.hashToken(refreshToken))
                .userId(userDetails.getUserId())
                .familyId(UUID.randomUUID())
                .expiresAt(Instant.now().plus(30, ChronoUnit.DAYS))
                .build();

        refreshTokenRepo.save(token);

        log.info("event=tokensIssued userId={}", token.getUserId());
        return new TokenResponse(message, accessToken, refreshToken);
    }
}
