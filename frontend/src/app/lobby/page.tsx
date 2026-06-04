"use client";

import React, { useEffect } from "react";
import Lobby from "@/components/lobby/Lobby";
import { useGame } from "@/context/GameContext";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { gameApi } from "@/services/api";
import { Color } from "@/types/game";
import { useRouter } from "next/navigation";
import { GameShell } from "@/components/layout/GameShell";

export default function LobbyPage() {
  const { isAuthenticated } = useAuth();
  const {
    playerName,
    playerId,
    playerColor,
    setPlayerColor,
    setGameSession,
    connected,
    connect,
  } = useGame();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/");
      return;
    }
    if (!connected) {
      connect();
    }
  }, [isAuthenticated, connected, connect, router]);

  const handleCreateGame = async () => {
    try {
      const gameId = await gameApi.createGame(
        playerId,
        playerName,
        playerColor,
      );
      toast.success("Game arena created! Waiting for opponent.");
      router.push(`/game/${gameId}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create game arena.");
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
      toast.success("Joined arena successfully.");
      router.push(`/game/${gameId}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to join arena. It may have been filled or closed.");
    }
  };

  if (!isAuthenticated) return null;

  return (
    <GameShell>
      <Lobby onCreateGame={handleCreateGame} onJoinGame={handleJoinGame} />
    </GameShell>
  );
}
