import { parseBackendError } from "@/utils/error";

const HOST_URL = process.env.NEXT_PUBLIC_API_URL;
const AUTH_BASE_URL = `${HOST_URL}/api/auth`;

export interface LoginResponse {
  message: string;
  accessToken: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password?: string;
  verificationCode: string;
}

export const authApi = {
  checkEmail: async (email: string): Promise<boolean> => {
    const url = new URL(`${AUTH_BASE_URL}/check-email`);
    url.searchParams.append("email", email);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      throw await parseBackendError(response);
    }
    return await response.json(); // returns boolean
  },

  register: async (request: RegisterRequest): Promise<LoginResponse> => {
    const response = await fetch(`${AUTH_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      credentials: "include", // send cookies (refresh token)
    });

    if (!response.ok) {
      throw await parseBackendError(response);
    }
    return await response.json();
  },

  login: async (email: string, password?: string): Promise<LoginResponse> => {
    const response = await fetch(`${AUTH_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include", // receive refresh token cookie
    });

    if (!response.ok) {
      throw await parseBackendError(response);
    }
    return await response.json();
  },

  refresh: async (): Promise<LoginResponse> => {
    const response = await fetch(`${AUTH_BASE_URL}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // send and receive refresh token cookie
    });

    if (!response.ok) {
      throw await parseBackendError(response);
    }
    return await response.json();
  },

  logout: async (): Promise<void> => {
    const response = await fetch(`${AUTH_BASE_URL}/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // send refresh token cookie
    });

    if (!response.ok) {
      console.warn("Failed to clean up session on backend");
    }
  },
};
