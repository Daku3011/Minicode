"use client";

import React from "react";
import { Flame, Trophy, Zap } from "lucide-react";
import { clsx } from "clsx";
import type { Streak, CalendarDay } from "@/lib/achievement-api";

interface StreakDisplayProps {
  streak: Streak;
  calendar: CalendarDay[];
  loading?: boolean;
}

export default function StreakDisplay({
  streak,
  calendar,
  loading = false,
}: StreakDisplayProps) {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse">
        <div className="h-8 w-32 bg-slate-100 rounded mb-4" />
        <div className="h-6 w-48 bg-slate-100 rounded mb-6" />
        <div className="flex gap-1.5">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-sm bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  const today = calendar.find((d) => d.is_today);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
            <Flame className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              {streak.current_count}
            </p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Day Streak
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200">
          <Trophy className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-bold text-amber-700">
            Best: {streak.max_count}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
          Last 30 Days
        </p>
        <div className="flex gap-1 flex-wrap">
          {calendar.map((day) => (
            <div
              key={day.date}
              className={clsx(
                "w-3.5 h-3.5 rounded-sm transition-colors",
                day.active
                  ? day.is_today
                    ? "bg-rose-500 ring-2 ring-rose-200"
                    : "bg-emerald-500"
                  : day.is_today
                  ? "bg-rose-200 ring-2 ring-rose-100"
                  : "bg-slate-100"
              )}
              title={`${day.date}: ${day.active ? "Active" : "Inactive"}`}
            />
          ))}
        </div>
      </div>

      {today?.active && streak.current_count >= 3 && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-amber-600">
          <Zap className="w-4 h-4" />
          <span>Streak milestone bonuses: 3d (+50 XP), 7d (+100 XP), 14d (+250 XP), 30d (+500 XP)</span>
        </div>
      )}
    </div>
  );
}
