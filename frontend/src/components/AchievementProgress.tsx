"use client";

import React from "react";
import { Target } from "lucide-react";
import { clsx } from "clsx";

interface AchievementProgressProps {
  name: string;
  description?: string;
  current: number;
  target: number;
  category?: string;
}

export default function AchievementProgress({
  name,
  description,
  current,
  target,
  category = "milestone",
}: AchievementProgressProps) {
  const percentage = Math.min(100, Math.round((current / target) * 100));
  const isComplete = current >= target;

  const categoryColors: Record<string, string> = {
    milestone: "bg-amber-500",
    performance: "bg-indigo-500",
    social: "bg-emerald-500",
    streak: "bg-rose-500",
  };

  const barColor = categoryColors[category] || "bg-blue-500";

  return (
    <div
      className={clsx(
        "p-5 rounded-2xl border transition-all",
        isComplete
          ? "bg-emerald-50 border-emerald-200"
          : "bg-white border-slate-200"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <Target
            className={clsx(
              "w-5 h-5 shrink-0",
              isComplete ? "text-emerald-500" : "text-slate-400"
            )}
          />
          <div className="min-w-0">
            <p className="font-bold text-sm text-slate-900 truncate uppercase tracking-tight">
              {name}
            </p>
            {description && (
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>
        <span className="text-xs font-bold text-slate-500 shrink-0 ml-3">
          {current}/{target}
        </span>
      </div>

      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
        <div
          className={clsx(
            "h-full rounded-full transition-all duration-500",
            isComplete ? "bg-emerald-500" : barColor
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-[10px] font-medium text-slate-400 mt-2 uppercase tracking-wider">
        {isComplete ? "Completed" : `${percentage}% complete`}
      </p>
    </div>
  );
}
