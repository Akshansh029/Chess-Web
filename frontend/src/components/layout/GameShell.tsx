"use client";

import React, { ReactNode } from "react";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import { Trophy, LogOut, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface GameShellProps {
  children: ReactNode;
  showNavbar?: boolean;
}

export const GameShell: React.FC<GameShellProps> = ({ children, showNavbar = true }) => {
  const { connected } = useGame();
  const { user, logout, isAuthenticated } = useAuth();

  const displayName = isAuthenticated && user ? user.name : null;

  return (
    <div className={`${showNavbar ? "min-h-screen" : "h-screen overflow-hidden"} bg-background relative overflow-hidden flex flex-col font-sans selection:bg-primary selection:text-white`}>
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[140px] animate-pulse"></div>
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent/10 rounded-full blur-[140px] animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div className="absolute inset-0 bg-dots opacity-20"></div>
      </div>

      {/* Header */}
      {showNavbar && (
        <header className="relative z-50 border-b border-white/5 bg-black/20 backdrop-blur-md">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-4 hover:opacity-90 transition-opacity"
              >
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                  <Image
                    src="/logo.jpg"
                    alt="Chess Logo"
                    width={100}
                    height={100}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <h1 className="text-lg font-light tracking-tight text-white flex items-center">
                    Chess <span className="font-semibold text-primary ml-1">Web</span>
                    <span className="text-[9px] font-medium bg-white/5 px-1.5 py-0.5 rounded text-foreground/40 ml-2 border border-white/5 uppercase tracking-wider">
                      Beta 2.0
                    </span>
                  </h1>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-6">
              {displayName && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <div
                    className={`w-2 h-2 rounded-full ${connected ? "bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]" : "bg-red-500 shadow-[0_0_5px_#ef4444]"}`}
                  ></div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground/60">
                    {connected ? "Relay Active" : "Offline"}
                  </span>
                </div>
              )}

              {displayName && (
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[10px] font-medium text-foreground/30 uppercase tracking-wider">
                        {isAuthenticated ? "Player" : "Guest"}
                      </p>
                      <p className="text-xs font-semibold uppercase text-white tracking-wider">
                        {displayName}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary uppercase">
                        {displayName.substring(0, 2)}
                      </span>
                    </div>
                  </div>

                  {isAuthenticated && (
                    <button
                      onClick={logout}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-red-500/10 hover:border-red-500/20 text-foreground/40 hover:text-red-400 transition-all flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider"
                      title="Sign Out"
                    >
                      <LogOut size={16} />
                    </button>
                  )}
                </div>
              )}

              {!displayName && (
                <div className="flex gap-3">
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-foreground/60 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-xl bg-primary/20 border border-primary/30 text-xs font-semibold uppercase tracking-wider text-white hover:bg-primary/30 transition-all"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={`relative z-10 flex-1 flex flex-col items-center justify-center ${showNavbar ? "p-4 overflow-y-auto" : "overflow-hidden w-full h-full"}`}>
        {children}
      </main>
    </div>
  );
};
