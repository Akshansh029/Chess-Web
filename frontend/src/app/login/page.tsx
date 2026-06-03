"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";
import { GameShell } from "@/components/layout/GameShell";
import { motion } from "framer-motion";
import { Lock, Mail, ChevronRight, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please fill out all fields.");
      toast.error("Please fill out all fields.");
      return;
    }

    try {
      await login(email, password);
      toast.success("Successfully logged in.");
      router.push("/lobby");
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || "Invalid email or password.";
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  return (
    <GameShell>
      <div className="w-full max-w-md mx-auto flex flex-col justify-center items-center min-h-[calc(100vh-140px)] py-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="glass-card p-10 w-full relative overflow-hidden"
        >
          {/* Decorative Backing Icon */}
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Lock size={120} />
          </div>

          <div className="relative z-10 flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 border border-primary/20 shadow-lg shadow-primary/10">
              <Lock className="text-primary w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">
              Authenticate
            </h2>
            <p className="text-foreground/50 text-xs font-semibold uppercase tracking-wider mt-1">
              Sign in to your ChessWeb profile
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3 text-xs font-semibold relative z-10"
            >
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-1">
                Secure Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-foreground/30">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold placeholder:text-foreground/20 text-white text-sm"
                  placeholder="name@domain.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-1">
                Access Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-foreground/30">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold placeholder:text-foreground/20 text-white text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:opacity-50 text-white font-black py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs border border-white/10 mt-6"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Connect Session
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs relative z-10">
            <p className="text-foreground/40 font-semibold uppercase tracking-wider">
              New strategist?{" "}
              <Link
                href="/register"
                className="text-primary hover:text-accent font-black transition-colors"
              >
                Register Account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </GameShell>
  );
}
