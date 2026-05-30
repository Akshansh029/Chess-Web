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
  }, [id, connected, playerName, connect, subscribeToGame, router]);

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
