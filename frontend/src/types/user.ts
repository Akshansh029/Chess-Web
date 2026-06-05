import { GameResult, GameTerminationReason } from "./game";

export interface UserProfileDto {
  id: string;
  username: string;
  email: string;
  eloRating: number;
  isActive: boolean;
  createdAt: string; // ISO timestamp (UTC)
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gamesDraw: number;
  winPercentage: number;
}

export interface GameHistoryDto {
  gameId: string;
  whitePlayerName: string;
  blackPlayerName: string;
  result: GameResult;
  terminationReason: GameTerminationReason;
  totalMoves: number;
  endedAt: string; // ISO timestamp (UTC)
  pgn: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}
