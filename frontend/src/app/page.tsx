"use client";

import React, { useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { GameShell } from "@/components/layout/GameShell";
import { motion } from "framer-motion";
import Link from "next/link";
import LightRays from "@/components/ui/LightRays";

export default function Home() {
  const { connect } = useGame();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // If already authenticated, send to lobby
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      connect();
      router.push("/lobby");
    }
  }, [isAuthenticated, isLoading, connect, router]);

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
    <GameShell showNavbar={false}>
      <div className="relative w-full h-full flex flex-col justify-center items-center overflow-hidden px-4">
        {/* React Bits Light Rays WebGL Background */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <LightRays
            raysOrigin="top-center"
            raysColor="#3b82f6"
            raysSpeed={0.6}
            lightSpread={1.6}
            rayLength={2.0}
            pulsating={false}
            fadeDistance={1.4}
            saturation={0.7}
            noiseAmount={0.015}
            distortion={0.1}
          />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-xl w-full mx-auto flex flex-col items-center text-center gap-8">
          {/* Logo & Headline */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center gap-5"
          >
            {/* ChessWeb Logo Image */}
            <div className="w-20 h-20 relative select-none">
              <img
                alt="ChessWeb Logo"
                className="w-full h-full object-contain rounded-xl border border-white/10 shadow-sm"
                src="/logo.jpg"
              />
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white">
                Chess, <span className="font-semibold text-primary">refined</span>.
              </h1>
              <p className="text-foreground/40 text-sm max-w-md mx-auto leading-relaxed">
                A clean, distraction-free environment for real-time multiplayer chess matches. Analyze, play, and master the board.
              </p>
            </div>
          </motion.div>

          {/* Minimal CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-3 w-full justify-center max-w-xs relative z-20"
          >
            <Link
              href="/register"
              className="flex-1 bg-white hover:bg-neutral-100 text-black font-semibold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition-colors text-center border border-white"
            >
              Start Playing
            </Link>

            <Link
              href="/login"
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition-colors text-center"
            >
              Sign In
            </Link>
          </motion.div>
        </div>
      </div>
    </GameShell>
  );
}

