package com.akshansh.chessweb.service;

import com.akshansh.chessweb.exception.GameNotFoundException;
import com.akshansh.chessweb.model.entity.GameSession;
import com.akshansh.chessweb.model.enums.GameStatus;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class GameStore {

    private final ConcurrentHashMap<String, GameSession> store = new ConcurrentHashMap<>();

    public void saveGame(GameSession session){
        store.put(session.getId().toString(), session);
    }

    public Optional<GameSession> findById(UUID gameId){
        return Optional.ofNullable(store.get(gameId.toString()));
    }

    public void remove(String gameId) {
        store.remove(gameId);
    }

    public List<GameSession> findWaitingGames() {
        return store.values().stream()
                .filter(g -> g.getStatus() == GameStatus.WAITING)
                .collect(Collectors.toList());
    }

    public List<GameSession> findActiveGames() {
        return store.values().stream()
                .filter(g -> g.getStatus() == GameStatus.ACTIVE)
                .collect(Collectors.toList());
    }

    public <T> T withGameLock(UUID gameId, Function<GameSession, T> operation) {
        GameSession session = findById(gameId)
                .orElseThrow(() -> new GameNotFoundException(gameId));

        synchronized (session) {
            return operation.apply(session);
        }
    }

    public boolean exists(String gameId) {
        return store.containsKey(gameId);
    }
}
