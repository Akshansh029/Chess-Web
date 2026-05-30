"use client";

import React, { useState } from "react";
import { Color } from "@/types/game";
import { motion } from "framer-motion";
import { User, Shield, ChevronRight } from "lucide-react";

interface SetupProps {
  onStart: (name: string, color: Color) => void;
}

const Setup: React.FC<SetupProps> = ({ onStart }) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState<Color>(Color.WHITE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onStart(name, color);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-10 w-full max-w-lg relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <Shield size={120} />
      </div>

      <div className="relative z-10 flex flex-col items-center mb-8">
        <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 border border-primary/20 shadow-lg shadow-primary/10">
          <User className="text-primary w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black tracking-tight uppercase">
          Initiate Arena
        </h2>
        <p className="text-foreground/50 text-sm font-medium">
          Configure your deployment for the match
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest text-foreground/40 ml-1">
            Codename
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold uppercase tracking-tight placeholder:text-foreground/20"
            placeholder="Ex: Kasper-2026"
            required
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest text-foreground/40 ml-1">
            Strategic Alignment
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setColor(Color.WHITE)}
              className={`py-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                color === Color.WHITE
                  ? "bg-white text-black border-white shadow-xl shadow-white/10"
                  : "bg-white/5 border-white/10 text-white hover:bg-white/10"
              }`}
            >
              <span className="font-black uppercase tracking-tighter italic">
                WHITE
              </span>
              <span className="text-[10px] uppercase font-bold opacity-60">
                First Strike
              </span>
            </button>
            <button
              type="button"
              onClick={() => setColor(Color.BLACK)}
              className={`py-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                color === Color.BLACK
                  ? "bg-slate-900 text-white border-white/20 shadow-xl shadow-black/40"
                  : "bg-white/5 border-white/10 text-white hover:bg-white/10"
              }`}
            >
              <span className="font-black uppercase tracking-tighter italic">
                BLACK
              </span>
              <span className="text-[10px] uppercase font-bold opacity-60">
                Counter Strategy
              </span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-linear-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 text-white font-black py-5 rounded-2xl shadow-2xl shadow-primary/20 transition-all transform hover:translate-y-[-2px] active:translate-y-px flex items-center justify-center gap-2 uppercase tracking-tighter"
        >
          Establish Connection
          <ChevronRight size={20} />
        </button>
      </form>
    </motion.div>
  );
};

export default Setup;
