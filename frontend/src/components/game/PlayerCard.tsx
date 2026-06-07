"use client";
import React, { useState, useEffect } from "react";
import { Color } from "@/types/game";
import { Target, User } from "lucide-react";
import { pieceSymbols } from "@/utils/gameSessionUtils";
import { formatTime, getWarningThresholdMs } from "@/utils/time";

export const PlayerCard = ({
  name,
  color,
  isMyTurn,
  isWaiting,
  isMe,
  capturedPieces,
  lead,
  timeRemainingMs,
  isGameActive,
  timeControl,
}: {
  name: string;
  color: Color;
  isMyTurn: boolean;
  isWaiting?: boolean;
  isMe?: boolean;
  capturedPieces?: string[];
  lead?: number;
  timeRemainingMs?: number | null;
  isGameActive?: boolean;
  timeControl?: string | null;
}) => {
  const [localTimeLeft, setLocalTimeLeft] = useState<number>(
    timeRemainingMs || 0,
  );

  useEffect(() => {
    if (timeRemainingMs == null) return;
    setLocalTimeLeft(timeRemainingMs);

    if (!isGameActive || !isMyTurn) {
      return;
    }

    const localReceivedTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - localReceivedTime;
      const timeLeft = Math.max(0, timeRemainingMs - elapsed);
      setLocalTimeLeft(timeLeft);
    }, 100);

    return () => clearInterval(interval);
  }, [timeRemainingMs, isMyTurn, isGameActive]);

  const warningThreshold = getWarningThresholdMs(timeControl);
  const isLowTime =
    timeRemainingMs != null && localTimeLeft <= warningThreshold;
  const displayTime =
    timeRemainingMs != null ? formatTime(localTimeLeft) : "10:00";

  return (
    <div
      className={`glass-card p-6 border-white/5 transition-all duration-300 relative overflow-hidden ${
        isLowTime
          ? "bg-red-950/70 border-red-500/30 ring-2 ring-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.25)]"
          : isMyTurn
            ? "ring-2 ring-primary/50 bg-primary/5"
            : ""
      }`}
    >
      {isMyTurn && (
        <div className="absolute top-0 right-0 p-2">
          <div
            className={`w-2 h-2 rounded-full animate-ping ${isLowTime ? "bg-red-500" : "bg-primary"}`}
          ></div>
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
            <h3 className="font-semibold text-white tracking-tight">{name}</h3>
            {isMe && (
              <span className="text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-semibold">
                YOU
              </span>
            )}
          </div>

          <p className="text-[10px] font-medium text-foreground/40 uppercase tracking-wider mt-1">
            Rank: Ranked
          </p>
        </div>
      </div>

      <div className="flex justify-between items-start border-t border-white/5 pt-4 mt-2">
        <div className="space-y-2">
          <p className="text-[8px] font-medium text-foreground/30 uppercase tracking-wider">
            Alignment
          </p>
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full ${color === Color.WHITE ? "bg-white shadow-[0_0_8px_white]" : "bg-slate-600"}`}
            ></div>
            <span className="text-lg font-semibold uppercase">{color}</span>
          </div>
        </div>
        <div className="text-right space-y-1">
          <p className="text-[8px] font-medium text-foreground/30 uppercase tracking-wider">
            Chronometer
          </p>
          <p
            className={`text-3xl font-semibold tracking-tight font-mono transition-colors duration-300 ${
              isLowTime
                ? "text-red-400 font-bold animate-pulse opacity-100"
                : "opacity-80"
            }`}
          >
            {displayTime}
          </p>
        </div>
      </div>
      {/* Captured Pieces & Score Lead */}
      {capturedPieces &&
        (capturedPieces.length > 0 || (lead !== undefined && lead > 0)) && (
          <div className="flex items-center gap-2 mt-3 min-h-[16px]">
            {lead !== undefined && lead > 0 && (
              <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                +{lead}
              </span>
            )}
            <div className="flex items-center gap-0.5 text-xs">
              {capturedPieces.map((piece, idx) => (
                <span
                  key={idx}
                  className={
                    piece === piece.toUpperCase()
                      ? "text-slate-200"
                      : "text-slate-500"
                  }
                  title={piece}
                >
                  {pieceSymbols[piece] || piece}
                </span>
              ))}
            </div>
          </div>
        )}

      {isWaiting && (
        <div className="mt-4 py-2 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center gap-2">
          <Target size={12} className="text-primary animate-spin" />
          <span className="text-[8px] font-semibold text-primary uppercase tracking-wider">
            Transmission Lock In Progress
          </span>
        </div>
      )}
    </div>
  );
};
