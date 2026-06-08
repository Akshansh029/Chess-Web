"use client";

import React, { useEffect, useState, useRef } from "react";
import { GameSession, Color } from "@/types/game";
import { gameApi } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Swords, Play, Clock, RefreshCw } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface LobbyProps {
  onJoinGame: (gameId: string, hostColor: Color) => void;
  onCreateGame: (color: Color, timeControl: string) => void;
}

const Lobby: React.FC<LobbyProps> = ({ onJoinGame, onCreateGame }) => {
  const [games, setGames] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<Color>(Color.WHITE);
  const [selectedTimeControl, setSelectedTimeControl] =
    useState<string>("10+5");

  const fetchGames = async () => {
    setLoading(true);
    try {
      const waitingGames = await gameApi.getWaitingGames();
      if (isMounted.current) {
        setGames(waitingGames);
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchGames();
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-light tracking-tight text-white mb-1">
            Available <span className="font-semibold text-primary">Arenas</span>
          </h2>
          <p className="text-foreground/40 text-sm font-normal">
            Select a strategic confrontation to engage
          </p>
        </div>
        <div className="flex gap-4 text-white">
          <button
            onClick={fetchGames}
            className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white hover:bg-neutral-100 text-black px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-md transition-colors active:scale-95 text-xs uppercase tracking-wider cursor-pointer border border-white"
          >
            <Plus size={20} />
            New Arena
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {games.length > 0 ? (
            games.map((game, index) => {
              const hostName = game.whitePlayerName || game.blackPlayerName;
              const hostColor = game.whitePlayerName
                ? Color.WHITE
                : Color.BLACK;
              const availableColor =
                hostColor === Color.WHITE ? Color.BLACK : Color.WHITE;

              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 border-white/5 hover:border-primary/30 transition-all group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex items-center gap-3 text-white">
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-all">
                        <div
                          className={`w-8 h-8 rounded-full ${hostColor === Color.WHITE ? "bg-white" : "bg-slate-800 border border-white/20"}`}
                        ></div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-base">
                          {hostName}
                        </h4>
                        <div className="flex items-center gap-1.5 opacity-40">
                          <Clock size={12} />
                          <span className="text-[10px] font-medium uppercase tracking-wider">
                            Waiting for rival
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                      <span className="text-[10px] font-semibold uppercase text-foreground/40 tracking-wider">
                        ID: {game.id.substring(0, 5)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between relative z-10 text-white">
                    <div className="flex items-center gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-foreground/30">
                          Your Alignment
                        </p>
                        <p
                          className={`font-semibold uppercase tracking-wider ${availableColor === Color.WHITE ? "text-white" : "text-slate-400"}`}
                        >
                          {availableColor}
                        </p>
                      </div>
                      {game.timeControl && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-foreground/30">
                            Time Control
                          </p>
                          <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-primary" />
                            <p className="font-semibold tracking-wider text-white">
                              {game.timeControl}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onJoinGame(game.id, hostColor)}
                      className="bg-white text-black hover:bg-neutral-100 px-5 py-3 rounded-xl font-semibold uppercase tracking-wider text-xs transition-colors flex items-center gap-2 active:scale-95 shadow-md cursor-pointer border border-white"
                    >
                      <Swords size={16} />
                      Join Arena
                    </button>
                  </div>

                  {/* Decoration */}
                  <div className="absolute bottom-[-20%] right-[-10%] w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/20 transition-all duration-500"></div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center justify-center glass-card border-dashed border-white/10">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-foreground/20">
                <Play size={32} />
              </div>
              <h3 className="text-lg font-light tracking-tight opacity-30 text-white">
                No active matches detected
              </h3>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Config Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md glass-card border border-white/10 p-8 shadow-2xl relative overflow-hidden bg-slate-950/90 space-y-6"
            >
              {/* Glow background decoration */}
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-[80px] pointer-events-none opacity-20 bg-primary"></div>

              <div className="text-center space-y-1.5 relative z-10">
                <h3 className="text-2xl font-light tracking-tight text-white">
                  Arena Configuration
                </h3>
                <p className="text-[10px] font-semibold text-foreground/40 uppercase tracking-widest">
                  Configure your battle constraints
                </p>
              </div>

              {/* Color Selection */}
              <div className="space-y-2 relative z-10">
                <label className="text-[8px] font-bold text-foreground/40 uppercase tracking-wider block">
                  Select Alignment (Color)
                </label>
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedColor(Color.WHITE)}
                    className={`flex-1 py-4 border rounded-xl flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      selectedColor === Color.WHITE
                        ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                        : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full ${selectedColor === Color.WHITE ? "bg-black" : "bg-white"} flex items-center justify-center`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full ${selectedColor === Color.WHITE ? "bg-white" : "bg-slate-300"}`}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      White
                    </span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedColor(Color.BLACK)}
                    className={`flex-1 py-4 border rounded-xl flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      selectedColor === Color.BLACK
                        ? "bg-slate-800 border-white/40 text-white shadow-[0_0_15px_rgba(30,41,59,0.5)]"
                        : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full ${selectedColor === Color.BLACK ? "bg-white" : "bg-black border border-white/20"} flex items-center justify-center`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full ${selectedColor === Color.BLACK ? "bg-black" : "bg-slate-800"}`}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Black
                    </span>
                  </motion.button>
                </div>
              </div>

              {/* Time Control Selection */}
              <div className="space-y-2 relative z-10">
                <label className="text-[8px] font-bold text-foreground/40 uppercase tracking-wider block">
                  Select Time Control
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    "1+0",
                    "1+1",
                    "3+0",
                    "3+2",
                    "5+0",
                    "10+0",
                    "10+5",
                    "15+10",
                  ].map((tc) => {
                    const [minutes, increment] = tc.split("+");
                    return (
                      <motion.button
                        key={tc}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedTimeControl(tc)}
                        className={`py-3 border rounded-lg text-center cursor-pointer transition-all ${
                          selectedTimeControl === tc
                            ? "bg-primary border-primary text-white shadow-[0_0_10px_rgba(59,130,246,0.3)] font-bold"
                            : "bg-white/5 border-white/10 text-foreground/75 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <div className="text-sm font-bold tracking-tight">
                          {increment === "0"
                            ? `${minutes} min`
                            : `${minutes} | ${increment}`}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 relative z-10 border-t border-white/5">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold uppercase tracking-wider text-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onCreateGame(selectedColor, selectedTimeControl);
                    setIsModalOpen(false);
                  }}
                  className="flex-1 py-3 bg-white text-black hover:bg-neutral-100 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-md cursor-pointer border border-white"
                >
                  Launch Arena
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Lobby;
