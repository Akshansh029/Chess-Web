"use client";

import React, { useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { useParams, useRouter } from "next/navigation";
import GameSessionView from "@/components/game/GameSessionView";
import { GameShell } from "@/components/layout/GameShell";

export default function GamePage() {
  const { id } = useParams() as { id: string };
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
    if (!playerName) {
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
    playerName,
    connect,
    subscribeToGame,
    unsubscribeFromGame,
    router,
  ]);

  if (!playerName) return null;

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
