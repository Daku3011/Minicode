"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

interface RecentSubmission {
    id: number;
    problem: string;
    status: string;
    time: string;
}

interface Problem {
    id: number;
    title: string;
    difficulty: string;
}

interface LeaderboardEntry {
    rank: number;
    name: string;
    username: string;
    score: number;
    problems: number;
    avatar: string;
}

interface ProfileStats {
    solved: number;
    rank: number;
    xp: number;
    streak: number;
}

export default function ProfilePage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [loading, setLoading] = useState(true);

    // Real data states
    const [stats, setStats] = useState<ProfileStats>({ solved: 0, rank: 0, xp: 0, streak: 0 });
    const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [myRank, setMyRank] = useState(0);
    const [totalSubmissions, setTotalSubmissions] = useState(0);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const [meRes, problemsRes, leaderboardRes] = await Promise.all([
                    api.get("/auth/me"),
                    api.get("/problems"),
                    api.get("/leaderboard"),
                ]);

                const me = meRes.data;
                setStats(me.stats || { solved: 0, rank: 0, xp: 0, streak: 0 });
                setRecentSubmissions(me.recentSubmissions || []);
                setTotalSubmissions((me.recentSubmissions || []).length);
                setProblems(problemsRes.data || []);
                setLeaderboard(leaderboardRes.data || []);

                // Find my rank
                const myEntry = (leaderboardRes.data || []).find(
                    (e: LeaderboardEntry) => e.username === me.username
                );
                setMyRank(myEntry ? myEntry.rank : 0);
            } catch (err) {
                console.error("Failed to load profile data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    const sidebarItems = [
        { icon: "dashboard", label: "Dashboard", id: "dashboard" },
        { icon: "terminal", label: "My Submissions", id: "submissions" },
        { icon: "emoji_events", label: "Achievements", id: "achievements" },
        { icon: "analytics", label: "Insights", id: "insights" },
    ];

    const sidebarSystem = [
        { icon: "settings", label: "Settings", id: "settings" },
        { icon: "help_center", label: "Documentation", id: "docs" },
    ];

    const statusColor = (status: string) => {
        switch (status) {
            case "accepted": return "text-[#22C55E] bg-[#22C55E]/10";
            case "wrong_answer": return "text-[#FB7185] bg-[#FB7185]/10";
            case "pending": return "text-[#F59E0B] bg-[#F59E0B]/10";
            case "error": case "runtime_error": return "text-[#FB7185] bg-[#FB7185]/10";
            default: return "text-slate-400 bg-slate-100";
        }
    };

    const statusLabel = (status: string) => {
        switch (status) {
            case "accepted": return "Accepted";
            case "wrong_answer": return "Wrong Answer";
            case "pending": return "Pending";
            case "error": return "Error";
            case "runtime_error": return "Runtime Error";
            default: return status;
        }
    };

    const difficultyColor = (d: string) => {
        switch (d?.toLowerCase()) {
            case "easy": return "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20";
            case "medium": return "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20";
            case "hard": return "text-[#FB7185] bg-[#FB7185]/10 border-[#FB7185]/20";
            default: return "text-slate-400 bg-slate-100";
        }
    };

    // ========== TAB CONTENT RENDERERS ==========

    const renderDashboard = () => (
        <div className="space-y-8">
            {/* Welcome */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        Welcome back, <span className="hand-drawn-underline text-[#6366F1]">{user?.username || "Student"}</span>
                        <span className="text-xl">✨</span>
                    </h1>
                    <p className="text-slate-500 mt-2">Your personal coding workspace at a glance.</p>
                </div>
                <Link href="/problems" className="bg-[#6366F1] text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-[#6366F1]/20 hover:shadow-[#6366F1]/30 active:scale-95 transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">play_arrow</span>
                    Start Coding
                </Link>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard icon="bolt" iconBg="bg-[#6366F1]/10" iconColor="text-[#6366F1]"
                    badge={stats.solved > 0 ? `${stats.solved} solved` : "Start!"} badgeBg="bg-[#22C55E]/10" badgeColor="text-[#22C55E]"
                    label="Problems Solved" value={`${stats.solved} / ${problems.length}`}
                    barFrom="from-[#6366F1]" barTo="to-[#38BDF8]" barWidth={problems.length > 0 ? (stats.solved / problems.length) * 100 : 0} />
                <MetricCard icon="code" iconBg="bg-[#38BDF8]/10" iconColor="text-[#38BDF8]"
                    badge="Total" badgeBg="bg-[#FB7185]/10" badgeColor="text-[#FB7185]"
                    label="Total Submissions" value={`${recentSubmissions.length}`}
                    barFrom="from-[#38BDF8]" barTo="to-[#22C55E]" barWidth={Math.min(recentSubmissions.length * 10, 100)} />
                <MetricCard icon="local_fire_department" iconBg="bg-[#22C55E]/10" iconColor="text-[#22C55E]"
                    badge={stats.streak > 0 ? "🔥 Active" : "Inactive"} badgeBg="bg-slate-100" badgeColor="text-slate-500"
                    label="Current Streak" value={`${stats.streak} Day${stats.streak !== 1 ? 's' : ''}`}
                    barFrom="from-[#22C55E]" barTo="to-[#6366F1]" barWidth={Math.min(stats.streak * 14, 100)} />
                <MetricCard icon="emoji_events" iconBg="bg-[#F59E0B]/10" iconColor="text-[#F59E0B]"
                    badge={myRank > 0 ? "Ranked" : "Unranked"} badgeBg="bg-[#F59E0B]/10" badgeColor="text-[#F59E0B]"
                    label="Global Rank" value={myRank > 0 ? `#${myRank}` : "—"}
                    barFrom="from-[#F59E0B]" barTo="to-[#FB7185]" barWidth={myRank > 0 ? Math.max(100 - myRank * 5, 10) : 0} />
            </div>

            {/* Chart + Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* XP Summary */}
                <div className="lg:col-span-2 bg-white p-8 rounded-xl sketch-border">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Performance Summary</h3>
                    <p className="text-sm text-slate-400 mb-6">Your real-time coding statistics</p>
                    <div className="grid grid-cols-3 gap-6">
                        <div className="text-center p-4 rounded-xl bg-[#6366F1]/5">
                            <p className="text-3xl font-black text-[#6366F1]">{stats.xp}</p>
                            {/* <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Total XP</p> */}
                        </div>
                        <div className="text-center p-4 rounded-xl bg-[#22C55E]/5">
                            <p className="text-3xl font-black text-[#22C55E]">{stats.solved}</p>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Accepted</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-[#F59E0B]/5">
                            <p className="text-3xl font-black text-[#F59E0B]">{myRank > 0 ? `#${myRank}` : "—"}</p>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Rank</p>
                        </div>
                    </div>
                    {/* Problem difficulty breakdown */}
                    <div className="mt-8">
                        <h4 className="text-sm font-bold text-slate-700 mb-4">Available Problems by Difficulty</h4>
                        <div className="flex gap-4">
                            {["Easy", "Medium", "Hard"].map(d => {
                                const count = problems.filter(p => p.difficulty?.toLowerCase() === d.toLowerCase()).length;
                                return (
                                    <div key={d} className="flex-1 p-3 rounded-lg bg-slate-50 text-center">
                                        <p className="text-xl font-bold text-slate-800">{count}</p>
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${difficultyColor(d)}`}>{d}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl sketch-border">
                        <h4 className="font-bold text-slate-800 text-sm mb-4">Recent Activity</h4>
                        {recentSubmissions.length === 0 ? (
                            <p className="text-sm text-slate-400 py-4 text-center">No submissions yet. Start solving!</p>
                        ) : (
                            <div className="space-y-4">
                                {recentSubmissions.slice(0, 5).map((sub) => (
                                    <div key={sub.id} className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${sub.status === "accepted" ? "bg-[#22C55E]/20 text-[#22C55E]" : "bg-[#FB7185]/20 text-[#FB7185]"}`}>
                                            <span className="material-symbols-outlined text-sm">
                                                {sub.status === "accepted" ? "check_circle" : "error"}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-slate-800 truncate">{sub.problem}</p>
                                            <p className="text-[10px] text-slate-400">{statusLabel(sub.status)} • {sub.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Account Info Card */}
                    <div className="bg-white p-6 rounded-xl sketch-border">
                        <h4 className="font-bold text-slate-800 text-sm mb-4">Account Info</h4>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-slate-400">Username</span><span className="font-mono font-semibold text-slate-700">{user?.username}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Email</span><span className="font-mono font-semibold text-slate-700 truncate ml-4">{user?.email}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Role</span><span className="font-mono font-semibold text-slate-700 capitalize">{user?.role}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Joined</span><span className="font-mono font-semibold text-slate-700">{user?.created_at || "—"}</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Problem List Table */}
            <div className="bg-white rounded-xl sketch-border overflow-hidden">
                <div className="p-6 border-b border-dashed border-slate-200 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900">All Problems</h3>
                    <Link href="/problems" className="flex items-center gap-2 text-sm text-[#6366F1] font-medium hover:underline">
                        <span className="material-symbols-outlined text-lg">arrow_forward</span> Go to Arena
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">#</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Difficulty</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {problems.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-slate-500 font-mono">{p.id}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{p.title}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${difficultyColor(p.difficulty)}`}>{p.difficulty}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/problems/${p.id}`} className="text-[#6366F1] text-xs font-semibold hover:underline">Solve →</Link>
                                    </td>
                                </tr>
                            ))}
                            {problems.length === 0 && (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No problems available yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderSubmissions = () => (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                    My <span className="hand-drawn-underline text-[#6366F1]">Submissions</span>
                    <span className="text-xl">📋</span>
                </h1>
                <p className="text-slate-500 mt-2">Your complete submission history from the backend.</p>
            </div>

            <div className="bg-white rounded-xl sketch-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Problem</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Submitted</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentSubmissions.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                    <span className="material-symbols-outlined text-4xl mb-2 block">inbox</span>
                                    No submissions yet. Head to the <Link href="/problems" className="text-[#6366F1] underline">Coding Arena</Link> to start!
                                </td></tr>
                            ) : (
                                recentSubmissions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-500 font-mono">#{sub.id}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">{sub.problem}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(sub.status)}`}>
                                                {statusLabel(sub.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 font-mono">{sub.time}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderAchievements = () => {
        const badges = [
            { name: "First Blood", desc: "Solved your first problem", icon: "military_tech", earned: stats.solved >= 1, color: "#6366F1" },
            { name: "Streak Starter", desc: "Maintained a 3-day streak", icon: "local_fire_department", earned: stats.streak >= 3, color: "#F59E0B" },
            { name: "Problem Crusher", desc: "Solved 5 problems", icon: "bolt", earned: stats.solved >= 5, color: "#38BDF8" },
            { name: "Top 10", desc: "Reached top 10 on leaderboard", icon: "emoji_events", earned: myRank > 0 && myRank <= 10, color: "#22C55E" },
            { name: "Century Club", desc: "Earned 100+ XP", icon: "stars", earned: stats.xp >= 100, color: "#FB7185" },
            { name: "All Rounder", desc: "Solved all available problems", icon: "verified", earned: stats.solved >= problems.length && problems.length > 0, color: "#6366F1" },
        ];
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <span className="hand-drawn-underline text-[#6366F1]">Achievements</span>
                        <span className="text-xl">🏆</span>
                    </h1>
                    <p className="text-slate-500 mt-2">Badges are earned based on your real progress. Keep coding to unlock them all!</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {badges.map((b) => (
                        <div key={b.name} className={`bg-white p-6 rounded-xl sketch-border text-center transition-transform hover:translate-y-[-2px] ${!b.earned ? "opacity-40 grayscale" : ""}`}>
                            <div className="h-14 w-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${b.color}20`, color: b.color }}>
                                <span className="material-symbols-outlined text-2xl">{b.icon}</span>
                            </div>
                            <h4 className="font-bold text-slate-900">{b.name}</h4>
                            <p className="text-xs text-slate-400 mt-1">{b.desc}</p>
                            {b.earned && <span className="inline-block mt-3 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E]">Unlocked ✓</span>}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderInsights = () => {
        const acceptedCount = recentSubmissions.filter(s => s.status === "accepted").length;
        const failedCount = recentSubmissions.filter(s => s.status !== "accepted").length;
        const successRate = recentSubmissions.length > 0 ? Math.round((acceptedCount / recentSubmissions.length) * 100) : 0;

        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <span className="hand-drawn-underline text-[#6366F1]">Insights</span>
                        {/* <span className="text-xl">📊</span> */}
                    </h1>
                    <p className="text-slate-500 mt-2">Analytics based on your real submission data.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-white p-6 rounded-xl sketch-border text-center">
                        <p className="text-4xl font-black text-[#22C55E]">{successRate}%</p>
                        <p className="text-sm text-slate-500 mt-2">Success Rate</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl sketch-border text-center">
                        <p className="text-4xl font-black text-[#6366F1]">{acceptedCount}</p>
                        <p className="text-sm text-slate-500 mt-2">Accepted Submissions</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl sketch-border text-center">
                        <p className="text-4xl font-black text-[#FB7185]">{failedCount}</p>
                        <p className="text-sm text-slate-500 mt-2">Failed Submissions</p>
                    </div>
                </div>

                {/* Leaderboard snapshot */}
                <div className="bg-white rounded-xl sketch-border overflow-hidden">
                    <div className="p-6 border-b border-dashed border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900">Leaderboard (Top 10)</h3>
                        <p className="text-sm text-slate-400">Real-time ranking from the server.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase">Rank</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase">User</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase">Score</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase">Solved</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {leaderboard.slice(0, 10).map((entry) => (
                                    <tr key={entry.rank} className={`hover:bg-slate-50/50 transition-colors ${entry.username === user?.username ? "bg-[#6366F1]/5" : ""}`}>
                                        <td className="px-6 py-3 text-sm font-bold text-slate-700">#{entry.rank}</td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                {entry.avatar ? (
                                                    <img src={entry.avatar} className="h-7 w-7 rounded-full" alt="" />
                                                ) : (
                                                    <div className="h-7 w-7 rounded-full bg-[#6366F1]/20 flex items-center justify-center text-[#6366F1] text-xs font-bold">{entry.name.charAt(0)}</div>
                                                )}
                                                <span className="text-sm font-semibold text-slate-800">{entry.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-sm font-mono text-slate-600">{entry.score} XP</td>
                                        <td className="px-6 py-3 text-sm font-mono text-slate-600">{entry.problems}</td>
                                    </tr>
                                ))}
                                {leaderboard.length === 0 && (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No leaderboard data yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderSettings = () => (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="hand-drawn-underline text-[#6366F1]">Settings</span>
                    <span className="text-xl">⚙️</span>
                </h1>
                <p className="text-slate-500 mt-2">Manage your account preferences.</p>
            </div>
            <div className="bg-white p-8 rounded-xl sketch-border space-y-6">
                <div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Profile Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Username</label>
                            <input type="text" readOnly value={user?.username || ""} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 font-mono" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
                            <input type="text" readOnly value={user?.email || ""} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 font-mono" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
                            <input type="text" readOnly value={user?.full_name || "Not set"} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Role</label>
                            <input type="text" readOnly value={user?.role || "student"} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 capitalize" />
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Connected Accounts</h3>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="h-10 w-10 rounded-lg bg-slate-900 flex items-center justify-center">
                            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385c.6.105.825-.255.825-.57c0-.285-.015-1.23-.015-2.235c-3.015.555-3.795-.735-4.035-1.41c-.135-.345-.72-1.41-1.23-1.695c-.42-.225-1.02-.78-.015-.795c.945-.015 1.62.87 1.845 1.23c1.08 1.815 2.805 1.305 3.495.99c.105-.78.42-1.305.765-1.605c-2.67-.3-5.46-1.335-5.46-5.925c0-1.305.465-2.385 1.23-3.225c-.12-.3-.54-1.53.12-3.18c0 0 1.005-.315 3.3 1.23c.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23c.66 1.65.24 2.88.12 3.18c.765.84 1.23 1.905 1.23 3.225c0 4.605-2.805 5.625-5.475 5.925c.435.375.81 1.095.81 2.22c0 1.605-.015 2.895-.015 3.3c0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" /></svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800">GitHub</p>
                            <p className="text-xs text-slate-400">Connected as <span className="font-mono text-[#6366F1]">{user?.username}</span></p>
                        </div>
                        <span className="ml-auto text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E]">Connected</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDocs = () => (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="hand-drawn-underline text-[#6366F1]">Documentation</span>
                    <span className="text-xl">📖</span>
                </h1>
                <p className="text-slate-500 mt-2">Quick reference for using MiniCode.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { title: "Getting Started", desc: "Login with GitHub, browse the Coding Arena, and provision your first repo.", icon: "rocket_launch", color: "#6366F1" },
                    { title: "Submitting Code", desc: "Push your code to GitHub, then click 'Sync & Evaluate' to get AI-powered feedback.", icon: "cloud_sync", color: "#38BDF8" },
                    { title: "AI Mentor Feedback", desc: "After submission, your AI Mentor will score Correctness, Time Complexity, and Code Quality.", icon: "psychology", color: "#22C55E" },
                    { title: "Leaderboard & XP", desc: "Earn XP for accepted submissions. Your highest score per problem counts towards your rank.", icon: "leaderboard", color: "#F59E0B" },
                ].map((doc) => (
                    <div key={doc.title} className="bg-white p-6 rounded-xl sketch-border hover:translate-y-[-2px] transition-transform">
                        <div className="h-10 w-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${doc.color}15`, color: doc.color }}>
                            <span className="material-symbols-outlined">{doc.icon}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 mb-2">{doc.title}</h4>
                        <p className="text-sm text-slate-500">{doc.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <span className="material-symbols-outlined text-4xl text-[#6366F1] animate-spin">progress_activity</span>
                        <p className="text-sm text-slate-400 mt-2">Loading your data...</p>
                    </div>
                </div>
            );
        }
        switch (activeTab) {
            case "dashboard": return renderDashboard();
            case "submissions": return renderSubmissions();
            case "achievements": return renderAchievements();
            case "insights": return renderInsights();
            case "settings": return renderSettings();
            case "docs": return renderDocs();
            default: return renderDashboard();
        }
    };

    return (
        <div className="bg-[#FAFAF9] text-slate-900 min-h-[calc(100vh-64px)] font-[Inter,sans-serif]">
            <div className="flex h-[calc(100vh-64px)] overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto pt-6">
                        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Main</div>
                        {sidebarItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${activeTab === item.id
                                    ? "bg-[#6366F1]/10 text-[#6366F1] font-medium"
                                    : "text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                <span className="material-symbols-outlined">{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        ))}

                        <div className="pt-6 px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">System</div>
                        {sidebarSystem.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${activeTab === item.id
                                    ? "bg-[#6366F1]/10 text-[#6366F1] font-medium"
                                    : "text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                <span className="material-symbols-outlined">{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Profile Completion */}
                    <div className="p-4 border-t border-dashed border-slate-200">
                        <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-3">
                            <p className="text-xs text-slate-500">Problems Solved</p>
                            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-[#6366F1] rounded-full transition-all duration-500" style={{ width: problems.length > 0 ? `${(stats.solved / problems.length) * 100}%` : "0%" }}></div>
                            </div>
                            <p className="text-[11px] text-slate-400 font-mono">{stats.solved} / {problems.length} problems</p>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-8">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
}

// Reusable Metric Card Component
function MetricCard({ icon, iconBg, iconColor, badge, badgeBg, badgeColor, label, value, barFrom, barTo, barWidth }: {
    icon: string; iconBg: string; iconColor: string; badge: string; badgeBg: string; badgeColor: string;
    label: string; value: string; barFrom: string; barTo: string; barWidth: number;
}) {
    return (
        <div className="bg-white p-6 rounded-xl sketch-border flex flex-col justify-between hover:translate-y-[-2px] transition-transform">
            <div className="flex justify-between items-start mb-4">
                <div className={`h-10 w-10 rounded-lg ${iconBg} flex items-center justify-center ${iconColor}`}>
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                <span className={`text-[10px] font-mono font-bold ${badgeBg} ${badgeColor} px-2 py-1 rounded-full`}>{badge}</span>
            </div>
            <div>
                <p className="text-slate-500 text-sm font-medium">{label}</p>
                <h3 className="text-2xl font-bold mt-1 marker-highlight inline-block px-1">{value}</h3>
            </div>
            <div className="mt-4">
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${barFrom} ${barTo} transition-all duration-700`} style={{ width: `${Math.min(barWidth, 100)}%` }}></div>
                </div>
            </div>
        </div>
    );
}