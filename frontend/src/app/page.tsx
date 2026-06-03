"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Color } from "@/types/game";
import { GameShell } from "@/components/layout/GameShell";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Shield, Play, Lock, UserPlus } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { setPlayerName, setPlayerColor, connect, playerName } = useGame();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestColor, setGuestColor] = useState<Color>(Color.WHITE);

  // If already authenticated or named, send to lobby
  useEffect(() => {
    if (!isLoading && (isAuthenticated || playerName)) {
      connect();
      router.push("/lobby");
    }
  }, [playerName, isAuthenticated, isLoading, connect, router]);

  const handleStartGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (guestName.trim()) {
      setPlayerName(guestName);
      setPlayerColor(guestColor);
      connect();
      router.push("/lobby");
    }
  };

  if (isLoading) {
    return (
      <GameShell>
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-foreground/40 text-xs font-black uppercase tracking-widest">
            Loading Arena...
          </p>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell>
      <div className="w-full max-w-lg mx-auto flex flex-col justify-center items-center min-h-[calc(100vh-140px)] py-4 overflow-hidden">
        <AnimatePresence mode="wait">
          {!showGuestForm ? (
            <motion.div
              key="main-options"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="glass-card p-10 w-full relative overflow-hidden flex flex-col justify-center"
            >
              {/* Backing Graphic */}
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Shield size={120} />
              </div>

              {/* Logo / Heading */}
              <div className="flex flex-col items-center text-center mb-8 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mb-5 border border-primary/30 shadow-xl shadow-primary/5">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-9 h-9 text-primary filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                    fill="currentColor"
                  >
                    <path d="M19,22H5V20H19V22M17,10C17,8.9 16.1,8 15,8V7C16.1,7 17,6.1 17,5C17,3.9 16.1,3 15,3C13.9,3 13,3.9 13,5C13,6.1 13.9,7 15,7V8H9V7C10.1,7 11,6.1 11,5C11,3.9 10.1,3 9,3C7.9,3 7,3.9 7,5C7,6.1 7.9,7 9,7V8C7.9,8 7,8.9 7,10V15C7,16.1 7.9,17 9,17H15C16.1,17 17,16.1 17,15V10M15,15H9V10H15V15M17,18H7V19H17V18Z" />
                  </svg>
                </div>
                <h2 className="text-4xl font-black tracking-tight text-white uppercase italic">
                  ChessWeb
                </h2>
                <p className="text-foreground/50 text-xs font-semibold uppercase tracking-wider mt-2 max-w-sm">
                  Real-time multiplayer chess in a high-tech strategy arena
                </p>
              </div>

              {/* Main Actions */}
              <div className="space-y-4 relative z-10">
                <Link
                  href="/login"
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-black py-4.5 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs border border-white/10"
                >
                  <Lock size={16} />
                  Sign In
                </Link>

                <Link
                  href="/register"
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black py-4.5 rounded-xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                >
                  <UserPlus size={16} />
                  Create Account
                </Link>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-white/5"></div>
                  <span className="flex-shrink mx-4 text-[10px] font-black text-foreground/20 uppercase tracking-widest">
                    Or
                  </span>
                  <div className="flex-grow border-t border-white/5"></div>
                </div>

                <button
                  onClick={() => setShowGuestForm(true)}
                  className="w-full bg-transparent hover:text-white text-foreground/40 font-black py-2.5 transition-colors flex items-center justify-center gap-2 uppercase tracking-widest text-[11px]"
                >
                  <Play size={14} />
                  Play as Guest
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="guest-form"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="glass-card p-10 w-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Shield size={120} />
              </div>

              <div className="relative z-10 flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 border border-primary/20 shadow-lg shadow-primary/10">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-8 h-8 text-primary"
                    fill="currentColor"
                  >
                    <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">
                  Guest Session
                </h2>
                <p className="text-foreground/50 text-xs font-semibold uppercase tracking-wider mt-1">
                  Configure guest credentials
                </p>
              </div>

              <form onSubmit={handleStartGuest} className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-1">
                    Codename
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold uppercase tracking-tight placeholder:text-foreground/20 text-white text-sm"
                    placeholder="Ex: Guest-102"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-1">
                    Strategic Alignment
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setGuestColor(Color.WHITE)}
                      className={`py-3.5 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                        guestColor === Color.WHITE
                          ? "bg-white text-black border-white shadow-xl shadow-white/10"
                          : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                      }`}
                    >
                      <span className="font-black uppercase tracking-tighter italic text-sm">
                        WHITE
                      </span>
                      <span className="text-[9px] uppercase font-black opacity-60">
                        First Strike
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuestColor(Color.BLACK)}
                      className={`py-3.5 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                        guestColor === Color.BLACK
                          ? "bg-slate-950 text-white border-white/20 shadow-xl shadow-black/40"
                          : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                      }`}
                    >
                      <span className="font-black uppercase tracking-tighter italic text-sm">
                        BLACK
                      </span>
                      <span className="text-[9px] uppercase font-black opacity-60">
                        Counter Play
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-black py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs border border-white/10"
                  >
                    Enter Arena
                    <ChevronRight size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowGuestForm(false)}
                    className="w-full bg-transparent hover:text-white text-foreground/40 font-black py-2.5 transition-colors uppercase tracking-widest text-[10px]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameShell>
  );
}
