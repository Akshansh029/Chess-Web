"use client";
import { GameResult, Color, GameSession } from "@/types/game";
import { motion } from "framer-motion";

export const GameOverModal = ({
  session,
  myColor,
  onClose,
}: {
  session: GameSession;
  myColor: Color;
  onClose: () => void;
}) => {
  const isWinner =
    (session.result === GameResult.WHITE_WON && myColor === Color.WHITE) ||
    (session.result === GameResult.BLACK_WON && myColor === Color.BLACK);
  const isLoser =
    (session.result === GameResult.WHITE_WON && myColor === Color.BLACK) ||
    (session.result === GameResult.BLACK_WON && myColor === Color.WHITE);
  const isDraw = session.result === GameResult.DRAW;

  let title = "Game Over";
  let titleColor = "text-white";

  if (isWinner) {
    title = "You Won";
    titleColor =
      "bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]";
  } else if (isLoser) {
    title = "You Lost";
    titleColor =
      "bg-gradient-to-r from-red-500 via-red-300 to-rose-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]";
  } else if (isDraw) {
    title = "Draw Match";
    titleColor =
      "bg-gradient-to-r from-slate-400 via-slate-200 to-slate-500 bg-clip-text text-transparent";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="w-full max-w-md glass-card border border-white/10 p-8 shadow-2xl text-center relative overflow-hidden bg-slate-950/90"
      >
        {/* Glow effect */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-[80px] pointer-events-none opacity-40 ${isWinner ? "bg-amber-500" : isLoser ? "bg-red-500" : "bg-blue-500"}`}
        ></div>

        <h3 className={`text-3xl font-light tracking-tight mb-2 ${titleColor}`}>
          {title}
        </h3>
        <p className="text-foreground/40 text-xs font-normal mb-6">
          {session.terminationReason
            ? `Decided by ${session.terminationReason.toLowerCase()}`
            : "Game completed"}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8 bg-white/5 border border-white/5 rounded-2xl p-6">
          <div className="space-y-1 text-left">
            <span className="text-[8px] font-semibold text-foreground/30 uppercase tracking-wider block">
              White Player
            </span>
            <span className="text-sm font-semibold text-white block truncate">
              {session.whitePlayerName || "Unknown"}
            </span>
          </div>
          <div className="space-y-1 text-right">
            <span className="text-[8px] font-semibold text-foreground/30 uppercase tracking-wider block">
              Black Player
            </span>
            <span className="text-sm font-semibold text-white block truncate">
              {session.blackPlayerName || "Unknown"}
            </span>
          </div>
          <div className="col-span-2 border-t border-white/5 pt-4 flex justify-between items-center text-xs">
            <span className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider">
              Total Moves
            </span>
            <span className="font-mono font-semibold text-white">
              {(session.moveDtoHistory || []).length} moves
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 bg-white text-black hover:bg-neutral-100 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-md active:scale-95 border border-white cursor-pointer"
        >
          Return to Lobby
        </button>
      </motion.div>
    </div>
  );
};
