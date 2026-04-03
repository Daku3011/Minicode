"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, BookOpen, Users, Trophy, Calendar, Settings, BarChart3, Target, Plus, Download, Mail, Award, TrendingUp, Clock, ChevronRight, Edit, Loader2, FileText, Sparkles, BookMarked, Search, ArrowRight } from "lucide-react";
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
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<"overview" | "events" | "settings">("overview");
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<FacultyStats>({
        problems_created: 0,
        total_students: 0,
        total_submissions: 0,
        avg_pass_rate: 0
    });
    const [events, setEvents] = useState<Event[]>([]);
    const [problems, setProblems] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

    useEffect(() => {
        fetchFacultyData();
    }, []);

    const fetchFacultyData = async () => {
        try {
            const [problemsRes, eventsRes] = await Promise.all([
                api.get("/faculty/problems"),
                api.get("/events/faculty/my-events").catch(() => ({ data: [] }))
            ]);
            
            setProblems(problemsRes.data);
            setEvents(eventsRes.data);
            
            // Calculate stats
            setStats({
                problems_created: problemsRes.data.length,
                total_students: 0, // Would need a dedicated endpoint
                total_submissions: 0, // Would aggregate from analytics
                avg_pass_rate: 0
            });
        } catch (error) {
            console.error("Failed to fetch faculty data:", error);
        } finally {
            setLoading(false);
        }
    };

    const sidebarItems = [
        { id: "overview", label: "Overview", icon: <BarChart3 className="w-5 h-5" /> },
        { id: "events", label: "My Events", icon: <Calendar className="w-5 h-5" /> },
        { id: "settings", label: "Profile Settings", icon: <Settings className="w-5 h-5" /> },
    ];

    const renderOverview = () => (
        <div className="space-y-8">
            {/* Stats Grid */}
            {/* Student Quick Search */}
            <div className="bg-[#1a142e]/60 backdrop-blur-md border border-indigo-500/20 p-8 rounded-2xl relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="max-w-md">
                        <h3 className="text-xl font-black text-white flex items-center gap-2">
                             <Search className="w-5 h-5 text-indigo-400" /> Student Telemetry
                        </h3>
                        <p className="text-sm text-slate-400 mt-2">
                            Enter a student's username to view their detailed performance profile, submission history, and achievement status.
                        </p>
                    </div>
                    <div className="flex-1 max-w-sm">
                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                const username = (e.target as any).username.value;
                                if (username) window.location.href = `/faculty/students/${username}`;
                            }}
                            className="relative group/form"
                        >
                            <input
                                name="username"
                                type="text"
                                placeholder="Student username (e.g. jdoe123)"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-5 pr-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500 font-mono"
                                required
                            />
                            <button 
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-400 transition-colors shadow-lg shadow-indigo-500/20"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#1a142e]/60 backdrop-blur-md border border-purple-500/20 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-purple-400" />
                        </div>
                        <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">Problems</span>
                    </div>
                    <p className="text-3xl font-black text-white">{stats.problems_created}</p>
                    <p className="text-sm text-slate-400 mt-1">Problems Created</p>
                </div>
                
                <div className="bg-[#1a142e]/60 backdrop-blur-md border border-blue-500/20 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-400" />
                        </div>
                        <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">Students</span>
                    </div>
                    <p className="text-3xl font-black text-white">{stats.total_students}</p>
                    <p className="text-sm text-slate-400 mt-1">Active Students</p>
                </div>
                
                <div className="bg-[#1a142e]/60 backdrop-blur-md border border-green-500/20 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                        </div>
                        <span className="text-xs text-green-400 font-bold uppercase tracking-wider">Submissions</span>
                    </div>
                    <p className="text-3xl font-black text-white">{stats.total_submissions}</p>
                    <p className="text-sm text-slate-400 mt-1">Total Submissions</p>
                </div>
                
                <div className="bg-[#1a142e]/60 backdrop-blur-md border border-amber-500/20 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-amber-400" />
                        </div>
                        <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">Success</span>
                    </div>
                    <p className="text-3xl font-black text-white">{stats.avg_pass_rate.toFixed(1)}%</p>
                    <p className="text-sm text-slate-400 mt-1">Avg Pass Rate</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
                <Link href="/problems/create" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white p-5 rounded-xl flex items-center gap-4 transition-all group">
                    <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold">Create Problem</p>
                        <p className="text-xs text-purple-200">New challenge</p>
                    </div>
                </Link>
                
                <Link href="/faculty/events" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-5 rounded-xl flex items-center gap-4 transition-all group">
                    <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold">Manage Events</p>
                        <p className="text-xs text-blue-200">Edit & organize</p>
                    </div>
                </Link>
                
                <Link href="/faculty/materials" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white p-5 rounded-xl flex items-center gap-4 transition-all group">
                    <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold">AI Generate</p>
                        <p className="text-xs text-emerald-200">From materials</p>
                    </div>
                </Link>
                
                {/* <Link href="/faculty/problems" className="bg-[#1a142e]/60 hover:bg-[#1a142e]/80 border border-white/10 p-5 rounded-xl flex items-center gap-4 transition-all group text-left">
                    <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BookMarked className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <p className="font-bold text-white">Problem Manager</p>
                        <p className="text-xs text-slate-400">Edit & organize</p>
                    </div>
                </Link> */}
            </div>

            {/* Problems List */}
            <div className="bg-[#1a142e]/60 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">My Problems</h2>
                        <p className="text-sm text-slate-400">Coding challenges you've created</p>
                    </div>
                    <div className="flex gap-5">
                        <Link href="/faculty/problems" className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1">
                            Manage All
                        </Link>
                        <Link href="/problems/create" className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1">
                            <Plus className="w-4 h-4" /> Add New
                        </Link>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Problem</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Difficulty</th>
                                {/* <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th> */}
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {problems.length > 0 ? problems.map((problem) => (
                                <tr key={problem.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-white font-medium">{problem.title}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={clsx(
                                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                            problem.difficulty === "Easy" ? "bg-green-500/10 text-green-400" :
                                            problem.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400" :
                                            "bg-red-500/10 text-red-400"
                                        )}>
                                            {problem.difficulty}
                                        </span>
                                    </td>
                                    {/* <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                            <span className="text-green-400 text-sm">Active</span>
                                        </div>
                                    </td> */}
                                    <td className="px-6 py-4 text-slate-400 text-sm">
                                        {new Date(problem.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/problems/${problem.id}`} className="text-purple-400 hover:text-purple-300 text-sm">
                                            View <ChevronRight className="w-4 h-4 inline" />
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-50" />
                                        <p>No problems created yet</p>
                                        <Link href="/problems/create" className="text-purple-400 hover:underline text-sm mt-2 inline-block">
                                            Create your first problem
                                        </Link>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Events */}
            <div className="bg-[#1a142e]/60 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">Recent Events</h2>
                        <p className="text-sm text-slate-400">Events you've created</p>
                    </div>
                    <div className="flex gap-5">
                        <Link href="/faculty/events" className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1">
                            Manage All
                        </Link>
                        <Link href="/events/create" className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1">
                            <Plus className="w-4 h-4" /> New Event
                        </Link>
                    </div>
                </div>
                <div className="p-6">
                    {events.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {events.slice(0, 4).map((event) => (
                                <Link key={event.id} href={`/events/${event.id}`} className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="text-white font-medium truncate">{event.title}</h4>
                                        <span className={clsx(
                                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                            event.status === "active" ? "bg-green-500/10 text-green-400" : "bg-slate-500/10 text-slate-400"
                                        )}>
                                            {event.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            {event.current_participants}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(event.start_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500">
                            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-50" />
                            <p>No events created yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderEvents = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">My Events</h2>
                    <p className="text-slate-400">Manage your created events and challenges</p>
                </div>
            </div>
            
            {events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {events.map((event) => (
                        <Link key={event.id} href={`/events/${event.id}`} className="bg-[#1a142e]/60 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-purple-500/30 transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <span className={clsx(
                                    "px-3 py-1 rounded-full text-xs font-bold",
                                    event.status === "active" ? "bg-green-500/10 text-green-400" :
                                    event.status === "completed" ? "bg-slate-500/10 text-slate-400" :
                                    "bg-amber-500/10 text-amber-400"
                                )}>
                                    {event.status}
                                </span>
                                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                                {event.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                                <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {event.current_participants}{event.max_participants ? `/${event.max_participants}` : ""}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(event.start_date).toLocaleDateString()}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="bg-[#1a142e]/60 backdrop-blur-md border border-white/10 rounded-xl p-12 text-center">
                    <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No events yet</h3>
                    <p className="text-slate-400 mb-6">Create your first event to engage students with challenges and projects.</p>
                    <Link href="/events" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all">
                        <Plus className="w-5 h-5" /> Create Event
                    </Link>
                </div>
            )}
        </div>
    );

    const renderSettings = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
                <p className="text-slate-400">Manage your faculty profile information</p>
            </div>
            
            <div className="bg-[#1a142e]/60 backdrop-blur-md border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-6">Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Username</label>
                        <input
                            type="text"
                            value={user?.username || ""}
                            readOnly
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-white font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                        <input
                            type="email"
                            value={user?.email || ""}
                            readOnly
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-white font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                        <input
                            type="text"
                            value={user?.full_name || "Not set"}
                            readOnly
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Role</label>
                        <input
                            type="text"
                            value={user?.role || "faculty"}
                            readOnly
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-white capitalize"
                        />
                    </div>
                </div>
            </div>
            
            <div className="bg-[#1a142e]/60 backdrop-blur-md border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Connected Accounts</h3>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                    <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center">
                        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385c.6.105.825-.255.825-.57c0-.285-.015-1.23-.015-2.235c-3.015.555-3.795-.735-4.035-1.41c-.135-.345-.72-1.41-1.23-1.695c-.42-.225-1.02-.78-.015-.795c.945-.015 1.62.87 1.845 1.23c1.08 1.815 2.805 1.305 3.495.99c.105-.78.42-1.305.765-1.605c-2.67-.3-5.46-1.335-5.46-5.925c0-1.305.465-2.385 1.23-3.225c-.12-.3-.54-1.53.12-3.18c0 0 1.005-.315 3.3 1.23c.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23c.66 1.65.24 2.88.12 3.18c.765.84 1.23 1.905 1.23 3.225c0 4.605-2.805 5.625-5.475 5.925c.435.375.81 1.095.81 2.22c0 1.605-.015 2.895-.015 3.3c0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <p className="text-white font-medium">GitHub</p>
                        <p className="text-sm text-slate-400">Connected as <span className="font-mono text-purple-400">@{user?.username}</span></p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400">Connected</span>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-[#0f0a1e] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#0f0a1e] text-white">
            {/* Background */}
            <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Profile Header */}
                <div className="bg-[#1a142e]/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 mb-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-3xl font-black text-white overflow-hidden">
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    user?.username?.charAt(0).toUpperCase() || "F"
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center border-4 border-[#0f0a1e]">
                                <Award className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-black text-white mb-1">{user?.full_name || user?.username}</h1>
                            <p className="text-slate-400 mb-4">@{user?.username} • Faculty</p>
                            
                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <BookOpen className="w-4 h-4 text-purple-400" />
                                    <span className="text-white font-bold">{stats.problems_created}</span>
                                    <span className="text-slate-400">Problems</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Users className="w-4 h-4 text-blue-400" />
                                    <span className="text-white font-bold">{stats.total_students}</span>
                                    <span className="text-slate-400">Students</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4 text-green-400" />
                                    <span className="text-white font-bold">{events.length}</span>
                                    <span className="text-slate-400">Events</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-3">
                            <Link href="/problems/create" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all">
                                <Plus className="w-4 h-4" /> New Problem
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={clsx(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                                activeTab === item.id
                                    ? "bg-purple-600 text-white"
                                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === "overview" && renderOverview()}
                {activeTab === "events" && renderEvents()}
                {activeTab === "settings" && renderSettings()}
            </div>
        </div>
    );
}
