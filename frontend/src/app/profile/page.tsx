"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { gameApi } from "@/services/api";
import { UserProfileDto, GameHistoryDto, PageResponse } from "@/types/user";
import { useRouter } from "next/navigation";
import { GameShell } from "@/components/layout/GameShell";
import { motion } from "framer-motion";
import {
  Trophy,
  Mail,
  Calendar,
  ArrowLeft,
  Swords,
  Gamepad2,
  Percent,
  Handshake,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatToIST } from "@/utils/time";
import GamesHistoryTable from "@/components/profile/GamesHistoryTable";

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

        {/* Profile Card & Stats Skeleton */}
        {loadingData && !profile ? (
          <div className="space-y-6">
            <div className="glass-card p-6 md:p-8 animate-pulse flex flex-col md:flex-row items-center gap-6 h-40">
              <div className="w-20 h-20 bg-white/5 rounded-full"></div>
              <div className="flex-1 space-y-4">
                <div className="h-6 bg-white/5 rounded w-1/3"></div>
                <div className="h-4 bg-white/5 rounded w-1/2"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="glass-card p-4 h-28 border-white/5 bg-white/1 flex flex-col justify-between"
                >
                  <div className="h-3 bg-white/5 rounded w-1/2"></div>
                  <div className="h-6 bg-white/5 rounded w-3/4 mt-4"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          profile && (
            <div className="space-y-6">
              {/* Profile Main Card */}
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

              {/* Stats Grid */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="grid grid-cols-2 md:grid-cols-5 gap-4"
              >
                {/* Games Played Card */}
                <div className="glass-card p-4 flex flex-col justify-between min-h-[110px] border-white/5 relative overflow-hidden group hover:border-white/10 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold uppercase tracking-wider text-foreground/40">
                      Played
                    </span>
                    <span className="p-1.5 rounded-lg bg-white/5 text-foreground/60 group-hover:bg-white/10 transition-colors">
                      <Gamepad2 size={16} />
                    </span>
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-light tracking-tight text-white">
                      {profile.gamesPlayed}
                    </span>
                    <span className="block text-[9px] text-foreground/30 font-medium uppercase tracking-wider mt-1">
                      Total Arenas
                    </span>
                  </div>
                </div>

                {/* Games Won Card */}
                <div className="glass-card p-4 flex flex-col justify-between min-h-[110px] border-white/5 relative overflow-hidden group hover:border-white/10 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold uppercase tracking-wider text-foreground/40">
                      Won
                    </span>
                    <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                      <Trophy size={16} />
                    </span>
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-light tracking-tight text-emerald-400">
                      {profile.gamesWon}
                    </span>
                    <span className="block text-[9px] text-foreground/30 font-medium uppercase tracking-wider mt-1">
                      Victories
                    </span>
                  </div>
                </div>

                {/* Games Lost Card */}
                <div className="glass-card p-4 flex flex-col justify-between min-h-[110px] border-white/5 relative overflow-hidden group hover:border-white/10 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold uppercase tracking-wider text-foreground/40">
                      Lost
                    </span>
                    <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20 transition-colors">
                      <Swords size={16} />
                    </span>
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-light tracking-tight text-rose-400">
                      {profile.gamesLost}
                    </span>
                    <span className="block text-[9px] text-foreground/30 font-medium uppercase tracking-wider mt-1">
                      Defeats
                    </span>
                  </div>
                </div>

                {/* Games Draw Card */}
                <div className="glass-card p-4 flex flex-col justify-between min-h-[110px] border-white/5 relative overflow-hidden group hover:border-white/10 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold uppercase tracking-wider text-foreground/40">
                      Drawn
                    </span>
                    <span className="p-1.5 rounded-lg bg-white/5 text-foreground/40 group-hover:bg-white/10 transition-colors">
                      <Handshake size={16} />
                    </span>
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-light tracking-tight text-foreground/60">
                      {profile.gamesDraw}
                    </span>
                    <span className="block text-[9px] text-foreground/30 font-medium uppercase tracking-wider mt-1">
                      Draws
                    </span>
                  </div>
                </div>

                {/* Win Percentage Card */}
                <div className="glass-card p-4 flex flex-col justify-between min-h-[110px] border-white/5 relative overflow-hidden group hover:border-white/10 transition-all duration-300 col-span-2 md:col-span-1">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold uppercase tracking-wider text-foreground/40">
                      Win Rate
                    </span>
                    <span className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                      <Percent size={16} />
                    </span>
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-semibold tracking-tight text-primary">
                      {profile.winPercentage != null
                        ? profile.winPercentage.toFixed(1)
                        : "0.0"}
                      %
                    </span>
                    <span className="block text-[9px] text-foreground/30 font-medium uppercase tracking-wider mt-1">
                      Performance
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          )
        )}

        {/* Match History Table */}
        <GamesHistoryTable
          gamesData={gamesData}
          profile={profile}
          loadingData={loadingData}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />
      </div>
    </GameShell>
  );
}
