"use client";

import React, { useState, useEffect } from "react";
import Setup from "@/components/game/Setup";
import Lobby from "@/components/lobby/Lobby";
import GameSessionView from "@/components/game/GameSessionView";
import { useWebSocket } from "@/hooks/useWebSocket";
import { gameApi } from "@/services/api";
import { Color } from "@/types/game";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Zap, MessageSquare, History } from "lucide-react";

enum AppView {
  SETUP,
  LOBBY,
  GAME,
}

export default function Home() {
  const [view, setView] = useState<AppView>(AppView.SETUP);
  const [playerName, setPlayerName] = useState("");
  const [playerColor, setPlayerColor] = useState<Color>(Color.WHITE);
  const [playerId] = useState(uuidv4());

  const { connected, connect, subscribeToGame, gameSession, setGameSession } =
    useWebSocket();

  // Handle flow from Setup to Lobby
  const handleStartSetup = (name: string, color: Color) => {
    setPlayerName(name);
    setPlayerColor(color);
    connect(); // Connect to WS
    setView(AppView.LOBBY);
  };

  // Handle Creating a new game
  const handleCreateGame = async () => {
    try {
      const gameId = await gameApi.createGame(
        playerId,
        playerName,
        playerColor,
      );
      subscribeToGame(gameId);
      setView(AppView.GAME);
    } catch (err) {
      console.error(err);
      alert("Failed to create game arena");
    }
  };

  // Handle Joining an existing game
  const handleJoinGame = async (gameId: string, hostColor: Color) => {
    // My color will be opposite of host
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
      subscribeToGame(gameId);
      setView(AppView.GAME);
    } catch (err) {
      console.error(err);
      alert("Failed to join arena. It may have been filled or closed.");
    }
  };

  // Re-subscribe if we have a session ID but lost connection (basic recovery)
  useEffect(() => {
    if (connected && gameSession?.id) {
      subscribeToGame(gameSession.id);
    }
  }, [connected, gameSession?.id, subscribeToGame]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col font-sans selection:bg-primary selection:text-white">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[140px] animate-pulse"></div>
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent/10 rounded-full blur-[140px] animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div className="absolute inset-0 bg-dots opacity-20"></div>
      </div>

      {/* Navigation / Header */}
      <header className="relative z-50 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
              <Trophy className="text-primary w-5 h-5 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            </div>
            <div>
              <h1 className="text-xl font-black italic tracking-tighter text-white">
                LIVE CHESS{" "}
                <span className="text-[10px] not-italic font-bold bg-white/5 px-1.5 py-0.5 rounded text-foreground/40 ml-2 border border-white/5 uppercase">
                  Beta 2.0
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {view !== AppView.SETUP && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <div
                  className={`w-2 h-2 rounded-full ${connected ? "bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]" : "bg-red-500 shadow-[0_0_5px_#ef4444]"}`}
                ></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">
                  {connected ? "Relay Active" : "Offline"}
                </span>
              </div>
            )}
            {playerName && (
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.2em]">
                    Strategist
                  </p>
                  <p className="text-xs font-black uppercase text-white tracking-widest">
                    {playerName}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <span className="text-xs font-black text-primary uppercase">
                    {playerName.substring(0, 2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <AnimatePresence mode="wait">
          {view === AppView.SETUP && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex justify-center"
            >
              <Setup onStart={handleStartSetup} />
            </motion.div>
          )}

          {view === AppView.LOBBY && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="w-full"
            >
              <Lobby
                onCreateGame={handleCreateGame}
                onJoinGame={handleJoinGame}
              />
            </motion.div>
          )}

          {view === AppView.GAME && (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <GameSessionView
                session={gameSession}
                myColor={playerColor}
                myName={playerName}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Persistence Bar / Footer */}
      <footer className="relative z-50 py-8 border-t border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto px-12 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40 hover:opacity-80 transition-opacity">
          <div className="flex gap-8 items-center text-[10px] font-black uppercase tracking-[0.3em]">
            <div className="flex items-center gap-2 group cursor-pointer">
              <History
                size={14}
                className="text-primary group-hover:scale-110 transition-transform"
              />
              <span>Global Stats</span>
            </div>
            <div className="flex items-center gap-2 group cursor-pointer border-l border-white/10 pl-8">
              <MessageSquare
                size={14}
                className="text-primary group-hover:scale-110 transition-transform"
              />
              <span>World Relay</span>
            </div>
            <div className="flex items-center gap-2 group cursor-pointer border-l border-white/10 pl-8">
              <Zap
                size={14}
                className="text-orange-400 group-hover:scale-110 transition-transform"
              />
              <span>Latency: 24ms</span>
            </div>
          </div>

          <div className="text-[9px] font-mono text-center md:text-right text-foreground/40 leading-relaxed uppercase tracking-widest">
            System: Distributed Neural Engine 2026.0a
            <br />
            Protocol: Secure STOMP/WS
          </div>
        </div>
      </footer>
    </div>
  );
}
