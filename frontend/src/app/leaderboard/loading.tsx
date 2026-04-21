"use client";

import React from "react";
import { Trophy, Star, Medal } from "lucide-react";

export default function LeaderboardLoading() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#faf8ff] text-slate-900 p-8 overflow-hidden relative">
      <div className="absolute top-0 left-1/4 w-[520px] h-[520px] bg-violet-100/70 blur-[140px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[520px] h-[520px] bg-cyan-100/60 blur-[140px] -z-10" />

      <div className="max-w-7xl mx-auto mb-16 text-center space-y-6 mt-12">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 rounded-full bg-violet-100 border border-violet-200 shadow-sm scale-125">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div className="h-6 w-36 bg-slate-200 rounded-full animate-pulse" />
        </div>
        <div className="h-16 md:h-20 w-3/4 mx-auto bg-slate-200 rounded-3xl animate-pulse" />
        <div className="h-6 w-1/2 mx-auto bg-slate-200 rounded-full animate-pulse" />
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-end mb-16">
        <div className="order-2 md:order-1 flex flex-col items-center gap-4">
          <div className="size-24 rounded-[1.75rem] bg-slate-200 border border-slate-300 animate-pulse" />
          <div className="h-4 w-24 bg-slate-200 rounded-full animate-pulse" />
          <div className="h-40 w-full bg-white border border-slate-200 rounded-t-[2.5rem] shadow-sm" />
        </div>

        <div className="order-1 md:order-2 flex flex-col items-center gap-4">
          <div className="size-32 rounded-[2.25rem] bg-violet-100 border-2 border-violet-200" />
          <div className="h-6 w-32 bg-violet-200 rounded-full animate-pulse" />
          <div className="h-56 w-full bg-white border-2 border-amber-200 rounded-t-[3rem] shadow-sm relative">
            <div className="absolute top-8 left-1/2 -translate-x-1/2 size-12 rounded-full bg-amber-100 flex items-center justify-center animate-pulse">
              <Medal className="size-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="order-3 flex flex-col items-center gap-4">
          <div className="size-20 rounded-[1.5rem] bg-orange-100 border border-orange-200 animate-pulse" />
          <div className="h-4 w-20 bg-slate-200 rounded-full animate-pulse" />
          <div className="h-32 w-full bg-white border border-slate-200 rounded-t-[2rem] shadow-sm" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-5 gap-8 px-6 pb-6 border-b border-slate-200">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-slate-200 rounded-full animate-pulse" />
            ))}
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-5 gap-8 px-6 py-6 border-b border-slate-100 last:border-0 items-center">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="h-4 bg-slate-100 rounded-full animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
