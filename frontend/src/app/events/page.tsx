"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
    Calendar, Users, Trophy, Clock, Search, Zap, 
    Target, Plus, Activity, ArrowUpRight, ShieldCheck 
} from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

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
        color: "text-violet-700", 
        bg: "bg-violet-50",
        shadow: "shadow-violet-200",
        icon: <Zap className="w-3.5 h-3.5" /> 
    },
    team_project: { 
        label: "Team Project", 
        color: "text-sky-700", 
        bg: "bg-sky-50",
        shadow: "shadow-sky-200",
        icon: <Users className="w-3.5 h-3.5" /> 
    },
    announcement: { 
        label: "Announcement", 
        color: "text-amber-700", 
        bg: "bg-amber-50",
        shadow: "shadow-amber-200",
        icon: <Target className="w-3.5 h-3.5" /> 
    },
};

const statusColors: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    draft: "bg-slate-100 text-slate-600 border-slate-200",
    completed: "bg-slate-100 text-slate-600 border-slate-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
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
        <div className="min-h-screen pt-15 pb-24 px-4 md:px-8 bg-white relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-100 blur-3xl opacity-70" />
                <div className="absolute top-40 right-0 h-[320px] w-[320px] rounded-full bg-cyan-100 blur-3xl opacity-50" />
                <div className="absolute bottom-24 left-0 h-[300px] w-[300px] rounded-full bg-indigo-100 blur-3xl opacity-40" />
            </div>
            <div className="max-w-[1600px] mx-auto relative z-10 px-4 md:px-8">
                {/* Hero Section */}
                <div className="text-center mb-24 relative">
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-8 leading-[0.9]">
                        Events <span className="text-primary italic bg-gradient-to-r from-violet-700 via-violet-500 to-cyan-500 bg-clip-text text-transparent">Hub</span>
                    </h1>
                    <p className="text-slate-600 text-lg max-w-2xl mx-auto font-medium leading-relaxed mb-12">
                        Join coding events, team challenges, and announcements. Track progress, collaborate with peers, and earn rewards.
                    </p>
                    
                    {isFaculty && (
                        <div className="flex items-center justify-center gap-6">
                            <Link 
                                href="/faculty/events" 
                                className="h-12 px-6 rounded-lg bg-white border border-slate-200 hover:border-violet-300 text-slate-700 font-semibold text-sm flex items-center gap-3 transition-all"
                            >
                                <Calendar className="w-4 h-4 text-primary" />
                                Manage Events
                            </Link>
                            <Link 
                                href="/events/create" 
                                className="h-12 px-6 rounded-lg bg-primary text-white font-semibold text-sm flex items-center gap-3 transition-all hover:bg-violet-700"
                            >
                                <Plus className="w-4 h-4" />
                                Create Event
                            </Link>
                        </div>
                    )}

                    <div className="absolute -top-64 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
                </div>

                {/* Status Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
                    {[
                        { label: "Upcoming", val: upcomingEvents.length, icon: Activity, color: "text-emerald-700", bg: "bg-emerald-50" },
                        { label: "Participants", val: (events.reduce((acc, e) => acc + e.current_participants, 0)).toLocaleString(), icon: Users, color: "text-sky-700", bg: "bg-sky-50" },
                        { label: "Challenges", val: events.filter(e => e.event_type === "weekly_challenge").length, icon: Trophy, color: "text-amber-700", bg: "bg-amber-50" },
                        { label: "Joined", val: events.filter(e => e.is_joined).length, icon: ShieldCheck, color: "text-violet-700", bg: "bg-violet-50" },
                    ].map((stat) => (
                        <div 
                            key={stat.label}
                            className="bg-white p-6 rounded-xl border border-slate-200 relative overflow-hidden group hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                            <div className="flex items-center gap-5">
                                <div className={clsx("h-12 w-12 rounded-lg flex items-center justify-center transition-all border border-white", stat.bg)}>
                                    <stat.icon className={clsx("w-6 h-6", stat.color)} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold text-slate-900">{stat.val}</span>
                                    <span className="text-xs font-medium text-slate-500">{stat.label}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter Controls */}
                <div className="flex flex-col lg:flex-row items-center justify-between mb-12 gap-8">
                    <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                        {[
                            { id: "upcoming", label: "Upcoming", count: upcomingEvents.length },
                            { id: "past", label: "Completed", count: pastEvents.length },
                            { id: "all", label: "All", count: events.length },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    "px-4 py-2.5 rounded-lg text-sm font-medium transition-all relative whitespace-nowrap",
                                    activeTab === tab.id ? "bg-violet-100 text-violet-700 border border-violet-200" : "text-slate-600 hover:text-slate-900"
                                )}
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {tab.label}
                                    <span className={clsx("text-xs opacity-80", activeTab === tab.id ? "text-violet-700" : "text-slate-500")}>
                                        {tab.count}
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full lg:w-96 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-14 pr-6 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-violet-200 transition-all"
                        />
                    </div>
                </div>

                {/* Events Grid */}
                <div>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-8">
                            <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <span className="text-slate-500 font-medium text-sm">Loading events...</span>
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="text-center py-24 rounded-2xl border border-dashed border-slate-300 bg-white">
                            <Calendar className="w-14 h-14 text-slate-300 mx-auto mb-5" />
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">No events found</h3>
                            <p className="text-slate-500 text-sm">Try a different search or tab filter.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredEvents.map((event) => {
                                const typeInfo = eventTypeLabels[event.event_type] || eventTypeLabels.announcement;
                                
                                return (
                                    <Link
                                        key={event.id}
                                        href={`/events/${event.id}`}
                                        className="group relative flex flex-col h-full bg-white rounded-xl border border-slate-200 hover:border-violet-300 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md"
                                    >
                                        <div className="p-6 flex flex-col h-full">
                                            {/* Header */}
                                            <div className="flex items-center justify-between mb-6 gap-3">
                                                <div className={clsx(
                                                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold border border-slate-200",
                                                    typeInfo.color, typeInfo.bg
                                                )}>
                                                    {typeInfo.icon}
                                                    {typeInfo.label}
                                                </div>
                                                <span className={clsx(
                                                    "px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize border",
                                                    statusColors[event.status] || statusColors.draft
                                                )}>
                                                    {event.status}
                                                </span>
                                            </div>
                                            
                                            <h3 className="text-2xl font-bold text-slate-900 group-hover:text-violet-700 transition-colors leading-tight mb-3 min-h-[3.5rem] line-clamp-2">
                                                {event.title}
                                            </h3>
                                            
                                            <p className="text-sm text-slate-600 line-clamp-3 mb-6 leading-relaxed">
                                                {event.description}
                                            </p>

                                            <div className="mt-auto pt-5 border-t border-slate-200">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2 text-slate-500 mb-2">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            <span className="text-xs font-medium">{getTimeRemaining(event.end_date)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-medium text-slate-500">
                                                                {event.current_participants}/{event.max_participants || "∞"} participants
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="h-11 w-11 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-violet-600 group-hover:border-violet-600 transition-all duration-300">
                                                        <ArrowUpRight className="w-4.5 h-4.5 text-slate-500 group-hover:text-white" />
                                                    </div>
                                                </div>

                                                {event.prize_description && (
                                                    <div className="mt-5 flex items-center gap-3 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200">
                                                        <Trophy className="w-3.5 h-3.5 text-amber-700" />
                                                        <span className="text-xs font-medium text-amber-800 truncate">{event.prize_description}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
