"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { 
    LayoutDashboard, 
    Terminal, 
    Trophy, 
    BarChart3, 
    Settings, 
    BookOpen, 
    Flame, 
    Zap, 
    Star, 
    ChevronRight, 
    Activity, 
    Clock, 
    ShieldCheck, 
    Cpu,
    ArrowUpRight,
    Search,
    User,
    Mail,
    Calendar,
    Code2,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { clsx } from "clsx";

interface RecentSubmission {
    id: number;
    problem: string;
    status: string;
    time: string;
    score?: number;
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

    const [stats, setStats] = useState<ProfileStats>({ solved: 0, rank: 0, xp: 0, streak: 0 });
    const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [myRank, setMyRank] = useState(0);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const [meRes, problemsRes, leaderboardRes, submissionsRes] = await Promise.all([
                    api.get("/auth/me"),
                    api.get("/problems"),
                    api.get("/leaderboard"),
                    api.get("/submissions/me"),
                ]);

                const me = meRes.data;
                setStats(me.stats || { solved: 0, rank: 0, xp: 0, streak: 0 });
                const allSubmissions = submissionsRes.data.map((s: any) => ({
                    id: s.id,
                    problem: s.problem_title,
                    status: s.status,
                    time: new Date(s.timestamp).toLocaleString(),
                    score: s.score
                }));
                setRecentSubmissions(allSubmissions);
                setProblems(problemsRes.data || []);
                setLeaderboard(leaderboardRes.data || []);

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
        { icon: LayoutDashboard, label: "DASHBOARD", id: "dashboard" },
        { icon: Terminal, label: "SUBMISSIONS", id: "submissions" },
        { icon: Trophy, label: "ACHIEVEMENTS", id: "achievements" },
        { icon: BarChart3, label: "INSIGHTS", id: "insights" },
    ];

    const sidebarSystem = [
        { icon: Settings, label: "SETTINGS", id: "settings" },
        { icon: BookOpen, label: "PROTOCOL", id: "docs" },
    ];

    const statusLabel = (status: string) => {
        switch (status) {
            case "accepted": return "ACCEPTED";
            case "wrong_answer": return "FAILED";
            case "pending": return "PENDING";
            default: return status.toUpperCase();
        }
    };

    const difficultyColor = (d: string) => {
        switch (d?.toLowerCase()) {
            case "easy": return "text-emerald-500/60";
            case "medium": return "text-amber-500/60";
            case "hard": return "text-rose-500/60";
            default: return "text-foreground/40";
        }
    };

    // ========== TAB CONTENT RENDERERS ==========

    const renderDashboard = () => (
        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* User Profile Header: Cinematic Precision */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
                <div className="flex items-center gap-8">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl animate-pulse" />
                        <div className="relative w-24 h-24 rounded-[2.5rem] p-1 glass shadow-glass light-emission">
                            <img 
                                src={`https://ui-avatars.com/api/?name=${user?.username}&background=random`} 
                                alt="Avatar" 
                                className="w-full h-full rounded-[2rem] object-cover" 
                            />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tightest italic uppercase">
                            {user?.username || "OPERATIVE"}
                        </h1>
                        <div className="flex items-center gap-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary light-emission shadow-atmospheric" />
                            <p className="text-[10px] font-mono font-bold text-foreground/30 uppercase tracking-[0.5em] italic">NODE_SIG: {user?.email || "UNKNOWN"}</p>
                        </div>
                    </div>
                </div>
                <Link href="/problems" className="flex items-center gap-4 px-10 py-5 liquid-gradient text-primary-foreground rounded-2xl font-bold text-xs shadow-atmospheric hover:scale-105 active:scale-95 transition-all group">
                    <Activity className="w-4 h-4 group-hover:animate-pulse" />
                    <span className="uppercase tracking-[0.3em]">INITIALIZE_ARENA</span>
                </Link>
            </div>

            {/* Core Metrics: The Glass Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <MetricCard 
                    label="SOLVED_NODES" 
                    value={`${stats.solved}/${problems.length}`} 
                    subtext="TOTAL_DOMAIN_COVERAGE"
                    icon={Cpu}
                    progress={(stats.solved / (problems.length || 1)) * 100}
                />
                <MetricCard 
                    label="OP_ENTRIES" 
                    value={recentSubmissions.length.toString()} 
                    subtext="LIFETIME_SUBMISSIONS"
                    icon={Terminal}
                    progress={Math.min(recentSubmissions.length * 5, 100)}
                />
                <MetricCard 
                    label="ACTIVE_STREAK" 
                    value={`${stats.streak}D`} 
                    subtext="CONSECUTIVE_UPTIME"
                    icon={Flame}
                    progress={Math.min(stats.streak * 10, 100)}
                    variant="primary"
                />
                <MetricCard 
                    label="GLOBAL_RANK" 
                    value={myRank > 0 ? `#${myRank}` : "N/A"} 
                    subtext="HIERARCHY_POSITION"
                    icon={Trophy}
                    progress={myRank > 0 ? Math.max(100 - myRank, 10) : 0}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Performance Vector */}
                <div className="lg:col-span-2 glass rounded-[3.5rem] p-12 shadow-glass no-border-separation relative overflow-hidden group">
                    <div className="absolute top-[-10%] right-[-10%] p-10 text-primary/5 group-hover:rotate-12 transition-transform duration-1000">
                        <BarChart3 className="w-64 h-64" />
                    </div>
                    <div className="relative z-10 space-y-12">
                        <div className="space-y-2">
                            <h3 className="text-3xl font-bold tracking-tightest italic uppercase">Performance_Vector</h3>
                            <p className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.4em]">Node Output Analytics</p>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-10">
                            <div className="space-y-2 text-center">
                                <p className="text-5xl font-mono font-bold italic tracking-tighter text-primary light-emission">{stats.xp}</p>
                                <p className="text-[9px] font-mono font-bold text-foreground/30 uppercase tracking-[0.4em]">ACCUMULATED_XP</p>
                            </div>
                            <div className="space-y-2 text-center border-x border-white/5 px-4">
                                <p className="text-5xl font-mono font-bold italic tracking-tighter text-white">{stats.solved}</p>
                                <p className="text-[9px] font-mono font-bold text-foreground/30 uppercase tracking-[0.4em]">NODES_REIFIED</p>
                            </div>
                            <div className="space-y-2 text-center">
                                <p className="text-5xl font-mono font-bold italic tracking-tighter text-white">{myRank > 0 ? `#${myRank}` : "—"}</p>
                                <p className="text-[9px] font-mono font-bold text-foreground/30 uppercase tracking-[0.4em]">RANK_STATUS</p>
                            </div>
                        </div>

                        {/* Difficulty Distribution Chart */}
                        <div className="space-y-8 pt-6">
                            <h4 className="text-[10px] font-mono font-bold text-foreground/30 uppercase tracking-[0.6em]">DOMAIN_DIFFICULTY_SPREAD</h4>
                            <div className="flex gap-4">
                                {["Easy", "Medium", "Hard"].map(d => {
                                    const rawCount = problems.filter(p => p.difficulty?.toLowerCase() === d.toLowerCase()).length;
                                    const solvedCount = 0; // Missing solved per difficulty in schema, but we can fake it or just show total count contextually
                                    return (
                                        <div key={d} className="flex-1 level-2 rounded-3xl p-6 text-center shadow-atmospheric group/diff hover:bg-primary/[0.04] transition-colors">
                                            <p className="text-2xl font-mono font-bold text-white mb-2">{rawCount}</p>
                                            <span className={clsx("text-[8px] font-mono font-bold px-3 py-1 rounded-full level-1 uppercase tracking-[0.3em]", difficultyColor(d))}>
                                                {d}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sub-Telemetry Stream */}
                <div className="space-y-8">
                    <div className="level-1 rounded-[3rem] p-10 shadow-atmospheric no-border-separation h-full">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-xl font-bold tracking-tightest italic uppercase">Live_Updates</h4>
                            <Clock className="w-4 h-4 text-foreground/20" />
                        </div>
                        {recentSubmissions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-center space-y-4">
                                <Terminal className="w-10 h-10 text-foreground/10" />
                                <p className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.4em]">Stream_Offline</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {recentSubmissions.slice(0, 5).map((sub) => (
                                    <div key={sub.id} className="flex items-center gap-4 group cursor-pointer">
                                        <div className={clsx(
                                            "w-2 h-10 rounded-full transition-all duration-500",
                                            sub.status === "accepted" ? "bg-emerald-500/40 group-hover:bg-emerald-500" : "bg-rose-500/40 group-hover:bg-rose-500"
                                        )} />
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <p className="text-xs font-bold text-white truncate uppercase tracking-[0.1em]">{sub.problem}</p>
                                            <div className="flex items-center justify-between">
                                                <p className={clsx("text-[8px] font-mono font-bold tracking-widest", sub.status === "accepted" ? "text-emerald-500/60" : "text-rose-500/60")}>
                                                    {statusLabel(sub.status)}
                                                </p>
                                                <p className="text-[8px] font-mono font-bold text-foreground/20 md:hidden xl:block">{sub.time.split(',')[0]}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSubmissions = () => (
        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tightest italic uppercase">Archives</h1>
                <div className="flex items-center gap-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-atmospheric light-emission" />
                    <p className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.5em] italic">Full_Operation_Logs // NODE_SYNC_SUCCESS</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {recentSubmissions.length === 0 ? (
                    <div className="level-1 rounded-[3rem] p-24 text-center space-y-6 shadow-atmospheric">
                        <Terminal className="w-16 h-16 mx-auto text-foreground/10" />
                        <div className="space-y-2">
                             <h4 className="text-2xl font-bold tracking-tightest italic uppercase text-foreground/20">Empty_Set</h4>
                             <p className="text-[10px] font-mono font-bold text-foreground/10 uppercase tracking-[0.4em]">No historical data detected on current pulse.</p>
                        </div>
                        <Link href="/problems" className="inline-block text-[10px] font-mono font-bold text-primary uppercase tracking-[0.6em] hover:tracking-[0.8em] transition-all">GENERATE_TRAFFIC →</Link>
                    </div>
                ) : (
                    recentSubmissions.map((sub) => (
                        <div key={sub.id} className="group level-1 rounded-[3rem] p-8 pr-12 flex items-center justify-between hover:bg-primary/[0.02] transition-all shadow-atmospheric no-border-separation">
                            <div className="flex items-center gap-10">
                                <div className="w-16 text-center">
                                    <span className="text-2xl font-mono font-bold italic text-foreground/10 group-hover:text-primary/20 transition-colors uppercase tracking-tightest">
                                        #{sub.id.toString().padStart(3, '0')}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-2xl font-bold italic tracking-tightest uppercase text-white group-hover:text-primary transition-colors">{sub.problem}</h4>
                                    <p className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.3em]">{sub.time}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-12">
                                <div className="text-right space-y-3">
                                    <div className={clsx(
                                        "px-6 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-[0.4em] level-2 shadow-atmospheric light-emission",
                                        sub.status === "accepted" ? "text-emerald-500/80" : "text-rose-500/80"
                                    )}>
                                        {statusLabel(sub.status)}
                                    </div>
                                    <p className="text-[8px] font-mono font-bold text-foreground/20 uppercase tracking-[0.4em] italic">SCORE_WEIGHT: {sub.score || 0}%</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    const renderAchievements = () => {
        const badges = [
            { name: "FIRST_BLOOD", desc: "Solitary node reification success", icon: Zap, earned: stats.solved >= 1, color: "text-primary" },
            { name: "UPTIME_VIBRANT", desc: "Maintained 3-cycle operational streak", icon: Flame, earned: stats.streak >= 3, color: "text-amber-500" },
            { name: "LOGIC_CRUSHER", desc: "Overcame 5 architectural challenges", icon: Cpu, earned: stats.solved >= 5, color: "text-blue-500" },
            { name: "ELITE_TIER", desc: "Reached top 10 within hierarchy", icon: Trophy, earned: myRank > 0 && myRank <= 10, color: "text-emerald-500" },
            { name: "XP_MAXIMA", desc: "Accumulated 100+ precision units", icon: Star, earned: stats.xp >= 100, color: "text-rose-500" },
            { name: "DOMAIN_MASTER", desc: "Total logic domain coverage achieved", icon: ShieldCheck, earned: stats.solved >= problems.length && problems.length > 0, color: "text-indigo-500" },
        ];
        return (
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tightest italic uppercase">Artifacts</h1>
                    <div className="flex items-center gap-4">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-atmospheric light-emission" />
                        <p className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.5em] italic">Evolutionary_Milestones_Detected</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {badges.map((b) => (
                        <div key={b.name} className={clsx(
                            "group level-1 rounded-[3.5rem] p-10 text-center transition-all duration-700 shadow-atmospheric no-border-separation relative overflow-hidden",
                            !b.earned ? "opacity-20 grayscale scale-[0.98]" : "hover:scale-[1.02] hover:bg-primary/[0.02]"
                        )}>
                            <div className={clsx(
                                "h-20 w-20 rounded-[2rem] mx-auto mb-8 flex items-center justify-center transition-all duration-700",
                                b.earned ? "glass shadow-glass light-emission" : "level-2"
                            )}>
                                <b.icon className={clsx("w-10 h-10", b.earned ? b.color : "text-foreground/20")} />
                            </div>
                            <div className="space-y-3">
                                <h4 className={clsx("text-xl font-bold italic tracking-tightest uppercase", b.earned ? "text-white" : "text-foreground/20")}>{b.name}</h4>
                                <p className="text-[9px] font-mono font-bold text-foreground/20 uppercase tracking-widest leading-relaxed">{b.desc}</p>
                            </div>
                            {b.earned && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/20 blur-[2px] light-emission" />
                            )}
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
            <div className="space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tightest italic uppercase">Insights</h1>
                    <p className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.5em] italic px-2">Telemetric_Deep_Dive</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <InsightCard label="EFFICIENCY_RATIO" value={`${successRate}%`} icon={Zap} color="text-emerald-500" />
                    <InsightCard label="ACCEPTED_FLOWS" value={acceptedCount.toString()} icon={CheckCircle2} color="text-primary" />
                    <InsightCard label="LOGIC_LEAKAGE" value={failedCount.toString()} icon={AlertCircle} color="text-rose-500" />
                </div>

                {/* Leaderboard snapshot */}
                <div className="space-y-12">
                     <div className="space-y-1 px-4">
                        <h3 className="text-3xl font-bold tracking-tightest italic uppercase">Hierarchy_Pulse</h3>
                        <p className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.4em]">Real-time Position Vector</p>
                    </div>

                    <div className="glass rounded-[4rem] p-1 shadow-glass no-border-separation overflow-hidden">
                        <table className="w-full text-left font-mono">
                            <thead>
                                <tr className="level-2 text-[9px] font-bold text-white/40 uppercase tracking-[0.4em] italic">
                                    <th className="px-10 py-6">RANK</th>
                                    <th className="px-10 py-6">OPERATIVE</th>
                                    <th className="px-10 py-6">XP_SCORE</th>
                                    <th className="px-10 py-6 text-right">SOLVED</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {leaderboard.slice(0, 5).map((entry) => (
                                    <tr key={entry.rank} className={clsx(
                                        "hover:bg-primary/[0.04] transition-colors group",
                                        entry.username === user?.username ? "bg-primary/[0.03]" : ""
                                    )}>
                                        <td className="px-10 py-8 text-xl font-bold italic tracking-tighter text-foreground/20 group-hover:text-primary/40 transition-colors">
                                            #{entry.rank.toString().padStart(2, '0')}
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className="h-10 w-10 rounded-xl glass shadow-glass flex items-center justify-center p-0.5">
                                                    <img src={`https://ui-avatars.com/api/?name=${entry.name}&background=random`} className="rounded-lg h-full w-full object-cover grayscale opacity-60" alt="" />
                                                </div>
                                                <span className="text-sm font-bold text-white/50 uppercase tracking-widest group-hover:text-white transition-all">{entry.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-xl font-bold text-primary/40 tabular-nums italic">{entry.score}</td>
                                        <td className="px-10 py-8 text-right font-bold text-white/20">{entry.problems.toString().padStart(2, '0')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderSettings = () => (
        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tightest italic uppercase">Config</h1>
                <p className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.5em] italic px-2">Hardware_Interface_Settings</p>
            </div>

            <div className="glass rounded-[4rem] p-16 shadow-glass no-border-separation space-y-16">
                <div>
                    <h3 className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.6em] mb-12 italic border-b border-primary/10 pb-4">PILOT_IDENTIFICATION</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <label className="block text-[9px] font-mono font-bold text-foreground/20 uppercase tracking-[0.4em] px-2 italic">NODE_USERNAME</label>
                            <div className="px-8 py-4 level-1 rounded-[2rem] text-sm font-mono font-bold text-foreground/60 shadow-atmospheric border border-white/5 tracking-widest">
                                {user?.username}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="block text-[9px] font-mono font-bold text-foreground/20 uppercase tracking-[0.4em] px-2 italic">COMMS_LINK</label>
                            <div className="px-8 py-4 level-1 rounded-[2rem] text-sm font-mono font-bold text-foreground/60 shadow-atmospheric border border-white/5 tracking-widest truncate">
                                {user?.email}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="block text-[9px] font-mono font-bold text-foreground/20 uppercase tracking-[0.4em] px-2 italic">ACCESS_ROLE</label>
                            <div className="px-8 py-4 level-1 rounded-[2rem] text-sm font-mono font-bold text-primary uppercase shadow-atmospheric border border-white/5 tracking-widest">
                                {user?.role || "STUDENT"}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="block text-[9px] font-mono font-bold text-foreground/20 uppercase tracking-[0.4em] px-2 italic">JOIN_TIMESTAMP</label>
                            <div className="px-8 py-4 level-1 rounded-[2rem] text-sm font-mono font-bold text-foreground/60 shadow-atmospheric border border-white/5 tracking-widest">
                                {user?.created_at?.split('T')[0] || "SYSTEM_GENESIS"}
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.6em] mb-12 italic border-b border-primary/10 pb-4">SECURE_CHANNELS</h3>
                    <div className="flex items-center gap-10 p-10 level-1 rounded-[3.5rem] shadow-atmospheric no-border-separation hover:bg-primary/[0.04] transition-all">
                        <div className="h-16 w-16 glass rounded-[2rem] flex items-center justify-center shadow-glass light-emission">
                            <img 
                                src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" 
                                className="h-10 w-10 invert brightness-100" 
                                alt="" 
                            />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl font-bold italic tracking-tightest uppercase text-white">GitHub_Protocol</p>
                            <p className="text-[9px] font-mono font-bold text-primary uppercase tracking-[0.4em] italic">Active_Connection: {user?.username}</p>
                        </div>
                        <div className="ml-auto px-8 py-3 rounded-full level-2 text-[8px] font-mono font-bold text-emerald-500 uppercase tracking-[0.6em] italic shadow-atmospheric">ENCRYPTED // VERIFIED</div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDocs = () => (
        <div className="space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tightest italic uppercase">Protocol</h1>
                <p className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.5em] italic px-2">Operational_Guidelines</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {[
                    { title: "DOMAIN_ENTRY", desc: "Initialize your session via GitHub OAuth to provision localized coding nodes.", icon: Zap, color: "text-primary" },
                    { title: "NODE_SYNC", desc: "Propagate logic changes via GitHub pull requests for real-time AI evaluation.", icon: Activity, color: "text-blue-500" },
                    { title: "TELEMETRY", desc: "Receive atmospheric feedback on logic complexity, correctness, and architecture.", icon: Cpu, color: "text-emerald-500" },
                    { title: "ASCENSION", desc: "Higher logic accuracy increases XP score and elevates hierarchical rank.", icon: Trophy, color: "text-amber-500" },
                ].map((doc) => (
                    <div key={doc.title} className="group level-1 rounded-[4rem] p-12 hover:bg-primary/[0.02] transition-all shadow-atmospheric no-border-separation relative overflow-hidden">
                        <div className="flex items-center gap-8 mb-8">
                             <div className="h-14 w-14 glass rounded-[1.5rem] flex items-center justify-center shadow-glass light-emission">
                                <doc.icon className={clsx("w-7 h-7", doc.color)} />
                            </div>
                            <h4 className="text-2xl font-bold italic tracking-tightest uppercase text-white group-hover:text-primary transition-colors">{doc.title}</h4>
                        </div>
                        <p className="text-[10px] font-mono font-bold text-foreground/30 uppercase tracking-[0.3em] leading-relaxed group-hover:text-foreground/50 transition-colors">
                            {doc.desc}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center h-[70vh] gap-8">
                    <div className="w-20 h-20 level-1 rounded-full border-4 border-primary/20 border-t-primary animate-spin shadow-atmospheric light-emission" />
                    <div className="space-y-2 text-center">
                        <p className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.6em] animate-pulse">Syncing_Operative_Context...</p>
                        <p className="text-[8px] font-mono font-bold text-foreground/10 uppercase tracking-[0.3em]">Hardware Handshake: OK</p>
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
        <div className="level-0 text-foreground min-h-[calc(100vh-64px)] selection:bg-primary/30">
            <div className="flex h-[calc(100vh-64px)] overflow-hidden">
                {/* Sidebar: Command Architecture */}
                <aside className="w-80 level-1 hidden xl:flex flex-col shrink-0 shadow-atmospheric no-border-separation z-50 p-10">
                    <div className="px-4 py-2 text-[9px] font-mono font-bold text-foreground/20 uppercase tracking-[0.6em] italic mb-8">CORE_DOMAIN</div>
                    <nav className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                        {sidebarItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={clsx(
                                    "w-full flex items-center gap-6 px-8 py-5 rounded-[2.5rem] font-bold transition-all text-xs group relative overflow-hidden",
                                    activeTab === item.id
                                        ? "glass text-primary shadow-glass light-emission"
                                        : "text-foreground/20 hover:bg-primary/[0.02] hover:text-foreground/40"
                                )}
                            >
                                <item.icon className={clsx("w-5 h-5", activeTab === item.id ? "light-emission" : "opacity-40")} />
                                <span className="font-mono tracking-widest">{item.label}</span>
                                {activeTab === item.id && (
                                    <div className="absolute right-0 top-0 h-full w-1.5 bg-primary light-emission" />
                                )}
                            </button>
                        ))}

                        <div className="pt-12 px-4 py-2 text-[9px] font-mono font-bold text-foreground/20 uppercase tracking-[0.6em] italic mb-8">SYSTEM_ACCESS</div>
                        {sidebarSystem.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={clsx(
                                    "w-full flex items-center gap-6 px-8 py-5 rounded-[2.5rem] font-bold transition-all text-xs group relative overflow-hidden",
                                    activeTab === item.id
                                        ? "glass text-primary shadow-glass light-emission"
                                        : "text-foreground/20 hover:bg-primary/[0.02] hover:text-foreground/40"
                                )}
                            >
                                <item.icon className={clsx("w-5 h-5", activeTab === item.id ? "light-emission" : "opacity-40")} />
                                <span className="font-mono tracking-widest">{item.label}</span>
                                {activeTab === item.id && (
                                    <div className="absolute right-0 top-0 h-full w-1.5 bg-primary light-emission" />
                                )}
                            </button>
                        ))}
                    </nav>

                    {/* Operational Progress Gauge */}
                    <div className="mt-auto px-2 pt-12 border-t border-white/5">
                        <div className="glass rounded-[2rem] p-8 space-y-4 shadow-glass no-border-separation">
                            <div className="flex justify-between items-center text-[8px] font-mono font-bold text-foreground/40 uppercase tracking-widest">
                                <span>Global_Coverage</span>
                                <span className="text-primary italic">{(stats.solved / (problems.length || 1) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="h-2 w-full level-2 rounded-full overflow-hidden shadow-atmospheric">
                                <div 
                                    className="h-full bg-primary light-emission rounded-full transition-all duration-1500 ease-out" 
                                    style={{ width: `${(stats.solved / (problems.length || 1) * 100)}%` }} 
                                />
                            </div>
                            <p className="text-[7px] font-mono font-bold text-foreground/10 uppercase tracking-[0.5em] italic">SYMMETRIC_DOMAIN_STABILITY: OK</p>
                        </div>
                    </div>
                </aside>

                {/* Main Content: The Experience Layer */}
                <main className="flex-1 flex flex-col overflow-hidden relative">
                    <div className="flex-1 overflow-y-auto p-12 md:p-16 custom-scrollbar scroll-smooth">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
}

{/* Sub-Components */}

function MetricCard({ label, value, subtext, icon: Icon, progress, variant = "default" }: any) {
    return (
        <div className="level-1 rounded-[3.5rem] p-10 flex flex-col justify-between group hover:bg-primary/[0.02] transition-colors shadow-atmospheric no-border-separation h-[280px]">
            <div className="flex justify-between items-start">
                <div className={clsx(
                    "p-5 rounded-[2rem] shadow-glass light-emission",
                    variant === "primary" ? "glass text-primary" : "level-2 text-foreground/30"
                )}>
                    <Icon className="w-8 h-8" />
                </div>
                <div className="px-5 py-2 rounded-full level-2 shadow-atmospheric">
                    <span className="text-[8px] font-mono font-bold text-foreground/20 uppercase tracking-[0.4em] italic">ACTIVE_PULSE</span>
                </div>
            </div>
            <div className="space-y-2">
                <p className="text-[9px] font-mono font-bold text-foreground/20 uppercase tracking-[0.6em] italic px-1">{label}</p>
                <h3 className="text-5xl font-bold tracking-tightest italic uppercase font-mono tabular-nums leading-none">{value}</h3>
                <p className="text-[8px] font-mono font-bold text-foreground/10 uppercase tracking-[0.8em] px-1">{subtext}</p>
            </div>
            <div className="mt-4 px-1">
                <div className="h-1.5 w-full level-2 rounded-full overflow-hidden shadow-atmospheric">
                    <div 
                        className={clsx(
                            "h-full transition-all duration-1500 ease-out",
                            variant === "primary" ? "bg-primary light-emission" : "bg-foreground/10"
                        )} 
                        style={{ width: `${Math.min(progress, 100)}%` }} 
                    />
                </div>
            </div>
        </div>
    );
}

function InsightCard({ label, value, icon: Icon, color }: any) {
    return (
        <div className="level-1 rounded-[3.5rem] p-12 text-center group hover:bg-primary/[0.02] transition-all shadow-atmospheric no-border-separation">
            <div className="h-20 w-20 rounded-[2.5rem] glass mx-auto mb-8 flex items-center justify-center shadow-glass light-emission group-hover:scale-110 transition-transform duration-700">
                <Icon className={clsx("w-10 h-10", color)} />
            </div>
            <div className="space-y-4 font-mono">
                <p className="text-6xl font-black italic tracking-tightest tabular-nums text-white group-hover:text-primary transition-colors">{value}</p>
                <p className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.6em] italic">{label}</p>
            </div>
        </div>
    );
}