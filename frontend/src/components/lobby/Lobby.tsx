"use client";

import React, { useEffect, useState, useRef } from "react";
import { GameSession, Color } from "@/types/game";
import { gameApi } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Swords, Play, Clock, RefreshCw } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface LobbyProps {
  onJoinGame: (gameId: string, hostColor: Color) => void;
  onCreateGame: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ onJoinGame, onCreateGame }) => {
  const [games, setGames] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  const { toast } = useToast();

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
            onClick={onCreateGame}
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
              <button
                onClick={onCreateGame}
                className="mt-4 text-primary text-xs font-semibold uppercase tracking-widest hover:underline cursor-pointer"
              >
                Initiate first Arena
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Lobby;
