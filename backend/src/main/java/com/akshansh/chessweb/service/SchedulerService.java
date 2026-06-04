package com.akshansh.chessweb.service;
import com.akshansh.chessweb.model.entity.UserVerification;
import com.akshansh.chessweb.repository.RefreshTokenRepository;
import com.akshansh.chessweb.repository.UserVerificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class SchedulerService {

    private final UserVerificationRepository userVerificationRepo;
    private final RefreshTokenRepository refreshTokenRepo;

    @Transactional
    @Scheduled(fixedDelay = (1000L * 60 * 60 * 6))        // runs every 6 hours
    public void deleteExpiredVerificationCodes(){
        List<UserVerification> expiredCodes = userVerificationRepo.findAllByExpiresAtBefore(Instant.now());

        userVerificationRepo.deleteAll(expiredCodes);
        log.info("event=expiredVerificationCodesDeleted expiredCodesCount={}", expiredCodes.size());
    }

    @Transactional
    @Scheduled(cron = "0 0 3 * * *")
    public void deleteExpiredRefreshTokens(){
        refreshTokenRepo.deleteByExpiresAtBefore(Instant.now());
        log.info("event=expiredRefreshTokensDeleted");
    }
}
