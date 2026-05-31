"use client";

import React from "react";
import {
  GameSession as GameSessionType,
  Color,
  GameStatus,
  GameResult,
  GameTerminationReason,
  Move,
} from "@/types/game";
import { Target, Cpu, Activity, User } from "lucide-react";
import { useChessStore } from "@/services/chessStore";
import ChessBoardWrapper from "./ChessBoardWrapper";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameContext";
import { motion, AnimatePresence } from "framer-motion";

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
  const setFen = useChessStore((state) => state.setFen);
  const router = useRouter();
  const { setGameSession } = useGame();

  React.useEffect(() => {
    if (session?.currentFen) {
      setFen(session.currentFen);
    }
  }, [session?.currentFen, setFen]);

  const handleReturnToLobby = () => {
    setGameSession(null);
    router.push("/lobby");
  };

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
    <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 text-white h-fit">
      {/* Left Column (Both Players' Cards) */}
      <div className="lg:col-span-3 space-y-6">
        <PlayerCard
          name={opponentName || "Awaiting Rival..."}
          color={opponentColor}
          isMyTurn={session.currentTurn === opponentColor}
          isWaiting={isWaiting}
        />
        <PlayerCard
          name={myName}
          color={myColor}
          isMyTurn={session.currentTurn === myColor}
          isMe
        />
      </div>

      {/* Center Column (Chessboard) */}
      <div className="lg:col-span-5 flex flex-col items-center gap-6">
        <div className="glass-card p-4 border-white/10 shadow-2xl shadow-black/50">
          <ChessBoardWrapper />
        </div>
      </div>

      {/* Right Column (Moves Record & Commands) */}
      <div className="lg:col-span-4 space-y-6">
        <MoveHistoryTable moves={session.moveHistory || []} />

        <div className="glass-card p-6 border-white/5 space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
              Command Center
            </h4>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span className="text-[8px] font-bold text-foreground/50 uppercase tracking-widest">
                {session.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <p className="text-[8px] font-bold text-foreground/30 uppercase tracking-widest">
                Active Turn
              </p>
              <p className="font-black uppercase text-white">
                {session.currentTurn}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[8px] font-bold text-foreground/30 uppercase tracking-widest">
                Turn Color
              </p>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${session.currentTurn === Color.WHITE ? "bg-white shadow-[0_0_5px_white]" : "bg-slate-600"}`}
                ></span>
                <span className="font-bold text-white uppercase">
                  {session.currentTurn}
                </span>
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 hover:border-red-500/30 transition-all text-red-400">
              Resign Match
            </button>
            <button className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 hover:border-primary/30 transition-all text-primary">
              Offer Draw
            </button>
          </div>
        </div>
      </div>

      {/* GameOver Modal Overlay */}
      <AnimatePresence>
        {session.status === GameStatus.ENDED && (
          <GameOverModal
            session={session}
            myColor={myColor}
            onClose={handleReturnToLobby}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const GameOverModal = ({
  session,
  myColor,
  onClose,
}: {
  session: GameSessionType;
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

  console.log(session);

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

        <h3
          className={`text-4xl font-black uppercase italic tracking-tighter mb-2 ${titleColor}`}
        >
          {title}
        </h3>
        <p className="text-foreground/40 text-xs font-bold uppercase tracking-widest mb-6">
          {session.terminationReason
            ? `Decided by ${session.terminationReason.toLowerCase()}`
            : "Game completed"}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8 bg-white/5 border border-white/5 rounded-2xl p-6">
          <div className="space-y-1 text-left">
            <span className="text-[8px] font-bold text-foreground/30 uppercase tracking-widest block">
              White Player
            </span>
            <span className="text-sm font-bold text-white block truncate">
              {session.whitePlayerName || "Unknown"}
            </span>
          </div>
          <div className="space-y-1 text-right">
            <span className="text-[8px] font-bold text-foreground/30 uppercase tracking-widest block">
              Black Player
            </span>
            <span className="text-sm font-bold text-white block truncate">
              {session.blackPlayerName || "Unknown"}
            </span>
          </div>
          <div className="col-span-2 border-t border-white/5 pt-4 flex justify-between items-center text-xs">
            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">
              Total Moves
            </span>
            <span className="font-mono font-black text-white">
              {session.moveHistory.length} moves
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 bg-white text-black hover:bg-primary hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
        >
          Return to Lobby
        </button>
      </motion.div>
    </div>
  );
};

const MoveHistoryTable = ({ moves }: { moves: Move[] }) => {
  const bottomRef = React.useRef<HTMLDivElement>(null);

  // Group moves into pairs (White / Black)
  const pairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: moves[i]?.sanNotation || `${moves[i]?.from}→${moves[i]?.to}`,
      black:
        moves[i + 1]?.sanNotation ||
        (moves[i + 1] ? `${moves[i + 1]?.from}→${moves[i + 1]?.to}` : ""),
    });
  }

  React.useEffect(() => {
    // Auto-scroll to the latest move
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [moves.length]);

  return (
    <div className="glass-card p-4 border-white/5 flex flex-col h-[280px]">
      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 border-b border-white/5 pb-2 mb-3">
        Strategic Record (SAN)
      </h4>
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-[9px] font-black uppercase text-foreground/30 tracking-wider">
              <th className="py-2 w-16">Move</th>
              <th className="py-2">White</th>
              <th className="py-2">Black</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((pair) => (
              <tr
                key={pair.moveNumber}
                className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-all"
              >
                <td className="py-2 font-mono text-foreground/40">
                  {pair.moveNumber}.
                </td>
                <td className="py-2 font-bold text-white/80">{pair.white}</td>
                <td className="py-2 font-bold text-white/80">{pair.black}</td>
              </tr>
            ))}
            {pairs.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="py-8 text-center text-[10px] uppercase font-bold text-foreground/20 italic tracking-widest"
                >
                  No moves played yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div ref={bottomRef} />
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
