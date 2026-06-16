package com.akshansh.chessweb.service;
import com.akshansh.chessweb.model.entity.GameSession;
import com.akshansh.chessweb.model.entity.UserVerification;
import com.akshansh.chessweb.model.enums.Color;
import com.akshansh.chessweb.model.enums.GameResult;
import com.akshansh.chessweb.model.enums.GameStatus;
import com.akshansh.chessweb.model.enums.GameTerminationReason;
import com.akshansh.chessweb.repository.RefreshTokenRepository;
import com.akshansh.chessweb.repository.UserVerificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class SchedulerService {

    private final UserVerificationRepository userVerificationRepo;
    private final RefreshTokenRepository refreshTokenRepo;
    private final GameStore gameStore;
    private final GamePersistenceService gamePersistenceService;
    private final SimpMessagingTemplate messagingTemplate;

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

    @Transactional
    @Scheduled(fixedDelay = 1000L * 10)
    public void checkAbandonedGames() {
        List<GameSession> activeGames = gameStore.findActiveGames();

        for (GameSession session : activeGames) {
            checkAndHandleTimeout(session.getId());
        }
    }

    private void checkAndHandleTimeout(UUID gameId) {
        GameSession snapshot = gameStore.withGameLock(gameId, session -> {

            if (session.getStatus() != GameStatus.ACTIVE) {
                return null;
            }

            long elapsed = Duration.between(session.getTurnStartedAt(), Instant.now()).toMillis();
            long timeRemaining = session.getCurrentTurn() == Color.WHITE
                    ? session.getWhiteTimeRemainingMs() - elapsed
                    : session.getBlackTimeRemainingMs() - elapsed;

            if (timeRemaining > 0) {
                return null; // not timed out yet
            }

            session.setStatus(GameStatus.ENDED);
            session.setTerminationReason(GameTerminationReason.TIMEOUT);
            session.setResult(session.getCurrentTurn() == Color.WHITE
                    ? GameResult.BLACK_WON
                    : GameResult.WHITE_WON);

            log.info("event=gameTimeout gameId={} losingColor={}",
                    session.getId(), session.getCurrentTurn());

            return session;
        });

        if (snapshot == null || snapshot.getStatus() != GameStatus.ENDED) {
            return;
        }

        // save the game if ended
        try {
            int[] eloResults = gamePersistenceService.persist(snapshot);
            snapshot.setWhitePlayerNewElo(eloResults[0]);
            snapshot.setBlackPlayerNewElo(eloResults[1]);
        } catch (Exception e) {
            log.error("event=timeoutPersistFailed gameId={}", gameId, e);
            return; // don't remove from store if persist failed
        }

        gameStore.remove(gameId.toString());

        messagingTemplate.convertAndSend("/topic/game." + gameId, snapshot);
    }
}
