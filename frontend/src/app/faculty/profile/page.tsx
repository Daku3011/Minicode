"use client";

import { useEffect, useState } from "react";
import {
    User, BookOpen, Users, Trophy, Calendar, Settings,
    BarChart3, Target, Plus, Mail, Award, TrendingUp,
    Clock, ChevronRight, Edit, Loader2, FileText, Sparkles,
    BookMarked, Search, ArrowRight, ShieldCheck, Zap,
    Activity, LogOut, Bell
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface FacultyStats {
    problems_created: number;
    total_students: number;
    total_submissions: number;
    avg_pass_rate: number;
}

interface Event {
    id: number;
    title: string;
    event_type: string;
    status: string;
    start_date: string;
    current_participants: number;
    max_participants: number | null;
}

interface RecentActivity {
    id: number;
    type: "submission" | "join" | "event";
    message: string;
    timestamp: string;
    user?: string;
}

export default function FacultyProfilePage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"overview" | "events" | "settings">("overview");
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<FacultyStats>({
        problems_created: 0,
        total_students: 0,
        total_submissions: 0,
        avg_pass_rate: 0
    });
    const [events, setEvents] = useState<Event[]>([]);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

    useEffect(() => {
        fetchFacultyData();
    }, []);

    const fetchFacultyData = async () => {
        setLoading(true);
        try {
            const [statsRes, eventsRes] = await Promise.all([
                api.get("/faculty/dashboard-stats"),
                api.get("/events/faculty/my-events").catch(() => ({ data: [] }))
            ]);

            setStats({
                problems_created: statsRes.data.total_problems,
                total_students: statsRes.data.total_students,
                total_submissions: statsRes.data.total_submissions,
                avg_pass_rate: statsRes.data.avg_pass_rate
            });
            setEvents(eventsRes.data);
            setRecentActivity(statsRes.data.recent_activity);
        } catch (error) {
            console.error("Failed to fetch faculty data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0f]">
                <div className="relative">
                    <div className="size-16 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-primary/40" />
                    </div>
                </div>
                <p className="mt-6 text-slate-600 font-black tracking-[0.3em] text-[10px] uppercase">Synchronizing Core Profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-slate-100 font-display relative">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Hero Profile Section */}
                <div className="mb-10 overflow-hidden border border-white/10 rounded-3xl">
                    <div className="bg-[#0a0a0f]/40 p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 relative">
                        <div className="relative">
                            <div className="size-36 rounded-3xl bg-gradient-to-br from-primary/20 to-blue-600/20 p-1 border border-white/10 shadow-2xl">
                                <div className="w-full h-full rounded-[1.4rem] bg-[#0d0d14] flex items-center justify-center relative overflow-hidden">
                                    <User className="size-16 text-slate-400" />
                                </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 size-12 rounded-2xl bg-white text-black flex items-center justify-center border-4 border-[#0a0a0f] shadow-xl">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                <span className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">Faculty Member</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none mb-4 uppercase">
                                {user?.username}
                            </h1>
                            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-slate-400 font-bold text-xs">
                                <Mail className="w-4 h-4 text-primary/60" /> {user?.email}
                            </div>
                        </div>

                        {/* <div className="flex flex-col gap-3 min-w-[200px]">
                            <button
                                onClick={() => logout()}
                                className="w-full px-8 py-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-3"
                            >
                                <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                        </div> */}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="glass-card p-2 space-y-1">
                            {[
                                { id: "overview", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
                                { id: "events", label: "My Events", icon: <Calendar className="w-4 h-4" /> },
                                { id: "settings", label: "Configuration", icon: <Settings className="w-4 h-4" /> },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id as any)}
                                    className={clsx(
                                        "w-full flex items-center gap-4 px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all",
                                        activeTab === item.id
                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                            : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                                    )}
                                >
                                    {item.icon}
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-9">
                        {activeTab === "overview" && (
                            <div className="space-y-8">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { label: "Problems", value: stats.problems_created, icon: <BookOpen className="text-purple-400" /> },
                                        { label: "Students", value: stats.total_students, icon: <Users className="text-blue-400" /> },
                                        { label: "Submissions", value: stats.total_submissions, icon: <TrendingUp className="text-emerald-400" /> },
                                        { label: "Pass Rate", value: `${stats.avg_pass_rate}%`, icon: <Activity className="text-amber-400" /> }
                                    ].map((stat) => (
                                        <div key={stat.label} className="glass-card p-6 border-white/5 bg-white/[0.02]">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center">{stat.icon}</div>
                                            </div>
                                            <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Student Search */}
                                <div className="glass-card p-8 border-white/5 bg-white/[0.02]">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                        <div className="max-w-md">
                                            <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                                <Search className="w-5 h-5 text-primary" />
                                                Student Telemetery
                                            </h3>
                                            <p className="text-slate-500 font-medium text-xs mt-2">
                                                Access performance diagnostics by entering a candidate username.
                                            </p>
                                            <p className="text-slate-500 font-medium text-xs mt-2">
                                                <a href="./students" className="text-primary hover:underline">
                                                    View All Students
                                                </a>
                                            </p>
                                        </div>
                                        <div className="flex-1 max-w-sm w-full">
                                            <form
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    const username = (e.currentTarget.elements.namedItem("username") as HTMLInputElement).value;
                                                    if (username) router.push(`/faculty/students/${username}`);
                                                }}
                                                className="relative"
                                            >
                                                <input
                                                    name="username"
                                                    type="text"
                                                    placeholder="CANDIDATE_ID..."
                                                    className="w-full bg-[#0d0d14] border border-white/10 rounded-xl py-3.5 pl-6 pr-14 text-white font-black text-xs focus:outline-none focus:border-primary/50 transition-all placeholder:text-slate-700 tracking-wider"
                                                    required
                                                />
                                                <button
                                                    type="submit"
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 size-10 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all flex items-center justify-center"
                                                >
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                {/* Activity Feed */}
                                <div className="glass-card p-8 border-white/5 bg-white/[0.02]">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
                                        <Activity className="w-4 h-4 text-primary" /> Operational Logs
                                    </h3>
                                    <div className="space-y-6">
                                        {recentActivity.map((activity) => (
                                            <div key={activity.id} className="flex gap-5">
                                                <div className="flex flex-col items-center">
                                                    <div className={clsx(
                                                        "size-9 rounded-xl flex items-center justify-center",
                                                        activity.type === 'join' ? "bg-blue-500/10 text-blue-400" :
                                                            activity.type === 'submission' ? "bg-emerald-500/10 text-emerald-400" :
                                                                "bg-purple-500/10 text-purple-400"
                                                    )}>
                                                        {activity.type === 'join' ? <Users className="w-4 h-4" /> :
                                                            activity.type === 'submission' ? <Zap className="w-4 h-4" /> :
                                                                <Target className="w-4 h-4" />}
                                                    </div>
                                                    <div className="flex-1 w-px bg-white/5 my-2" />
                                                </div>
                                                <div className="flex-1 pb-4">
                                                    <p className="text-slate-300 font-bold text-sm leading-snug">{activity.message}</p>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{activity.timestamp}</span>
                                                        {activity.user && (
                                                            <>
                                                                <span className="size-1 rounded-full bg-white/5" />
                                                                <Link href={`/faculty/students/${activity.user}`} className="text-[9px] font-black text-primary hover:underline uppercase tracking-widest">Detail View</Link>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "events" && (
                            <div className="space-y-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase">My Protocols</h3>
                                    <Link
                                        href="/events/create"
                                        className="bg-primary text-white px-8 py-3 rounded-xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/10"
                                    >
                                        <Plus className="w-4 h-4" /> Initialize
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {events.length > 0 ? events.map((event) => (
                                        <div key={event.id} className="glass-card p-6 flex flex-col md:flex-row items-center gap-6 group hover:bg-white/[0.02] transition-colors border-white/5">
                                            <div className="w-full md:w-40 h-24 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/10">
                                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{event.event_type}</span>
                                            </div>
                                            <div className="flex-1 text-center md:text-left">
                                                <h4 className="text-lg font-black text-white tracking-tight uppercase group-hover:text-primary transition-colors">{event.title}</h4>
                                                <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                                                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                        <Calendar className="w-3.5 h-3.5" /> {new Date(event.start_date).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                        <Users className="w-3.5 h-3.5" /> {event.current_participants}/{event.max_participants || "∞"}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-[9px] uppercase tracking-widest">{event.status}</div>
                                                <Link href={`/faculty/events/${event.id}`} className="size-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                                                    <ChevronRight className="w-5 h-5" />
                                                </Link>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="glass-card p-20 flex flex-col items-center justify-center text-center opacity-20 bg-transparent border-dashed">
                                            <Calendar className="w-12 h-12 mb-6" />
                                            <p className="text-sm font-black uppercase tracking-widest text-slate-500">No Operations Active</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "settings" && (
                            <div className="glass-card p-10 space-y-10 border-white/5 bg-white/[0.02]">
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tighter uppercase mb-1">Configuration</h3>
                                    <p className="text-slate-500 font-medium text-xs">Adjust node parameters and communication vectors.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">
                                            Mainframe Identity
                                        </label>
                                        <input
                                            disabled
                                            type="text"
                                            value={user?.username}
                                            className="w-full bg-[#0d0d14] border border-white/5 rounded-xl px-5 py-3 text-white font-black opacity-40 cursor-not-allowed text-sm"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">
                                            Communication Channel
                                        </label>
                                        <input
                                            type="text"
                                            defaultValue={user?.email}
                                            className="w-full bg-[#0d0d14] border border-white/10 rounded-xl px-5 py-3 text-white font-black focus:border-primary/50 transition-all outline-none text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-white/5 flex justify-end gap-4">
                                    <button className="px-6 py-3 rounded-lg font-black text-[9px] uppercase tracking-widest text-slate-600 hover:text-white transition-all">Discard</button>
                                    <button className="px-10 py-3 rounded-lg bg-white text-black font-black text-[9px] uppercase tracking-[0.2em] hover:bg-slate-200 transition-all">Apply Schema</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
