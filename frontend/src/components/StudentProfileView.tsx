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
    Globe,
    ExternalLink,
    ArrowUpRight,
    Cpu,
    MousePointer2,
    Database,
    BookOpen,
    ChevronRight,
    Code2
} from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import MagneticWrapper from "./MagneticWrapper";

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

interface StudentProfileViewProps {
    data: ProfileData;
    isFacultyView?: boolean;
}

const statusColor = (status: string) => {
    switch (status) {
        case "accepted": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
        case "wrong_answer": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
        case "pending": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
        case "error": case "runtime_error": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
        default: return "text-slate-400 bg-white/5 border-white/10";
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
        "bg-white/5",
        "bg-primary/20",
        "bg-primary/40 shadow-[0_0_10px_rgba(137,91,245,0.1)]",
        "bg-primary/60 shadow-[0_0_15px_rgba(137,91,245,0.2)]",
        "bg-primary shadow-[0_0_20px_rgba(137,91,245,0.3)]",
    ];

    return (
        <div className="glass-card p-8 rounded-[3rem] border border-white/10 relative overflow-hidden group shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
                <div className="flex items-center gap-6">
                    <div className="h-12 w-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(137,91,245,0.3)]" />
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-tight">Execution History</h3>
                        <p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.3em] mt-1.5">Temporal logic sample distribution</p>
                    </div>
                </div>
                <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-center min-w-[140px]">
                    <p className="text-xl font-black text-white">{Object.values(contributionDataRaw).reduce((sum, c) => sum + (c || 0), 0)}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Total Signals</p>
                </div>
            </div>

            <div className="h-12 mb-8 flex items-center justify-center border-b border-dashed border-white/10">
                <AnimatePresence mode="wait">
                    {hoveredDay ? (
                        <motion.div
                            key="hovered"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-4"
                        >
                            <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                {new Date(hoveredDay.date).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="text-[11px] font-black text-primary uppercase tracking-widest">
                                {hoveredDay.count} SUCCESSFUL OPS
                            </span>
                        </motion.div>
                    ) : (
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.5em] italic">Scan matrix tiles for authority data</p>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex flex-col min-w-0">
                <div className="relative h-6 mb-2 ml-10">
                    {monthLabels.map((m, i) => (
                        <span key={i} className="absolute text-[9px] font-black text-slate-500 uppercase tracking-widest" style={{ left: `${m.weekIndex * (16 + 6)}px` }}>{m.month}</span>
                    ))}
                </div>
                <div className="flex">
                    <div className="flex flex-col justify-between mr-4 text-[9px] font-black text-slate-600 uppercase py-1">
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
                                            "w-3.5 h-3.5 rounded-sm transition-colors duration-200 relative",
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
    <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 flex flex-col justify-between overflow-hidden relative group">
        <div className="flex justify-between items-start mb-6">
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10">
                <Icon className="w-6 h-6 text-primary" />
            </div>
            <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg">{trend}</span>
        </div>
        <div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2">{label}</p>
            <h3 className="text-4xl font-black text-white tracking-tighter">{value}</h3>
        </div>
    </div>
));

export default function StudentProfileView({ data, isFacultyView = false }: StudentProfileViewProps) {
    const [activeTab, setActiveTab] = useState("dashboard");

    const sidebarItems = useMemo(() => [
        { id: "dashboard", label: "Dashboard", icon: Activity },
        { id: "submissions", label: "Submissions", icon: Code2 },
        { id: "achievements", label: "Achievements", icon: Trophy },
        { id: "insights", label: "Insights", icon: Zap },
        { id: "settings", label: "Settings", icon: Settings },
        { id: "help", label: "Help Center", icon: BookOpen },
        ...(isFacultyView ? [{ id: "sovereign", label: "Sovereign Override", icon: Shield }] : [])
    ], [isFacultyView]);

    const renderContent = () => {
        const props: StudentProfileViewProps = { data, isFacultyView };
        switch (activeTab) {
            case "dashboard": return <DashboardTab {...props} />;
            case "submissions": return <SubmissionsTab {...props} />;
            case "achievements": return <AchievementsTab {...props} />;
            case "insights": return <InsightsTab {...props} />;
            case "settings": return <SettingsTab {...props} />;
            case "help": return <HelpTab {...props} />;
            case "sovereign": return <SovereignTab {...props} />;
            default: return <DashboardTab {...props} />;
        }
    };

    return (
        <div className="min-h-screen bg-black text-slate-300 font-sans selection:bg-primary/30 selection:text-white pt-24 pb-12 overflow-x-hidden">
            <div className="container mx-auto px-6 relative">
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/5 blur-[120px] rounded-full" />
                </div>

                <div className="flex flex-col lg:flex-row gap-12 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="w-full lg:w-96 shrink-0 space-y-8"
                    >
                        <div className="glass-card p-6 rounded-[2.5rem] border border-white/10 shadow-xl text-center relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="relative inline-block mb-6">
                                    <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-primary/20 shadow-xl relative group-hover:border-primary/40 transition-colors">
                                        <img src={data.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`} alt={data.username} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-primary text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-lg shadow-primary/20">
                                        {data.stats.level}
                                    </div>
                                </div>
                                <h2 className="text-2xl font-black text-white tracking-tight uppercase">{data.full_name}</h2>
                                <p className="text-primary font-black text-[10px] mt-2 tracking-[0.2em] uppercase">{data.stats.level_name}</p>
                            </div>
                        </div>

                        <nav className="glass-card p-2 rounded-3xl border border-white/10 shadow-xl overflow-hidden">
                            {sidebarItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={clsx(
                                        "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group relative",
                                        activeTab === item.id ? "bg-white/10 text-white" : "hover:bg-white/5 text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    {activeTab === item.id && <div className="absolute left-2 w-1 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(137,91,245,0.6)]" />}
                                    <item.icon className={clsx("w-5 h-5 shrink-0 transition-transform duration-300", activeTab === item.id ? "scale-110" : "group-hover:scale-110")} />
                                    <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </motion.div>

                    <main className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {renderContent()}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    );
}

const DashboardTab = memo(({ data }: StudentProfileViewProps) => {
    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                <MetricTile icon={Trophy} label="SOLVED_REPOS" value={data.stats.solved} trend="+12%" />
                <MetricTile icon={Zap} label="CURRENT_XP" value={data.stats.xp.toLocaleString()} trend="TOP 2%" />
                <MetricTile icon={Activity} label="WORLD_RANK" value={`#${data.stats.rank}`} trend="↑ 45" />
                <MetricTile icon={Code2} label="BURN_STREAK" value={data.stats.streak} trend="Days" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                <div className="xl:col-span-2 space-y-12">
                    <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 shadow-lg relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                    <Activity className="w-6 h-6 text-primary" />
                                    Activity History
                                </h3>
                                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Live Telemetry</span>
                                </div>
                            </div>
                            <ContributionGraph contributionData={Object.entries(data.contribution_data).map(([date, count]) => ({ date, count, level: count > 10 ? 4 : count > 5 ? 3 : count > 2 ? 2 : count > 0 ? 1 : 0 }))} contributionDataRaw={data.contribution_data} stats={data.stats} />
                        </div>
                    </div>

                    <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 shadow-lg relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tight">
                                <Code2 className="w-6 h-6 text-indigo-400" />
                                Recent Activity
                            </h3>
                            <div className="space-y-4">
                                {data.recentSubmissions.slice(0, 5).map((sub, i) => (
                                    <div key={sub.id} className="group/item flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer">
                                        <div className="flex items-center gap-6">
                                            <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center font-black text-[10px]", statusColor(sub.status))}>
                                                {statusLabel(sub.status)}
                                            </div>
                                            <div>
                                                <p className="font-black text-white text-base tracking-tight">{sub.problem || "Untitled Fragment"}</p>
                                                <p className="text-slate-500 text-[9px] font-bold mt-0.5 uppercase tracking-widest">{new Date(sub.time).toLocaleDateString()} // v{String(sub.id).slice(0, 4)}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-700 group-hover/item:text-white transition-colors" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* <div className="space-y-12">
                    <div className="glass-card p-10 rounded-[3.5rem] bg-primary shadow-xl relative overflow-hidden group">
                        <div className="relative z-10 text-white">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-3 opacity-70">Strategic_Alliance</p>
                            <h3 className="text-2xl font-black mb-8 leading-tight">Sync your neural interface with GitHub.</h3>
                            <div className="bg-white/10 p-6 rounded-[2.5rem] backdrop-blur-xl border border-white/10">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                                        <Globe className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-widest">Connection_Status</p>
                                        <p className="text-[10px] font-bold text-white/50 tracking-wider">ENCRYPTED_UPLINK</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
                    </div>

                    <div className="glass-card p-10 rounded-[3.5rem] border border-white/10 shadow-xl bg-slate-900 overflow-hidden relative group">
                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-white mb-8 uppercase tracking-tight flex items-center justify-between">
                                Sector_Leaderboard
                                <span className="text-[10px] font-black text-primary px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 tracking-widest">OMNI_GRID</span>
                            </h3>
                            <div className="space-y-6">
                                {data.leaderboard?.slice(0, 5).map((entry, i) => (
                                    <div key={entry.username} className={clsx("flex items-center justify-between p-4 rounded-2xl transition-all", entry.username === data.username ? "bg-primary/20 border border-primary/30" : "hover:bg-white/5")}>
                                        <div className="flex items-center gap-5">
                                            <span className={clsx("text-sm font-black w-6", i === 0 ? "text-amber-400" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-800" : "text-slate-600")}>{i + 1}</span>
                                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10">
                                                <img src={entry.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.username}`} className="w-full h-full object-cover" />
                                            </div>
                                            <span className={clsx("text-sm font-black tracking-tight transition-colors", entry.username === data.username ? "text-white" : "text-slate-400")}>@{entry.username}</span>
                                        </div>
                                        <span className="text-xs font-black text-slate-500 font-mono">{entry.score.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div> */}
            </div>
        </div>
    );
});

const SubmissionsTab = memo(({ data }: StudentProfileViewProps) => (
    <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 shadow-lg animate-in fade-in duration-500">
        <h3 className="text-xl font-black text-white mb-8 tracking-tight uppercase">Submission History</h3>
        <div className="space-y-6">
            {data.recentSubmissions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-10">
                        <div className={clsx("px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest", statusColor(sub.status))}>
                            {statusLabel(sub.status)}
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-white tracking-tight uppercase">{sub.problem || "Problem Name"}</h4>
                            <div className="flex items-center gap-6 mt-2">
                                <span className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
                                    <Activity className="w-3.5 h-3.5" /> {String(sub.id).slice(0, 8)}
                                </span>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">TIMESTAMP: {new Date(sub.time).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
));

const AchievementsTab = memo((_props: StudentProfileViewProps) => (
    <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 shadow-lg animate-in fade-in duration-500">
        <h3 className="text-xl font-black text-white mb-8 tracking-tight uppercase">Honor Logs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {[
                { title: "Day_0_Veteran", desc: "Initialized neural link on launch day.", icon: Trophy, color: "text-amber-400" },
                { title: "Bug_Hunter", desc: "Detected and neutralized 10 code anomalies.", icon: Zap, color: "text-indigo-400" },
                { title: "Speed_Demon", desc: "Solved a complex repo in under 5 minutes.", icon: Activity, color: "text-rose-400" }
            ].map((ach, i) => (
                <div key={i} className="p-10 rounded-[3rem] bg-white/[0.03] border border-white/5 hover:border-primary/30 transition-all group">
                    <div className={clsx("w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 bg-white/5 group-hover:scale-105 transition-transform", ach.color)}>
                        <ach.icon className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-black text-white mb-3 uppercase tracking-tight">{ach.title}</h4>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed">{ach.desc}</p>
                </div>
            ))}
        </div>
    </div>
));

const InsightsTab = memo((_props: StudentProfileViewProps) => (
    <div className="space-y-12 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
            <div className="xl:col-span-2 glass-card p-8 rounded-[2.5rem] border border-white/10 text-white relative overflow-hidden bg-slate-950">
                <h3 className="text-xl font-black mb-8 flex items-center gap-3 uppercase tracking-tight">
                    <Activity className="w-6 h-6 text-emerald-400" />
                    Problem Solving Velocity
                </h3>
                <div className="h-96 w-full flex items-end gap-3 pb-8">
                    {[30, 45, 60, 40, 85, 55, 70, 95, 65, 80, 50, 75].map((h, i) => (
                        <div key={i} className="flex-1 bg-gradient-to-t from-primary/80 to-primary/20 rounded-t-xl group relative" style={{ height: `${h}%` }}>
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black px-3 py-1.5 rounded-lg text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                VELO_{h}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    <span>Phase_Start</span>
                    <span>Mid_Sequence</span>
                    <span>Current_Node</span>
                </div>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 bg-slate-900 flex flex-col justify-between">
                <div>
                    <h3 className="text-lg font-black text-white mb-8 uppercase tracking-tight">Logic Proficiency</h3>
                    <div className="space-y-10">
                        {[
                            { label: "ALGORITHMIC_LOGIC", val: 88, color: "bg-emerald-500" },
                            { label: "DEBUG_PRECISION", val: 94, color: "bg-primary" },
                            { label: "SYSTEM_ARCHITECTURE", val: 72, color: "bg-indigo-500" }
                        ].map((stat, i) => (
                            <div key={i} className="space-y-4">
                                <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                    <span>{stat.label}</span>
                                    <span className="text-white">{stat.val}%</span>
                                </div>
                                <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className={clsx("h-full transition-all duration-1000", stat.color)} style={{ width: `${stat.val}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <button className="w-full py-5 rounded-[2rem] border border-primary/30 bg-primary/10 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all mt-12">
                    Optimize_Neural_Map
                </button>
            </div>
        </div>
    </div>
));

const SettingsTab = ({ data }: StudentProfileViewProps) => {
    const [reportEmail, setReportEmail] = useState(data.faculty_report_email || "");
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            await api.put("/user/settings", { faculty_report_email: reportEmail });
            setSaveStatus("success");
            setTimeout(() => setSaveStatus("idle"), 3000);
        } catch (err) {
            setSaveStatus("error");
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 shadow-xl animate-in fade-in duration-700">
            <h3 className="text-xl font-black text-white mb-8 tracking-tight uppercase">Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-12">
                    <div className="space-y-8">
                        <div>
                            <h4 className="text-sm font-black text-slate-500 uppercase tracking-[0.4em] mb-8">Neural Profile</h4>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5">
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Identity_Alias</p>
                                    <p className="text-xl font-black text-white tracking-tight">@{data.username}</p>
                                </div>
                                <div className="bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5 text-slate-500 italic">
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Secure_Email</p>
                                    <p className="text-sm font-bold truncate opacity-50">{data.email}</p>
                                </div>
                            </div>
                        </div>

                        {data.role === "faculty" && (
                            <div className="pt-12 border-t border-white/5">
                                <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-4 uppercase tracking-tight">
                                    <MessageSquare className="w-6 h-6 text-amber-400" />
                                    Reporting_Uplink
                                </h3>
                                <p className="text-base text-slate-500 mb-10 font-medium">Define target endpoint for encrypted student behavior archives.</p>
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2 font-mono">Endpoint Address</label>
                                        <input
                                            type="email"
                                            value={reportEmail}
                                            onChange={(e) => setReportEmail(e.target.value)}
                                            placeholder="faculty@example.com"
                                            className="w-full bg-white/[0.03] px-6 py-4 rounded-2xl border-2 border-white/5 focus:border-primary focus:ring-8 focus:ring-primary/10 outline-none transition-all font-black text-white placeholder-slate-700 tracking-wider"
                                        />
                                    </div>
                                    <MagneticWrapper>
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
                                    </MagneticWrapper>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="glass-card p-10 rounded-[3.5rem] bg-slate-900 border border-white/10 overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-white mb-8 uppercase tracking-tight">Security Perimeter</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between group/line cursor-help">
                                    <span className="text-sm font-bold text-slate-500 group-hover/line:text-slate-300 transition-colors uppercase tracking-tight">Multi-Factor Gateway</span>
                                    <span className="text-[10px] font-black text-emerald-400 uppercase bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">ENFORCED</span>
                                </div>
                                <div className="flex items-center justify-between group/line cursor-help">
                                    <span className="text-sm font-bold text-slate-500 group-hover/line:text-slate-300 transition-colors uppercase tracking-tight">Packet Encryption</span>
                                    <span className="text-[10px] font-black text-emerald-400 uppercase bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">AES-256</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary p-8 rounded-[2.5rem] text-white shadow-lg relative overflow-hidden group hover:scale-[1.01] transition-transform">
                        <div className="relative z-10">
                            <h3 className="text-xl font-black mb-4 uppercase tracking-tight">Platform Status</h3>
                            <div className="flex items-center gap-6 bg-white/10 p-6 rounded-[2.5rem] backdrop-blur-xl border border-white/10 group-hover:bg-white/20 transition-all">
                                <div className="p-4 rounded-2xl bg-white/10">
                                    <Globe className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-widest">GitHub Vault</p>
                                    <p className="text-[10px] font-bold text-white/50 tracking-wider">SYNCED_AS @{data.username}</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-20 -right-10 w-64 h-64 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const HelpTab = memo((_props: StudentProfileViewProps) => (
    <div className="space-y-12 animate-in fade-in duration-500 pb-12">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12">
            <div className="flex items-center gap-6">
                <div className="h-16 w-1.5 bg-primary rounded-full shadow-[0_0_20px_rgba(137,91,245,0.3)]" />
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase">Help Center</h1>
                    <p className="text-slate-500 font-medium text-base mt-2 uppercase tracking-wide">Documentation and support access</p>
                </div>
            </div>
            <MagneticWrapper>
                <a href="https://discord.gg/minicode" target="_blank" className="flex items-center gap-4 bg-[#5865F2] text-white px-10 py-5 rounded-[2.5rem] font-black text-sm hover:shadow-[#5865F2]/20 transition-all shadow-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <MessageSquare className="w-5 h-5 pr-1" />
                    JOIN_HQ_SERVER
                </a>
            </MagneticWrapper>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {[
                { title: "Core Protocols", icon: BookOpen, desc: "Fundamental rules of the Minicode environment and credit allocation." },
                { title: "Leaderboard Analytics", icon: Activity, iconColor: "text-amber-500", desc: "Understanding rank decay, global weights, and seasonal resets." },
                { title: "Repository Workflow", icon: Code2, iconColor: "text-emerald-500", desc: "Technical breakdown of multi-stage problem solving and testing." }
            ].map((section, i) => (
                <div key={i} className="glass-card p-8 rounded-[2.5rem] border border-white/10 hover:border-primary/50 transition-all group flex flex-col justify-between">
                    <div>
                        <div className={clsx("w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-105 transition-transform", section.iconColor || "text-primary")}>
                            <section.icon className="w-7 h-7" />
                        </div>
                        <h4 className="text-xl font-black text-white mb-4 uppercase tracking-tight">{section.title}</h4>
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
        <div className="space-y-12 animate-in fade-in duration-700 pb-12">
            <div className="flex items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase">Sovereign Override</h1>
                    <p className="text-slate-500 font-medium text-base mt-2 uppercase tracking-wide">Direct credit award for @{data.username}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 shadow-xl space-y-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 font-mono">Award Amount (XP)</label>
                        <div className="flex items-center gap-4">
                            {[10, 50, 100, 500].map(val => (
                                <button
                                    key={val}
                                    onClick={() => setAmount(val)}
                                    className={clsx(
                                        "flex-1 py-4 rounded-2xl font-black text-xs transition-all border",
                                        amount === val ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
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
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-black focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="Custom Amount..."
                        />
                    </div>

                    <div className="space-y-6">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2 font-mono">Operational Reason</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Enter justification for manual XP award..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px] resize-none"
                        />
                    </div>

                    <MagneticWrapper>
                        <button
                            onClick={handleAward}
                            disabled={isAwarding || amount <= 0}
                            className={clsx(
                                "w-full py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all relative overflow-hidden shadow-2xl",
                                awardStatus === "success" ? "bg-emerald-500 text-white shadow-emerald-500/40" : "bg-primary text-white hover:shadow-primary/40"
                            )}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                {isAwarding ? "INITIALIZING INFUSION..." : (
                                    awardStatus === "success" ? <><CheckCircle className="w-5 h-5" /> OVERRIDE_SUCCESSFUL</> : <><Zap className="w-5 h-5" /> Execute Sovereign Override</>
                                )}
                            </span>
                        </button>
                    </MagneticWrapper>
                </div>

                <div className="space-y-8">
                    <div className="glass-card p-10 rounded-[3rem] bg-indigo-500/5 border border-indigo-500/10">
                        <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-500" /> Administrative Protocol
                        </h4>
                        <ul className="space-y-4">
                            {[
                                "Manual XP updates are recorded in the audit logs permanently.",
                                "Leaderboard synchronization occurs immediately post-transmission.",
                                "A Sovereign Override notification will be sent to the student.",
                                "This action cannot be reverted via the standard interface."
                            ].map((note, i) => (
                                <li key={i} className="flex gap-3 text-[11px] text-slate-400 font-medium leading-relaxed uppercase tracking-tight">
                                    <div className="h-1.5 w-1.5 rounded-full bg-slate-700 shrink-0 mt-1" />
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
