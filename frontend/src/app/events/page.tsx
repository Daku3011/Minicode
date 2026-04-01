"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Users, Trophy, Clock, Filter, Search, Zap, Target, Star, ChevronRight, Plus } from "lucide-react";
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

const eventTypeLabels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    weekly_challenge: { label: "Weekly Challenge", color: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: <Zap className="w-4 h-4" /> },
    team_project: { label: "Team Project", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: <Users className="w-4 h-4" /> },
    announcement: { label: "Announcement", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: <Target className="w-4 h-4" /> },
};

const statusColors: Record<string, string> = {
    active: "bg-green-500/10 text-green-400 border-green-500/20",
    draft: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    completed: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
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
        
        if (days > 0) return `${days}d ${hours}h remaining`;
        return `${hours}h remaining`;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#0f0a1e]">
            {/* Background Gradient */}
            <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight">
                            Events <span className="text-purple-400">&</span> Challenges
                        </h1>
                        <p className="text-slate-400 mt-2 max-w-2xl">
                            Participate in weekly challenges, team projects, and special events. 
                            Compete, collaborate, and climb the leaderboard!
                        </p>
                    </div>
                    {isFaculty ? (
                        <div className="flex gap-3">
                            <Link 
                                href="/faculty/events" 
                                className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all border border-white/10"
                            >
                                <Calendar className="w-4 h-4" /> Manage Events
                            </Link>
                            <Link 
                                href="/events/create" 
                                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-purple-500/20"
                            >
                                <Plus className="w-4 h-4" /> Create Event
                            </Link>
                        </div>
                    ) : null}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{upcomingEvents.length}</p>
                                <p className="text-xs text-slate-400">Upcoming</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{events.reduce((acc, e) => acc + e.current_participants, 0)}</p>
                                <p className="text-xs text-slate-400">Total Participants</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{events.filter(e => e.event_type === "weekly_challenge").length}</p>
                                <p className="text-xs text-slate-400">Challenges</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <Star className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{events.filter(e => e.is_joined).length}</p>
                                <p className="text-xs text-slate-400">Joined</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                    {[
                        { id: "upcoming", label: "Upcoming", count: upcomingEvents.length },
                        { id: "past", label: "Past", count: pastEvents.length },
                        { id: "all", label: "All", count: events.length },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2",
                                activeTab === tab.id
                                    ? "bg-purple-600 text-white"
                                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            {tab.label}
                            <span className={clsx(
                                "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                                activeTab === tab.id ? "bg-white/20 text-white" : "bg-white/10 text-slate-500"
                            )}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                </div>

                {/* Events Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-20">
                        <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-300 mb-2">No events found</h3>
                        <p className="text-slate-500">Check back later for new challenges and announcements.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvents.map((event) => {
                            const typeInfo = eventTypeLabels[event.event_type] || eventTypeLabels.announcement;
                            
                            return (
                                <Link
                                    key={event.id}
                                    href={`/events/${event.id}`}
                                    className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                                >
                                    {/* Card Header */}
                                    <div className="p-6 pb-4">
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <span className={clsx(
                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                                                typeInfo.color
                                            )}>
                                                {typeInfo.icon}
                                                {typeInfo.label}
                                            </span>
                                            <span className={clsx(
                                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                                                statusColors[event.status] || statusColors.draft
                                            )}>
                                                {event.status}
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors line-clamp-2">
                                            {event.title}
                                        </h3>
                                        
                                        <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                                            {event.description}
                                        </p>
                                    </div>
                                    
                                    {/* Card Footer */}
                                    <div className="px-6 py-4 bg-white/5 border-t border-white/10">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <Users className="w-4 h-4" />
                                                    <span>{event.current_participants}{event.max_participants ? `/${event.max_participants}` : ""}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="text-xs">{getTimeRemaining(event.end_date)}</span>
                                                </div>
                                            </div>
                                            {event.is_joined && (
                                                <span className="text-green-400 text-xs font-bold">Joined ✓</span>
                                            )}
                                        </div>
                                        
                                        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
                                            <span>{formatDate(event.start_date)}</span>
                                            {event.prize_description && (
                                                <span className="flex items-center gap-1 text-amber-400/80">
                                                    <Trophy className="w-3 h-3" />
                                                    {event.prize_description}
                                                </span>
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
    );
}
