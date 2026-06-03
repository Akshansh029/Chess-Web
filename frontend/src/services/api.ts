import { Color, GameSession } from "@/types/game";
import { parseBackendError } from "@/utils/error";

const API_BASE_URL = "http://localhost:8080/api/games";

const getHeaders = () => {
  return { "Content-Type": "application/json" };
};

export const gameApi = {
  createGame: async (
    playerId: string,
    playerName: string,
    playerColor: Color,
  ): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/create`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ playerId, playerName, playerColor }),
      credentials: "include",
    });
    if (!response.ok) {
      throw await parseBackendError(response);
    }
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
      headers: getHeaders(),
      body: JSON.stringify({ gameId, playerId, playerName, playerColor }),
      credentials: "include",
    });
    if (!response.ok) {
      throw await parseBackendError(response);
    }
    return await response.json();
  },

  getWaitingGames: async (): Promise<GameSession[]> => {
    const response = await fetch(`${API_BASE_URL}/waiting`, {
      headers: getHeaders(),
      credentials: "include",
    });
    if (!response.ok) {
      throw await parseBackendError(response);
    }
    return await response.json();
  },
};
