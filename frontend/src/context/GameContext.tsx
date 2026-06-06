"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Color, GameSession, ChatMessage } from "@/types/game";
import { v4 as uuidv4 } from "uuid";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/context/AuthContext";

interface GameContextType {
  playerName: string;
  setPlayerName: (name: string) => void;
  playerColor: Color;
  setPlayerColor: (color: Color) => void;
  playerId: string;
  setPlayerId: (id: string) => void;
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
  gameSession: GameSession | null;
  setGameSession: (session: GameSession | null) => void;
  subscribeToGame: (gameId: string) => void;
  unsubscribeFromGame: () => void;
  sendMove: (
    gameId: string,
    move: { from: string; to: string; piece: string; promotionPiece?: string },
    color: Color,
  ) => void;
  sendResign: (gameId: string, playerName: string) => void;
  sendDrawOffer: (
    gameId: string,
    playerName: string,
    opponentId: string,
    opponentName: string,
  ) => void;
  sendDrawAccept: (gameId: string, offerAcceptedByPlayerName: string) => void;
  sendDrawDecline: (gameId: string, offerAcceptedByPlayerName: string) => void;
  messages: ChatMessage[];
  sendMessage: (username: string, content: string) => void;
  sendJoin: (username: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [playerName, setPlayerNameState] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("chess_player_name") || "";
    }
    return "";
  });
  const [playerColor, setPlayerColor] = useState<Color>(Color.WHITE);
  const [playerId, setPlayerIdState] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("chess_player_id") || "";
    }
    return "";
  });

  const setPlayerName = (name: string) => {
    setPlayerNameState(name);
    localStorage.setItem("chess_player_name", name);
  };

  const setPlayerId = (id: string) => {
    setPlayerIdState(id);
    if (typeof window !== "undefined") {
      if (id) {
        localStorage.setItem("chess_player_id", id);
      } else {
        localStorage.removeItem("chess_player_id");
      }
    }
  };

  React.useEffect(() => {
    if (user) {
      setPlayerName(user.name);
      setPlayerId(user.id);
    } else {
      setPlayerName("");
      setPlayerId("");
    }
  }, [user]);

  const ws = useWebSocket();

  React.useEffect(() => {
    if (ws.connected && playerName) {
      ws.sendJoin(playerName);
    }
  }, [ws.connected, playerName, ws.sendJoin]);

  return (
    <GameContext.Provider
      value={{
        playerName,
        setPlayerName,
        playerColor,
        setPlayerColor,
        playerId,
        setPlayerId,
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
        messages: ws.messages,
        sendMessage: ws.sendMessage,
        sendJoin: ws.sendJoin,
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
