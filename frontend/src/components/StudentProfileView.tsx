"use client";

import React, { useState, useMemo, useCallback, memo } from "react";
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
    Globe,
    ExternalLink,
    ArrowUpRight,
    Cpu,
    MousePointer2,
    Database,
    BookOpen,
    ChevronRight,
    Code2,
    Mail,
    Loader2,
    KeyRound,
    Sparkles,
    Target,
    Play,
    Rocket,
    Crown
} from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import api, { userApi } from "@/lib/api";

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
    level: number;
    level_name: string;
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

function processRecentSubmissionsToContributionData(recentSubmissions: RecentSubmission[]): { date: string; count: number; level: number }[] {
    const dailyCounts: Record<string, number> = {};
    
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    recentSubmissions.forEach(sub => {
        if (sub.time) {
            const subDate = new Date(sub.time);
            if (!isNaN(subDate.getTime()) && subDate >= oneYearAgo) {
                const dateStr = subDate.toISOString().split('T')[0];
                dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;
            }
        }
    });
    
    const result: { date: string; count: number; level: number }[] = [];
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const count = dailyCounts[dateStr] || 0;
        let level = 0;
        if (count > 10) level = 4;
        else if (count > 5) level = 3;
        else if (count > 2) level = 2;
        else if (count > 0) level = 1;
        result.push({ date: dateStr, count, level });
    }
    
    return result;
}

function processRecentSubmissionsToWeeklyActivity(recentSubmissions: RecentSubmission[]): number[] {
    const weeklyCounts: Record<string, number> = {};
    
    const fifteenWeeksAgo = new Date();
    fifteenWeeksAgo.setDate(fifteenWeeksAgo.getDate() - 15 * 7);
    
    recentSubmissions.forEach(sub => {
        if (sub.time) {
            const subDate = new Date(sub.time);
            if (!isNaN(subDate.getTime()) && subDate >= fifteenWeeksAgo) {
                const weekStart = new Date(subDate);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                const weekKey = weekStart.toISOString().split('T')[0];
                weeklyCounts[weekKey] = (weeklyCounts[weekKey] || 0) + 1;
            }
        }
    });
    
    const result: number[] = [];
    const today = new Date();
    for (let i = 14; i >= 0; i--) {
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() - i * 7);
        const weekKey = weekStart.toISOString().split('T')[0];
        result.push(weeklyCounts[weekKey] || 0);
    }
    
    return result;
}

interface StudentProfileViewProps {
    data: ProfileData;
    isFacultyView?: boolean;
}

const statusColor = (status: string) => {
    switch (status) {
        case "accepted": return "text-emerald-600 bg-emerald-50 border-emerald-200";
        case "wrong_answer": return "text-rose-600 bg-rose-50 border-rose-200";
        case "pending": return "text-amber-600 bg-amber-50 border-amber-200";
        case "error": case "runtime_error": return "text-rose-600 bg-rose-50 border-rose-200";
        default: return "text-slate-500 bg-slate-50 border-slate-200";
    }
};

const statusLabel = (status: string) => {
    switch (status) {
        case "accepted": return "ACCEPTED";
        case "wrong_answer": return "FAIL_WA";
        case "pending": return "JUDGING";
        case "error": return "FAIL_ERR";
        case "runtime_error": return "FAIL_RTE";
        default: return status.toUpperCase().replace("_", "_");
    }
};

const ContributionGraph = memo(function ContributionGraph({ contributionData, contributionDataRaw, stats }: {
    contributionData: { date: string; count: number; level: number }[];
    contributionDataRaw: Record<string, number>;
    stats: ProfileStats;
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
        "bg-slate-100 border border-slate-200",
        "bg-blue-200",
        "bg-blue-400",
        "bg-blue-600",
        "bg-blue-800",
    ];

    return (
        <div className="bg-white p-8 rounded-[3rem] border border-blue-100 relative overflow-hidden group shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-transparent pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
                <div className="flex items-center gap-6">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Execution History</h3>
                        <p className="text-slate-400 text-[10px] uppercase font-black tracking-[0.3em] mt-1.5">Temporal logic sample distribution</p>
                    </div>
                </div>
                <div className="px-6 py-3 rounded-2xl bg-blue-50 border border-blue-100 text-center min-w-[140px]">
                    <p className="text-xl font-black text-slate-900">{Object.values(contributionDataRaw).reduce((sum, c) => sum + (c || 0), 0)}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Total Signals</p>
                </div>
            </div>

            <div className="h-12 mb-8 flex items-center justify-center border-b border-dashed border-blue-100">
                {hoveredDay ? (
                    <div className="flex items-center gap-4">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            {new Date(hoveredDay.date).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-[11px] font-black text-primary uppercase tracking-widest">
                            {hoveredDay.count} SUCCESSFUL OPS
                        </span>
                    </div>
                ) : (
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.5em] italic">Scan matrix tiles for authority data</p>
                )}
            </div>

            <div className="flex flex-col min-w-0">
                <div className="relative h-6 mb-2 ml-10">
                    {monthLabels.map((m, i) => (
                        <span key={i} className="absolute text-[9px] font-black text-slate-500 uppercase tracking-widest" style={{ left: `${m.weekIndex * (16 + 6)}px` }}>{m.month}</span>
                    ))}
                </div>
                <div className="flex">
                    <div className="flex flex-col justify-between mr-4 text-[9px] font-black text-slate-400 uppercase py-1">
                        <div className="h-3.5 flex items-center">S</div>
                        <div className="h-3.5 flex items-center opacity-0">M</div>
                        <div className="h-3.5 flex items-center">T</div>
                        <div className="h-3.5 flex items-center opacity-0">W</div>
                        <div className="h-3.5 flex items-center">T</div>
                        <div className="h-3.5 flex items-center opacity-0">F</div>
                        <div className="h-3.5 flex items-center">S</div>
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto pb-4 scrollbar-hide py-1">
                        {weeks.map((week, wi) => (
                            <div key={wi} className="flex flex-col gap-1.5 shrink-0">
                                {week.map((day) => (
                                    <div
                                        key={day.date}
                                        className={clsx(
                                            "w-3 h-3 rounded-[2px] transition-colors duration-200 relative",
                                            levelColors[day.level] || "bg-white/5",
                                            "cursor-pointer"
                                        )}
                                        onMouseEnter={() => setHoveredDay(day)}
                                        onMouseLeave={() => setHoveredDay(null)}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
});

const MetricTile = memo(({ icon: Icon, label, value, trend }: any) => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-blue-100 flex flex-col justify-between overflow-hidden relative group shadow-sm hover:border-blue-300 transition-colors">
        <div className="flex justify-between items-start mb-6">
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-blue-50 border border-blue-100">
                <Icon className="w-6 h-6 text-blue-600" />
            </div>
        </div>
        <div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2">{label}</p>
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h3>
        </div>
    </div>
));

export default function StudentProfileView({ data, isFacultyView = false }: StudentProfileViewProps) {
    const [activeTab, setActiveTab] = useState("dashboard");

    const sidebarItems = useMemo(() => {
        const items = [
            { id: "dashboard", label: "Dashboard", icon: Activity },
            { id: "submissions", label: "Submissions", icon: Code2 },
            { id: "achievements", label: "Achievements", icon: Trophy },
            // { id: "insights", label: "Insights", icon: Zap },
            { id: "progress", label: "Progress Guide", icon: Target },
        ];

        if (!isFacultyView) {
            items.push(
                { id: "settings", label: "Settings", icon: Settings },
                { id: "help", label: "Help Center", icon: BookOpen }
            );
        }

        if (isFacultyView) {
            items.push({ id: "sovereign", label: "Sovereign Override", icon: Shield });
        }

        return items;
    }, [isFacultyView]);

    const renderContent = () => {
        const props: StudentProfileViewProps = { data, isFacultyView };
        switch (activeTab) {
            case "dashboard": return <DashboardTab {...props} />;
            case "submissions": return <SubmissionsTab {...props} />;
            case "achievements": return <AchievementsTab {...props} />;
            // case "insights": return <InsightsTab {...props} />;
            case "settings": return <SettingsTab {...props} />;
            case "help": return <HelpTab {...props} />;
            case "sovereign": return <SovereignTab {...props} />;
            case "progress": return <ProgressGuideTab {...props} />;
            default: return <DashboardTab {...props} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-700 font-sans pt-24 pb-12 overflow-x-hidden">
            <div className="max-w-[1800px] mx-auto px-6 relative">
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-50 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-sky-50 blur-[120px] rounded-full" />
                </div>

                <div className="flex flex-col lg:flex-row gap-12 relative z-10">
                    <div className="w-full lg:w-96 shrink-0 space-y-8">
                        <div className="bg-white p-6 rounded-[2.5rem] border border-blue-100 shadow-sm text-center relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="relative inline-block mb-6">
                                    <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-blue-200 shadow-xl relative group-hover:border-blue-400 transition-colors">
                                        <img src={data.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`} alt={data.username} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-lg">
                                        {data.stats.level}
                                    </div>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{data.full_name}</h2>
                                <p className="text-blue-600 font-black text-[10px] mt-2 tracking-[0.2em] uppercase">{data.stats.level_name}</p>
                            </div>
                        </div>

                        <nav className="bg-white p-2 rounded-3xl border border-blue-100 shadow-sm overflow-hidden">
                            {sidebarItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={clsx(
                                        "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group relative",
                                        activeTab === item.id ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50 text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    {activeTab === item.id && <div className="absolute left-2 w-1 h-6 bg-blue-600 rounded-full" />}
                                    <item.icon className={clsx("w-5 h-5 shrink-0 transition-transform duration-300", activeTab === item.id ? "scale-110" : "group-hover:scale-110")} />
                                    <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <main className="flex-1 min-w-0">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </div>
    );
}

const DashboardTab = memo(({ data }: StudentProfileViewProps) => {
    const processedContributionData = useMemo(() => 
        processRecentSubmissionsToContributionData(data.recentSubmissions), 
        [data.recentSubmissions]
    );
    
    const contributionDataRaw = useMemo(() => {
        const raw: Record<string, number> = {};
        data.recentSubmissions.forEach(sub => {
            if (sub.time) {
                const dateStr = new Date(sub.time).toISOString().split('T')[0];
                raw[dateStr] = (raw[dateStr] || 0) + 1;
            }
        });
        return raw;
    }, [data.recentSubmissions]);
    
    return (
        <div className="space-y-12 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                <MetricTile icon={Trophy} label="SOLVED_REPOS" value={data.stats.solved} trend="" />
                <MetricTile icon={Zap} label="CURRENT_XP" value={data.stats.xp.toLocaleString()} trend="" />
                <MetricTile icon={Activity} label="WORLD_RANK" value={`#${data.stats.rank}`} trend="" />
                <MetricTile icon={Code2} label="BURN_STREAK" value={data.stats.streak} trend="" />
            </div>

            <div className="grid  gap-12">
                <div className=" space-y-12">
                    <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 shadow-lg relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                                    <Activity className="w-6 h-6 text-blue-600" />
                                    Activity History
                                </h3>
                            </div>
                            <ContributionGraph contributionData={processedContributionData} contributionDataRaw={contributionDataRaw} stats={data.stats} />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-sm relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 uppercase tracking-tight">
                                <Code2 className="w-6 h-6 text-blue-500" />
                                Recent Activity
                            </h3>
                            <div className="space-y-4">
                                {data.recentSubmissions.slice(0, 5).map((sub, i) => (
                                    <div key={sub.id} className="group/item flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer">
                                        <div className="flex items-center gap-6">
                                            <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center font-black text-[10px]", statusColor(sub.status))}>
                                                {statusLabel(sub.status)}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-base tracking-tight">{sub.problem || "Untitled Fragment"}</p>
                                                <p className="text-slate-400 text-[9px] font-bold mt-0.5 uppercase tracking-widest">{new Date(sub.time).toLocaleDateString()} // v{String(sub.id).slice(0, 4)}</p>
                                            </div>
                                        </div>
                                        {/* <ChevronRight className="w-5 h-5 text-slate-300 group-hover/item:text-blue-500 transition-colors" /> */}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

const SubmissionsTab = memo(({ data }: StudentProfileViewProps) => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tight uppercase">Submission History</h3>
        <div className="space-y-6">
            {data.recentSubmissions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition-all">
                    <div className="flex items-center gap-10">
                        <div className={clsx("px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest", statusColor(sub.status))}>
                            {statusLabel(sub.status)}
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-slate-900 tracking-tight uppercase">{sub.problem || "Problem Name"}</h4>
                            <div className="flex items-center gap-6 mt-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2">
                                    <Activity className="w-3.5 h-3.5" /> {String(sub.id).slice(0, 8)}
                                </span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TIMESTAMP: {new Date(sub.time).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
));

const AchievementsTab = memo(({ data }: StudentProfileViewProps) => {
    const achievements = [
        { title: "FIRST_BLOOD", desc: "Solve your very first repository.", icon: Trophy, color: "text-amber-400", bg: "bg-amber-400/10", glow: "shadow-amber-500/20", req: "1 Solved", unlocked: data.stats.solved >= 1 },
        { title: "CODE_NINJA", desc: "Successfully solve 10 repositories.", icon: Code2, color: "text-indigo-400", bg: "bg-indigo-400/10", glow: "shadow-indigo-500/20", req: "10 Solved", unlocked: data.stats.solved >= 10 },
        { title: "STREAK_MASTER", desc: "Maintain a 7-day burning streak.", icon: Flame, color: "text-rose-400", bg: "bg-rose-400/10", glow: "shadow-rose-500/20", req: "7 Day Streak", unlocked: data.stats.streak >= 7 },
        { title: "CENTURION", desc: "Accumulate 100 XP.", icon: Zap, color: "text-emerald-400", bg: "bg-emerald-400/10", glow: "shadow-emerald-500/20", req: "100 XP", unlocked: data.stats.xp >= 100 },
        { title: "ARCHITECT", desc: "Reach level 5.", icon: Award, color: "text-primary", bg: "bg-primary/10", glow: "shadow-primary/20", req: "Level 5", unlocked: data.stats.level >= 5 },
        { title: "VETERAN", desc: "Solve 50 repositories.", icon: Star, color: "text-cyan-400", bg: "bg-cyan-400/10", glow: "shadow-cyan-500/20", req: "50 Solved", unlocked: data.stats.solved >= 50 }
    ];

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-sm">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Honor_Logs</h3>
                    <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest">Authenticated credentials and milestone acquisitions</p>
                </div>
                <div className="px-6 py-3 rounded-2xl bg-blue-50 border border-blue-100 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    PROG: {achievements.filter(a => a.unlocked).length} / {achievements.length}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                {achievements.map((ach, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={clsx(
                            "group relative p-8 rounded-[2.5rem] border transition-all overflow-hidden",
                            ach.unlocked 
                                ? "bg-white border-blue-100 hover:border-blue-300 shadow-sm hover:shadow-md" 
                                : "bg-slate-50 border-slate-100 opacity-50 grayscale"
                        )}
                    >
                        {!ach.unlocked && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-help">
                                <div className="text-center p-6 bg-white rounded-3xl border border-blue-100 shadow-lg">
                                    <KeyRound className="w-8 h-8 text-blue-500 mx-auto mb-4" />
                                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1">Authorization Required</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">{ach.req}</p>
                                </div>
                            </div>
                        )}

                        <div className={clsx(
                            "w-16 h-16 rounded-2xl flex items-center justify-center mb-10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
                            ach.unlocked ? ach.bg : "bg-slate-100",
                        )}>
                            <ach.icon className={clsx("w-8 h-8", ach.unlocked ? ach.color : "text-slate-400")} />
                        </div>

                        <h4 className="text-xl font-black mb-4 uppercase tracking-tighter text-slate-900 flex items-center justify-between">
                            {ach.title}
                            {ach.unlocked && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                        </h4>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed tracking-tight group-hover:text-slate-600 transition-colors">{ach.desc}</p>
                        
                        <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
                            <div className={clsx(
                                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em]",
                                ach.unlocked ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-400"
                            )}>
                                {ach.unlocked ? "DECRYPTED" : "ENCRYPTED"}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
});

const InsightsTab = memo(({ data }: StudentProfileViewProps) => {
    const weeklyActivity = useMemo(() => 
        processRecentSubmissionsToWeeklyActivity(data.recentSubmissions), 
        [data.recentSubmissions]
    );
    
    const velocityData = useMemo(() => {
        const maxActivity = Math.max(...weeklyActivity, 1);
        return weeklyActivity.map(count => {
            const normalized = (count / maxActivity) * 80;
            return Math.max(20, Math.round(normalized + 20));
        });
    }, [weeklyActivity]);
    
    const totalSubmissions = weeklyActivity.reduce((sum, c) => sum + c, 0);
    const efficiency = totalSubmissions > 0 ? (Math.max(...weeklyActivity) / Math.max(totalSubmissions / 15, 1)).toFixed(2) : "0.00";
    
    const algoLogic = Math.min(100, Math.round(40 + (data.stats.solved * 2) + (data.stats.level * 5)));
    const debugPrecision = Math.min(100, Math.round(50 + (data.stats.streak * 3) + (data.stats.solved * 1)));
    const sysArch = Math.min(100, Math.round(30 + (data.stats.xp / 100)));

    const points = velocityData.map((v, i) => `${(i / (velocityData.length - 1)) * 100},${100 - v}`).join(" ");

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                <div className="xl:col-span-2 bg-white p-8 rounded-[2.5rem] border border-blue-100 text-slate-900 relative overflow-hidden shadow-sm group">
                    <div className="absolute top-0 right-0 p-10 pointer-events-none opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-32 h-32 text-blue-500" />
                    </div>
                    
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h3 className="text-2xl font-black flex items-center gap-4 uppercase tracking-tighter text-slate-900">
                                    <Activity className="w-8 h-8 text-emerald-500" />
                                    Cognitive_Velocity
                                </h3>
                                <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest">Weekly Activity Distribution (Last 15 Weeks)</p>
                            </div>
                            <div className="px-6 py-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Efficiency: {efficiency}x</span>
                            </div>
                        </div>

                        <div className="flex-1 relative mt-12 mb-8">
                            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-80 overflow-visible">
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <motion.path
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 2, ease: "easeInOut" }}
                                    d={`M ${points}`}
                                    fill="none"
                                    stroke="var(--color-primary)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                                />
                                <motion.path
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1, duration: 1 }}
                                    d={`M ${points} L 100,100 L 0,100 Z`}
                                    fill="url(#gradient)"
                                />
                                {velocityData.map((v, i) => (
                                    <motion.circle
                                        key={i}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.5 + (i * 0.05) }}
                                        cx={(i / (velocityData.length - 1)) * 100}
                                        cy={100 - v}
                                        r="1.5"
                                        fill="white"
                                        className="cursor-pointer hover:r-3 transition-all"
                                    />
                                ))}
                            </svg>
                        </div>
                        
                        <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono border-t border-white/5 pt-8">
                            <span>Sector_Start</span>
                            <span>Mid_Analysis</span>
                            <span>Current_Metric</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-sm flex flex-col justify-between group">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 mb-10 uppercase tracking-tighter flex items-center gap-3">
                            Neural_Mapping
                            <Cpu className="w-5 h-5 text-blue-500" />
                        </h3>
                        <div className="space-y-12">
                            {[
                                { label: "ALGORITHMIC_LOGIC", val: algoLogic, color: "bg-emerald-500", glow: "" },
                                { label: "DEBUG_PRECISION", val: debugPrecision, color: "bg-blue-600", glow: "" },
                                { label: "SYSTEM_ARCHITECTURE", val: sysArch, color: "bg-indigo-500", glow: "" }
                            ].map((stat, i) => (
                                <div key={i} className="space-y-5">
                                    <div className="flex justify-between text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                        <span className="group-hover:text-slate-700 transition-colors">{stat.label}</span>
                                        <span className="text-slate-900 font-mono">{stat.val}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-[1px]">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${stat.val}%` }}
                                            transition={{ duration: 1.5, delay: i * 0.2, ease: "circOut" }}
                                            className={clsx("h-full rounded-full transition-all", stat.color)} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button className="w-full py-6 rounded-3xl border border-blue-200 bg-blue-50 text-blue-700 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all duration-500 mt-16 relative overflow-hidden group/btn shadow-sm">
                        Optimize_Synapse
                    </button>
                </div>
            </div>
        </div>
    );
});

const SettingsTab = ({ data }: StudentProfileViewProps) => {
    const [reportEmail, setReportEmail] = useState(data.faculty_report_email || "");
    const [studentEmail, setStudentEmail] = useState(data.email || "");
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
    
    // Email verification state
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [pendingEmail, setPendingEmail] = useState("");

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            await userApi.settings({ faculty_report_email: reportEmail });
            setSaveStatus("success");
            setTimeout(() => setSaveStatus("idle"), 3000);
        } catch (err) {
            setSaveStatus("error");
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSendVerification = async () => {
        if (!studentEmail || !studentEmail.includes("@")) {
            alert("Please enter a valid email address");
            return;
        }
        
        setIsSendingOtp(true);
        try {
            await userApi.sendVerificationEmail(studentEmail);
            setPendingEmail(studentEmail);
            setShowOtpModal(true);
            setOtpError("");
        } catch (err: any) {
            alert(err.response?.data?.detail || "Failed to send verification code");
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            setOtpError("Please enter a 6-digit code");
            return;
        }
        
        setIsVerifying(true);
        setOtpError("");
        try {
            await userApi.verifyEmail(pendingEmail, otp);
            setShowOtpModal(false);
            setOtp("");
            setSaveStatus("success");
            // Refresh the page data
            window.location.reload();
        } catch (err: any) {
            setOtpError(err.response?.data?.detail || "Invalid or expired code");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <>
            {showOtpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <KeyRound className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Verify Email</h3>
                            <p className="text-slate-500 text-sm mt-2">Enter the 6-digit code sent to</p>
                            <p className="text-primary font-bold">{pendingEmail}</p>
                        </div>
                        
                        <div className="space-y-6">
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                placeholder="000000"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-8 py-6 text-center text-3xl font-black tracking-[0.5em] text-slate-900 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                maxLength={6}
                            />
                            
                            {otpError && (
                                <p className="text-rose-400 text-sm text-center font-medium">{otpError}</p>
                            )}
                            
                            <div className="flex gap-4">
                                <button
                                    onClick={() => { setShowOtpModal(false); setOtp(""); }}
                                    className="flex-1 py-4 rounded-2xl border border-slate-200 text-slate-600 font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleVerifyOtp}
                                    disabled={isVerifying || otp.length !== 6}
                                    className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-bold uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
                                >
                                    {isVerifying ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Verify"}
                                </button>
                            </div>
                            
                            <p className="text-slate-600 text-xs text-center">Code expires in 10 minutes</p>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="p-8 rounded-[2.5rem] border border-blue-100 bg-white shadow-sm">
                <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tight uppercase">Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-1">
                    <div className="space-y-12">
                        <div className="space-y-8">
                            <div>
                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] mb-10">Neural Profile</h4>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Identity_Alias</p>
                                        <p className="text-xl font-black text-slate-900 tracking-tight">@{data.username}</p>
                                    </div>
                                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 text-slate-600 italic">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Secure_Email</p>
                                        <p className="text-sm font-bold truncate">{data.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Email Update Section for Students and Faculty */}
                            {(data.role === "student") && (
                                <div className="pt-12 border-t border-slate-100">
                                    <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3 uppercase tracking-tight">
                                        <Mail className="w-5 h-5 text-blue-600" />
                                        Update Email
                                    </h3>
                                    <p className="text-base text-slate-500 mb-6 font-medium">Add or update your email for notifications.</p>
                                    <div className="space-y-4">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Email Address</label>
                                            <input
                                                type="email"
                                                value={studentEmail}
                                                onChange={(e) => setStudentEmail(e.target.value)}
                                                placeholder="your@email.com"
                                                className="w-full bg-slate-50 px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none transition-all font-bold text-slate-900 placeholder-slate-400 tracking-wider"
                                            />
                                        </div>
                                        <button
                                            onClick={handleSendVerification}
                                            disabled={isSendingOtp}
                                            className="w-full py-4 rounded-2xl bg-primary text-black font-bold uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-gray-500/50 cursor-pointer hover:bg-slate-300/70"
                                        >
                                            {isSendingOtp ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                                            {isSendingOtp ? "Sending Code..." : "Send Verification Code"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Faculty Reporting Section */}
                            {data.role === "faculty" && (
                                <div className="pt-12 border-t border-slate-100">
                                    <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-4 uppercase tracking-tight">
                                        <MessageSquare className="w-6 h-6 text-amber-500" />
                                        Reporting_Uplink
                                    </h3>
                                    <p className="text-base text-slate-500 mb-10 font-medium">Define target endpoint for encrypted student behavior archives.</p>
                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2 font-mono">Endpoint Address</label>
                                            <input
                                                type="email"
                                                value={reportEmail}
                                                onChange={(e) => setReportEmail(e.target.value)}
                                                placeholder="faculty@example.com"
                                                className="w-full bg-slate-50 px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-bold text-slate-900 placeholder-slate-400 tracking-wider"
                                            />
                                        </div>
                                        <button
                                            onClick={handleSaveSettings}
                                            disabled={isSaving}
                                            className={clsx(
                                                "group relative px-10 py-5 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] transition-all overflow-hidden shadow-2xl",
                                                saveStatus === "success" ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-primary text-white"
                                            )}
                                        >
                                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            {isSaving ? "SYNCING..." : (
                                                saveStatus === "success" ? <><Check className="w-5 h-5 inline mr-2" /> UPLINK_SYNCED</> : <><Save className="w-5 h-5 inline mr-2" /> Establish Link</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* <div className="space-y-8 py-10">
                        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-lg relative overflow-hidden group hover:scale-[1.01] transition-transform border border-white/5">
                            <div className="relative z-10">
                                <h3 className="text-xl font-black mb-4 uppercase tracking-tight text-blue-400">Platform Status</h3>
                                <div className="flex items-center gap-6 bg-white/5 p-6 rounded-[2.5rem] border border-white/10 group-hover:bg-white/10 transition-all">
                                    <div className="p-4 rounded-2xl bg-white/5">
                                        <Globe className="w-8 h-8 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-300">GitHub Vault</p>
                                        <p className="text-[10px] font-bold text-slate-500 tracking-wider">
                                            {data.github_id ? `SYNCED_AS @${data.username}` : "LINK_REQUIRED"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -bottom-20 -right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
                        </div>
                    </div> */}
                </div>
            </div>
        </>
    );
};

const ProgressGuideTab = ({ data }: StudentProfileViewProps) => {
    return (
        <div className="space-y-12 pb-12">
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12">
                <div className="flex items-center gap-6">
                    <div className="h-16 w-1.5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.3)]" />
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Learning Adventure</h1>
                        <p className="text-slate-500 font-medium text-base mt-2 uppercase tracking-wide">Track your MiniCode journey with gamified quests</p>
                    </div>
                </div>
                <a href="/progress" className="flex items-center gap-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-[2.5rem] font-black text-sm hover:shadow-2xl hover:shadow-blue-600/20 transition-all shadow-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Rocket className="w-5 h-5 pr-1" />
                    VIEW FULL PROGRESS
                </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-[2.5rem] border border-blue-100 hover:border-blue-300 transition-all group flex flex-col justify-between shadow-sm">
                    <div>
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-8 group-hover:scale-105 transition-transform shadow-lg shadow-blue-500/20">
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">Quest System</h4>
                        <p className="text-[12px] text-slate-500 leading-relaxed font-medium uppercase tracking-wide">Complete progressive challenges to earn XP and unlock achievements</p>
                    </div>
                    <div className="mt-8 pt-8 border-t border-blue-200">
                        <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                            <Target className="w-4 h-4" />
                            4 Active Quests
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-[2.5rem] border border-purple-100 hover:border-purple-300 transition-all group flex flex-col justify-between shadow-sm">
                    <div>
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mb-8 group-hover:scale-105 transition-transform shadow-lg shadow-purple-500/20">
                            <Trophy className="w-7 h-7 text-white" />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">Achievement Hall</h4>
                        <p className="text-[12px] text-slate-500 leading-relaxed font-medium uppercase tracking-wide">Unlock bronze, silver, and gold achievements as you progress</p>
                    </div>
                    <div className="mt-8 pt-8 border-t border-purple-200">
                        <div className="flex items-center gap-2 text-[10px] font-black text-purple-600 uppercase tracking-widest">
                            <Award className="w-4 h-4" />
                            6 Achievement Tiers
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-[2.5rem] border border-amber-100 hover:border-amber-300 transition-all group flex flex-col justify-between shadow-sm">
                    <div>
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mb-8 group-hover:scale-105 transition-transform shadow-lg shadow-amber-500/20">
                            <Crown className="w-7 h-7 text-white" />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">Level System</h4>
                        <p className="text-[12px] text-slate-500 leading-relaxed font-medium uppercase tracking-wide">Progress through Explorer, Adventurer, and Master levels</p>
                    </div>
                    <div className="mt-8 pt-8 border-t border-amber-200">
                        <div className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-widest">
                            <TrendingUp className="w-4 h-4" />
                            3 Mastery Levels
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tight uppercase flex items-center gap-3">
                    <Play className="w-6 h-6 text-blue-500" />
                    Quick Start Guide
                </h3>
                <div className="space-y-6">
                    {[
                        { step: 1, title: "Start Your First Quest", desc: "Click on any available quest and begin completing mission steps" },
                        { step: 2, title: "Earn Experience Points", desc: "Complete quests to earn XP and level up your account" },
                        { step: 3, title: "Unlock Achievements", desc: "Achieve milestones to unlock bronze, silver, and gold achievements" },
                        { step: 4, title: "Track Your Progress", desc: "Watch your stats grow and compete on the leaderboard" }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-6 p-6 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-100 hover:border-blue-200 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-black text-white text-lg">
                                {item.step}
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{item.title}</h4>
                                <p className="text-sm text-slate-500 font-medium mt-1">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const HelpTab = memo((_props: StudentProfileViewProps) => (
    <div className="space-y-12 pb-12">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12">
            <div className="flex items-center gap-6">
                <div className="h-16 w-1.5 bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.3)]" />
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Help Center</h1>
                    <p className="text-slate-500 font-medium text-base mt-2 uppercase tracking-wide">Documentation and support access</p>
                </div>
            </div>
            <a href="https://discord.gg/minicode" target="_blank" className="flex items-center gap-4 bg-[#5865F2] text-white px-10 py-5 rounded-[2.5rem] font-black text-sm hover:shadow-[#5865F2]/20 transition-all shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <MessageSquare className="w-5 h-5 pr-1" />
                JOIN_HQ_SERVER
            </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {[
                { title: "Core Protocols", icon: BookOpen, desc: "Fundamental rules of the Minicode environment and credit allocation." },
                { title: "Leaderboard Analytics", icon: Activity, iconColor: "text-amber-500", desc: "Understanding rank decay, global weights, and seasonal resets." },
                { title: "Repository Workflow", icon: Code2, iconColor: "text-emerald-500", desc: "Technical breakdown of multi-stage problem solving and testing." }
            ].map((section, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-blue-100 hover:border-blue-300 transition-all group flex flex-col justify-between shadow-sm">
                    <div>
                        <div className={clsx("w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center mb-8 group-hover:scale-105 transition-transform", section.iconColor || "text-blue-600")}>
                            <section.icon className="w-7 h-7" />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">{section.title}</h4>
                        <p className="text-[12px] text-slate-500 leading-relaxed font-medium uppercase tracking-wide">{section.desc}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
));

const SovereignTab = ({ data }: StudentProfileViewProps) => {
    const [amount, setAmount] = useState(10);
    const [reason, setReason] = useState("");
    const [isAwarding, setIsAwarding] = useState(false);
    const [awardStatus, setAwardStatus] = useState<"idle" | "success" | "error">("idle");

    const handleAward = async () => {
        setIsAwarding(true);
        setAwardStatus("idle");
        try {
            await api.post(`/faculty/award-xp/${data.username}`, { amount, reason });
            setAwardStatus("success");
            setTimeout(() => setAwardStatus("idle"), 3000);
        } catch (err) {
            console.error("Failed to award XP", err);
            setAwardStatus("error");
        } finally {
            setIsAwarding(false);
        }
    };

    return (
        <div className="space-y-12 pb-12">
            <div className="flex items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Sovereign Override</h1>
                    <p className="text-slate-500 font-medium text-base mt-2 uppercase tracking-wide">Direct credit award for @{data.username}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-sm space-y-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 font-mono">Award Amount (XP)</label>
                        <div className="flex items-center gap-4">
                            {[10, 50, 100, 500].map(val => (
                                <button
                                    key={val}
                                    onClick={() => setAmount(val)}
                                    className={clsx(
                                        "flex-1 py-4 rounded-2xl font-black text-xs transition-all border",
                                        amount === val ? "bg-blue-600 text-white border-blue-600 shadow-lg" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-blue-50 hover:border-blue-300"
                                    )}
                                >
                                    +{val}
                                </button>
                            ))}
                        </div>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-black focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400"
                            placeholder="Custom Amount..."
                        />
                    </div>

                    <div className="space-y-6">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2 font-mono">Operational Reason</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Enter justification for manual XP award..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/50 min-h-[120px] resize-none"
                        />
                    </div>

                    <button
                        onClick={handleAward}
                        disabled={isAwarding || amount <= 0}
                        className={clsx(
                            "w-full p-1 group relative rounded-[2rem] transition-all duration-300 shadow-2xl",
                            awardStatus === "success" ? "bg-emerald-500 shadow-emerald-500/20" : "bg-blue-600 shadow-blue-600/20 hover:shadow-blue-600/40"
                        )}
                    >
                        <span className="relative z-10 flex items-center justify-center gap-3 w-full py-6 rounded-[1.8rem] bg-white/10 backdrop-blur-sm border border-white/20 text-white font-black text-sm uppercase tracking-widest transition-all group-hover:bg-white/20">
                            {isAwarding ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    SYNCING_INFUSION...
                                </>
                            ) : (
                                awardStatus === "success" ? (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        OVERRIDE_SUCCESSFUL
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5" />
                                        Execute Sovereign Override
                                    </>
                                )
                            )}
                        </span>
                    </button>
                </div>

                <div className="space-y-8">
                    <div className="bg-slate-50 p-10 rounded-[3rem] border border-blue-100">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-500" /> Administrative Protocol
                        </h4>
                        <ul className="space-y-4">
                            {[
                                "Manual XP updates are recorded in the audit logs permanently.",
                                "Leaderboard synchronization occurs immediately post-transmission.",
                                "A Sovereign Override notification will be sent to the student.",
                                "This action cannot be reverted via the standard interface."
                            ].map((note, i) => (
                                <li key={i} className="flex gap-3 text-[11px] text-slate-500 font-medium leading-relaxed uppercase tracking-tight">
                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-200 shrink-0 mt-1" />
                                    {note}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
