"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { 
    Trophy, 
    Medal, 
    Star, 
    TrendingUp, 
    Search, 
    Zap, 
    Code, 
    Flame, 
    Award, 
    Terminal, 
    CheckCircle, 
    AlertCircle, 
    ArrowRight, 
    Shield, 
    Stars, 
    UserCheck, 
    BarChart2, 
    Settings, 
    HelpCircle, 
    Clock,
    Activity,
    MessageSquare,
    Check,
    Save,
    Globe
} from "lucide-react";
import { clsx } from "clsx";
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

interface ProfileData {
    username: string;
    email: string;
    full_name: string;
    avatar_url: string;
    role: string;
    github_id?: number | null;
    created_at: string;
    stats: ProfileStats;
    contribution_data: Record<string, number>;
    recentSubmissions: RecentSubmission[];
    problems?: Problem[];
    leaderboard?: LeaderboardEntry[];
    faculty_report_email?: string;
}

interface StudentProfileViewProps {
    data: ProfileData;
    isFacultyView?: boolean;
}

// Pure helper functions (outside component to avoid recreation)
const statusColor = (status: string) => {
    switch (status) {
        case "accepted": return "text-emerald-500 bg-emerald-500/10";
        case "wrong_answer": return "text-rose-500 bg-rose-500/10";
        case "pending": return "text-amber-500 bg-amber-500/10";
        case "error": case "runtime_error": return "text-rose-500 bg-rose-500/10";
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
        default: return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
    }
};

// Memoized ContributionGraph component with hover tooltip
const ContributionGraph = React.memo(function ContributionGraph({ contributionData, contributionDataRaw, stats, recentSubmissions }: {
    contributionData: { date: string; count: number; level: number }[];
    contributionDataRaw: Record<string, number>;
    stats: ProfileStats;
    recentSubmissions: RecentSubmission[];
}) {
    const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);

    const weeks: { date: string; count: number; level: number }[][] = [];
    let currentWeek: { date: string; count: number; level: number }[] = [];
    contributionData.forEach((day, i) => {
        currentWeek.push(day);
        if (currentWeek.length === 7 || i === contributionData.length - 1) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });

    const monthLabels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
        const firstDay = week[0];
        if (firstDay) {
            const d = new Date(firstDay.date);
            const month = d.getMonth();
            if (month !== lastMonth) {
                monthLabels.push({ month: d.toLocaleString("default", { month: "short" }), weekIndex: wi });
                lastMonth = month;
            }
        }
    });

    const levelColors = [
        "bg-slate-100",
        "bg-indigo-200",
        "bg-indigo-400",
        "bg-indigo-500",
        "bg-indigo-700",
    ];

    const totalContributions = Object.values(contributionDataRaw).reduce((sum, c) => sum + (c || 0), 0);

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h3 className="text-sm font-bold text-slate-700">Activity Graph</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Submission frequency in the last 365 days</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{totalContributions}</p>
                    <p className="text-[10px] text-slate-400 uppercase">Total</p>
                </div>
            </div>

            <div className="h-10 mb-4 flex items-center justify-center border-b border-dashed border-slate-100">
                {hoveredDay ? (
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-700">
                            {new Date(hoveredDay.date).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}:
                        </span>
                        <span className="text-xs font-bold text-indigo-600">
                            {hoveredDay.count} contribution{hoveredDay.count !== 1 ? 's' : ''}
                        </span>
                    </div>
                ) : (
                    <p className="text-xs text-slate-300 italic">Hover over tiles to see details</p>
                )}
            </div>

            <div className="flex flex-col min-w-0">
                <div className="relative h-4 mb-1 ml-8">
                    {monthLabels.map((m, i) => (
                        <span key={i} className="absolute text-[9px] font-bold text-slate-400 uppercase tracking-tighter" style={{ left: `${m.weekIndex * (14 + 4)}px` }}>{m.month}</span>
                    ))}
                </div>
                <div className="flex">
                    <div className="flex flex-col justify-between mr-2 text-[9px] font-bold text-slate-300 uppercase py-0.5">
                        <div className="h-3.5 flex items-center mb-[2px]">Sun</div>
                        <div className="h-3.5 flex items-center mb-[2px] opacity-0">Mon</div>
                        <div className="h-3.5 flex items-center mb-[2px]">Tue</div>
                        <div className="h-3.5 flex items-center mb-[2px] opacity-0">Wed</div>
                        <div className="h-3.5 flex items-center mb-[2px]">Thu</div>
                        <div className="h-3.5 flex items-center mb-[2px] opacity-0">Fri</div>
                        <div className="h-3.5 flex items-center">Sat</div>
                    </div>
                    <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
                        {weeks.map((week, wi) => (
                            <div key={wi} className="flex flex-col gap-1 shrink-0">
                                {week.map((day, di) => (
                                    <div 
                                        key={di} 
                                        onMouseEnter={() => setHoveredDay({ date: day.date, count: day.count })}
                                        onMouseLeave={() => setHoveredDay(null)}
                                        className={clsx(
                                            "w-3.5 h-3.5 rounded-[2px] cursor-crosshair hover:ring-2 hover:ring-indigo-400 hover:scale-125",
                                            levelColors[day.level]
                                        )} 
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Less</span>
                    <div className="flex gap-1">
                        {levelColors.map((color, i) => (<div key={i} className={clsx("w-2.5 h-2.5 rounded-[1px]", color)} />))}
                    </div>
                    <span>More</span>
                </div>
                <div className="flex gap-5">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Streak: {stats.streak} Days</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Total: {recentSubmissions.length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

const MetricCard = React.memo(function MetricCard({ icon, iconBg, iconColor, badge, badgeBg, badgeColor, label, value, barWidth, barColor }: any) {
    return (
        <div className="bg-white p-7 rounded-2xl border border-slate-200 flex flex-col justify-between overflow-hidden relative">
            <div className="flex justify-between items-start mb-6">
                <div className={clsx(
                    "h-12 w-12 rounded-2xl flex items-center justify-center",
                    iconBg, iconColor
                )}>
                    {icon}
                </div>
                <span className={clsx(
                    "text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                    badgeBg, badgeColor
                )}>{badge}</span>
            </div>
            <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{label}</p>
                <h3 className="text-3xl font-black mt-2 text-slate-900 tracking-tighter">{value}</h3>
            </div>
            <div className="mt-6">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div 
                        className={clsx("h-full rounded-full", barColor)} 
                        style={{ width: `${Math.min(barWidth, 100)}%` }}
                    />
                </div>
            </div>
        </div>
    );
});

export default function StudentProfileView({ data, isFacultyView = false }: StudentProfileViewProps) {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [reportEmail, setReportEmail] = useState(data.faculty_report_email || "");
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

    const stats = data.stats;
    const recentSubmissions = data.recentSubmissions;
    const problems = data.problems || [];
    const contributionDataRaw = data.contribution_data || {};

    const myRank = stats.rank || 0;

    const sidebarItems = useMemo(() => [
        { icon: <TrendingUp className="w-5 h-5" />, label: "Dashboard", id: "dashboard" },
        { icon: <Terminal className="w-5 h-5" />, label: "Submissions", id: "submissions" },
        { icon: <Award className="w-5 h-5" />, label: "Achievements", id: "achievements" },
        { icon: <BarChart2 className="w-5 h-5" />, label: "Insights", id: "insights" },
    ], []);

    const sidebarSystem = useMemo(() => isFacultyView ? [] : [
        { icon: <Settings className="w-5 h-5" />, label: "Settings", id: "settings" },
        { icon: <HelpCircle className="w-5 h-5" />, label: "Help", id: "docs" },
    ], [isFacultyView]);

    const contributionData = useMemo(() => {
        const result: { date: string; count: number; level: number }[] = [];
        const today = new Date();
        for (let i = 364; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split("T")[0];
            const count = contributionDataRaw[dateStr] || 0;
            let level = 0;
            if (count > 0) {
                if (count === 1) level = 1;
                else if (count <= 3) level = 2;
                else if (count <= 5) level = 3;
                else level = 4;
            }
            result.push({ date: dateStr, count, level });
        }
        return result;
    }, [contributionDataRaw]);

    const handleTabChange = useCallback((id: string) => {
        setActiveTab(id);
    }, []);

    const handleSaveSettings = async () => {
        setIsSaving(true);
        setSaveStatus("idle");
        try {
            await api.put("/users/me/settings", { report_email: reportEmail });
            setSaveStatus("success");
            setTimeout(() => setSaveStatus("idle"), 3000);
        } catch (err) {
            console.error("Failed to save settings", err);
            setSaveStatus("error");
        } finally {
            setIsSaving(false);
        }
    };

    const renderDashboard = useCallback(() => (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        {isFacultyView ? "Student Profile: " : "Welcome back, "} 
                        <span className="text-indigo-600">{data.username}</span>
                    </h1>
                    <p className="text-slate-500 mt-2 flex items-center gap-2">
                        {isFacultyView ? 
                            <><UserCheck className="w-4 h-4 text-emerald-500" /> Monitoring performance for {data.full_name || data.username}</> : 
                            <><Zap className="w-4 h-4 text-amber-500" /> Your personalized coding trajectory</>
                        }
                    </p>
                </div>
                {!isFacultyView && (
                    <Link href="/problems" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        Solve Problems
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard 
                    icon={<Zap className="w-5 h-5" />} 
                    iconBg="bg-indigo-500/10" 
                    iconColor="text-indigo-500" 
                    badge={stats.solved > 0 ? "Progressing" : "Just Starting"} 
                    badgeBg="bg-emerald-500/10" 
                    badgeColor="text-emerald-500" 
                    label="Problems Solved" 
                    value={`${stats.solved} / ${problems.length}`} 
                    barWidth={problems.length > 0 ? (stats.solved / problems.length) * 100 : 0} 
                    barColor="bg-indigo-500"
                />
                <MetricCard 
                    icon={<Terminal className="w-5 h-5" />} 
                    iconBg="bg-sky-500/10" 
                    iconColor="text-sky-500" 
                    badge="Total Work" 
                    badgeBg="bg-rose-500/10" 
                    badgeColor="text-rose-500" 
                    label="Submissions" 
                    value={`${recentSubmissions.length}`} 
                    barWidth={Math.min(recentSubmissions.length * 5, 100)} 
                    barColor="bg-sky-500"
                />
                <MetricCard 
                    icon={<Flame className="w-5 h-5" />} 
                    iconBg="bg-emerald-500/10" 
                    iconColor="text-emerald-500" 
                    badge={stats.streak > 0 ? "On fire" : "Paused"} 
                    badgeBg="bg-slate-100" 
                    badgeColor="text-slate-500" 
                    label="Current Streak" 
                    value={`${stats.streak} Days`} 
                    barWidth={Math.min(stats.streak * 20, 100)} 
                    barColor="bg-emerald-500"
                />
                <MetricCard 
                    icon={<Trophy className="w-5 h-5" />} 
                    iconBg="bg-amber-500/10" 
                    iconColor="text-amber-500" 
                    badge={myRank > 0 ? "Global" : "Pending"} 
                    badgeBg="bg-amber-500/10" 
                    badgeColor="text-amber-500" 
                    label="World Rank" 
                    value={myRank > 0 ? `#${myRank}` : "—"} 
                    barWidth={myRank > 0 ? Math.max(100 - myRank * 10, 10) : 0} 
                    barColor="bg-amber-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 relative overflow-hidden">
                    <h3 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-500" /> Performance Metrics
                    </h3>
                    <p className="text-sm text-slate-500 mb-8 uppercase tracking-widest font-semibold">Consolidated data point analysis</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="text-center p-6 rounded-2xl bg-indigo-50 border border-indigo-100">
                            <p className="text-4xl font-black text-indigo-500">{stats.xp}</p>
                            <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-[0.2em] font-black">Total XP</p>
                        </div>
                        <div className="text-center p-6 rounded-2xl bg-emerald-50 border border-emerald-100">
                            <p className="text-4xl font-black text-emerald-500">{stats.solved}</p>
                            <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-[0.2em] font-black">Problems</p>
                        </div>
                        <div className="text-center p-6 rounded-2xl bg-amber-50 border border-amber-100">
                            <p className="text-4xl font-black text-amber-500">{myRank > 0 ? `#${myRank}` : "—"}</p>
                            <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-[0.2em] font-black">Rank</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                        <h4 className="font-bold text-slate-800 text-sm mb-6 flex items-center gap-2">
                             <Clock className="w-4 h-4 text-sky-500" /> Recent Activity
                        </h4>
                        {recentSubmissions.length === 0 ? (
                            <div className="py-10 text-center">
                                <p className="text-xs text-slate-400 italic">No operations recorded.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentSubmissions.slice(0, 5).map((sub) => (
                                    <div key={sub.id} className="flex items-center gap-4">
                                        <div className={clsx(
                                            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                                            sub.status === "accepted" ? "bg-emerald-500/20 text-emerald-500" : "bg-rose-500/20 text-rose-500"
                                        )}>
                                            {sub.status === "accepted" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-800 truncate">{sub.problem}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">{statusLabel(sub.status)} • {sub.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-2xl text-white relative overflow-hidden">
                        <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                            <Shield className="w-4 h-4" /> Identity Verified
                        </h4>
                        <div className="space-y-3">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-white/60 uppercase font-black tracking-widest">Username</span>
                                <span className="font-mono text-sm font-bold tracking-tight">{data.username}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-white/60 uppercase font-black tracking-widest">Role Authority</span>
                                <span className="text-sm font-bold capitalize">{data.role}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ContributionGraph contributionData={contributionData} contributionDataRaw={contributionDataRaw} stats={stats} recentSubmissions={recentSubmissions} />
        </div>
    ), [contributionData, contributionDataRaw, stats, recentSubmissions, isFacultyView, data, problems.length, myRank]);

    const renderSubmissions = useCallback(() => (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                    <span className="text-indigo-600">{isFacultyView ? `${data.username}'s Archive` : "Submission Audit"}</span>
                </h1>
                <p className="text-slate-500 mt-2 uppercase tracking-widest text-[10px] font-bold">Historical data points from the MiniCode core</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">
                                <th className="px-6 py-5">Sequence</th>
                                <th className="px-6 py-5">Problem Statement</th>
                                <th className="px-6 py-5">Final State</th>
                                <th className="px-6 py-5">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentSubmissions.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Zero entries found in database</td></tr>
                            ) : (
                                recentSubmissions.map((sub) => (
                                    <tr key={sub.id}>
                                        <td className="px-6 py-5 text-xs text-slate-400 font-mono">#{sub.id.toString().padStart(4, '0')}</td>
                                        <td className="px-6 py-5 text-sm font-bold text-slate-900">{sub.problem}</td>
                                        <td className="px-6 py-5">
                                            <span className={clsx(
                                                "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                statusColor(sub.status)
                                            )}>
                                                {statusLabel(sub.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-xs text-slate-500 font-mono">{sub.time}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    ), [recentSubmissions, isFacultyView, data.username]);

    const renderAchievements = useCallback(() => {
        const badges = [
            { name: "Initiation", desc: "First challenge completed", icon: <Medal className="w-6 h-6" />, earned: stats.solved >= 1, color: "text-indigo-500", bg: "bg-indigo-500/10" },
            { name: "Resilience", desc: "Maintained a 3-day active streak", icon: <Flame className="w-6 h-6" />, earned: stats.streak >= 3, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { name: "Expertise", desc: "Solved 5 complex scenarios", icon: <Zap className="w-6 h-6" />, earned: stats.solved >= 5, color: "text-sky-500", bg: "bg-sky-500/10" },
            { name: "Elite Status", desc: "Top 10 global ranking achieved", icon: <Trophy className="w-6 h-6" />, earned: myRank > 0 && myRank <= 10, color: "text-amber-500", bg: "bg-amber-500/10" },
            { name: "Pioneer", desc: "Accumulated over 100 XP points", icon: <Stars className="w-6 h-6" />, earned: stats.xp >= 100, color: "text-rose-500", bg: "bg-rose-500/10" },
            { name: "Mastery", desc: "Perfect solution record", icon: <Shield className="w-6 h-6" />, earned: stats.solved >= problems.length && problems.length > 0, color: "text-purple-500", bg: "bg-purple-500/10" },
        ];
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        Achievements
                    </h1>
                    <p className="text-slate-500 mt-2 uppercase tracking-widest text-[10px] font-bold">Protocol-based merit badge distribution</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {badges.map((b) => (
                        <div key={b.name} className={clsx(
                            "bg-white p-8 rounded-2xl border relative",
                            b.earned ? "border-slate-200" : "border-slate-100 opacity-40 grayscale"
                        )}>
                            <div className={clsx(
                                "h-16 w-16 rounded-2xl mx-auto mb-6 flex items-center justify-center",
                                b.bg, b.color
                            )}>
                                {b.icon}
                            </div>
                            <div className="text-center">
                                <h4 className="font-black text-slate-900 uppercase tracking-widest">{b.name}</h4>
                                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{b.desc}</p>
                                {b.earned && (
                                    <div className="mt-6 flex items-center justify-center gap-2 text-emerald-500 font-black text-[9px] uppercase tracking-[0.3em]">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                        Unlocked Authority
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }, [stats, myRank, problems.length]);

    const renderInsights = useCallback(() => {
        const acceptedCount = recentSubmissions.filter(s => s.status === "accepted").length;
        const failedCount = recentSubmissions.filter(s => s.status !== "accepted").length;
        const successRate = recentSubmissions.length > 0 ? Math.round((acceptedCount / recentSubmissions.length) * 100) : 0;

        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                         Intelligence Insights
                    </h1>
                    <p className="text-slate-500 mt-2 uppercase tracking-widest text-[10px] font-bold">Deep learning diagnostics of student behavior</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center">
                        <p className="text-5xl font-black text-emerald-500 mb-2">{successRate}%</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">Success Quotient</p>
                    </div>
                    <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center">
                        <p className="text-5xl font-black text-indigo-500 mb-2">{acceptedCount}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">Valid Executions</p>
                    </div>
                    <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center">
                        <p className="text-5xl font-black text-rose-500 mb-2">{failedCount}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">Error Exceptions</p>
                    </div>
                </div>

                <div className="bg-slate-50 p-8 rounded-2xl border border-dashed border-slate-300">
                    <p className="text-sm text-slate-500 italic text-center">
                        "Your coding trajectory is based on real-time intelligence gathered from {recentSubmissions.length} independent logic samples."
                    </p>
                </div>
            </div>
        );
    }, [recentSubmissions.length]);

    const renderSettings = useCallback(() => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                    <Settings className="w-8 h-8 text-indigo-600" />
                    Account Settings
                </h1>
                <p className="text-slate-500 mt-2">Manage your core credentials and system preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <UserCheck className="w-5 h-5 text-indigo-500" />
                                Profile Matrix
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity ID</label>
                                    <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600">
                                        {data.username}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Node</label>
                                    <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600">
                                        {data.email}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {data.role === "faculty" && (
                            <div className="pt-8 border-t border-slate-100">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-amber-500" />
                                    Reporting Configuration
                                </h3>
                                <p className="text-sm text-slate-500 mb-6">Enter the email address where you'd like to receive periodic student engagement reports.</p>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Report Target Email</label>
                                        <input 
                                            type="email"
                                            value={reportEmail}
                                            onChange={(e) => setReportEmail(e.target.value)}
                                            placeholder="e.g. professor@university.edu"
                                            className="w-full bg-white px-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-900"
                                        />
                                    </div>
                                    <button 
                                        onClick={handleSaveSettings}
                                        disabled={isSaving}
                                        className={clsx(
                                            "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all",
                                            saveStatus === "success" ? "bg-emerald-500 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"
                                        )}
                                    >
                                        {isSaving ? "Synchronizing..." : (
                                            saveStatus === "success" ? <><Check className="w-4 h-4" /> Saved Successfully</> : <><Save className="w-4 h-4" /> Save Preferences</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900 p-8 rounded-3xl text-white">
                        <h3 className="text-lg font-bold mb-4">Security Status</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">Multi-Factor Auth</span>
                                <span className="text-xs font-black text-emerald-400 uppercase">Active</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">Session Encryption</span>
                                <span className="text-xs font-black text-emerald-400 uppercase">AES-256</span>
                            </div>
                            <div className="pt-4 border-t border-slate-800">
                                <button className="text-xs font-black text-slate-400 hover:text-white transition-colors uppercase tracking-widest">Rotate API Keys</button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-600 p-8 rounded-3xl text-white relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-2">Connected</h3>
                            <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                                <Globe className="w-6 h-6" />
                                <div>
                                    <p className="text-sm font-bold">GitHub OAuth</p>
                                    <p className="text-[10px] opacity-70">Linked to @{data.username}</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    </div>
                </div>
            </div>
        </div>
    ), [data, reportEmail, isSaving, saveStatus, handleSaveSettings]);

    const renderHelp = useCallback(() => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <HelpCircle className="w-8 h-8 text-indigo-600" />
                        Intelligence Matrix Support
                    </h1>
                    <p className="text-slate-500 mt-2 uppercase tracking-[0.2em] text-[10px] font-black">Centralized operations and documentation hub</p>
                </div>
                <a href="https://discord.gg/minicode" target="_blank" className="flex items-center gap-2 bg-[#5865F2] text-white px-6 py-3 rounded-2xl font-bold text-sm hover:scale-105 transition-transform shadow-lg shadow-[#5865F2]/20">
                    <MessageSquare className="w-4 h-4" />
                    Join Developer Discord
                </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-indigo-500/50 transition-colors group">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Code className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-3">Logic Execution</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Learn how to synchronize your local environment with the judge matrix. Push code to your private repository for AI evaluation.
                    </p>
                    <button className="mt-6 text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">Read Protocol <ArrowRight className="w-3 h-3" /></button>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-emerald-500/50 transition-colors group">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Trophy className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-3">Ranking Algorithms</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Understand how XP is calculated based on problem complexity, execution efficiency, and code quality benchmarks.
                    </p>
                    <button className="mt-6 text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">View Benchmarks <ArrowRight className="w-3 h-3" /></button>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-rose-500/50 transition-colors group">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Shield className="w-6 h-6 text-rose-600" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-3">Integrity Core</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Our anti-plagiarism engine monitors code lineages. Ensure your work is original to avoid disciplinary exceptions.
                    </p>
                    <button className="mt-6 text-xs font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">Integrity Guide <ArrowRight className="w-3 h-3" /></button>
                </div>
            </div>

            <div className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-3xl font-black mb-6">Need technical intervention?</h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">If you encounter judge timeouts or repo synchronization errors, our operations team is ready in the Discord headquarters to assist with manual resets.</p>
                    <div className="flex flex-wrap gap-4">
                        <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-sm">Open Support Ticket</button>
                        <button className="bg-slate-800 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-slate-700 transition-colors">Documentation Wiki</button>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none" />
            </div>
        </div>
    ), []);

    const renderContent = useCallback(() => {
        switch (activeTab) {
            case "dashboard": return renderDashboard();
            case "submissions": return renderSubmissions();
            case "achievements": return renderAchievements();
            case "insights": return renderInsights();
            case "settings": return renderSettings();
            case "docs": return renderHelp();
            default: return renderDashboard();
        }
    }, [activeTab, renderDashboard, renderSubmissions, renderAchievements, renderInsights, renderSettings, renderHelp]);

    return (
        <div className="bg-white text-slate-900 min-h-[calc(100vh-64px)] font-[Inter,sans-serif] w-full selection:bg-indigo-500 selection:text-white">
            <div className="max-w-[1600px] mx-auto flex h-[calc(100vh-64px)] overflow-hidden">
                <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 relative z-20">
                    <div className="p-8 pb-4">
                        <div className="h-16 w-16 rounded-2xl border border-slate-200 overflow-hidden mb-4 ring-2 ring-indigo-500/20 p-0.5">
                            {data.avatar_url ? (
                                <img src={data.avatar_url} alt="" className="w-full h-full object-cover rounded-[14px]" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl">
                                    {data.username.slice(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <h2 className="font-black text-slate-900 uppercase tracking-wider text-xs truncate">{data.full_name || data.username}</h2>
                        <p className="text-[9px] text-slate-400 font-bold tracking-widest mt-1 opacity-70 uppercase">{data.role}</p>
                    </div>

                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto pt-4 scrollbar-hide">
                        <div className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 opacity-50">Intelligence Hub</div>
                        {sidebarItems.map((item) => (
                            <button 
                                key={item.id} 
                                onClick={() => handleTabChange(item.id)} 
                                className={clsx(
                                    "w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest",
                                    activeTab === item.id 
                                        ? "bg-indigo-600 text-white" 
                                        : "text-slate-500 hover:bg-slate-100"
                                )}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                        {sidebarSystem.length > 0 && (
                            <>
                                <div className="pt-10 px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 opacity-50">System Link</div>
                                {sidebarSystem.map((item) => (
                                    <button 
                                        key={item.id} 
                                        onClick={() => handleTabChange(item.id)} 
                                        className={clsx(
                                            "w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest",
                                            activeTab === item.id 
                                                ? "bg-indigo-600 text-white" 
                                                : "text-slate-500 hover:bg-slate-100"
                                        )}
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </button>
                                ))}
                            </>
                        )}
                    </nav>
                </aside>

                <main className="flex-1 flex flex-col overflow-hidden relative z-10 bg-slate-50">
                    <div className="flex-1 overflow-y-auto p-10 lg:p-16 relative">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
}
