"use client";

import React, { useEffect } from "react";
import Lobby from "@/components/lobby/Lobby";
import { useGame } from "@/context/GameContext";
import { gameApi } from "@/services/api";
import { Color } from "@/types/game";
import { useRouter } from "next/navigation";
import { GameShell } from "@/components/layout/GameShell";

export default function LobbyPage() {
  const {
    playerName,
    playerId,
    playerColor,
    setPlayerColor,
    setGameSession,
    connected,
    connect,
  } = useGame();
  const router = useRouter();

  useEffect(() => {
    if (!playerName) {
      router.replace("/");
      return;
    }
    if (!connected) {
      connect();
    }
  }, [playerName, connected, connect, router]);

  const handleCreateGame = async () => {
    try {
      const gameId = await gameApi.createGame(
        playerId,
        playerName,
        playerColor,
      );
      router.push(`/game/${gameId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create game arena");
    }
  };

  const handleJoinGame = async (gameId: string, hostColor: Color) => {
    const myJoinColor = hostColor === Color.WHITE ? Color.BLACK : Color.WHITE;
    setPlayerColor(myJoinColor);

    try {
      const session = await gameApi.joinGame(
        gameId,
        playerId,
        playerName,
        myJoinColor,
      );
      setGameSession(session);
      router.push(`/game/${gameId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to join arena. It may have been filled or closed.");
    }
  };

  if (!playerName) return null;

  return (
    <GameShell>
      <Lobby onCreateGame={handleCreateGame} onJoinGame={handleJoinGame} />
    </GameShell>
  );
}
