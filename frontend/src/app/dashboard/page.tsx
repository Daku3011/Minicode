"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { learningApi } from "@/lib/learning-api";
import WeakAreasChart from "@/components/WeakAreasChart";
import RecommendationCard from "@/components/RecommendationCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Trophy, Target, Zap, Activity, BookOpen, BarChart3, TrendingUp } from "lucide-react";
import { clsx } from "clsx";

interface DashboardData {
    stats: {
        total_submissions: number;
        total_solved: number;
        accepted: number;
        pending: number;
        rejected: number;
        by_difficulty: Record<string, number>;
        by_subject: Record<string, number>;
        recent_activity: {
            id: number;
            problem_id: number;
            problem_title: string;
            status: string;
            score: number;
            timestamp: string;
        }[];
        recent_submissions_count: number;
        level_info: {
            level: number;
            level_name: string;
            xp: number;
            xp_into_level: number;
            xp_for_next: number;
            progress_pct: number;
        };
    };
    weak_areas: {
        by_subject: {
            subject: string;
            total_attempts: number;
            accepted: number;
            pass_rate: number;
            weakness_score: number;
        }[];
        by_difficulty: {
            difficulty: string;
            total_attempts: number;
            accepted: number;
            pass_rate: number;
        }[];
    };
    recommendations: {
        id: number;
        title: string;
        difficulty: string;
        subject: string | null;
        xp_reward: number;
        level: number;
    }[];
    learning_path: {
        streams: {
            id: number;
            name: string;
            slug: string;
            icon: string;
            color: string;
            total_milestones: number;
            completed_milestones: number;
            progress_pct: number;
        }[];
        level_info: {
            level: number;
            level_name: string;
            xp: number;
            xp_into_level: number;
            xp_for_next: number;
            progress_pct: number;
        };
    };
    ai_recommendations: {
        topic: string;
        reason: string;
        resource_type: string;
        priority: string;
    }[];
}

const DIFF_COLORS: Record<string, string> = {
    Easy: "text-emerald-600 bg-emerald-50 border-emerald-200",
    Medium: "text-amber-600 bg-amber-50 border-amber-200",
    Hard: "text-rose-600 bg-rose-50 border-rose-200",
};

export default function DashboardPage() {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await learningApi.dashboard();
                setData(res.data);
            } catch (e) {
                console.error("Failed to load dashboard", e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <LoadingSpinner />
                <p className="mt-4 text-slate-400">Loading your dashboard...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
                Failed to load dashboard data.
            </div>
        );
    }

    const { stats, weak_areas, recommendations, learning_path, ai_recommendations } = data;
    const li = stats.level_info;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Learning Dashboard</h1>
                <p className="text-slate-500 mt-1">Track your progress and discover what to learn next.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-blue-100 text-sm">Welcome back,</p>
                            <h2 className="text-2xl font-bold">{user?.full_name || user?.username}</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold">{li.level}</p>
                            <p className="text-blue-100 text-sm">{li.level_name}</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-blue-100">
                            <span>XP Progress</span>
                            <span>{li.xp_into_level} / {li.xp_for_next} XP</span>
                        </div>
                        <div className="h-3 bg-blue-400/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full transition-all duration-500"
                                style={{ width: `${li.progress_pct}%` }}
                            />
                        </div>
                        <p className="text-blue-100 text-xs">{li.xp} Total XP</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 text-emerald-600 mb-2">
                            <Trophy className="w-5 h-5" />
                            <span className="text-xs font-semibold uppercase tracking-wide">Solved</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900">{stats.total_solved}</p>
                        <p className="text-xs text-slate-400 mt-1">{stats.total_submissions} submissions</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                            <Activity className="w-5 h-5" />
                            <span className="text-xs font-semibold uppercase tracking-wide">Recent</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900">{stats.recent_submissions_count}</p>
                        <p className="text-xs text-slate-400 mt-1">last 30 days</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-rose-500" />
                            Weak Areas
                        </h3>
                        <WeakAreasChart data={weak_areas.by_subject} />
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-500" />
                            Recommended Problems
                        </h3>
                        {recommendations.length === 0 ? (
                            <p className="text-slate-400 text-sm py-4 text-center">
                                No recommendations yet. Solve more problems to get personalized recommendations.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {recommendations.slice(0, 5).map((rec) => (
                                    <RecommendationCard key={rec.id} recommendation={rec} />
                                ))}
                            </div>
                        )}
                    </div>

                    {ai_recommendations.length > 0 && (
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-violet-500" />
                                AI Recommendations
                            </h3>
                            <div className="space-y-3">
                                {ai_recommendations.map((rec, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className={clsx(
                                            "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                                            rec.priority === "high" ? "bg-rose-500" :
                                            rec.priority === "medium" ? "bg-amber-500" : "bg-slate-400"
                                        )} />
                                        <div>
                                            <p className="font-medium text-slate-800 text-sm">{rec.topic}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{rec.reason}</p>
                                            <span className="text-xs text-blue-600 mt-1 inline-block capitalize">{rec.resource_type}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-emerald-500" />
                            Recent Activity
                        </h3>
                        {stats.recent_activity.length === 0 ? (
                            <p className="text-slate-400 text-sm py-4 text-center">No recent activity.</p>
                        ) : (
                            <div className="space-y-2">
                                {stats.recent_activity.slice(0, 10).map((act) => (
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
                                            <span className="text-xs text-slate-400">{new Date(act.timestamp).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-500" />
                            By Difficulty
                        </h3>
                        <div className="space-y-3">
                            {["Easy", "Medium", "Hard"].map((diff) => (
                                <div key={diff} className="flex items-center justify-between">
                                    <span className={clsx(
                                        "text-xs font-semibold px-2.5 py-1 rounded-full border",
                                        DIFF_COLORS[diff]
                                    )}>
                                        {diff}
                                    </span>
                                    <span className="text-lg font-bold text-slate-800">{stats.by_difficulty[diff] || 0}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-500" />
                            Learning Path
                        </h3>
                        {learning_path.streams.length === 0 ? (
                            <p className="text-slate-400 text-sm">No learning streams available.</p>
                        ) : (
                            <div className="space-y-3">
                                {learning_path.streams.map((stream) => (
                                    <div key={stream.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-lg">{stream.icon}</span>
                                            <span className="font-medium text-sm text-slate-800">{stream.name}</span>
                                        </div>
                                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{ width: `${stream.progress_pct}%`, backgroundColor: stream.color }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                                            <span>{stream.completed_milestones}/{stream.total_milestones} milestones</span>
                                            <span>{stream.progress_pct}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Subject Breakdown</h3>
                        {Object.keys(stats.by_subject).length === 0 ? (
                            <p className="text-slate-400 text-sm">No subjects yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {Object.entries(stats.by_subject)
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
                </div>
            </div>
        </div>
    );
}
