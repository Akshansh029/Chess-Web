"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { GameResult } from "@/types/game";
import { formatToIST } from "@/utils/time";
import { UserProfileDto, GameHistoryDto, PageResponse } from "@/types/user";
import { useToast } from "@/context/ToastContext";
import {
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Swords,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";

interface GamesHistoryTableProps {
  gamesData: PageResponse<GameHistoryDto> | null;
  profile: UserProfileDto | null;
  loadingData: boolean;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
}

const GamesHistoryTable: React.FC<GamesHistoryTableProps> = ({
  gamesData,
  profile,
  loadingData,
  page,
  setPage,
  pageSize,
  setPageSize,
}) => {
  const { toast } = useToast();
  const [copiedGameId, setCopiedGameId] = useState<string | null>(null);

  const formatReason = (reason: string | undefined) => {
    if (!reason) return "";
    return reason
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (gamesData && page < gamesData.totalPages - 1) {
      setPage(page + 1);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(0); // reset page
  };

  const copyToClipboard = async (pgn: string, gameId: string) => {
    if (!pgn) {
      toast.error("No PGN available for this match.");
      return;
    }
    try {
      await navigator.clipboard.writeText(pgn);
      setCopiedGameId(gameId);
      toast.success("PGN copied to clipboard!");
      setTimeout(() => setCopiedGameId(null), 2000);
    } catch (err) {
      toast.error("Failed to copy PGN.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h3 className="text-2xl font-light tracking-tight text-white mb-1">
            Match <span className="font-semibold text-primary">History</span>
          </h3>
          <p className="text-foreground/40 text-sm font-normal">
            Paging through your chess battles
          </p>
        </div>

        {gamesData && gamesData.totalElements > 0 && (
          <div className="flex items-center gap-2 text-xs font-normal text-foreground/40">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option value={5} className="bg-background">
                5
              </option>
              <option value={10} className="bg-background">
                10
              </option>
              <option value={20} className="bg-background">
                20
              </option>
              <option value={50} className="bg-background">
                50
              </option>
            </select>
            <span>matches</span>
          </div>
        )}
      </div>

      {loadingData && !gamesData ? (
        <div className="glass-card overflow-hidden border border-white/5 animate-pulse h-64"></div>
      ) : gamesData && gamesData.content.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="glass-card overflow-hidden border border-white/5 shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/2 border-b border-white/5">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-foreground/40">
                      Date & Time (IST)
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-foreground/40">
                      Color
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-foreground/40">
                      Opponent
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-foreground/40">
                      Outcome
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-foreground/40">
                      Termination
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-foreground/40">
                      Moves
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-foreground/40 text-center">
                      PGN
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-normal">
                  {gamesData.content.map((game) => {
                    const isWhite =
                      profile && game.whitePlayerName === profile.username;
                    const opponent = isWhite
                      ? game.blackPlayerName || "Guest"
                      : game.whitePlayerName || "Guest";

                    let outcomeBadge = null;
                    if (game.result === GameResult.DRAW) {
                      outcomeBadge = (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-white/5 text-white/60 border border-white/10">
                          Draw
                        </span>
                      );
                    } else if (
                      (game.result === GameResult.WHITE_WON && isWhite) ||
                      (game.result === GameResult.BLACK_WON && !isWhite)
                    ) {
                      outcomeBadge = (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Victory
                        </span>
                      );
                    } else {
                      outcomeBadge = (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Defeat
                        </span>
                      );
                    }

                    return (
                      <tr
                        key={game.gameId}
                        className="hover:bg-white/1 transition-colors"
                      >
                        <td className="px-6 py-4 text-xs text-white font-medium whitespace-nowrap">
                          {formatToIST(game.endedAt)}
                        </td>
                        <td className="px-6 py-4 text-xs whitespace-nowrap">
                          <span className="flex items-center gap-2">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                isWhite
                                  ? "bg-white border border-white/20"
                                  : "bg-slate-800 border border-white/30"
                              }`}
                            ></span>
                            <span className="text-xs font-semibold uppercase tracking-wider text-foreground/60">
                              {isWhite ? "White" : "Black"}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-foreground/80 font-medium whitespace-nowrap">
                          {opponent}
                        </td>
                        <td className="px-6 py-4 text-xs whitespace-nowrap">
                          {outcomeBadge}
                        </td>
                        <td className="px-6 py-4 text-xs text-foreground/50 whitespace-nowrap">
                          {formatReason(game.terminationReason.toString())}
                        </td>
                        <td className="px-6 py-4 text-xs text-foreground/60 whitespace-nowrap">
                          {game.totalMoves} moves
                        </td>
                        <td className="px-6 py-4 text-xs text-center whitespace-nowrap">
                          <button
                            onClick={() =>
                              copyToClipboard(game.pgn, game.gameId)
                            }
                            className={`p-1.5 rounded border transition-all active:scale-90 ${
                              copiedGameId === game.gameId
                                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                                : "bg-white/5 border-white/5 text-foreground/40 hover:text-white hover:bg-white/10"
                            }`}
                            title="Copy PGN"
                          >
                            {copiedGameId === game.gameId ? (
                              <Check size={14} />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {gamesData.totalPages > 1 && (
            <div className="flex justify-between items-center px-2">
              <span className="text-xs font-normal text-foreground/40">
                Showing match {page * pageSize + 1} to{" "}
                {Math.min((page + 1) * pageSize, gamesData.totalElements)} of{" "}
                {gamesData.totalElements}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 0}
                  className="p-2 border border-white/10 bg-white/5 rounded-xl hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer text-white"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex items-center px-3 border border-white/10 bg-white/5 rounded-xl text-xs font-semibold select-none text-foreground/60">
                  Page {page + 1} of {gamesData.totalPages}
                </div>
                <button
                  onClick={handleNextPage}
                  disabled={page === gamesData.totalPages - 1}
                  className="p-2 border border-white/10 bg-white/5 rounded-xl hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer text-white"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-16 flex flex-col items-center justify-center glass-card border-dashed border-white/10"
        >
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-foreground/20">
            <Gamepad2 size={32} />
          </div>
          <h4 className="text-lg font-light tracking-tight text-white mb-2">
            No matches recorded yet
          </h4>
          <p className="text-foreground/40 text-xs mb-6 max-w-xs text-center font-normal">
            You haven't completed any strategic arenas. Step into the
            matchmaking lobby to begin.
          </p>
          <Link
            href="/lobby"
            className="bg-white hover:bg-neutral-100 text-black px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors text-xs uppercase tracking-wider cursor-pointer border border-white"
          >
            <Swords size={16} />
            Enter Matchmaking
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default GamesHistoryTable;
