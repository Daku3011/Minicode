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
import { motion, AnimatePresence } from "framer-motion";
import MagneticWrapper from "@/components/MagneticWrapper";
import BroadcastAlert from "@/components/BroadcastAlert";

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
                    <div className="size-20 border-t-2 border-primary rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ShieldCheck className="w-8 h-8 text-primary/40" />
                    </div>
                </div>
                <p className="mt-8 text-slate-500 font-black tracking-[0.4em] text-[10px] uppercase animate-pulse">Synchronizing Core Profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0f] text-slate-100 font-display relative overflow-x-hidden">
            {/* Ambient Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/grid.svg')] opacity-[0.03]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Hero Profile Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="glass-card mb-12 p-1 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-blue-500/10 pointer-events-none" />
                    <div className="bg-[#0a0a0f]/80 backdrop-blur-3xl rounded-[2.8rem] p-10 md:p-14 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-5">
                            <Sparkles className="w-64 h-64 text-white" />
                        </div>
                        
                        <div className="relative group">
                            <div className="size-44 rounded-[3.5rem] bg-gradient-to-br from-primary to-blue-600 p-1.5 shadow-2xl transition-transform group-hover:scale-105 duration-500">
                                <div className="w-full h-full rounded-[3.1rem] bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden">
                                     <User className="size-20 text-white" />
                                     {/* <div className="absolute bottom-0 inset-x-0 h-1/3 bg-primary/20 backdrop-blur-md flex items-center justify-center border-t border-white/10 uppercase font-black text-[8px] tracking-[0.2em] text-white">ID_VERIFIED</div> */}
                                </div>
                            </div>
                            <div className="absolute -bottom-4 -right-4 size-16 rounded-3xl bg-white text-black flex items-center justify-center border-8 border-[#0a0a0f] shadow-2xl">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div className="space-y-1">
                                <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none mb-2">Professor <span className="text-primary">{user?.username}</span></h1>
                            </div>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
                                <div className="px-6 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-bold text-xs uppercase tracking-widest flex items-center gap-3 shadow-inner">
                                    <Mail className="w-4 h-4 text-primary" /> {user?.email}
                                </div>
                                {/* <div className="px-6 py-2.5 rounded-2xl bg-primary/20 border border-primary/30 text-primary font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/10">
                                    LEVEL 20 ACADEMIC
                                </div> */}
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            {/* <BroadcastAlert /> */}
                            {/* <MagneticWrapper>
                                <button
                                    onClick={() => logout()}
                                    className="w-full px-10 py-5 rounded-3xl bg-white/[0.03] border border-white/10 text-rose-500 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-rose-500/10 hover:border-rose-500/30 transition-all flex items-center justify-center gap-3 group"
                                >
                                    <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> TERMINATE SESSION
                                </button>
                            </MagneticWrapper> */}
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="glass-card p-4 space-y-2">
                            {[
                                { id: "overview", label: "Overview", icon: <BarChart3 className="w-5 h-5" /> },
                                { id: "events", label: "My Events", icon: <Calendar className="w-5 h-5" /> },
                                { id: "settings", label: "Operational Config", icon: <Settings className="w-5 h-5" /> },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id as any)}
                                    className={clsx(
                                        "w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all relative overflow-hidden group",
                                        activeTab === item.id 
                                            ? "bg-primary text-white shadow-xl shadow-primary/20" 
                                            : "text-slate-500 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {item.icon}
                                    {item.label}
                                    {/* {activeTab === item.id && (
                                        <div className="absolute right-0 top-0 h-full w-1.5 bg-white/20" />
                                    )} */}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-9">
                        <AnimatePresence mode="wait">
                            {activeTab === "overview" && (
                                <motion.div
                                    key="overview"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-10"
                                >
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {[
                                            { label: "Problems", value: stats.problems_created, icon: <BookOpen className="text-purple-400" />, color: "border-purple-500/20" },
                                            { label: "Students", value: stats.total_students, icon: <Users className="text-blue-400" />, color: "border-blue-500/20" },
                                            { label: "Submissions", value: stats.total_submissions, icon: <TrendingUp className="text-emerald-400" />, color: "border-emerald-500/20" },
                                            { label: "Success Rate", value: `${stats.avg_pass_rate}%`, icon: <TrendingUp className="text-amber-400" />, color: "border-amber-500/20" }
                                        ].map((stat) => (
                                            <div key={stat.label} className={clsx("glass-card p-6 border-b-4", stat.color)}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">{stat.icon}</div>
                                                    <div className="size-2 rounded-full bg-white/10" />
                                                </div>
                                                <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Student Telemetry Search */}
                                    <div className="glass-card p-10 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                                            <Search className="w-48 h-48 text-white" />
                                        </div>
                                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                                            <div className="max-w-md">
                                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                                    <div className="size-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                                        <Search className="w-5 h-5 text-primary" />
                                                    </div>
                                                    Student Telemetry
                                                </h3>
                                                <p className="text-slate-500 font-bold text-sm mt-3 leading-relaxed">
                                                    Access performance diagnostics by entering a candidate's mainframe identifier.
                                                </p>
                                            </div>
                                            <div className="flex-1 max-w-sm">
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
                                                        placeholder="CANDIDATE_ID (e.g. jdoe123)"
                                                        className="w-full bg-[#0a0a0f] border border-white/10 rounded-2xl py-5 pl-8 pr-16 text-white font-black text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-slate-800 tracking-wider shadow-inner"
                                                        required
                                                    />
                                                    <button 
                                                        type="submit"
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 size-12 rounded-xl bg-white text-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-2xl hover:shadow-white/20"
                                                    >
                                                        <ArrowRight className="w-5 h-5" />
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Activity Feed */}
                                    <div className="">
                                        <div className="glass-card p-10 space-y-8">
                                             <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                                                <Activity className="w-4 h-4 text-primary" /> Operational Logs
                                            </h3>
                                            <div className="space-y-6">
                                                {recentActivity.map((activity) => (
                                                    <div key={activity.id} className="flex gap-6 group/item">
                                                        <div className="flex flex-col items-center">
                                                            <div className={clsx(
                                                                "size-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover/item:scale-110",
                                                                activity.type === 'join' ? "bg-blue-500/10 text-blue-400" :
                                                                activity.type === 'submission' ? "bg-emerald-500/10 text-emerald-400" :
                                                                "bg-purple-500/10 text-purple-400"
                                                            )}>
                                                                {activity.type === 'join' ? <Users className="w-4 h-4" /> :
                                                                 activity.type === 'submission' ? <Zap className="w-4 h-4" /> :
                                                                 <Target className="w-4 h-4" />}
                                                            </div>
                                                            <div className="flex-1 w-0.5 bg-white/5 my-2" />
                                                        </div>
                                                        <div className="flex-1 pb-6">
                                                            <p className="text-slate-200 font-bold text-sm leading-tight">{activity.message}</p>
                                                            <div className="flex items-center gap-3 mt-2">
                                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{activity.timestamp}</span>
                                                                {activity.user && (
                                                                    <>
                                                                        <span className="size-1 rounded-full bg-white/10" />
                                                                        <Link href={`/faculty/students/${activity.user}`} className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">View Profile</Link>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* <div className="space-y-8">
                                            <div className="glass-card p-10 bg-white/[0.03] border-white/10">
                                                <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
                                                    <Award className="w-4 h-4 text-amber-500" /> Faculty Milestones
                                                </h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {[1,2,3,4].map(i => (
                                                        <div key={i} className="aspect-square rounded-[2rem] bg-[#0a0a0f] border border-white/5 flex flex-col items-center justify-center gap-3 group hover:border-amber-500/30 transition-all">
                                                            <div className="size-12 rounded-2xl bg-amber-500/10 flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity">
                                                                <Trophy className="w-6 h-6 text-amber-500" />
                                                            </div>
                                                            <div className="text-[8px] font-black text-slate-800 group-hover:text-amber-500/60 uppercase tracking-widest">Locked_Entry</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div> */}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "events" && (
                                <motion.div
                                    key="events"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-10"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <h3 className="text-3xl font-black text-white tracking-tighter uppercase">My Operational Protocols</h3>
                                        <MagneticWrapper>
                                            <Link 
                                                href="/events/create"
                                                className="premium-btn px-8 py-3 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest"
                                            >
                                                <Plus className="w-5 h-5" /> Initialize New Event
                                            </Link>
                                        </MagneticWrapper>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                        {events.length > 0 ? events.map((event) => (
                                            <div key={event.id} className="glass-card p-4 md:p-8 flex flex-col md:flex-row items-center gap-8 group">
                                                <div className="w-full md:w-48 h-32 rounded-3xl bg-white/5 flex flex-col items-center justify-center border border-white/10 group-hover:bg-primary/10 transition-colors">
                                                    <span className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-2">{event.event_type}</span>
                                                    <div className="text-2xl">⚡️</div>
                                                </div>
                                                <div className="flex-1 text-center md:text-left">
                                                    <h4 className="text-xl font-black text-white tracking-tight uppercase group-hover:text-primary transition-colors">{event.title}</h4>
                                                    <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
                                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                            <Calendar className="w-3.5 h-3.5 text-primary" /> {new Date(event.start_date).toLocaleDateString()}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                            <Users className="w-3.5 h-3.5 text-blue-400" /> {event.current_participants}/{event.max_participants || "∞"}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-[10px] uppercase tracking-widest">{event.status}</div>
                                                    <Link href={`/faculty/events/${event.id}`} className="size-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                                                        <ChevronRight className="w-5 h-5" />
                                                    </Link>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="glass-card p-24 flex flex-col items-center justify-center text-center opacity-20">
                                                <Calendar className="w-20 h-20 mb-8" />
                                                <p className="text-2xl font-black uppercase tracking-widest">No Active Protocol Clusters</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "settings" && (
                                <motion.div
                                    key="settings"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="glass-card p-12 space-y-12"
                                >
                                    <div className="pb-8 border-b border-white/5">
                                        <h3 className="text-2xl font-black text-white tracking-tighter uppercase mb-2">Operational Configurations</h3>
                                        <p className="text-slate-500 font-bold text-sm">Fine-tune your node's parameters and communication vectors.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
    
                                        {/* First Field */}
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block ml-1">
                                                Assigned Name
                                            </label>
                                            <input
                                                disabled
                                                type="text"
                                                value={user?.username}
                                                className="w-full bg-[#0a0a0f] border border-white/10 rounded-2xl px-6 py-4 text-white font-black opacity-50 cursor-not-allowed"
                                            />
                                        </div>

                                        {/* Second Field */}
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block ml-1">
                                                Communication Channel (Email)
                                            </label>
                                            <input
                                                type="text"
                                                defaultValue={user?.email}
                                                className="w-full bg-[#0a0a0f] border border-white/10 rounded-2xl px-6 py-4 text-white font-black focus:ring-2 focus:ring-primary/40 transition-all outline-none"
                                            />
                                        </div>
                                        
                                        {/* <div className="space-y-8">
                                            <div className="flex items-center justify-between p-6 bg-white/[0.03] rounded-3xl border border-white/5">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                                        <Bell className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold text-sm">Submission Alerts</p>
                                                        <p className="text-xs text-slate-500">Global notifications for class batches</p>
                                                    </div>
                                                </div> 
                                                <div className="w-12 h-6 bg-primary rounded-full relative p-1 shadow-lg shadow-primary/20">
                                                    <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-6 bg-white/[0.03] rounded-3xl border border-white/5">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                                        <ShieldCheck className="w-5 h-5 text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold text-sm">Telemetry Masking</p>
                                                        <p className="text-xs text-slate-500">Hide stats from student-view</p>
                                                    </div>
                                                </div>
                                                <div className="w-12 h-6 bg-white/10 rounded-full relative p-1">
                                                    <div className="w-4 h-4 bg-white/40 rounded-full" />
                                                </div>
                                            </div>
                                        </div> */}
                                    </div>

                                    <div className="pt-8 border-t border-white/5 flex justify-end gap-6">
                                        <button className="px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-white transition-all">Cancel Mods</button>
                                        <button className="px-12 py-3 rounded-xl bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl">Apply Schema</button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
