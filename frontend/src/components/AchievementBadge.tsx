"use client";

import React from "react";
import { Trophy, Lock, CheckCircle, Award } from "lucide-react";
import { clsx } from "clsx";
import type { Badge } from "@/lib/achievement-api";

interface AchievementBadgeProps {
  badge: Badge;
  earned?: boolean;
  earnedAt?: string;
  className?: string;
}

const categoryIcons: Record<string, React.ElementType> = {
  milestone: Trophy,
  performance: Award,
  social: Trophy,
  streak: Award,
};

const categoryColors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  milestone: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: "text-amber-500",
  },
  performance: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    icon: "text-indigo-500",
  },
  social: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: "text-emerald-500",
  },
  streak: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    icon: "text-rose-500",
  },
};

export default function AchievementBadge({
  badge,
  earned = false,
  earnedAt,
  className,
}: AchievementBadgeProps) {
  const Icon = categoryIcons[badge.category] || Trophy;
  const colors = categoryColors[badge.category] || categoryColors.milestone;

  return (
    <div
      className={clsx(
        "group relative p-6 rounded-2xl border transition-all overflow-hidden",
        earned
          ? `${colors.bg} ${colors.border} hover:shadow-md`
          : "bg-slate-50 border-slate-200 opacity-70 grayscale",
        className
      )}
    >
      {!earned && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <div className="text-center p-4">
            <Lock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Locked
            </p>
          </div>
        </div>
      )}

      <div className="flex items-start gap-4">
        <div
          className={clsx(
            "w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
            earned ? colors.bg : "bg-slate-100"
          )}
        >
          <Icon
            className={clsx(
              "w-7 h-7",
              earned ? colors.icon : "text-slate-400"
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-bold text-slate-900 text-sm truncate uppercase tracking-tight">
              {badge.name}
            </h4>
            {earned && (
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            )}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
            {badge.description}
          </p>
          <div className="flex items-center gap-3 mt-3">
            <span
              className={clsx(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                earned
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-200 text-slate-500"
              )}
            >
              {earned ? "Earned" : "Locked"}
            </span>
            {badge.xp_reward > 0 && (
              <span className="text-[10px] font-bold text-slate-400">
                +{badge.xp_reward} XP
              </span>
            )}
          </div>
          {earnedAt && (
            <p className="text-[10px] text-slate-400 mt-2 font-medium">
              Earned {new Date(earnedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
