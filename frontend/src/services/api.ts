import { Color, GameSession } from "@/types/game";

const API_BASE_URL = "http://localhost:8080/api/games";

export const gameApi = {
  createGame: async (
    playerId: string,
    playerName: string,
    playerColor: Color,
  ): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId, playerName, playerColor }),
    });
    if (!response.ok) throw new Error("Failed to create game");
    return await response.json();
  },

  joinGame: async (
    gameId: string,
    playerId: string,
    playerName: string,
    playerColor: Color,
  ): Promise<GameSession> => {
    const response = await fetch(`${API_BASE_URL}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, playerId, playerName, playerColor }),
    });
    if (!response.ok) throw new Error("Failed to join game");
    return await response.json();
  },

  getWaitingGames: async (): Promise<GameSession[]> => {
    const response = await fetch(`${API_BASE_URL}/waiting`);
    if (!response.ok) throw new Error("Failed to fetch waiting games");
    return await response.json();
  },
};
