"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
    Calendar, Users, Trophy, Clock, Search, Zap, 
    Target, Star, Plus, Activity, ArrowUpRight, ShieldCheck 
} from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import MagneticWrapper from "@/components/MagneticWrapper";

interface Event {
    id: number;
    title: string;
    description: string;
    event_type: string;
    difficulty: string | null;
    start_date: string;
    end_date: string | null;
    max_participants: number | null;
    current_participants: number;
    prize_description: string | null;
    status: string;
    author_name: string;
    created_at: string;
    is_joined: boolean;
}

const eventTypeLabels: Record<string, { label: string; color: string; bg: string; shadow: string; icon: React.ReactNode }> = {
    weekly_challenge: { 
        label: "Weekly Challenge", 
        color: "text-purple-400", 
        bg: "bg-purple-500/10",
        shadow: "shadow-purple-500/20",
        icon: <Zap className="w-3.5 h-3.5" /> 
    },
    team_project: { 
        label: "Team Project", 
        color: "text-blue-400", 
        bg: "bg-blue-500/10",
        shadow: "shadow-blue-500/20",
        icon: <Users className="w-3.5 h-3.5" /> 
    },
    announcement: { 
        label: "Announcement", 
        color: "text-amber-400", 
        bg: "bg-amber-500/10",
        shadow: "shadow-amber-500/20",
        icon: <Target className="w-3.5 h-3.5" /> 
    },
};

const statusColors: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10",
    draft: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    completed: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/10",
};

export default function EventsPage() {
    const { user } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>("upcoming");
    const [searchQuery, setSearchQuery] = useState("");

    const isFaculty = user?.role === "faculty" || user?.role === "admin";

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await api.get("/events");
            setEvents(response.data);
        } catch (error) {
            console.error("Failed to fetch events:", error);
        } finally {
            setLoading(false);
        }
    };

    const isUpcoming = (event: Event) => {
        const now = new Date();
        const start = new Date(event.start_date);
        return start > now || event.status === "active";
    };

    const isPast = (event: Event) => {
        const now = new Date();
        const end = event.end_date ? new Date(event.end_date) : new Date(event.start_date);
        return end < now && event.status !== "active";
    };

    const filteredEvents = events.filter((event) => {
        const matchesTab = activeTab === "all" || 
            (activeTab === "upcoming" && isUpcoming(event)) ||
            (activeTab === "past" && isPast(event));
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            event.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const upcomingEvents = events.filter(isUpcoming);
    const pastEvents = events.filter(isPast);

    const getTimeRemaining = (endDate: string | null) => {
        if (!endDate) return "No deadline";
        const end = new Date(endDate);
        const now = new Date();
        const diff = end.getTime() - now.getTime();
        
        if (diff <= 0) return "Ended";
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h LEFT`;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    return (
        <div className="min-h-screen pt-32 pb-24 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-24 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-primary font-black text-[10px] uppercase tracking-[0.6em] mb-6 block text-white">Operations Matrix</span>
                        <h1 className="text-7xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
                            PROTOCOLS <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">&</span> EVENTS
                        </h1>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium leading-relaxed mb-12">
                            Synchronize with high-priority development cycles. Participate in tactical sprints, 
                            secure rewards, and elevate your clearance level.
                        </p>
                        
                        {isFaculty && (
                            <div className="flex items-center justify-center gap-6">
                                <MagneticWrapper>
                                    <Link 
                                        href="/faculty/events" 
                                        className="h-14 px-8 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 text-white font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-2xl"
                                    >
                                        <Calendar className="w-5 h-5 text-primary" />
                                        Manage Archives
                                    </Link>
                                </MagneticWrapper>
                                <MagneticWrapper>
                                    <Link 
                                        href="/events/create" 
                                        className="h-14 px-8 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-[0_0_30px_rgba(137,91,245,0.4)]"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Initialize Protocol
                                    </Link>
                                </MagneticWrapper>
                            </div>
                        )}
                    </motion.div>

                    {/* Decorative Nebula */}
                    <div className="absolute -top-64 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
                </div>

                {/* Status Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
                    {[
                        { label: "Active Nodes", val: upcomingEvents.length, icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                        { label: "Operators", val: (events.reduce((acc, e) => acc + e.current_participants, 0)).toLocaleString(), icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
                        { label: "Challenges", val: events.filter(e => e.event_type === "weekly_challenge").length, icon: Trophy, color: "text-amber-400", bg: "bg-amber-500/10" },
                        { label: "Clearance", val: events.filter(e => e.is_joined).length, icon: ShieldCheck, color: "text-purple-400", bg: "bg-purple-400/10" },
                    ].map((stat, i) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                            key={stat.label}
                            className="glass-card p-6 rounded-[2rem] border border-white/10 relative overflow-hidden group hover:border-white/20 transition-all duration-500"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent pointer-events-none" />
                            <div className="flex items-center gap-5">
                                <div className={clsx("h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500", stat.bg)}>
                                    <stat.icon className={clsx("w-6 h-6", stat.color)} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black text-white">{stat.val}</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Filter Controls */}
                <div className="flex flex-col lg:flex-row items-center justify-between mb-12 gap-8">
                    <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-3xl">
                        {[
                            { id: "upcoming", label: "Upcoming", count: upcomingEvents.length },
                            { id: "past", label: "Completed", count: pastEvents.length },
                            { id: "all", label: "Full Archive", count: events.length },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    "px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest relative whitespace-nowrap",
                                    activeTab === tab.id ? "text-white" : "text-slate-500 hover:text-white"
                                )}
                            >
                                {activeTab === tab.id && (
                                    <motion.div 
                                        layoutId="tab-pill"
                                        className="absolute inset-0 bg-primary/20 rounded-xl border border-primary/30"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    {tab.label}
                                    <span className={clsx("text-[9px] opacity-60", activeTab === tab.id ? "text-primary" : "text-slate-600")}>
                                        {tab.count}
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full lg:w-96 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-600 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="LOCATE PROTOCOL..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-xs font-medium text-white placeholder-slate-700 tracking-widest focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/40 transition-all shadow-2xl"
                        />
                    </div>
                </div>

                {/* Events Grid */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-40 gap-8"
                        >
                            <motion.div 
                                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full shadow-[0_0_40px_rgba(137,91,245,0.3)]"
                            />
                            <span className="text-slate-500 font-black text-[10px] uppercase tracking-[0.5em] animate-pulse">Syncing Protocols...</span>
                        </motion.div>
                    ) : filteredEvents.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-32 rounded-[3rem] border border-dashed border-white/10 bg-white/[0.02]"
                        >
                            <Calendar className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                            <h3 className="text-xl font-black text-slate-500 uppercase tracking-widest mb-2">No Protocols Detected</h3>
                            <p className="text-slate-600 text-sm font-medium">Verify your synchronization matrix or search parameters.</p>
                        </motion.div>
                    ) : (
                        <motion.div 
                            layout
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {filteredEvents.map((event, i) => {
                                const typeInfo = eventTypeLabels[event.event_type] || eventTypeLabels.announcement;
                                
                                return (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 * i }}
                                    >
                                        <Link
                                            href={`/events/${event.id}`}
                                            className="group relative flex flex-col h-full glass-card bg-white/[0.03] rounded-[2.5rem] border border-white/10 hover:border-primary/50 transition-all duration-500 overflow-hidden shadow-2xl"
                                        >
                                            {/* Top Accent Line */}
                                            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                            <div className="p-8 flex flex-col h-full">
                                                {/* Header */}
                                                <div className="flex items-center justify-between mb-8">
                                                    <div className={clsx(
                                                        "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border border-white/5",
                                                        typeInfo.color, typeInfo.bg
                                                    )}>
                                                        <span className={clsx("p-1 rounded-md", typeInfo.bg)}>
                                                            {typeInfo.icon}
                                                        </span>
                                                        {typeInfo.label}
                                                    </div>
                                                    <span className={clsx(
                                                        "px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                                                        statusColors[event.status] || statusColors.draft
                                                    )}>
                                                        {event.status}
                                                    </span>
                                                </div>
                                                
                                                <h3 className="text-2xl font-black text-white group-hover:text-primary transition-colors leading-tight mb-4 min-h-[3.5rem] line-clamp-2">
                                                    {event.title}
                                                </h3>
                                                
                                                <p className="text-sm text-slate-500 font-medium line-clamp-3 mb-8 leading-relaxed italic">
                                                    "{event.description}"
                                                </p>

                                                <div className="mt-auto pt-8 border-t border-white/5">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2 text-slate-500 mb-2">
                                                                <Clock className="w-3.5 h-3.5 text-primary/60" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">{getTimeRemaining(event.end_date)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex -space-x-2">
                                                                    {[1, 2, 3].map(j => (
                                                                        <div key={j} className="h-6 w-6 rounded-full border-2 border-[#0a0a14] bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-500">
                                                                            {j}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                                                    {event.current_participants}/{event.max_participants || "∞"} OPERATORS
                                                                </span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="relative h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(137,91,245,0.4)]">
                                                            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                                        </div>
                                                    </div>

                                                    {event.prize_description && (
                                                        <div className="mt-6 flex items-center gap-3 px-4 py-2 bg-amber-500/5 rounded-xl border border-amber-500/10">
                                                            <Trophy className="w-3.5 h-3.5 text-amber-500" />
                                                            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest truncate">{event.prize_description}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

