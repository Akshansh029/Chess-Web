"use client";

import React, { useEffect } from "react";
import Setup from "@/components/game/Setup";
import { useGame } from "@/context/GameContext";
import { useRouter } from "next/navigation";
import { Color } from "@/types/game";
import { GameShell } from "@/components/layout/GameShell";

export default function Home() {
  const { setPlayerName, setPlayerColor, connect, playerName } = useGame();
  const router = useRouter();

  // If already identified, go to lobby (optional, but good for UX)
  useEffect(() => {
    if (playerName) {
      connect();
      router.push("/lobby");
    }
  }, [playerName, connect, router]);

  const handleStartSetup = (name: string, color: Color) => {
    setPlayerName(name);
    setPlayerColor(color);
    connect();
    router.push("/lobby");
  };

  return (
    <GameShell>
      <Setup onStart={handleStartSetup} />
    </GameShell>
  );
}
