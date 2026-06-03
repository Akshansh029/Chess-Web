"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, RegisterRequest } from "@/services/auth";
import { useGame } from "@/context/GameContext";

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  sendVerificationCode: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { setPlayerName } = useGame();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleAuthSuccess = (token: string) => {
    setAccessToken(token);
    const decoded = parseJwt(token);
    if (decoded) {
      const profile = {
        id: decoded.sub,
        name: decoded.userName,
        email: decoded.email,
      };
      setUser(profile);
      setPlayerName(profile.name); // synchronize with GameContext
    }
  };

  // Attempt refresh token login on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await authApi.refresh();
        if (response.accessToken) {
          handleAuthSuccess(response.accessToken);
        }
      } catch (err) {
        // Silent catch: user is simply not logged in
        console.log("No active session found or session expired.");
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  // Automatic silent refresh before token expires
  useEffect(() => {
    if (!accessToken) return;

    const decoded = parseJwt(accessToken);
    if (!decoded || !decoded.exp) return;

    const expiryTimeMs = decoded.exp * 1000;
    const delay = expiryTimeMs - Date.now() - 60 * 1000; // 1 min before expiry

    const refreshTimer = setTimeout(async () => {
      try {
        console.log("Initiating silent token refresh...");
        const response = await authApi.refresh();
        if (response.accessToken) {
          handleAuthSuccess(response.accessToken);
        }
      } catch (err) {
        console.error("Automatic token refresh failed:", err);
        // Clean up user session
        setUser(null);
        setAccessToken(null);
        setPlayerName("");
      }
    }, Math.max(0, delay));

    return () => clearTimeout(refreshTimer);
  }, [accessToken, setPlayerName]);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);
      if (response.accessToken) {
        handleAuthSuccess(response.accessToken);
      }
    } catch (err) {
      setUser(null);
      setAccessToken(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      if (response.accessToken) {
        handleAuthSuccess(response.accessToken);
      }
    } catch (err) {
      setUser(null);
      setAccessToken(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      setUser(null);
      setAccessToken(null);
      setPlayerName(""); // clear from GameContext
      setIsLoading(false);
    }
  };

  const sendVerificationCode = async (email: string): Promise<boolean> => {
    try {
      return await authApi.checkEmail(email);
    } catch (err) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!accessToken,
        isLoading,
        login,
        register,
        logout,
        sendVerificationCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
