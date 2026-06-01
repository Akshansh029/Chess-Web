"use client";

import React from "react";
import {
  GameSession as GameSessionType,
  Color,
  GameStatus,
  Move,
} from "@/types/game";
import { Activity, Flag, Handshake } from "lucide-react";
import { useChessStore } from "@/services/chessStore";
import ChessBoardWrapper from "./ChessBoardWrapper";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameContext";
import { motion, AnimatePresence } from "framer-motion";
import { PlayerCard } from "./PlayerCard";
import { GameOverModal } from "./GameOverModal";

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
  const { setGameSession, playerId, sendResign } = useGame();
  const [showGameOverModal, setShowGameOverModal] = React.useState(false);

  React.useEffect(() => {
    if (session?.status === GameStatus.ENDED) {
      const timer = setTimeout(() => {
        setShowGameOverModal(true);
      }, 1200); // 1.2 seconds
      return () => clearTimeout(timer);
    } else {
      setShowGameOverModal(false);
    }
  }, [session?.status]);

  React.useEffect(() => {
    if (session?.currentFen) {
      setFen(session.currentFen);
    }
  }, [session?.currentFen, setFen]);

  const handleReturnToLobby = () => {
    setGameSession(null);
    router.push("/lobby");
  };

  const [showResignConfirm, setShowResignConfirm] = React.useState(false);

  const confirmResign = () => {
    if (session?.status !== GameStatus.ACTIVE) return;
    sendResign(session.id, playerId, myName);
    setShowResignConfirm(false);
  };

  React.useEffect(() => {
    if (session?.status !== GameStatus.ACTIVE) {
      setShowResignConfirm(false);
    }
  }, [session?.status]);

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
  const isGameActive = session.status === GameStatus.ACTIVE;
  const opponentName =
    myColor === Color.WHITE ? session.blackPlayerName : session.whitePlayerName;
  const opponentColor = myColor === Color.WHITE ? Color.BLACK : Color.WHITE;

  const capturedInfo = getCapturedPieces(
    session.currentFen ||
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  );

  return (
    <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 text-white h-fit">
      {/* Left Column (Both Players' Cards) */}
      <div className="lg:col-span-3 space-y-6">
        <PlayerCard
          name={opponentName || "Awaiting Rival..."}
          color={opponentColor}
          isMyTurn={session.currentTurn === opponentColor}
          isWaiting={isWaiting}
          capturedPieces={
            opponentColor === Color.WHITE
              ? capturedInfo.whiteCaptured
              : capturedInfo.blackCaptured
          }
          lead={
            opponentColor === Color.WHITE
              ? capturedInfo.whiteLead
              : capturedInfo.blackLead
          }
        />
        <PlayerCard
          name={myName}
          color={myColor}
          isMyTurn={session.currentTurn === myColor}
          isMe
          capturedPieces={
            myColor === Color.WHITE
              ? capturedInfo.whiteCaptured
              : capturedInfo.blackCaptured
          }
          lead={
            myColor === Color.WHITE
              ? capturedInfo.whiteLead
              : capturedInfo.blackLead
          }
        />
      </div>

      {/* Center Column (Chessboard) */}
      <div className="lg:col-span-6 flex flex-col items-center gap-6">
        <div className="glass-card p-4 border-white/10 shadow-2xl shadow-black/50">
          <ChessBoardWrapper />
        </div>
      </div>

      {/* Right Column (Moves Record & Commands) */}
      <div className="lg:col-span-3 space-y-6">
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
                Active Turn
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

          <div className="flex gap-4 relative">
            <div className="relative flex-1">
              <button
                onClick={() => setShowResignConfirm(true)}
                disabled={!isGameActive}
                className={`w-full flex items-center justify-center py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 hover:border-red-500/30 transition-all text-red-400 ${!isGameActive ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Resign
                <Flag size={14} className="ml-2" />
              </button>

              <AnimatePresence>
                {showResignConfirm && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-30 p-4 rounded-xl border border-white/10 bg-slate-900 shadow-2xl flex flex-col items-center gap-3 text-center min-w-[160px]"
                  >
                    {/* Arrow/Triangle pointing to the button */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white/10 -z-10 translate-y-px"></div>

                    <p className="text-[9px] font-black uppercase tracking-wider text-white select-none whitespace-nowrap">
                      Confirm Resign?
                    </p>
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={confirmResign}
                        className="flex-1 py-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-[9px] font-black uppercase tracking-widest text-white transition-all shadow-[0_2px_10px_rgba(239,68,68,0.2)]"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setShowResignConfirm(false)}
                        className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-300 transition-all"
                      >
                        No
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button className="flex-1 flex items-center justify-center py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 hover:border-primary/30 transition-all text-primary">
              Offer Draw
              <Handshake size={14} className="ml-2" />
            </button>
          </div>
        </div>
      </div>

      {/* GameOver Modal Overlay */}
      <AnimatePresence>
        {showGameOverModal && (
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

export const pieceSymbols: Record<string, string> = {
  p: "♟",
  n: "♞",
  b: "♝",
  r: "♜",
  q: "♛",
  P: "♟",
  N: "♞",
  B: "♝",
  R: "♜",
  Q: "♛",
};

interface CapturedPiecesInfo {
  whiteCaptured: string[];
  blackCaptured: string[];
  whiteScore: number;
  blackScore: number;
  whiteLead: number;
  blackLead: number;
}

const getCapturedPieces = (fen: string): CapturedPiecesInfo => {
  const defaultPieces = {
    white: { P: 8, N: 2, B: 2, R: 2, Q: 1 },
    black: { p: 8, n: 2, b: 2, r: 2, q: 1 },
  };

  const currentCounts = {
    P: 0,
    N: 0,
    B: 0,
    R: 0,
    Q: 0,
    p: 0,
    n: 0,
    b: 0,
    r: 0,
    q: 0,
  };

  const boardPart = fen.split(" ")[0];
  for (const char of boardPart) {
    if (char in currentCounts) {
      currentCounts[char as keyof typeof currentCounts]++;
    }
  }

  const whiteCaptured: string[] = [];
  const blackCaptured: string[] = [];

  // Pieces captured by White (Black pieces lost)
  const pCount = defaultPieces.black.p - currentCounts.p;
  for (let i = 0; i < pCount; i++) whiteCaptured.push("p");
  const nCount = defaultPieces.black.n - currentCounts.n;
  for (let i = 0; i < nCount; i++) whiteCaptured.push("n");
  const bCount = defaultPieces.black.b - currentCounts.b;
  for (let i = 0; i < bCount; i++) whiteCaptured.push("b");
  const rCount = defaultPieces.black.r - currentCounts.r;
  for (let i = 0; i < rCount; i++) whiteCaptured.push("r");
  const qCount = defaultPieces.black.q - currentCounts.q;
  for (let i = 0; i < qCount; i++) whiteCaptured.push("q");

  // Pieces captured by Black (White pieces lost)
  const PCount = defaultPieces.white.P - currentCounts.P;
  for (let i = 0; i < PCount; i++) blackCaptured.push("P");
  const NCount = defaultPieces.white.N - currentCounts.N;
  for (let i = 0; i < NCount; i++) blackCaptured.push("N");
  const BCount = defaultPieces.white.B - currentCounts.B;
  for (let i = 0; i < BCount; i++) blackCaptured.push("B");
  const RCount = defaultPieces.white.R - currentCounts.R;
  for (let i = 0; i < RCount; i++) blackCaptured.push("R");
  const QCount = defaultPieces.white.Q - currentCounts.Q;
  for (let i = 0; i < QCount; i++) blackCaptured.push("Q");

  const values: Record<string, number> = {
    P: 1,
    N: 3,
    B: 3,
    R: 5,
    Q: 9,
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
  };

  const sortOrder: Record<string, number> = {
    q: 0,
    r: 1,
    b: 2,
    n: 3,
    p: 4,
    Q: 0,
    R: 1,
    B: 2,
    N: 3,
    P: 4,
  };

  whiteCaptured.sort((a, b) => sortOrder[a] - sortOrder[b]);
  blackCaptured.sort((a, b) => sortOrder[a] - sortOrder[b]);

  const whiteScore = whiteCaptured.reduce((sum, p) => sum + values[p], 0);
  const blackScore = blackCaptured.reduce((sum, p) => sum + values[p], 0);

  const whiteLead = Math.max(0, whiteScore - blackScore);
  const blackLead = Math.max(0, blackScore - whiteScore);

  return {
    whiteCaptured,
    blackCaptured,
    whiteScore,
    blackScore,
    whiteLead,
    blackLead,
  };
};

export default GameSessionView;
