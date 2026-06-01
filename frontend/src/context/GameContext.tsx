"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Color, GameSession } from "@/types/game";
import { v4 as uuidv4 } from "uuid";
import { useWebSocket } from "@/hooks/useWebSocket";

interface GameContextType {
  playerName: string;
  setPlayerName: (name: string) => void;
  playerColor: Color;
  setPlayerColor: (color: Color) => void;
  playerId: string;
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
  gameSession: GameSession | null;
  setGameSession: (session: GameSession | null) => void;
  subscribeToGame: (gameId: string) => void;
  unsubscribeFromGame: () => void;
  sendMove: (
    gameId: string,
    playerId: string,
    move: { from: string; to: string; piece: string; promotionPiece?: string },
    color: Color
  ) => void;
  sendResign: (gameId: string, playerId: string, playerName: string) => void;
  sendDrawOffer: (
    gameId: string,
    playerId: string,
    playerName: string,
    opponentId: string,
    opponentName: string
  ) => void;
  sendDrawAccept: (
    gameId: string,
    offerAccepterByPlayerId: string,
    offerAcceptedByPlayerName: string
  ) => void;
  sendDrawDecline: (
    gameId: string,
    offerAccepterByPlayerId: string,
    offerAcceptedByPlayerName: string
  ) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [playerName, setPlayerNameState] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("chess_player_name") || "";
    }
    return "";
  });
  const [playerColor, setPlayerColor] = useState<Color>(Color.WHITE);
  const [playerId] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("chess_player_id");
      if (saved) return saved;
      const newId = uuidv4();
      localStorage.setItem("chess_player_id", newId);
      return newId;
    }
    return uuidv4();
  });

  const setPlayerName = (name: string) => {
    setPlayerNameState(name);
    localStorage.setItem("chess_player_name", name);
  };

  const ws = useWebSocket();

  return (
    <GameContext.Provider
      value={{
        playerName,
        setPlayerName,
        playerColor,
        setPlayerColor,
        playerId,
        connected: ws.connected,
        connect: ws.connect,
        disconnect: ws.disconnect,
        gameSession: ws.gameSession,
        setGameSession: ws.setGameSession,
        subscribeToGame: ws.subscribeToGame,
        unsubscribeFromGame: ws.unsubscribeFromGame,
        sendMove: ws.sendMove,
        sendResign: ws.sendResign,
        sendDrawOffer: ws.sendDrawOffer,
        sendDrawAccept: ws.sendDrawAccept,
        sendDrawDecline: ws.sendDrawDecline,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
