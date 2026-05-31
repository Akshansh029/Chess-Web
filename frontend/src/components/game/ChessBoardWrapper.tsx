"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Chess } from "chess.js";
import { useChessStore } from "@/services/chessStore";
import { useGame } from "@/context/GameContext";
import { Color, GameStatus } from "@/types/game";

// Dynamically import Chessboard to avoid SSR/window-not-defined errors in Next.js
const Chessboard = dynamic(
  () => import("react-chessboard").then((mod) => mod.Chessboard),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-square bg-slate-900/50 rounded-lg flex items-center justify-center border border-white/10">
        <span className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">
          Initializing Grid Matrix...
        </span>
      </div>
    ),
  }
);

interface PieceDropArgs {
  piece: { pieceType: string };
  sourceSquare: string;
  targetSquare: string | null;
}

export default function ChessBoardWrapper() {
  const fen = useChessStore((state) => state.fen);
  const setFen = useChessStore((state) => state.setFen);
  const { gameSession, playerColor, playerId, sendMove } = useGame();

  const isMyTurn = gameSession?.currentTurn === playerColor;
  const isGameActive = gameSession?.status === GameStatus.ACTIVE;

  const onPieceDrop = ({
    piece,
    sourceSquare,
    targetSquare,
  }: PieceDropArgs): boolean => {
    if (!targetSquare) return false;
    if (!isGameActive) return false;
    if (!isMyTurn) return false;

    // Enforce piece color matching the player's assigned color
    const pieceStr = piece.pieceType; // e.g., 'wP', 'bK'
    const isWhitePiece = pieceStr.startsWith("w");
    if (playerColor === Color.WHITE && !isWhitePiece) return false;
    if (playerColor === Color.BLACK && isWhitePiece) return false;

    // Initialize chess.js with the current FEN state
    const game = new Chess(fen);

    // Check if the move is a pawn promotion
    const pieceObj = game.get(sourceSquare as any);
    const isPawn = pieceObj?.type === "p";
    const isPromotionRank =
      (playerColor === Color.WHITE && targetSquare.endsWith("8")) ||
      (playerColor === Color.BLACK && targetSquare.endsWith("1"));
    const promotion = isPawn && isPromotionRank ? "q" : undefined;

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion,
      });

      if (move) {
        // Optimistic UI Update: update FEN in our store so the piece stays put
        setFen(game.fen());

        // Send the move payload to the Java backend via WebSocket
        sendMove(
          gameSession.id,
          playerId,
          {
            from: sourceSquare,
            to: targetSquare,
            piece: move.piece.toUpperCase(),
            promotionPiece: promotion
              ? playerColor === Color.WHITE
                ? "Q"
                : "q"
              : undefined,
          },
          playerColor
        );
        return true;
      }
    } catch (error) {
      console.warn("Local move validation failed:", error);
      return false;
    }

    return false;
  };

  return (
    <div className="w-full max-w-[500px] aspect-square rounded-xl overflow-hidden shadow-2xl relative border border-white/10 bg-slate-950">
      <Chessboard
        options={{
          position: fen,
          onPieceDrop,
          boardOrientation: playerColor === Color.WHITE ? "white" : "black",
          allowDragging: isGameActive && isMyTurn,
          darkSquareStyle: { backgroundColor: "#475569" },
          lightSquareStyle: { backgroundColor: "#cbd5e1" },
          boardStyle: {
            borderRadius: "12px",
            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.5)",
          },
        }}
      />
    </div>
  );
}
