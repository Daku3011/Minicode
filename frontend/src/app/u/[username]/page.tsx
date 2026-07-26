"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { learningApi } from "@/lib/learning-api";
import PortfolioHeader from "@/components/PortfolioHeader";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import XPChart from "@/components/XPChart";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Trophy, Code, BookOpen, TrendingUp, Calendar, Target, Award } from "lucide-react";
import { clsx } from "clsx";

interface PortfolioData {
    username: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    xp: number;
    level_info: {
        level: number;
        level_name: string;
        xp: number;
        xp_into_level: number;
        xp_for_next: number;
        progress_pct: number;
    };
    stats: {
        problems_solved: number;
        total_submissions: number;
        by_difficulty: Record<string, number>;
        by_subject: Record<string, number>;
        max_streak: number;
        total_days_active: number;
        milestones_completed: number;
        badges_earned: number;
    };
    activity: {
        dates: Record<string, number>;
        total_days: number;
        max_streak: number;
    };
    badges: {
        id: string;
        name: string;
        icon: string;
        description: string;
    }[];
    top_solutions: {
        id: number;
        problem_id: number;
        problem_title: string;
        problem_difficulty: string;
        score: number;
        language: string | null;
        timestamp: string | null;
    }[];
    xp_history: {
        month: string;
        xp_earned: number;
    }[];
    recent_activity: {
        id: number;
        type: string;
        problem_id: number;
        problem_title: string;
        status: string;
        score: number;
        timestamp: string | null;
    }[];
    member_since: string;
}

const DIFF_STYLES: Record<string, string> = {
    Easy: "text-emerald-700 bg-emerald-50 border-emerald-200",
    Medium: "text-amber-700 bg-amber-50 border-amber-200",
    Hard: "text-rose-700 bg-rose-50 border-rose-200",
};

export default function PortfolioPage() {
    const params = useParams();
    const username = params.username as string;
    const [data, setData] = useState<PortfolioData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await learningApi.publicPortfolio(username);
                setData(res.data);
            } catch (e) {
                console.error("Failed to load portfolio", e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [username]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <LoadingSpinner />
                <p className="mt-4 text-slate-400">Loading portfolio...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
                <p>Portfolio not found for @{username}.</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <PortfolioHeader
                username={data.username}
                full_name={data.full_name}
                avatar_url={data.avatar_url}
                bio={data.bio}
                level_info={data.level_info}
                badges={data.badges}
                member_since={data.member_since}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <Trophy className="w-5 h-5 text-amber-500 mb-2" />
                    <p className="text-2xl font-bold text-slate-900">{data.stats.problems_solved}</p>
                    <p className="text-xs text-slate-500">Problems Solved</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <Code className="w-5 h-5 text-blue-500 mb-2" />
                    <p className="text-2xl font-bold text-slate-900">{data.stats.total_submissions}</p>
                    <p className="text-xs text-slate-500">Submissions</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <Calendar className="w-5 h-5 text-emerald-500 mb-2" />
                    <p className="text-2xl font-bold text-slate-900">{data.stats.max_streak}</p>
                    <p className="text-xs text-slate-500">Max Streak</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <Award className="w-5 h-5 text-violet-500 mb-2" />
                    <p className="text-2xl font-bold text-slate-900">{data.stats.badges_earned}</p>
                    <p className="text-xs text-slate-500">Badges</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-500" />
                        Activity
                    </h3>
                    <ActivityHeatmap dates={data.activity.dates} />
                    <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
                        <span>{data.activity.total_days} days active</span>
                        <span>{data.activity.max_streak} day max streak</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        XP History
                    </h3>
                    <XPChart data={data.xp_history} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">By Difficulty</h3>
                    <div className="space-y-3">
                        {["Easy", "Medium", "Hard"].map((diff) => (
                            <div key={diff} className="flex items-center justify-between">
                                <span className={clsx(
                                    "text-xs font-semibold px-2.5 py-1 rounded-full border",
                                    DIFF_STYLES[diff]
                                )}>
                                    {diff}
                                </span>
                                <span className="text-lg font-bold text-slate-800">{data.stats.by_difficulty[diff] || 0}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">By Subject</h3>
                    {Object.keys(data.stats.by_subject).length === 0 ? (
                        <p className="text-slate-400 text-sm">No data yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {Object.entries(data.stats.by_subject)
                                .sort(([, a], [, b]) => b - a)
                                .map(([subject, count]) => (
                                    <div key={subject} className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600 truncate">
                                            {subject.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                                        </span>
                                        <span className="font-semibold text-slate-800 ml-2">{count}</span>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                        <BookOpen className="w-5 h-5 inline text-blue-500 mr-2" />
                        Milestones
                    </h3>
                    <p className="text-3xl font-bold text-slate-900">{data.stats.milestones_completed}</p>
                    <p className="text-xs text-slate-500 mt-1">milestones completed</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mt-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Solutions</h3>
                {data.top_solutions.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-4">No solutions yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="text-left py-2 font-medium text-slate-500">Problem</th>
                                    <th className="text-left py-2 font-medium text-slate-500">Difficulty</th>
                                    <th className="text-right py-2 font-medium text-slate-500">Score</th>
                                    <th className="text-right py-2 font-medium text-slate-500">Language</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.top_solutions.map((sol) => (
                                    <tr key={sol.id} className="border-b border-slate-50 hover:bg-slate-50">
                                        <td className="py-2 text-slate-800 font-medium">{sol.problem_title}</td>
                                        <td className="py-2">
                                            <span className={clsx(
                                                "text-xs font-semibold px-2 py-0.5 rounded-full border",
                                                DIFF_STYLES[sol.problem_difficulty] || "text-slate-600 bg-slate-50"
                                            )}>
                                                {sol.problem_difficulty}
                                            </span>
                                        </td>
                                        <td className="py-2 text-right font-semibold text-slate-800">{sol.score}</td>
                                        <td className="py-2 text-right text-slate-500">{sol.language || "N/A"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mt-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
                {data.recent_activity.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-4">No recent activity.</p>
                ) : (
                    <div className="space-y-2">
                        {data.recent_activity.slice(0, 10).map((act) => (
                            <div key={act.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={clsx(
                                        "w-2 h-2 rounded-full flex-shrink-0",
                                        act.status === "accepted" ? "bg-emerald-500" : "bg-slate-300"
                                    )} />
                                    <span className="text-sm text-slate-700 truncate">{act.problem_title}</span>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className={clsx(
                                        "text-xs font-medium px-2 py-0.5 rounded-full",
                                        act.status === "accepted" ? "text-emerald-700 bg-emerald-50" : "text-slate-500 bg-slate-100"
                                    )}>
                                        {act.status}
                                    </span>
                                    <span className="text-xs text-slate-400">{act.score} pts</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
