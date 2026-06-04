"use client";

import React, { useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import GameSessionView from "@/components/game/GameSessionView";
import { GameShell } from "@/components/layout/GameShell";

export default function GamePage() {
  const { id } = useParams() as { id: string };
  const { isAuthenticated } = useAuth();
  const {
    playerName,
    playerColor,
    gameSession,
    connected,
    connect,
    subscribeToGame,
    unsubscribeFromGame,
  } = useGame();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/");
      return;
    }

    if (!connected) {
      connect();
    } else if (id) {
      subscribeToGame(id);
    }

    return () => {
      unsubscribeFromGame();
    };
  }, [
    id,
    connected,
    isAuthenticated,
    connect,
    subscribeToGame,
    unsubscribeFromGame,
    router,
  ]);

  if (!isAuthenticated) return null;

  return (
    <GameShell>
      <GameSessionView
        session={gameSession}
        myColor={playerColor}
        myName={playerName}
      />
    </GameShell>
  );
}
