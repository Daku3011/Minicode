"use client";

import { useEffect, useState, useMemo } from "react";
import { Trophy, Filter } from "lucide-react";
import { clsx } from "clsx";
import LoadingSpinner from "@/components/LoadingSpinner";
import AchievementBadge from "@/components/AchievementBadge";
import StreakDisplay from "@/components/StreakDisplay";
import { achievementsApi, type Badge, type UserBadge, type Streak, type CalendarDay } from "@/lib/achievement-api";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "milestone", label: "Milestones" },
  { id: "performance", label: "Performance" },
  { id: "social", label: "Social" },
  { id: "streak", label: "Streaks" },
];

export default function AchievementsPage() {
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [myBadges, setMyBadges] = useState<UserBadge[]>([]);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [badgesRes, myRes, streaksRes, checkinRes] = await Promise.all([
          achievementsApi.list(),
          achievementsApi.my(),
          achievementsApi.streaks(),
          achievementsApi.checkin("submission_daily"),
        ]);
        setBadges(badgesRes.data);
        setMyBadges(myRes.data);
        setStreaks(streaksRes.data);
        setCalendar(checkinRes.data.calendar || []);
      } catch (err) {
        console.error("Failed to load achievements", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const earnedBadgeSlugs = useMemo(
    () => new Set(myBadges.map((ub) => ub.badge.slug)),
    [myBadges]
  );

  const filteredBadges = useMemo(() => {
    if (selectedCategory === "all") return badges;
    return badges.filter((b) => b.category === selectedCategory);
  }, [badges, selectedCategory]);

  const earnedCount = myBadges.length;
  const totalCount = badges.length;

  const submissionStreak = streaks.find((s) => s.streak_type === "submission_daily");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAF9] dark:bg-[#0f0a1e]">
        <LoadingSpinner />
        <p className="mt-4 text-slate-400">Loading achievements...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] dark:bg-[#0f0a1e] pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-4">
              <Trophy className="w-8 h-8 text-amber-500" />
              Achievements
            </h1>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              {earnedCount} / {totalCount} badges earned
            </p>
          </div>
          <div className="px-6 py-3 rounded-2xl bg-blue-50 border border-blue-100 text-center">
            <p className="text-2xl font-black text-slate-900">
              {totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0}%
            </p>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">
              Completion
            </p>
          </div>
        </div>

        {submissionStreak && calendar.length > 0 && (
          <div className="mb-10">
            <StreakDisplay
              streak={submissionStreak}
              calendar={calendar}
            />
          </div>
        )}

        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
          <Filter className="w-5 h-5 text-slate-400 shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={clsx(
                "px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border shrink-0",
                selectedCategory === cat.id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBadges.map((badge) => (
            <AchievementBadge
              key={badge.id}
              badge={badge}
              earned={earnedBadgeSlugs.has(badge.slug)}
              earnedAt={
                myBadges.find((ub) => ub.badge.slug === badge.slug)?.earned_at
              }
            />
          ))}
        </div>

        {filteredBadges.length === 0 && (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-lg font-bold text-slate-400">No badges found</p>
          </div>
        )}
      </div>
    </div>
  );
}
