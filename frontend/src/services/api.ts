import { Color, GameSession } from "@/types/game";
import { GameHistoryDto, PageResponse, UserProfileDto } from "@/types/user";
import { parseBackendError } from "@/utils/error";

const HOST_URL = "http://localhost:8080";
const API_BASE_URL = `${HOST_URL}/api/games`;

const getHeaders = (token?: string | null) => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
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

  getUserProfile: async (token: string): Promise<UserProfileDto> => {
    const response = await fetch(`${HOST_URL}/api/users/me`, {
      headers: getHeaders(token),
      credentials: "include",
    });
    if (!response.ok) {
      throw await parseBackendError(response);
    }
    return await response.json();
  },

  getUserGames: async (
    token: string,
    pageNo: number = 0,
    pageSize: number = 10,
  ): Promise<PageResponse<GameHistoryDto>> => {
    const response = await fetch(
      `${API_BASE_URL}?pageNo=${pageNo}&pageSize=${pageSize}`,
      {
        headers: getHeaders(token),
        credentials: "include",
      },
    );
    if (!response.ok) {
      throw await parseBackendError(response);
    }
    return await response.json();
  },
};
