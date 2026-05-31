"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Chess } from "chess.js";
import { useChessStore } from "@/services/chessStore";
import { useGame } from "@/context/GameContext";
import { Color, GameStatus } from "@/types/game";

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
  },
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

  const [moveFrom, setMoveFrom] = React.useState<string | null>(null);
  const [optionSquares, setOptionSquares] = React.useState<
    Record<string, React.CSSProperties>
  >({});

  const isMyTurn = gameSession?.currentTurn === playerColor;
  const isGameActive = gameSession?.status === GameStatus.ACTIVE;

  // Memoized base square styles for king-in-check
  const getBaseSquareStyles = React.useMemo((): Record<
    string,
    React.CSSProperties
  > => {
    const styles: Record<string, React.CSSProperties> = {};
    if (!fen) return styles;

    try {
      const game = new Chess(fen);

      // king in check highlight
      if (game.inCheck()) {
        const turn = game.turn();
        const board = game.board();
        let kingSquare: string | null = null;
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && piece.type === "k" && piece.color === turn) {
              kingSquare = piece.square;
              break;
            }
          }
          if (kingSquare) break;
        }

        if (kingSquare) {
          styles[kingSquare] = {
            boxShadow: "inset 0 0 0 4px #ef4444, 0 0 12px #ef4444",
            backgroundColor: "rgba(239, 68, 68, 0.25)",
          };
        }
      }
    } catch (e) {
      console.error("Error calculating chess board base highlights:", e);
    }

    return styles;
  }, [fen]);

  // combine base styles with transient option
  const getCombinedSquareStyles = (): Record<string, React.CSSProperties> => {
    const base = getBaseSquareStyles;
    const combined = { ...base };

    Object.keys(optionSquares).forEach((square) => {
      const baseStyle = base[square] || {};
      const optionStyle = optionSquares[square] || {};
      combined[square] = {
        ...baseStyle,
        ...optionStyle,
      };
    });

    return combined;
  };

  // Highlight valid moves
  const getMoveOptions = (square: string): boolean => {
    const game = new Chess(fen);
    const moves = game.moves({
      square: square as any,
      verbose: true,
    });
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares: Record<string, React.CSSProperties> = {};
    newSquares[square] = {
      background: "rgba(245, 158, 11, 0.2)",
    };

    moves.forEach((move) => {
      const isCapture = !!move.captured;
      newSquares[move.to] = {
        background:
          game.get(move.to as any) !== null
            ? "radial-gradient(circle, rgba(67, 122, 255, 0.8) 20%, transparent 20%)" // Move indicator (blue dot)
            : "radial-gradient(circle, rgba(59, 130, 246, 0.9) 20%, transparent 20%)",
        borderRadius: isCapture ? undefined : "50%",
        ...(isCapture
          ? {
              boxShadow: "inset 0 0 0 3px #f59e0b",
              backgroundColor: "rgba(245, 158, 11, 0.15)",
            }
          : {}),
      };
    });

    setOptionSquares(newSquares);
    return true;
  };

  // Drag start handler to highlight moves
  const onPieceDrag = ({ square }: { square: string | null }) => {
    if (!square || !isGameActive || !isMyTurn) return;
    if (moveFrom === square) return;
    setMoveFrom(square);
    getMoveOptions(square);
  };

  // Piece drop handler for drag-and-drop moves
  const onPieceDrop = ({
    piece,
    sourceSquare,
    targetSquare,
  }: PieceDropArgs): boolean => {
    setMoveFrom(null);
    setOptionSquares({});

    if (!targetSquare) return false;
    if (!isGameActive) return false;
    if (!isMyTurn) return false;

    // Enforce piece color matching the player's assigned color
    const pieceStr = piece.pieceType;
    const isWhitePiece = pieceStr.startsWith("w");
    if (playerColor === Color.WHITE && !isWhitePiece) return false;
    if (playerColor === Color.BLACK && isWhitePiece) return false;

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
        setFen(game.fen());
        sendMove(
          gameSession!.id,
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
          playerColor,
        );
        return true;
      }
    } catch (error) {
      console.warn("Local move validation failed:", error);
      return false;
    }

    return false;
  };

  // Square click handler for click-to-play moves
  const onSquareClick = ({ square }: { square: string }) => {
    if (!isGameActive || !isMyTurn) return;

    const game = new Chess(fen);
    const pieceObj = game.get(square as any);

    if (moveFrom === null) {
      // First click: select piece of player color
      if (pieceObj) {
        const isWhitePiece = pieceObj.color === "w";
        const isOurColor =
          (playerColor === Color.WHITE && isWhitePiece) ||
          (playerColor === Color.BLACK && !isWhitePiece);

        if (isOurColor) {
          setMoveFrom(square);
          getMoveOptions(square);
        }
      }
    } else {
      // Second click: deselect, switch selection, or make move
      if (moveFrom === square) {
        // Clicking same square deselects
        setMoveFrom(null);
        setOptionSquares({});
        return;
      }

      if (pieceObj) {
        // Clicking another of our pieces switches selection
        const isWhitePiece = pieceObj.color === "w";
        const isOurColor =
          (playerColor === Color.WHITE && isWhitePiece) ||
          (playerColor === Color.BLACK && !isWhitePiece);

        if (isOurColor) {
          setMoveFrom(square);
          getMoveOptions(square);
          return;
        }
      }

      // Try making click-to-play move
      const isPawn = game.get(moveFrom as any)?.type === "p";
      const isPromotionRank =
        (playerColor === Color.WHITE && square.endsWith("8")) ||
        (playerColor === Color.BLACK && square.endsWith("1"));
      const promotion = isPawn && isPromotionRank ? "q" : undefined;

      try {
        const move = game.move({
          from: moveFrom,
          to: square,
          promotion,
        });

        if (move) {
          setFen(game.fen());
          sendMove(
            gameSession!.id,
            playerId,
            {
              from: moveFrom,
              to: square,
              piece: move.piece.toUpperCase(),
              promotionPiece: promotion
                ? playerColor === Color.WHITE
                  ? "Q"
                  : "q"
                : undefined,
            },
            playerColor,
          );
        }
      } catch (error) {
        console.warn("Click-to-play move failed validation:", error);
      }

      // Clean up selection states
      setMoveFrom(null);
      setOptionSquares({});
    }
  };

  return (
    <div className="w-full max-w-[600px] aspect-square rounded-xl overflow-hidden shadow-2xl relative border border-white/10 bg-slate-950">
      <Chessboard
        options={{
          position: fen,
          onPieceDrop,
          onSquareClick,
          onPieceDrag,
          squareStyles: getCombinedSquareStyles(),
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
