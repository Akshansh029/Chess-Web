export enum MessageType {
  CHAT = "CHAT",
  JOIN = "JOIN",
  LEAVE = "LEAVE",
}

export enum Color {
  WHITE = "WHITE",
  BLACK = "BLACK",
}

export enum GameStatus {
  WAITING = "WAITING",
  ACTIVE = "ACTIVE",
  ENDED = "ENDED",
}

export enum GameResult {
  WHITE_WON = "WHITE_WON",
  BLACK_WON = "BLACK_WON",
  DRAW = "DRAW",
}

export enum GameTerminationReason {
  CHECKMATE = "CHECKMATE",
  RESIGNATION = "RESIGNATION",
  TIMEOUT = "TIMEOUT",
  STALEMATE = "STALEMATE",
  INSUFFICIENT_MATERIAL = "INSUFFICIENT_MATERIAL",
  REPETITION = "REPETITION",
  DRAW_ACCEPTED = "DRAW_ACCEPTED",
}

export interface Move {
  from: string;
  to: string;
  piece: string;
  playedAt?: string;
  moveNumber?: number;
  color?: Color;
  sanNotation?: string;
  fromSquare?: string;
  toSquare?: string;
  isCapture?: boolean;
  isCheck?: boolean;
  isCheckmate?: boolean;
  isCastling?: boolean;
}

export interface GameSession {
  id: string;
  whitePlayerId?: string | null;
  blackPlayerId?: string | null;
  whitePlayerName?: string | null;
  blackPlayerName?: string | null;
  whitePlayerNewElo?: number | null;
  blackPlayerNewElo?: number | null;
  whitePlayerOldElo?: number | null;
  blackPlayerOldElo?: number | null;
  status: GameStatus;
  currentFen: string;
  currentTurn: Color;
  moveDtoHistory: Move[];
  startedAt?: string;
  result?: GameResult | null;
  terminationReason?: GameTerminationReason | null;
  drawOfferBy?: string | null;
}

export interface ChatMessage {
  type: MessageType;
  content?: string;
  sender: string;
}
