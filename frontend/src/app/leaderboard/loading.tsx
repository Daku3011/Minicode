"use client";

import React from "react";
import { Trophy, Star, Medal } from "lucide-react";

export default function LeaderboardLoading() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0d0a14]/80 backdrop-blur-3xl font-display text-slate-100 p-8 overflow-hidden relative">
      {/* Spectral Aura Accents */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 blur-[150px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/5 blur-[150px] -z-10" />

      {/* Header Skeleton */}
      <div className="max-w-7xl mx-auto mb-16 text-center space-y-6 mt-12">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 shadow-lg scale-125">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div className="h-6 w-32 bg-white/10 rounded-full" />
        </div>
        <div className="h-16 md:h-20 w-3/4 mx-auto bg-white/5 rounded-3xl" />
        <div className="h-6 w-1/2 mx-auto bg-white/5 rounded-full" />
      </div>

      {/* Podium Skeleton */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-end mb-16">
        {/* Silver (Rank 2) */}
        <div className="order-2 md:order-1 flex flex-col items-center gap-4">
          <div className="size-24 rounded-[1.75rem] bg-white/5 border border-white/5" />
          <div className="h-4 w-24 bg-white/10 rounded-full" />
          <div className="h-40 w-full bg-slate-400/5 backdrop-blur-xl border border-white/5 rounded-t-[2.5rem] shadow-2xl" />
        </div>

        {/* Gold (Rank 1) */}
        <div className="order-1 md:order-2 flex flex-col items-center gap-4">
          <div className="size-32 rounded-[2.25rem] bg-primary/10 border-2 border-primary/20 shadow-[0_0_40px_rgba(137,91,245,0.2)]" />
          <div className="h-6 w-32 bg-primary/20 rounded-full" />
          <div className="h-56 w-full bg-primary/5 backdrop-blur-2xl border-2 border-primary/10 rounded-t-[3rem] shadow-[0_0_60px_rgba(137,91,245,0.1)] relative">
            <div className="absolute top-8 left-1/2 -translate-x-1/2 size-12 rounded-full bg-primary/20 flex items-center justify-center animate-bounce">
              <Medal className="size-6 text-primary" />
            </div>
          </div>
        </div>

        {/* Bronze (Rank 3) */}
        <div className="order-3 flex flex-col items-center gap-4">
          <div className="size-20 rounded-[1.5rem] bg-white/5 border border-white/5" />
          <div className="h-4 w-20 bg-white/10 rounded-full" />
          <div className="h-32 w-full bg-slate-400/5 backdrop-blur-xl border border-white/5 rounded-t-[2rem] shadow-2xl" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="max-w-5xl mx-auto glass-effect rounded-[2.5rem] border border-white/10 shadow-3xl overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-5 gap-8 px-6 pb-6 border-b border-white/5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-white/10 rounded-full" />
            ))}
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-5 gap-8 px-6 py-6 border-b border-white/5 last:border-0 items-center">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="h-4 bg-white/5 rounded-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
