"use client";

import { useEffect, useState } from "react";
import {
    Trophy, Medal, Crown, Search,
    ArrowUpRight, Code
} from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface LeaderboardUser {
    id: number;
    username: string;
    name: string;
    score: number;
    problems: number;
    avatar: string | null;
    rank: number;
    tags: string[];
    level: number;
    problems_solved: number;
    experience: number;
    streak?: number;
}

export default function LeaderboardPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"global" | "monthly" | "weekly">("global");

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const response = await api.get("/leaderboard");
            const enhancedData = response.data.map((u: any, i: number) => ({
                ...u,
                rank: i + 1,
                streak: Math.floor(Math.random() * 15),
                tags: i < 3 ? ["ELITE", "HARDCORE"] : i < 10 ? ["VETERAN"] : ["OPERATOR"],
                level: Math.floor((u.score || 0) / 1000) + 1,
                problems_solved: u.problems || 0,
                experience: u.score || 0
            }));
            setUsers(enhancedData);
        } catch (error) {
            console.error("Failed to fetch leaderboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const topThree = filteredUsers.slice(0, 3);
    const restOfUsers = filteredUsers.slice(3);

    const getTierLabel = (level: number) => {
        if (level >= 10) return "Master Scholar";
        if (level >= 7) return "Advanced";
        if (level >= 4) return "Rising";
        return "Beginner";
    };

    const dummyThird: LeaderboardUser = {
        id: -3,
        username: "risingstar",
        name: "Rising Star",
        score: 1200,
        problems: 8,
        avatar: null,
        rank: 3,
        tags: ["RISING"],
        level: 3,
        problems_solved: 8,
        experience: 1200,
        streak: 4,
    };

    const podiumSlots = [topThree[1] || null, topThree[0] || null, topThree[2] || dummyThird];

    return (
        <div className="min-h-screen bg-[#faf8ff] pt-20 pb-24 px-4 md:px-8 overflow-x-hidden relative">
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-100 blur-3xl opacity-70" />
                <div className="absolute top-60 right-0 h-[320px] w-[320px] rounded-full bg-cyan-100 blur-3xl opacity-50" />
                <div className="absolute bottom-24 left-0 h-[280px] w-[280px] rounded-full bg-indigo-100 blur-3xl opacity-40" />
            </div>

            <div className="max-w-[1600px] mx-auto relative z-10">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-4 leading-[0.95]">
                        Community <span className="text-primary italic bg-gradient-to-r from-violet-700 via-violet-500 to-cyan-500 bg-clip-text text-transparent">Leaders</span>
                    </h1>
                    <p className="text-slate-600 text-base md:text-lg max-w-xl mx-auto font-medium leading-relaxed">
                        Celebrating the craft and consistency of our most dedicated students.
                    </p>
                </div>

                <section className="mb-16 relative min-h-[260px] md:min-h-[470px] max-w-[980px] mx-auto">
                    {podiumSlots[1] && (
                        <div className="relative md:absolute z-30 left-0 top-0 md:left-8 w-full md:w-[460px] mb-6 md:mb-0">
                            <div className="bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[2.5rem] p-2">
                                <div className="bg-white rounded-[2.2rem] p-6 border border-slate-50 relative">
                                    <div className="absolute -top-4 -right-4 w-16 h-16 flex items-center justify-center rounded-full border-4 border-white shadow-lg z-20 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600">
                                        <span className="font-mono font-bold italic text-lg text-white">#1</span>
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                                        <div className="relative flex-shrink-0">
                                            <div className="w-32 h-44 md:w-40 md:h-52 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-500 shadow-2xl ring-8 ring-slate-50/50 overflow-hidden flex items-center justify-center">
                                                {podiumSlots[1].avatar ? (
                                                    <img src={podiumSlots[1].avatar} alt={podiumSlots[1].username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="font-black text-6xl text-violet-700">{podiumSlots[1].username[0].toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary px-3 py-1 rounded-full shadow-lg">
                                                <span className="text-[10px] text-white font-black uppercase tracking-widest whitespace-nowrap">Grandmaster</span>
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-grow text-center md:text-left pt-4">
                                            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight leading-none break-words">{podiumSlots[1].username}</h3>
                                            <div className="grid grid-cols-2 gap-4 mb-8 max-w-[260px]">
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-2xl leading-none font-bold text-primary">{podiumSlots[1].problems_solved}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Solved</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-2xl leading-none font-bold text-primary">{podiumSlots[1].score.toLocaleString()}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">XP Points</span>
                                                </div>
                                            </div>
                                            <button className="w-full py-4 px-6 rounded-2xl bg-primary text-white font-bold shadow-[0_10px_20px_-5px_rgba(124,58,237,0.35)] hover:translate-y-[-2px] transition-transform active:scale-95 text-sm uppercase tracking-widest">
                                                Congratulate
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {podiumSlots[0] && (
                        <div className="relative md:absolute z-20 md:left-[610px] md:top-10 w-full md:w-[360px] mb-6 md:mb-0">
                            <div className="bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[2rem] p-1.5">
                                <div className="bg-slate-50/30 rounded-[1.8rem] p-5 backdrop-blur-sm relative">
                                    <div className="absolute -top-3 -right-3 w-12 h-12 flex items-center justify-center rounded-full border-4 border-white shadow-lg z-20 bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400">
                                        <span className="font-mono font-bold italic text-sm text-slate-700">#2</span>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <div className="w-20 h-20 rounded-xl bg-slate-100 shadow-lg border-4 border-white overflow-hidden flex items-center justify-center">
                                            {podiumSlots[0].avatar ? (
                                                <img src={podiumSlots[0].avatar} alt={podiumSlots[0].username} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-black text-3xl text-slate-700">{podiumSlots[0].username[0].toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-lg md:text-xl font-bold text-slate-900 leading-tight">{podiumSlots[0].username}</h3>
                                            <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">Master Scholar</p>
                                            <div className="grid grid-cols-2 gap-3 max-w-[130px]">
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-sm font-bold text-slate-900 leading-none">{podiumSlots[0].problems_solved}</span>
                                                    <span className="text-[8px] font-black text-slate-400 uppercase">Solved</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-sm font-bold text-slate-900 leading-none">{podiumSlots[0].score.toLocaleString()}</span>
                                                    <span className="text-[8px] font-black text-slate-400 uppercase">XP</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="relative md:absolute z-10 md:left-[560px] md:top-[250px] w-full md:w-[340px]">
                        <div className="bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[2rem] p-1.5">
                            <div className="bg-white rounded-[1.8rem] p-5 relative">
                                <div className="absolute -top-3 -right-3 w-12 h-12 flex items-center justify-center rounded-full border-4 border-white shadow-lg z-20 bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400">
                                    <span className="font-mono font-bold italic text-sm text-orange-900">#3</span>
                                </div>
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-xl bg-orange-50 shadow-md border-2 border-slate-50 overflow-hidden flex items-center justify-center">
                                        {podiumSlots[2].avatar ? (
                                            <img src={podiumSlots[2].avatar} alt={podiumSlots[2].username} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-black text-2xl text-orange-700">{podiumSlots[2].username[0].toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-base md:text-lg font-bold text-slate-900 leading-tight">{podiumSlots[2].name || podiumSlots[2].username}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Scholar</p>
                                        <div className="grid grid-cols-2 gap-3 max-w-[120px]">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-sm font-bold text-slate-900 leading-none">{podiumSlots[2].problems_solved}</span>
                                                <span className="text-[8px] font-black text-slate-400 uppercase">Solved</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-mono text-sm font-bold text-slate-900 leading-none">{podiumSlots[2].score.toLocaleString()}</span>
                                                <span className="text-[8px] font-black text-slate-400 uppercase">XP</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-10" />
                    <div className="absolute left-[35%] bottom-0 w-64 h-2 bg-gradient-to-r from-transparent via-primary/20 to-transparent rounded-full -z-10" />
                </section>

                <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-200 relative overflow-hidden shadow-sm">
                    <div className="flex flex-col lg:flex-row items-center justify-between mb-12 gap-8">
                        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                            {[
                                { id: "global", label: "Global" },
                                { id: "monthly", label: "Monthly" },
                                { id: "weekly", label: "Weekly" },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={clsx(
                                        "px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
                                        activeTab === tab.id ? "bg-violet-600 text-white" : "text-slate-600 hover:text-slate-900"
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full lg:w-96 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-5 text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-violet-200 transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                                    <th className="text-left py-5 px-4">Rank</th>
                                    <th className="text-left py-5 px-4">Student</th>
                                    <th className="text-left py-5 px-4">Solved</th>
                                    <th className="text-left py-5 px-4">XP</th>
                                    <th className="text-left py-5 px-4">Tier</th>
                                    <th className="text-right py-5 px-4">Profile</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    [1, 2, 3, 4, 5].map((i) => (
                                        <tr key={i}>
                                            <td colSpan={6} className="py-5 px-4">
                                                <div className="h-9 bg-slate-100 rounded-lg w-full animate-pulse" />
                                            </td>
                                        </tr>
                                    ))
                                ) : restOfUsers.length > 0 ? (
                                    restOfUsers.map((u) => (
                                        <tr
                                            key={u.id}
                                            className={clsx(
                                                "group transition-colors relative",
                                                currentUser?.username === u.username ? "bg-violet-50 hover:bg-violet-100" : "hover:bg-slate-50"
                                            )}
                                        >
                                            <td className="py-5 px-4 font-semibold text-slate-700 text-sm">
                                                #{u.rank}
                                            </td>
                                            <td className="py-5 px-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-11 w-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-semibold text-sm text-slate-700 transition-colors group-hover:border-violet-300">
                                                        {u.username[0].toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-slate-900 font-semibold text-sm leading-none">{u.username}</span>
                                                        <span className="text-xs font-medium text-slate-500 leading-none">{u.name || "MiniCode Student"}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4">
                                                <div className="flex items-center gap-2 text-slate-700 font-medium text-sm leading-none">
                                                    <Code className="w-4 h-4 text-violet-600" />
                                                    {u.problems_solved}
                                                </div>
                                            </td>
                                            <td className="py-5 px-4 font-semibold text-violet-700 text-sm leading-none">
                                                {u.experience.toLocaleString()} <span className="text-xs text-violet-500">XP</span>
                                            </td>
                                            <td className="py-5 px-4">
                                                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
                                                    {getTierLabel(u.level)}
                                                </span>
                                            </td>
                                            <td className="py-5 px-4 text-right">
                                                <Link
                                                    href={`/profile/${u.username}`}
                                                    className="h-9 px-4 rounded-lg bg-white border border-slate-300 text-slate-700 font-medium text-sm inline-flex items-center gap-2 hover:bg-violet-600 hover:border-violet-600 hover:text-white transition-all"
                                                >
                                                    View
                                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-16 px-4 text-center">
                                            <div className="inline-flex flex-col items-center gap-2">
                                                <Trophy className="w-8 h-8 text-slate-300" />
                                                <p className="text-slate-600 text-lg font-semibold">No students found</p>
                                                <p className="text-slate-400 text-sm">Try a different search term.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
