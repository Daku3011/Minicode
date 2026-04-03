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
    Globe,
    ExternalLink,
    ArrowUpRight,
    Cpu,
    MousePointer2,
    Database
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

const ContributionGraph = React.memo(function ContributionGraph({ contributionData, contributionDataRaw, stats }: {
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
        "bg-primary/40 shadow-[0_0_10px_rgba(137,91,245,0.2)]",
        "bg-primary/60 shadow-[0_0_15px_rgba(137,91,245,0.3)]",
        "bg-primary shadow-[0_0_20px_rgba(137,91,245,0.5)]",
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 rounded-[3rem] border border-white/10 relative overflow-hidden group shadow-3xl"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
                <div className="flex items-center gap-6">
                    <div className="h-12 w-1.5 bg-primary rounded-full shadow-[0_0_15px_rgba(137,91,245,0.5)]" />
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-tight">Execution History</h3>
                        <p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.3em] mt-1.5">Temporal logic sample distribution</p>
                    </div>
                </div>
                <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-center min-w-[140px] group-hover:border-primary/30 transition-colors">
                    <p className="text-xl font-black text-white">{Object.values(contributionDataRaw).reduce((sum, c) => sum + (c || 0), 0)}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Total Signals</p>
                </div>
            </div>

            <div className="h-12 mb-8 flex items-center justify-center border-b border-dashed border-white/10">
                <AnimatePresence mode="wait">
                    {hoveredDay ? (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="flex items-center gap-4"
                        >
                            <div className="h-1.5 w-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(137,91,245,0.8)]" />
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                {new Date(hoveredDay.date).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="text-[11px] font-black text-primary uppercase tracking-widest">
                                {hoveredDay.count} SUCCESSFUL OPS
                            </span>
                        </motion.div>
                    ) : (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.5em] italic">Scan matrix tiles for authority data</motion.p>
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
                        <div className="h-4 flex items-center">S</div>
                        <div className="h-4 flex items-center opacity-0">M</div>
                        <div className="h-4 flex items-center">T</div>
                        <div className="h-4 flex items-center opacity-0">W</div>
                        <div className="h-4 flex items-center">T</div>
                        <div className="h-4 flex items-center opacity-0">F</div>
                        <div className="h-4 flex items-center">S</div>
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto pb-4 scrollbar-hide py-1">
                        {weeks.map((week, wi) => (
                            <div key={wi} className="flex flex-col gap-1.5 shrink-0">
                                {week.map((day, di) => (
                                    <motion.div
                                        key={di}
                                        whileHover={{ scale: 1.1, zIndex: 10 }}
                                        onMouseEnter={() => setHoveredDay({ date: day.date, count: day.count })}
                                        onMouseLeave={() => setHoveredDay(null)}
                                        className={clsx(
                                            "w-4 h-4 rounded-md cursor-crosshair transition-colors duration-300",
                                            levelColors[day.level]
                                        )}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/5">
                <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    <span>Minimum Intensity</span>
                    <div className="flex gap-1.5">
                        {levelColors.map((color, i) => (<div key={i} className={clsx("w-3 h-3 rounded-sm", color)} />))}
                    </div>
                    <span>Maximum Intensity</span>
                </div>
                <div className="flex gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active Streak: {stats.streak}D</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(137,91,245,0.5)]" />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Integrity Level: 1.0</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

const MetricTile = React.memo(function MetricTile({ icon, iconColor, label, value, subLabel, progress, index }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -2 }}
            className="glass-card p-10 rounded-[2.5rem] border border-white/10 flex flex-col justify-between overflow-hidden relative group"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

            <div className="flex justify-between items-start mb-10 relative z-10">
                <div className={clsx(
                    "h-14 w-14 rounded-2xl flex items-center justify-center shadow-2xl relative transition-all duration-300",
                    "bg-white/5 border border-white/10 group-hover:border-primary/50 group-hover:bg-primary/5 group-hover:shadow-primary/20"
                )}>
                    {React.cloneElement(icon as React.ReactElement<any>, { className: clsx("w-6 h-6 transition-transform group-hover:scale-110", iconColor) })}
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] group-hover:text-primary group-hover:border-primary/20 transition-all">
                    {subLabel}
                </div>
            </div>

            <div className="relative z-10">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-3 opacity-60 group-hover:opacity-100 transition-opacity">{label}</p>
                <h3 className="text-5xl font-black text-white tracking-tighter group-hover:text-primary transition-colors flex items-baseline gap-2">
                    {value}
                </h3>
            </div>

            <div className="mt-10 relative z-10">
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 + (index * 0.05) }}
                        className={clsx("h-full rounded-full shadow-[0_0_20px_rgba(137,91,245,0.3)]", "bg-primary")}
                    />
                </div>
            </div>

            {/* Subtle decorative Glow */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </motion.div>
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
        { icon: <TrendingUp />, label: "Operations", id: "dashboard" },
        { icon: <Terminal />, label: "Archives", id: "submissions" },
        { icon: <Award />, label: "Authority", id: "achievements" },
        { icon: <BarChart2 />, label: "Diagnostics", id: "insights" },
    ], []);

    const sidebarSystem = useMemo(() => isFacultyView ? [] : [
        { icon: <Settings />, label: "Protocols", id: "settings" },
        { icon: <HelpCircle />, label: "Manuals", id: "docs" },
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

    const handleTabChange = (id: string) => {
        setActiveTab(id);
    };

    const renderDashboard = useCallback(() => (
        <div className="space-y-12 pb-12">
            {/* Header Identity */}
            <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pt-8"
            >
                <div className="flex items-center gap-10">
                    <MagneticWrapper>
                        <div className="relative group">
                            <div className="w-40 h-40 rounded-[3rem] p-1 bg-gradient-to-br from-primary via-secondary to-primary bg-[length:300%_300%] animate-gradient-x shadow-3xl relative">
                                <div className="absolute inset-0 rounded-[3rem] bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <div className="w-full h-full rounded-[2.8rem] bg-slate-900 overflow-hidden border-4 border-slate-900 relative z-10">
                                    {data.avatar_url ? (
                                        <img src={data.avatar_url} alt={data.username} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-black text-4xl text-white/20 group-hover:text-primary transition-colors">
                                            {data.username.slice(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Rank Badge Floating */}
                            <motion.div
                                animate={{ y: [0, -2, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -bottom-3 -right-3 px-6 py-2.5 rounded-2xl bg-primary shadow-2xl border border-white/20 text-[11px] font-black text-white uppercase tracking-[0.3em] z-20 shadow-primary/20"
                            >
                                RANK #{myRank || "---"}
                            </motion.div>
                        </div>
                    </MagneticWrapper>

                    <div>
                        <div className="flex items-center gap-6 mb-4">
                            <h1 className="text-6xl font-black text-white tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/40">
                                {isFacultyView ? data.username : "IDENTITY_RECOGNIZED"}
                            </h1>
                            <span className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-primary uppercase tracking-[0.5em] shadow-inner">
                                {stats.level_name}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-2 w-32 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                                <div className="h-full bg-primary rounded-full w-2/3 shadow-[0_0_10px_rgba(137,91,245,0.4)]" />
                            </div>
                            <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em] flex items-center gap-3">
                                <Activity className="w-4 h-4 text-primary" />
                                SYNC_STATUS: ACTIVE_NODE
                            </p>
                        </div>
                    </div>
                </div>

                {!isFacultyView && (
                    <MagneticWrapper>
                        <Link href="/problems" className="group relative px-12 py-6 rounded-[2.5rem] bg-primary text-white font-black text-xs uppercase tracking-[0.4em] overflow-hidden shadow-2xl transition-all hover:shadow-primary/50 hover:-translate-y-1 active:translate-y-0">
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="relative z-10 flex items-center gap-4">
                                <Terminal className="w-5 h-5 transition-transform group-hover:rotate-12" />
                                EXECUTE_UPLINK
                            </span>
                        </Link>
                    </MagneticWrapper>
                )}
            </motion.div>

            {/* Metrics Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <MetricTile
                    icon={<Terminal />}
                    iconColor="text-primary"
                    label="Protocols Resolved"
                    value={stats.solved}
                    subLabel={`${Math.round((stats.solved / (problems.length || 1)) * 100)}% COMPLETION`}
                    progress={(stats.solved / (problems.length || 1)) * 100}
                    index={0}
                />
                <MetricTile
                    icon={<Database />}
                    iconColor="text-sky-400"
                    label="Operation History"
                    value={recentSubmissions.length}
                    subLabel="LOGGED SIGNALS"
                    progress={Math.min(recentSubmissions.length * 5, 100)}
                    index={1}
                />
                <MetricTile
                    icon={<Flame />}
                    iconColor="text-emerald-400"
                    label="Temporal Streak"
                    value={`${stats.streak}D`}
                    subLabel="CONSECUTIVE UPLINK"
                    progress={Math.min(stats.streak * 20, 100)}
                    index={2}
                />
                <MetricTile
                    icon={<Cpu />}
                    iconColor="text-amber-400"
                    label="Authority Level"
                    value={stats.xp}
                    subLabel="KINETIC XP POINTS"
                    progress={Math.min(stats.xp / 10, 100)}
                    index={3}
                />
            </div>

            {/* Large Activity Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-8">
                    <ContributionGraph contributionData={contributionData} contributionDataRaw={contributionDataRaw} stats={stats} />

                    {/* Insights Quick Bar */}
                    {/* <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="glass-card p-10 rounded-[3rem] border border-white/10 flex flex-wrap gap-12"
                    >
                        <div className="flex flex-col gap-2">
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Latency</span>
                             <span className="text-2xl font-black text-white">0.04ms</span>
                        </div>
                        <div className="flex flex-col gap-2">
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Compiler Bias</span>
                             <span className="text-2xl font-black text-emerald-400">OPTIMIZED</span>
                        </div>
                        <div className="flex flex-col gap-2">
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Memory Footprint</span>
                             <span className="text-2xl font-black text-white">4.2GB</span>
                        </div>
                    </motion.div> */}
                </div>

                <div className="space-y-8">
                    {/* Recent Feed */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-8 rounded-[3rem] border border-white/10 min-h-[400px]"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <h4 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-3">
                                <Clock className="w-5 h-5 text-primary" /> Live Data Feed
                            </h4>
                        </div>

                        <div className="space-y-6">
                            {recentSubmissions.slice(0, 5).map((sub, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + (i * 0.1) }}
                                    key={sub.id}
                                    className="flex items-center gap-5 p-4 rounded-[1.5rem] bg-white/5 border border-white/10 hover:border-primary/30 transition-all cursor-pointer group"
                                >
                                    <div className={clsx(
                                        "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
                                        sub.status === "accepted" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                                    )}>
                                        {sub.status === "accepted" ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black text-white truncate uppercase tracking-wider">{sub.problem}</p>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span className={clsx("text-[9px] font-black uppercase tracking-widest", sub.status === "accepted" ? "text-emerald-500" : "text-rose-500")}>
                                                {statusLabel(sub.status)}
                                            </span>
                                            <div className="w-1 h-1 rounded-full bg-slate-700" />
                                            <span className="text-[9px] text-slate-500 font-bold">{sub.time}</span>
                                        </div>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-slate-700 group-hover:text-primary transition-colors pr-2" />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Pro Card */}
                    {/* <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-primary/20 via-primary/40 to-primary/20 p-10 rounded-[3rem] border border-primary/40 shadow-3xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-8">
                            <Shield className="w-12 h-12 text-white/5 group-hover:text-white/20 transition-colors duration-700" />
                        </div>
                        <h4 className="font-black text-white text-lg mb-4 flex items-center gap-3 relative z-10 transition-all">
                            CRYPTO_AUTH
                        </h4>
                        <div className="space-y-4 relative z-10">
                            <div className="flex flex-col"> 
                                <span className="text-[9px] text-white/60 uppercase font-black tracking-[0.4em]">Subsystem</span>
                                <span className="font-mono text-xs font-bold text-white tracking-widest uppercase mt-1">Tier-One Sovereign</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] text-white/60 uppercase font-black tracking-[0.4em]">Encryption</span>
                                <span className="text-xs font-black text-primary bg-white/10 px-2 py-1 rounded inline-block w-fit mt-1">AES-256-GCM</span>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                    </motion.div> */}
                </div>
            </div>
        </div>
    ), [contributionData, contributionDataRaw, stats, recentSubmissions, isFacultyView, data, problems.length, myRank]);

    const renderSubmissions = useCallback(() => (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-700 pb-12 pt-8">
            <div className="flex items-center gap-8">
                <div className="h-20 w-2 bg-gradient-to-b from-primary to-secondary rounded-full shadow-[0_0_25px_rgba(137,91,245,0.6)]" />
                <div>
                    <h1 className="text-6xl font-black text-white tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-br from-white to-white/50">
                        {isFacultyView ? `${data.username}.log` : "SUBMISSION_ARCHIVE"}
                    </h1>
                    <p className="text-[11px] font-black text-slate-500 mt-3 tracking-[0.5em] uppercase flex items-center gap-3">
                        <Database className="w-4 h-4 text-primary" /> Recovered historical packets
                    </p>
                </div>
            </div>

            <div className="glass-card rounded-[3.5rem] border border-white/10 overflow-hidden shadow-edge relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.03] border-b border-white/5">
                                <th className="px-12 py-10 text-[11px] uppercase font-black text-slate-500 tracking-[0.4em]">Sequence</th>
                                <th className="px-12 py-10 text-[11px] uppercase font-black text-slate-500 tracking-[0.4em]">Protocol Identifier</th>
                                <th className="px-12 py-10 text-[11px] uppercase font-black text-slate-500 tracking-[0.4em]">Final State</th>
                                <th className="px-12 py-10 text-[11px] uppercase font-black text-slate-500 tracking-[0.4em]">Temporal Stamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {recentSubmissions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-10 py-32 text-center">
                                        <Database className="w-12 h-12 text-slate-800 mx-auto mb-6 opacity-30" />
                                        <p className="text-slate-600 font-black uppercase tracking-[0.6em] text-xs">No records detected in buffer</p>
                                    </td>
                                </tr>
                            ) : (
                                recentSubmissions.map((sub, i) => (
                                    <motion.tr
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={sub.id}
                                        className="hover:bg-primary/[0.03] transition-colors group cursor-pointer"
                                    >
                                        <td className="px-10 py-8">
                                            <span className="text-sm font-bold font-mono text-slate-500 group-hover:text-primary transition-colors">0x{sub.id.toString(16).padStart(4, '0').toUpperCase()}</span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="h-2 w-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                                <span className="text-sm font-black text-white group-hover:translate-x-1 transition-transform">{sub.problem}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={clsx(
                                                "px-4 py-2 rounded-xl text-[10px] font-black border tracking-[0.2em] inline-block",
                                                statusColor(sub.status)
                                            )}>
                                                {statusLabel(sub.status)}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-xs font-black text-slate-500 tracking-wider">
                                            {sub.time}
                                        </td>
                                    </motion.tr>
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
            { name: "INITIATION", desc: "Successfully resolved first challenge uplink", icon: <Award />, earned: stats.solved >= 1, color: "text-indigo-400" },
            { name: "RESILIENCE", desc: "Maintain a 3-day consecutive active synchronization", icon: <Flame />, earned: stats.streak >= 3, color: "text-emerald-400" },
            { name: "AUTHORITY", desc: "Resolved 5 high-priority logic scenarios", icon: <Zap />, earned: stats.solved >= 5, color: "text-sky-400" },
            { name: "SUPREMACY", desc: "Achieved Tier-One Global Ranking position", icon: <Trophy />, earned: myRank > 0 && myRank <= 10, color: "text-amber-400" },
            { name: "XP OVERRIDE", desc: "Accumulated over 100 power units", icon: <Stars />, earned: stats.xp >= 100, color: "text-rose-400" },
            { name: "MONITOR", desc: "Complete judicial monitoring assigned", icon: <Shield />, earned: stats.solved >= problems.length && problems.length > 0, color: "text-purple-400" },
        ];
        return (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="h-16 w-1.5 bg-primary rounded-full shadow-[0_0_20px_rgba(137,91,245,0.5)]" />
                        <div>
                            <h1 className="text-5xl font-black text-white tracking-tight">AUTHORITY_NODES</h1>
                            <p className="text-slate-500 font-medium text-lg mt-2 uppercase tracking-wide">Merit distribution across the global grid</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {badges.map((b, i) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            key={b.name}
                            className={clsx(
                                "glass-card p-10 rounded-[3rem] border relative overflow-hidden flex flex-col items-center text-center group",
                                b.earned ? "border-white/10 hover:border-primary/40 transition-all shadow-2xl" : "border-white/5 opacity-30 grayscale"
                            )}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

                            <div className={clsx(
                                "h-20 w-20 rounded-[2rem] mb-8 flex items-center justify-center transition-all duration-700 relative",
                                b.earned ? "bg-white/5 text-white shadow-[0_0_30px_rgba(137,91,245,0.2)]" : "bg-white/5 text-slate-800"
                            )}>
                                {React.cloneElement(b.icon as React.ReactElement<any>, { className: clsx("w-10 h-10", b.earned && b.color) })}
                                {b.earned && (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                        className="absolute -inset-3 border border-dashed border-primary/20 rounded-full"
                                    />
                                )}
                            </div>

                            <h4 className="font-black text-white text-xl uppercase tracking-tighter mb-4 group-hover:text-primary transition-colors">{b.name}</h4>
                            <p className="text-xs text-slate-500 uppercase font-black tracking-widest leading-relaxed mb-8">{b.desc}</p>

                            {b.earned ? (
                                <div className="px-6 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em] relative z-10 shadow-lg">
                                    NODE_ACTIVE
                                </div>
                            ) : (
                                <div className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] relative z-10">
                                    LOCKED_DATA
                                </div>
                            )}
                        </motion.div>
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
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12">
                <div className="flex items-center gap-6">
                    <div className="h-16 w-1.5 bg-primary rounded-full shadow-[0_0_20px_rgba(137,91,245,0.5)]" />
                    <div>
                        <h1 className="text-5xl font-black text-white tracking-tight">CORE_DIAGNOSTICS</h1>
                        <p className="text-slate-500 font-medium text-lg mt-2 uppercase tracking-wide">Neural assessment of student logic patterns</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <motion.div whileHover={{ y: -5 }} className="glass-card p-12 rounded-[3.5rem] border border-white/10 text-center shadow-3xl bg-gradient-to-br from-emerald-500/5 to-transparent">
                        <p className="text-7xl font-black text-emerald-400 tracking-tighter mb-4">{successRate}%</p>
                        <p className="text-[12px] text-slate-500 uppercase tracking-[0.4em] font-black">Success Ratio</p>
                    </motion.div>
                    <motion.div whileHover={{ y: -5 }} className="glass-card p-12 rounded-[3.5rem] border border-white/10 text-center shadow-3xl bg-gradient-to-br from-primary/5 to-transparent">
                        <p className="text-7xl font-black text-white tracking-tighter mb-4">{acceptedCount}</p>
                        <p className="text-[12px] text-slate-500 uppercase tracking-[0.4em] font-black">Valid Cycles</p>
                    </motion.div>
                    <motion.div whileHover={{ y: -5 }} className="glass-card p-12 rounded-[3.5rem] border border-white/10 text-center shadow-3xl bg-gradient-to-br from-rose-500/5 to-transparent">
                        <p className="text-7xl font-black text-rose-400 tracking-tighter mb-4">{failedCount}</p>
                        <p className="text-[12px] text-slate-500 uppercase tracking-[0.4em] font-black">Memory Leaks</p>
                    </motion.div>
                </div>

                <div className="glass-card p-12 rounded-[3.5rem] border border-dashed border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                        <Activity className="w-40 h-40 text-primary" />
                    </div>
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h3 className="text-2xl font-black text-white mb-6">Autonomous Evaluation</h3>
                        <p className="text-lg text-slate-400 font-medium leading-relaxed italic">
                            "Neural trajectory mapping confirms a high-probability of success in advanced cryptographic roles based on synchronization of {recentSubmissions.length} independent logic samples logged since registration."
                        </p>
                    </div>
                </div>
            </div>
        );
    }, [recentSubmissions.length]);

    const renderSettings = useCallback(() => (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12">
            <div className="flex items-center gap-6">
                <div className="h-16 w-1.5 bg-primary rounded-full shadow-[0_0_20px_rgba(137,91,245,0.5)]" />
                <div>
                    <h1 className="text-5xl font-black text-white tracking-tight tracking-tighter capitalize">PROTOCOL_SET</h1>
                    <p className="text-slate-500 font-medium text-lg mt-2 uppercase tracking-wide">Core credential management and system preferences</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card p-12 rounded-[3.5rem] border border-white/10 shadow-3xl space-y-12 pb-16">
                        <div>
                            <h3 className="text-2xl font-black text-white mb-10 flex items-center gap-4">
                                <UserCheck className="w-6 h-6 text-primary" />
                                Static Profile Mapping
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Identity UUID</label>
                                    <div className="bg-white/5 px-6 py-5 rounded-[2rem] border border-white/10 text-sm font-black text-white tracking-widest shadow-inner">
                                        {data.username}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Communication Node</label>
                                    <div className="bg-white/5 px-6 py-5 rounded-[2rem] border border-white/10 text-sm font-black text-slate-400 tracking-wider">
                                        {data.email}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {data.role === "faculty" && (
                            <div className="pt-12 border-t border-white/5">
                                <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-4">
                                    <MessageSquare className="w-6 h-6 text-amber-400" />
                                    Reporting Uplink
                                </h3>
                                <p className="text-lg text-slate-500 mb-10 font-medium">Define target endpoint for encrypted student behavior archives.</p>
                                <div className="space-y-8 max-w-xl">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Endpoint Address</label>
                                        <input
                                            type="email"
                                            value={reportEmail}
                                            onChange={(e) => setReportEmail(e.target.value)}
                                            placeholder="RECIPIENT@HOST.DOMAIN"
                                            className="w-full bg-white/[0.03] px-8 py-5 rounded-[2rem] border-2 border-white/5 focus:border-primary focus:ring-8 focus:ring-primary/10 outline-none transition-all font-black text-white placeholder-slate-700 tracking-wider"
                                        />
                                    </div>
                                    <MagneticWrapper>
                                        <button
                                            onClick={handleSaveSettings}
                                            disabled={isSaving}
                                            className={clsx(
                                                "group relative px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all overflow-hidden shadow-2xl",
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
                    <motion.div initial={{ x: 20 }} animate={{ x: 0 }} className="glass-card p-10 rounded-[3.5rem] bg-slate-900 border border-white/10 overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-white mb-8">Security Perimeter</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between group/line cursor-help">
                                    <span className="text-sm font-bold text-slate-500 group-hover/line:text-slate-300 transition-colors">Multi-Factor Gateway</span>
                                    <span className="text-[10px] font-black text-emerald-400 uppercase bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">ENFORCED</span>
                                </div>
                                <div className="flex items-center justify-between group/line cursor-help">
                                    <span className="text-sm font-bold text-slate-500 group-hover/line:text-slate-300 transition-colors">Packet Encryption</span>
                                    <span className="text-[10px] font-black text-emerald-400 uppercase bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">AES-256</span>
                                </div>
                                <div className="pt-8 border-t border-white/5">
                                    <button className="text-[10px] font-black text-slate-600 hover:text-white transition-colors uppercase tracking-[0.4em]">Rotate Security Tokens</button>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>

                    <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="bg-primary p-12 rounded-[3.5rem] text-white shadow-3xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black mb-4">Uplink Status</h3>
                            <div className="flex items-center gap-6 bg-white/10 p-6 rounded-[2.5rem] backdrop-blur-xl border border-white/10 group-hover:bg-white/20 transition-all">
                                <div className="p-4 rounded-2xl bg-white/10">
                                    <Globe className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-sm font-black uppercase tracking-widest">GitHub Vault</p>
                                    <p className="text-[10px] font-bold text-white/50 tracking-wider">SYNCED_AS @{data.username}</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-20 -right-10 w-64 h-64 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
                    </motion.div>
                </div>
            </div>
        </div>
    ), [data, reportEmail, isSaving, saveStatus, handleSaveSettings]);

    const renderHelp = useCallback(() => (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12">
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12">
                <div className="flex items-center gap-6">
                    <div className="h-16 w-1.5 bg-primary rounded-full shadow-[0_0_20px_rgba(137,91,245,0.5)]" />
                    <div>
                        <h1 className="text-5xl font-black text-white tracking-tight uppercase">USER_MANUALS</h1>
                        <p className="text-slate-500 font-medium text-lg mt-2 uppercase tracking-wide">Centralized operations and documentation access portal</p>
                    </div>
                </div>
                <MagneticWrapper>
                    <a href="https://discord.gg/minicode" target="_blank" className="flex items-center gap-4 bg-[#5865F2] text-white px-10 py-5 rounded-[2.5rem] font-black text-sm hover:shadow-[#5865F2]/40 transition-shadow shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <MessageSquare className="w-5 h-5 pr-1" />
                        JOIN_HQ_SERVER
                    </a>
                </MagneticWrapper>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    { title: "Judgement Cycle", desc: "Understanding the asynchronous evaluation and judge feedback mechanisms.", icon: <Code />, color: "text-primary" },
                    { title: "Grid Economics", desc: "How XP and merit points are distributed across the ranking algorithm.", icon: <Stars />, color: "text-emerald-400" },
                    { title: "Judicial Integrity", desc: "Policies regarding code derivation and anti-plagiarism protocols.", icon: <Shield />, color: "text-rose-400" },
                ].map((item, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={item.title}
                        className="glass-card p-12 rounded-[3.5rem] border border-white/10 hover:border-primary/50 transition-all group"
                    >
                        <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-primary/40 transition-all duration-500">
                            {React.cloneElement(item.icon as React.ReactElement<any>, { className: clsx("w-8 h-8", item.color) })}
                        </div>
                        <h3 className="text-2xl font-black text-white mb-4 tracking-tighter">{item.title}</h3>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed mb-10">{item.desc}</p>
                        <button className="text-[10px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-3 group-hover:gap-5 transition-all">
                            Access Protocol <ArrowRight className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </div>

            <div className="glass-card p-16 rounded-[4rem] text-center bg-gradient-to-br from-primary/10 via-transparent to-transparent border border-white/10 relative overflow-hidden group">
                <div className="relative z-10 max-w-2xl mx-auto">
                    <h2 className="text-5xl font-black text-white tracking-tighter mb-8 group-hover:scale-[1.02] transition-transform">Emergency Intervention?</h2>
                    <p className="text-xl text-slate-400 font-medium leading-relaxed mb-12">If judge synchronization fails or account credentials become desynced, contact the operational commanders in the secure channel for a manual reset.</p>
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <MagneticWrapper>
                            <button className="bg-white text-slate-900 px-12 py-5 rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-slate-100 transition-colors">
                                Support Request
                            </button>
                        </MagneticWrapper>
                        <button className="px-12 py-5 rounded-[2.5rem] border-2 border-white/5 font-black text-sm uppercase tracking-widest text-slate-500 hover:text-white hover:border-white/20 transition-all">
                            Archive Wiki
                        </button>
                    </div>
                </div>
                <div className="absolute inset-0 bg-primary/5 blur-[100px] pointer-events-none" />
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
        <div className="min-h-[calc(100vh-112px)] selection:bg-primary selection:text-white relative flex flex-col lg:flex-row gap-1 border-t border-white/5">
            {/* Sidebar Glass Navigation */}
            <aside className="w-full lg:w-80 border-r border-white/10 flex flex-col shrink-0 relative z-30 pt-12 bg-black/20 backdrop-blur-3xl lg:h-[calc(100vh-112px)] lg:sticky lg:top-[112px]">
                <div className="px-10 mb-12">
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-secondary p-px shadow-lg shadow-primary/20">
                            <div className="w-full h-full rounded-2xl bg-[#0a0a14] flex items-center justify-center">
                                <Terminal className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-widest bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60">MINICODE</h2>
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em] mt-1">Sovereign_OS v3.0</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {sidebarItems.map((item) => (
                        <MagneticWrapper key={item.id}>
                            <button
                                onClick={() => handleTabChange(item.id)}
                                className={clsx(
                                    "w-full flex items-center gap-5 px-8 py-5 rounded-[2rem] text-[11px] font-black transition-all group relative overflow-hidden",
                                    activeTab === item.id
                                        ? "text-primary shadow-2xl bg-white/[0.05]"
                                        : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]"
                                )}
                            >
                                {activeTab === item.id && (
                                    <motion.div layoutId="nav-pill" className="absolute inset-0 bg-primary/[0.08] border border-primary/20 rounded-[2rem]" />
                                )}
                                <div className={clsx(
                                    "relative z-10 transition-transform group-hover:scale-110",
                                    activeTab === item.id ? "text-primary" : "text-slate-600 group-hover:text-slate-400"
                                )}>
                                    {React.cloneElement(item.icon as React.ReactElement<any>, { className: "w-5 h-5 shadow-primary/20" })}
                                </div>
                                <span className="relative z-10 uppercase tracking-[0.3em]">{item.label}</span>
                                {activeTab === item.id && (
                                    <motion.div
                                        layoutId="dot"
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute right-6 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_#895bf5]"
                                    />
                                )}
                            </button>
                        </MagneticWrapper>
                    ))}

                    <div className="py-6 px-10">
                        <div className="h-px bg-white/5 w-full" />
                    </div>

                    {sidebarSystem.map((item) => (
                        <MagneticWrapper key={item.id}>
                            <button
                                onClick={() => handleTabChange(item.id)}
                                className={clsx(
                                    "w-full flex items-center gap-5 px-8 py-5 rounded-[2rem] text-[11px] font-black transition-all group relative",
                                    activeTab === item.id
                                        ? "text-amber-400 shadow-2xl bg-white/[0.05]"
                                        : "text-slate-600 hover:text-slate-400 hover:bg-white/[0.02]"
                                )}
                            >
                                {activeTab === item.id && (
                                    <motion.div layoutId="nav-pill-system" className="absolute inset-0 bg-amber-400/[0.08] border border-amber-400/20 rounded-[2rem]" />
                                )}
                                <div className={clsx(
                                    "relative z-10 transition-transform group-hover:scale-110",
                                    activeTab === item.id ? "text-amber-400" : "text-slate-700"
                                )}>
                                    {React.cloneElement(item.icon as React.ReactElement<any>, { className: "w-5 h-5" })}
                                </div>
                                <span className="relative z-10 uppercase tracking-[0.3em]">{item.label}</span>
                            </button>
                        </MagneticWrapper>
                    ))}
                </nav>

                {/* <div className="p-6 mt-auto">
                     <div className="p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 text-center group hover:border-primary/20 transition-all shadow-inner">
                         <div className="relative inline-block mb-4">
                            <MousePointer2 className="w-8 h-8 text-primary mx-auto group-hover:animate-bounce relative z-10" />
                            <div className="absolute inset-0 bg-primary/20 blur-xl scale-150 animate-pulse" />
                         </div>
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Node Analytics</p>
                         <p className="text-[11px] font-black text-primary uppercase tracking-[0.6em] mt-2">LINK_ACTIVE</p>
                     </div>
                </div> */}
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 lg:h-[calc(100vh-112px)] overflow-y-auto scrollbar-hide pt-16 px-6 md:px-12 lg:px-20 relative z-20">
                <div className="max-w-[1200px] mx-auto relative z-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 15, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -15, filter: "blur(10px)" }}
                            transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
