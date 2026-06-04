"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { gameApi } from "@/services/api";
import { UserProfileDto, GameHistoryDto, PageResponse } from "@/types/user";
import { GameResult } from "@/types/game";
import { useRouter } from "next/navigation";
import { GameShell } from "@/components/layout/GameShell";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Mail,
  Calendar,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Swords,
  Gamepad2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatToIST } from "@/utils/time";

export default function ProfilePage() {
  const { accessToken, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [gamesData, setGamesData] =
    useState<PageResponse<GameHistoryDto> | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [copiedGameId, setCopiedGameId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!accessToken) return;

    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [profileRes, gamesRes] = await Promise.all([
          gameApi.getUserProfile(accessToken),
          gameApi.getUserGames(accessToken, page, pageSize),
        ]);
        setProfile(profileRes);
        setGamesData(gamesRes);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to load profile details.");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [accessToken, page, pageSize, toast]);

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

  const formatReason = (reason: string | undefined) => {
    if (!reason) return "";
    return reason
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  if (isLoading || !isAuthenticated) {
    return (
      <GameShell>
        <div className="flex items-center justify-center min-h-[60vh] text-white">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-t-2 border-primary rounded-full animate-spin"></div>
            <p className="text-foreground/40 text-xs font-semibold uppercase tracking-widest animate-pulse">
              Authenticating Arena...
            </p>
          </div>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell>
      <div className="w-full max-w-5xl mx-auto space-y-8 px-4 md:px-0 py-8 text-white">
        {/* Back Link */}
        <div className="flex items-center">
          <Link
            href="/lobby"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/40 hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Back to Lobby
          </Link>
        </div>

        {/* Profile Card */}
        {loadingData && !profile ? (
          <div className="glass-card p-6 md:p-8 animate-pulse flex flex-col md:flex-row items-center gap-6 h-40">
            <div className="w-20 h-20 bg-white/5 rounded-full"></div>
            <div className="flex-1 space-y-4">
              <div className="h-6 bg-white/5 rounded w-1/3"></div>
              <div className="h-4 bg-white/5 rounded w-1/2"></div>
            </div>
          </div>
        ) : (
          profile && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 relative overflow-hidden"
            >
              <Image
                src={"/white-king.jpg"}
                alt="Profile"
                width={80}
                height={80}
                className="rounded-full border aspect-square object-cover border-primary/20"
              />

              <div className="text-center md:text-left flex-1 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <h2 className="text-3xl font-light tracking-tight text-white">
                    {profile.username}
                  </h2>
                  <div className="flex justify-center md:justify-start">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
                      <Trophy size={13} />
                      {profile.eloRating} ELO
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-6 gap-y-2 mt-4 text-xs text-foreground/50 font-normal">
                  <span className="flex items-center gap-2">
                    <Mail size={14} className="text-foreground/30" />
                    {profile.email}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar size={14} className="text-foreground/30" />
                    Joined on {formatToIST(profile.createdAt)}
                  </span>
                </div>
              </div>

              {/* Background gradient decoration */}
              <div className="absolute right-[-10%] top-[-20%] w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            </motion.div>
          )
        )}

        {/* Match History Table */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h3 className="text-2xl font-light tracking-tight text-white mb-1">
                Match{" "}
                <span className="font-semibold text-primary">History</span>
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
                        <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-foreground/40">
                          Date & Time (IST)
                        </th>
                        <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-foreground/40">
                          Color
                        </th>
                        <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-foreground/40">
                          Opponent
                        </th>
                        <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-foreground/40">
                          Outcome
                        </th>
                        <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-foreground/40">
                          Termination
                        </th>
                        <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-foreground/40">
                          Moves
                        </th>
                        <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-foreground/40 text-center">
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
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-white/5 text-white/60 border border-white/10">
                              Draw
                            </span>
                          );
                        } else if (
                          (game.result === GameResult.WHITE_WON && isWhite) ||
                          (game.result === GameResult.BLACK_WON && !isWhite)
                        ) {
                          outcomeBadge = (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Victory
                            </span>
                          );
                        } else {
                          outcomeBadge = (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
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
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground/60">
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
                    {Math.min((page + 1) * pageSize, gamesData.totalElements)}{" "}
                    of {gamesData.totalElements}
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
      </div>
    </GameShell>
  );
}
