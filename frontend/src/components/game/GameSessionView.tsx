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
import { formatToIST } from "@/utils/time";
import { MoveHistoryTable } from "./MoveHistoryTable";
import { getCapturedPieces } from "@/utils/gameSessionUtils";

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
  const {
    setGameSession,
    playerId,
    sendResign,
    sendDrawOffer,
    sendDrawAccept,
    sendDrawDecline,
  } = useGame();
  const [showGameOverModal, setShowGameOverModal] = React.useState(false);

  React.useEffect(() => {
    if (session?.status === GameStatus.ENDED) {
      setShowGameOverModal(true);
    } else {
      setShowGameOverModal(false);
    }
  }, [session?.status]);

  React.useEffect(() => {
    if (session?.currentFen) {
      setFen(session.currentFen);
    }
  }, [session?.currentFen, setFen]);

  const prevMovesLength = React.useRef(session?.moveRecordHistory?.length || 0);
  const prevStatus = React.useRef<GameStatus | undefined>(undefined);
  const isFirstLoad = React.useRef(true);

  const playSound = React.useCallback((soundName: string) => {
    try {
      const audio = new Audio(`/sounds/${soundName}.mp3`);
      audio.play().catch((err) => {
        console.warn(`Failed to play sound: /sounds/${soundName}.mp3`, err);
      });
    } catch (error) {
      console.error("Audio playback error:", error);
    }
  }, []);

  // Track opponent joins & game start notify sound
  React.useEffect(() => {
    if (!session) return;

    if (session.status === GameStatus.ACTIVE) {
      if (prevStatus.current === GameStatus.WAITING) {
        playSound("notify");
      } else if (prevStatus.current === undefined) {
        const isBrandNewGame =
          !session.moveRecordHistory || session.moveRecordHistory.length === 0;
        if (isBrandNewGame) {
          playSound("notify");
        }
      }
    }

    prevStatus.current = session.status;
  }, [session, playSound]);

  // Track game moves and play appropriate game sounds
  React.useEffect(() => {
    if (!session?.moveRecordHistory) return;

    const currentLength = session.moveRecordHistory.length;

    // No sound on initial mount or refresh
    if (isFirstLoad.current) {
      prevMovesLength.current = currentLength;
      isFirstLoad.current = false;
      return;
    }

    if (currentLength > prevMovesLength.current) {
      const lastMove = session.moveRecordHistory[currentLength - 1];

      const isCastling =
        lastMove.isCastling ||
        lastMove.castling ||
        lastMove.sanNotation?.includes("O-O") ||
        false;
      const isCheck =
        lastMove.isCheck ||
        lastMove.check ||
        lastMove.isCheckmate ||
        lastMove.checkmate ||
        lastMove.sanNotation?.includes("+") ||
        lastMove.sanNotation?.includes("#") ||
        false;
      const isCapture =
        lastMove.isCapture ||
        lastMove.capture ||
        lastMove.sanNotation?.includes("x") ||
        false;

      if (isCastling) {
        playSound("castle");
      } else if (isCheck) {
        playSound("move-check");
      } else if (isCapture) {
        playSound("capture");
      } else {
        playSound("move-self");
      }
    }

    prevMovesLength.current = currentLength;
  }, [session?.moveRecordHistory, playSound]);

  const handleReturnToLobby = () => {
    setGameSession(null);
    router.push("/lobby");
  };

  const [showResignConfirm, setShowResignConfirm] = React.useState(false);
  const [showDrawConfirm, setShowDrawConfirm] = React.useState(false);

  const confirmResign = () => {
    if (session?.status !== GameStatus.ACTIVE) return;
    sendResign(session.id, playerId, myName);
    setShowResignConfirm(false);
  };

  const confirmOfferDraw = () => {
    if (session?.status !== GameStatus.ACTIVE) return;
    if (session.drawOfferBy) return;

    const oppId =
      myColor === Color.WHITE ? session.blackPlayerId : session.whitePlayerId;
    const oppName =
      myColor === Color.WHITE
        ? session.blackPlayerName
        : session.whitePlayerName;

    if (!oppId || !oppName) return;

    sendDrawOffer(session.id, playerId, myName, oppId, oppName);
    setShowDrawConfirm(false);
  };

  const handleAcceptDraw = () => {
    if (session?.status !== GameStatus.ACTIVE) return;
    sendDrawAccept(session.id, playerId, myName);
  };

  const handleDeclineDraw = () => {
    if (session?.status !== GameStatus.ACTIVE) return;
    sendDrawDecline(session.id, playerId, myName);
  };

  React.useEffect(() => {
    if (session?.status !== GameStatus.ACTIVE) {
      setShowResignConfirm(false);
      setShowDrawConfirm(false);
    }
  }, [session?.status]);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white">
        <Activity className="animate-pulse text-primary mb-4" size={48} />
        <h3 className="text-base font-light tracking-tight text-foreground/50">
          Waiting for opponent...
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
        <MoveHistoryTable moves={session.moveRecordHistory || []} />

        <div className="glass-card p-6 border-white/5 space-y-6">
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
            <h3 className="text-xl font-light tracking-tight text-white">
              Game <span className="font-semibold text-primary">Arena</span>
            </h3>
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span className="text-[8px] font-semibold text-foreground/40 uppercase tracking-wider">
                {session.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <p className="text-[8px] font-semibold text-foreground/40 uppercase tracking-wider">
                Started At
              </p>
              <p className="font-semibold uppercase text-white tracking-wider">
                {formatToIST(session.startedAt)}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[8px] font-semibold text-foreground/40 uppercase tracking-wider">
                Active Turn
              </p>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${session.currentTurn === Color.WHITE ? "bg-white shadow-[0_0_5px_white]" : "bg-slate-600"}`}
                ></span>
                <span className="font-semibold text-white uppercase tracking-wider">
                  {session.currentTurn}
                </span>
              </span>
            </div>
          </div>

          {session.drawOfferBy && session.drawOfferBy !== playerId ? (
            <div className="p-4 rounded-xl border border-primary/20 bg-slate-900/60 shadow-lg flex flex-col items-center gap-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary animate-pulse flex items-center gap-2">
                <Handshake size={16} />
                Draw Offered by Opponent
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleAcceptDraw}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-[9px] uppercase tracking-wider text-white transition-all font-semibold cursor-pointer"
                >
                  Accept
                </button>
                <button
                  onClick={handleDeclineDraw}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 border border-white/5 rounded-lg text-[9px] font-semibold uppercase tracking-wider text-white transition-all cursor-pointer"
                >
                  Decline
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 relative">
              <div className="relative flex-1">
                <button
                  onClick={() => setShowResignConfirm(true)}
                  disabled={!isGameActive || !!session.drawOfferBy}
                  className={`w-full flex items-center justify-center py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-semibold uppercase tracking-wider hover:bg-red-500/10 hover:border-red-500/20 transition-colors text-red-400 cursor-pointer ${!isGameActive || !!session.drawOfferBy ? "opacity-50 cursor-not-allowed" : ""}`}
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

                      <p className="text-[9px] font-semibold uppercase tracking-wider text-white select-none whitespace-nowrap">
                        Confirm Resign?
                      </p>
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={confirmResign}
                          className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-[9px] font-semibold uppercase tracking-wider text-white transition-all cursor-pointer"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setShowResignConfirm(false)}
                          className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[9px] font-semibold uppercase tracking-wider text-slate-300 transition-all cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="relative flex-1">
                <button
                  onClick={() => {
                    if (session.drawOfferBy !== playerId) {
                      setShowDrawConfirm(true);
                    }
                  }}
                  disabled={!isGameActive || !!session.drawOfferBy}
                  className={`w-full flex items-center justify-center py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-semibold uppercase tracking-wider hover:bg-primary/10 hover:border-primary/20 transition-colors text-primary cursor-pointer ${!isGameActive || !!session.drawOfferBy ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {session.drawOfferBy === playerId
                    ? "Offered..."
                    : "Offer Draw"}
                  <Handshake size={14} className="ml-2" />
                </button>

                <AnimatePresence>
                  {showDrawConfirm && (
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

                      <p className="text-[9px] font-semibold uppercase tracking-wider text-white select-none whitespace-nowrap">
                        Offer Draw?
                      </p>
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={confirmOfferDraw}
                          className="flex-1 py-1.5 bg-white hover:bg-neutral-100 rounded-lg text-[9px] font-semibold uppercase tracking-wider text-black transition-all cursor-pointer border border-white"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setShowDrawConfirm(false)}
                          className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[9px] font-semibold uppercase tracking-wider text-slate-300 transition-all cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
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

export default GameSessionView;
