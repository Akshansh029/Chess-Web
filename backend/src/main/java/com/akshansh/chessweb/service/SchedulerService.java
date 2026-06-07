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
    @Scheduled(fixedDelay = 1000L * 10)      // runs every 10 seconds
    public void checkAbandonedGames(){
        List<GameSession> activeGames = gameStore.findActiveGames();

        for(GameSession session : activeGames){
            long elapsedMs = Duration.between(session.getTurnStartedAt(), Instant.now()).toMillis();
            if(session.getCurrentTurn() == Color.WHITE){
                if(session.getWhiteTimeRemainingMs() - elapsedMs <= 0){

                    session.setStatus(GameStatus.ENDED);
                    session.setResult(GameResult.BLACK_WON);
                    session.setTerminationReason(GameTerminationReason.TIMEOUT);

                    // save the game session
                    int[] eloResults = gamePersistenceService.persist(session);
                    session.setWhitePlayerNewElo(eloResults[0]);
                    session.setBlackPlayerNewElo(eloResults[1]);

                    messagingTemplate.convertAndSend(
                            "/topic/game." + session.getId(),
                            session
                    );

                    gameStore.remove(session.getId().toString());
                    log.info("event=whiteAbandonedGame userId={} gameId={}", session.getWhitePlayerId(), session.getId());
                }
            } else if (session.getCurrentTurn() == Color.BLACK) {
                if(session.getBlackTimeRemainingMs() - elapsedMs <= 0){
                    session.setStatus(GameStatus.ENDED);
                    session.setResult(GameResult.WHITE_WON);
                    session.setTerminationReason(GameTerminationReason.TIMEOUT);

                    // save the game session
                    int[] eloResults = gamePersistenceService.persist(session);
                    session.setWhitePlayerNewElo(eloResults[0]);
                    session.setBlackPlayerNewElo(eloResults[1]);

                    messagingTemplate.convertAndSend(
                            "/topic/game." + session.getId(),
                            session
                    );

                    gameStore.remove(session.getId().toString());
                    log.info("event=blackAbandonedGame userId={} gameId={}", session.getBlackPlayerId(), session.getId());
                }
            }
        }
    }
}
