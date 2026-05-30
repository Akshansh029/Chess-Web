"use client";

import React from "react";
import {
  GameSession as GameSessionType,
  Color,
  GameStatus,
} from "@/types/game";
import { Target, Cpu, Activity, User } from "lucide-react";

interface GameSessionViewProps {
  session: GameSessionType | null;
  myColor: Color;
  myName: string;
}

const GameSessionView: React.FC<GameSessionViewProps> = ({
  session,
  myColor,
  myName,
}) => {
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white">
        <Activity className="animate-pulse text-primary mb-4" size={48} />
        <h3 className="text-xl font-bold uppercase italic tracking-tighter">
          Synchronizing Strategic Data...
        </h3>
      </div>
    );
  }

  const isWaiting = session.status === GameStatus.WAITING;
  const opponentName =
    myColor === Color.WHITE ? session.blackPlayerName : session.whitePlayerName;
  const opponentColor = myColor === Color.WHITE ? Color.BLACK : Color.WHITE;

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 text-white">
      {/* Player 1 (Opponent) */}
      <div className="lg:col-span-3 space-y-6">
        <PlayerCard
          name={opponentName || "Awaiting Rival..."}
          color={opponentColor}
          isMyTurn={session.currentTurn === opponentColor}
          isWaiting={isWaiting}
        />

        <div className="glass-card p-6 border-white/5 space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 border-b border-white/5 pb-2">
            Session Intelligence
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[8px] font-bold text-foreground/30 uppercase">
                Status
              </p>
              <p className="text-[10px] font-black uppercase text-primary animate-pulse">
                {session.status}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[8px] font-bold text-foreground/30 uppercase">
                Turn
              </p>
              <p className="text-[10px] font-black uppercase">
                {session.currentTurn}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stage (Chessboard Placeholder) */}
      <div className="lg:col-span-6 flex flex-col items-center gap-6">
        <div className="glass-card p-4 border-white/10 shadow-2xl shadow-black/50">
          <div className="aspect-square w-full max-w-[500px] bg-slate-900 rounded-lg overflow-hidden relative border-4 border-white/5">
            {/* Simplified grid placeholder for chessboard */}
            <div className="grid grid-cols-8 grid-rows-8 h-full w-full opacity-20">
              {Array.from({ length: 64 }).map((_, i) => {
                const row = Math.floor(i / 8);
                const col = i % 8;
                const isDark = (row + col) % 2 === 1;
                return (
                  <div
                    key={i}
                    className={isDark ? "bg-slate-700" : "bg-transparent"}
                  ></div>
                );
              })}
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex flex-col items-center opacity-10">
                <Cpu size={80} />
                <span className="text-sm font-black uppercase tracking-[0.5em] mt-4 italic">
                  Neural Core Active
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 w-full">
          <div className="flex-1 glass-card p-4 border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 italic underline decoration-primary decoration-2 underline-offset-4">
              Arena Hash
            </span>
            <span className="text-[10px] font-mono opacity-60 uppercase">
              {session.id}
            </span>
          </div>
        </div>
      </div>

      {/* Player 2 (Local) */}
      <div className="lg:col-span-3 space-y-6">
        <PlayerCard
          name={myName}
          color={myColor}
          isMyTurn={session.currentTurn === myColor}
          isMe
        />

        <div className="glass-card p-6 border-white/5 space-y-6">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 border-b border-white/5 pb-2">
            Command Center
          </h4>
          <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 hover:border-red-500/30 transition-all text-red-400">
            Resign Match
          </button>
          <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 hover:border-primary/30 transition-all text-primary">
            Offer Draw
          </button>
        </div>
      </div>
    </div>
  );
};

const PlayerCard = ({
  name,
  color,
  isMyTurn,
  isWaiting,
  isMe,
}: {
  name: string;
  color: Color;
  isMyTurn: boolean;
  isWaiting?: boolean;
  isMe?: boolean;
}) => (
  <div
    className={`glass-card p-6 border-white/5 transition-all relative overflow-hidden ${isMyTurn ? "ring-2 ring-primary/50 bg-primary/5" : ""}`}
  >
    {isMyTurn && (
      <div className="absolute top-0 right-0 p-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
      </div>
    )}

    <div className="flex items-center gap-4 mb-4">
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border ${
          color === Color.WHITE
            ? "bg-white border-white"
            : "bg-slate-800 border-white/20"
        }`}
      >
        <User
          size={28}
          className={color === Color.WHITE ? "text-black" : "text-white"}
        />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-black uppercase italic tracking-tight">{name}</h3>
          {isMe && (
            <span className="text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold">
              YOU
            </span>
          )}
        </div>
        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
          Rank: Unranked
        </p>
      </div>
    </div>

    <div className="flex justify-between items-end border-t border-white/5 pt-4 mt-2">
      <div className="space-y-1">
        <p className="text-[8px] font-bold text-foreground/30 uppercase tracking-widest">
          Alignment
        </p>
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full ${color === Color.WHITE ? "bg-white shadow-[0_0_8px_white]" : "bg-slate-600"}`}
          ></div>
          <span className="text-[10px] font-black uppercase">{color}</span>
        </div>
      </div>
      <div className="text-right space-y-1">
        <p className="text-[8px] font-bold text-foreground/30 uppercase tracking-widest">
          Chronometer
        </p>
        <p className="text-lg font-black tracking-tighter italic font-mono opacity-80">
          10:00
        </p>
      </div>
    </div>

    {isWaiting && (
      <div className="mt-4 py-2 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center gap-2">
        <Target size={12} className="text-primary animate-spin" />
        <span className="text-[8px] font-black text-primary uppercase tracking-widest">
          Transmission Lock In Progress
        </span>
      </div>
    )}
  </div>
);

export default GameSessionView;
