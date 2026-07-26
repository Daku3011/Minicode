"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, Trophy, Users, Search, ArrowUpRight, Plus } from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";

interface Contest {
    id: number;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    scoring_type: string;
    status: string;
    author_name: string;
    created_at: string;
    is_registered: boolean;
}

const statusColors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-600 border-slate-200",
    upcoming: "bg-amber-50 text-amber-700 border-amber-200",
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    completed: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function ContestsPage() {
    const [contests, setContests] = useState<Contest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchContests();
    }, []);

    const fetchContests = async () => {
        try {
            const response = await api.get("/contests");
            setContests(response.data.items || []);
        } catch (error) {
            console.error("Failed to fetch contests:", error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = contests.filter((c) => {
        const matchesTab =
            activeTab === "all" ||
            (activeTab === "upcoming" && (c.status === "upcoming" || c.status === "draft")) ||
            (activeTab === "active" && c.status === "active") ||
            (activeTab === "completed" && c.status === "completed");
        const matchesSearch =
            c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const getTimeStatus = (contest: Contest) => {
        const now = new Date();
        const start = new Date(contest.start_time);
        const end = new Date(contest.end_time);
        if (now < start) return { label: "Starts", date: contest.start_time };
        if (now >= start && now < end) return { label: "Ends", date: contest.end_time };
        return { label: "Ended", date: contest.end_time };
    };

    return (
        <div className="min-h-screen pt-15 pb-24 px-4 md:px-8 bg-white relative overflow-hidden">
            <div className="max-w-[1600px] mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-6">
                        Contests{" "}
                        <span className="bg-gradient-to-r from-violet-700 via-violet-500 to-blue-500 bg-clip-text text-transparent">
                            Arena
                        </span>
                    </h1>
                    <p className="text-slate-600 text-lg max-w-2xl mx-auto font-medium">
                        Compete in timed coding contests, solve problems, and climb the leaderboard.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-between mb-10 gap-6">
                    <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                        {["all", "upcoming", "active", "completed"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={clsx(
                                    "px-4 py-2.5 rounded-lg text-sm font-medium transition-all capitalize",
                                    activeTab === tab
                                        ? "bg-violet-100 text-violet-700 border border-violet-200"
                                        : "text-slate-600 hover:text-slate-900"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full lg:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search contests..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-violet-200"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-slate-500 font-medium text-sm">Loading contests...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-24 rounded-2xl border border-dashed border-slate-300">
                        <Trophy className="w-14 h-14 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No contests found</h3>
                        <p className="text-slate-500 text-sm">Try a different filter.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((contest) => {
                            const ts = getTimeStatus(contest);
                            return (
                                <Link
                                    key={contest.id}
                                    href={`/contests/${contest.id}`}
                                    className="group relative flex flex-col bg-white rounded-xl border border-slate-200 hover:border-violet-300 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md"
                                >
                                    <div className="p-6 flex flex-col h-full">
                                        <div className="flex items-center justify-between mb-4">
                                            <span
                                                className={clsx(
                                                    "px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize border",
                                                    statusColors[contest.status]
                                                )}
                                            >
                                                {contest.status}
                                            </span>
                                            <span className="text-xs font-medium text-slate-500">
                                                {contest.duration_minutes}min
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-violet-700 transition-colors leading-tight mb-2 line-clamp-2">
                                            {contest.title}
                                        </h3>

                                        <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                                            {contest.description}
                                        </p>

                                        <div className="mt-auto pt-4 border-t border-slate-200">
                                            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>
                                                        {ts.label}: {new Date(ts.date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {contest.is_registered && (
                                                    <span className="text-emerald-600 font-semibold">
                                                        Registered
                                                    </span>
                                                )}
                                            </div>
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
