"use client";

import { useEffect, useState } from "react";
import {
    User, BookOpen, Users, Trophy, Calendar,
    BarChart3, Target, Plus, Mail, Award, TrendingUp,
    ChevronRight, ArrowRight, ShieldCheck, Zap,
    Activity, Search
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
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"overview" | "events">("overview");
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
            setRecentActivity(statsRes.data.recent_activity || []);
        } catch (error) {
            console.error("Failed to fetch faculty data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <div className="relative">
                    <div className="size-16 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-blue-400" />
                    </div>
                </div>
                <p className="mt-6 text-slate-500 font-black tracking-[0.3em] text-[10px] uppercase">Synchronizing Profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-display relative">
            {/* Background decoration */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.015]">
                <div className="absolute inset-0 bg-[url('/grid.svg')]" />
            </div>

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">

                {/* Hero Profile Card */}
                <div className="mb-10 bg-white border border-blue-100 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="size-32 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
                                <User className="size-14 text-blue-400" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 size-10 rounded-xl bg-blue-600 flex items-center justify-center border-4 border-white shadow-md">
                                <ShieldCheck className="w-4 h-4 text-white" />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                                <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-[10px] font-black uppercase tracking-wider">
                                    Faculty Member
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-4 uppercase">
                                {user?.full_name || user?.username}
                            </h1>
                            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100 text-slate-600 text-sm font-bold">
                                <Mail className="w-4 h-4 text-blue-500" />
                                {user?.email}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex flex-row md:flex-col gap-4 md:gap-3 shrink-0">
                            <div className="text-center px-6 py-3 bg-slate-50 rounded-2xl border border-blue-100">
                                <p className="text-2xl font-black text-slate-900">{stats.problems_created}</p>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Problems</p>
                            </div>
                            <div className="text-center px-6 py-3 bg-slate-50 rounded-2xl border border-blue-100">
                                <p className="text-2xl font-black text-slate-900">{stats.total_students}</p>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Students</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="bg-white border border-blue-100 p-3 rounded-2xl shadow-sm space-y-1">
                            {[
                                { id: "overview", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
                                { id: "events", label: "My Events", icon: <Calendar className="w-4 h-4" /> },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id as any)}
                                    className={clsx(
                                        "w-full flex items-center gap-3 px-5 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all",
                                        activeTab === item.id
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                            : "text-slate-500 hover:text-slate-800 hover:bg-blue-50"
                                    )}
                                >
                                    {item.icon}
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {/* Quick Links */}
                        <div className="bg-white border border-blue-100 p-5 rounded-2xl shadow-sm space-y-2">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Quick Access</p>
                            {[
                                { label: "All Problems", href: "/faculty/problems", icon: <BookOpen className="w-4 h-4" /> },
                                { label: "Student Roster", href: "/faculty/students", icon: <Users className="w-4 h-4" /> },
                                { label: "Cohorts", href: "/faculty/cohorts", icon: <Award className="w-4 h-4" /> },
                                { label: "Events", href: "/faculty/events", icon: <Trophy className="w-4 h-4" /> },
                                { label: "Student Progress", href: "/progress", icon: <Activity className="w-4 h-4" /> },
                            ].map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all text-[11px] font-bold uppercase tracking-widest group"
                                >
                                    <span className="text-slate-400 group-hover:text-blue-500 transition-colors">{link.icon}</span>
                                    {link.label}
                                    <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-9">
                        {activeTab === "overview" && (
                            <div className="space-y-6">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { label: "Problems Created", value: stats.problems_created, icon: <BookOpen className="w-5 h-5 text-purple-500" />, color: "bg-purple-50 border-purple-100" },
                                        { label: "Total Students", value: stats.total_students, icon: <Users className="w-5 h-5 text-blue-500" />, color: "bg-blue-50 border-blue-100" },
                                        { label: "Submissions", value: stats.total_submissions, icon: <TrendingUp className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-50 border-emerald-100" },
                                        { label: "Pass Rate", value: `${stats.avg_pass_rate}%`, icon: <Activity className="w-5 h-5 text-amber-500" />, color: "bg-amber-50 border-amber-100" }
                                    ].map((stat) => (
                                        <div key={stat.label} className={`bg-white border ${stat.color.split(' ')[1]} p-6 rounded-2xl shadow-sm`}>
                                            <div className={`size-10 rounded-xl ${stat.color} flex items-center justify-center mb-4 border`}>
                                                {stat.icon}
                                            </div>
                                            <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Student Search */}
                                <div className="bg-white border border-blue-100 p-8 rounded-2xl shadow-sm">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="max-w-md">
                                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                                                <Search className="w-5 h-5 text-blue-500" />
                                                Search Student
                                            </h3>
                                            <p className="text-slate-500 font-medium text-xs mt-2">
                                                Look up a student by their username to view their performance.
                                            </p>
                                            <a href="/faculty/students" className="text-blue-600 hover:underline font-black text-xs mt-2 block">
                                                → View All Students
                                            </a>
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
                                                    placeholder="Enter username..."
                                                    className="w-full bg-slate-50 border border-blue-200 rounded-xl py-3.5 pl-6 pr-14 text-slate-900 font-bold text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all placeholder:text-slate-400"
                                                    required
                                                />
                                                <button
                                                    type="submit"
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 size-9 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center justify-center shadow-sm"
                                                >
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                {/* Activity Feed */}
                                <div className="bg-white border border-blue-100 p-8 rounded-2xl shadow-sm">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
                                        <Activity className="w-4 h-4 text-blue-500" /> Recent Activity
                                    </h3>
                                    {recentActivity.length > 0 ? (
                                        <div className="space-y-5">
                                            {recentActivity.map((activity) => (
                                                <div key={activity.id} className="flex gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <div className={clsx(
                                                            "size-9 rounded-xl flex items-center justify-center shrink-0",
                                                            activity.type === 'join' ? "bg-blue-50 text-blue-500 border border-blue-100" :
                                                                activity.type === 'submission' ? "bg-emerald-50 text-emerald-500 border border-emerald-100" :
                                                                    "bg-purple-50 text-purple-500 border border-purple-100"
                                                        )}>
                                                            {activity.type === 'join' ? <Users className="w-4 h-4" /> :
                                                                activity.type === 'submission' ? <Zap className="w-4 h-4" /> :
                                                                    <Target className="w-4 h-4" />}
                                                        </div>
                                                        <div className="flex-1 w-px bg-blue-50 my-2" />
                                                    </div>
                                                    <div className="flex-1 pb-4">
                                                        <p className="text-slate-700 font-bold text-sm leading-snug">{activity.message}</p>
                                                        <div className="flex items-center gap-3 mt-1.5">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{activity.timestamp}</span>
                                                            {activity.user && (
                                                                <>
                                                                    <span className="size-1 rounded-full bg-slate-300" />
                                                                    <Link href={`/faculty/students/${activity.user}`} className="text-[9px] font-black text-blue-500 hover:underline uppercase tracking-widest">View Profile</Link>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-slate-400">
                                            <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No recent activity</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "events" && (
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">My Events</h3>
                                    {/* <Link
                                        href="/events/create"
                                        className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2.5 font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-sm shadow-blue-200"
                                    >
                                        <Plus className="w-4 h-4" /> Create Event
                                    </Link> */}
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {events.length > 0 ? events.map((event) => (
                                        <div key={event.id} className="bg-white border border-blue-100 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6 hover:border-blue-200 transition-all shadow-sm group">
                                            <div className="w-full md:w-36 h-20 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{event.event_type}</span>
                                            </div>
                                            <div className="flex-1 text-center md:text-left">
                                                <h4 className="text-lg font-black text-slate-900 tracking-tight uppercase group-hover:text-blue-600 transition-colors">{event.title}</h4>
                                                <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                                                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                        <Calendar className="w-3.5 h-3.5 text-blue-400" /> {new Date(event.start_date).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                        <Users className="w-3.5 h-3.5 text-blue-400" /> {event.current_participants}/{event.max_participants || "∞"}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <div className={clsx(
                                                    "px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest border",
                                                    event.status === "active" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                                        event.status === "upcoming" ? "bg-blue-50 text-blue-600 border-blue-200" :
                                                            "bg-slate-100 text-slate-500 border-slate-200"
                                                )}>
                                                    {event.status}
                                                </div>
                                                <Link href={`/faculty/events/${event.id}`} className="size-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all border border-slate-200">
                                                    <ChevronRight className="w-5 h-5" />
                                                </Link>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="bg-white border border-dashed border-blue-200 p-20 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                                            <Calendar className="w-12 h-12 text-slate-300 mb-4" />
                                            <p className="text-sm font-black uppercase tracking-widest text-slate-400">No events created yet</p>
                                            <Link href="/events/create" className="mt-6 px-6 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 transition-all">
                                                Create First Event
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
