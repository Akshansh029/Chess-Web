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

export interface Move {
  from: string;
  to: string;
  piece: string;
  timestamp: string;
}

export interface GameSession {
  id: string;
  whitePlayerId?: string | null;
  blackPlayerId?: string | null;
  whitePlayerName?: string | null;
  blackPlayerName?: string | null;
  status: GameStatus;
  currentFen: string;
  currentTurn: Color;
  moveHistory: Move[];
  startedAt?: string;
}

export interface ChatMessage {
  type: MessageType;
  content?: string;
  sender: string;
}
