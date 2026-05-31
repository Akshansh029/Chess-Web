import { create } from "zustand";

interface ChessState {
  fen: string;
  setFen: (fen: string) => void;
  resetFen: () => void;
}

export const useChessStore = create<ChessState>((set) => ({
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  setFen: (fen: string) => set({ fen }),
  resetFen: () =>
    set({ fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" }),
}));
