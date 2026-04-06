"use client";

import { useEffect, useState } from "react";
import {
    Trophy, Medal, Crown, TrendingUp, Search,
    Filter, ArrowUpRight, Zap, Star, ShieldCheck,
    Activity, Code
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
    const [activeTab, setActiveTab] = useState<"global" | "friends" | "department">("global");

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

    return (
        <div className="min-h-screen bg-[#05050a] pt-32 pb-24 px-4 md:px-8 text-white font-black overflow-x-hidden relative">
            {/* Minimal Background Element */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 blur-[120px] -z-10 pointer-events-none" />

            <div className="max-w-[1600px] mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-24">
                    <h1 className="text-7xl font-black text-white tracking-tighter mb-8 leading-[0.9] uppercase">
                        Hierarchy <span className="text-primary italic">&</span> Rank
                    </h1>
                    <p className="text-slate-600 text-lg max-w-2xl mx-auto font-black uppercase tracking-tight leading-none">
                        Definitive record of operational excellence across the network.
                    </p>
                </div>

                {/* Top 3 Podium - Static */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 items-end">
                    {/* Rank 2 */}
                    {topThree[1] && (
                        <div className="order-2 md:order-1 h-[320px] bg-white/[0.02] border border-gray-400 rounded-[3.5rem] p-10 flex flex-col items-center justify-center text-center relative group hover:border-white/10 transition-colors">
                             <div className="absolute -top-6 left-1/2 -translate-x-1/2 h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <Medal className="w-8 h-8 text-slate-400" />
                            </div>
                            <div className="w-24 h-24 rounded-full bg-white/5 border-4 border-white/5 mb-6 flex items-center justify-center font-black text-3xl text-slate-500 uppercase tracking-tighter">
                                {topThree[1].username[0]}
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">{topThree[1].username}</h3>
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 mb-4">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Rank #2</span>
                            </div>
                            <div className="text-xl font-black text-white tracking-tighter">{topThree[1].score.toLocaleString()} <span className="text-primary text-xs">XP</span></div>
                        </div>
                    )}

                    {/* Rank 1 */}
                    {topThree[0] && (
                        <div className="order-1 md:order-2 h-[420px] bg-white/[0.03] border border-amber-300 rounded-[4rem] p-12 flex flex-col items-center justify-center text-center relative shadow-2xl shadow-primary/5">
                             <div className="absolute -top-10 left-1/2 -translate-x-1/2 h-20 w-20 rounded-[2.5rem] bg-amber-300/10 border-4 border-amber-300/20 flex items-center justify-center shadow-2xl">
                                <Crown className="w-10 h-10 text-amber-300" />
                            </div>
                            <div className="w-32 h-32 rounded-full bg-white/5 border-4 border-amber-300 mb-8 flex items-center justify-center font-black text-5xl text-amber-200 uppercase tracking-tighter">
                                {topThree[0].username[0]}
                            </div>
                            <h3 className="text-4xl font-black text-white mb-3 uppercase tracking-tighter leading-none">{topThree[0].username}</h3>
                            <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                                <span className="text-xs font-black text-primary uppercase tracking-widest leading-none">Supreme Coder</span>
                            </div>
                            <div className="text-3xl font-black text-white tracking-tighter leading-none">{topThree[0].score.toLocaleString()} <span className="text-primary text-sm">XP</span></div>
                        </div>
                    )}

                    {/* Rank 3 */}
                    {topThree[2] && (
                        <div className="order-3 md:order-3 h-[280px] bg-white/[0.02] border border-yellow-950 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center relative group hover:border-white/10 transition-colors">
                             <div className="absolute -top-6 left-1/2 -translate-x-1/2 h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <Zap className="w-8 h-8 text-yellow-950" />
                            </div>
                            <div className="w-20 h-20 rounded-full bg-white/5 border-4 border-yellow-950 mb-4 flex items-center justify-center font-black text-2xl text-yellow-950 uppercase tracking-tighter">
                                {topThree[2].username[0]}
                            </div>
                            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tighter">{topThree[2].username}</h3>
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 mb-4">
                                <span className="text-[9px] font-black text-yellow-900 uppercase tracking-widest leading-none">Rank #3</span>
                            </div>
                            <div className="text-lg font-black text-white tracking-tighter">{topThree[2].score.toLocaleString()} <span className="text-primary text-xs">XP</span></div>
                        </div>
                    )}
                </div>

                {/* Main Table */}
                <div className="bg-white/[0.01] rounded-[3.5rem] p-10 border border-white/5 relative overflow-hidden">
                    <div className="flex flex-col lg:flex-row items-center justify-between mb-12 gap-8">
                        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                            {[
                                { id: "global", label: "Global" },
                                { id: "department", label: "Sector" },
                                { id: "friends", label: "Nodes" },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={clsx(
                                        "px-10 py-3.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-[0.2em]",
                                        activeTab === tab.id ? "bg-primary text-white" : "text-slate-600 hover:text-slate-400"
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full lg:w-96 group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="IDENTIFY OPERATOR..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-5 pl-16 pr-8 text-[10px] text-white placeholder:text-slate-500 font-black tracking-widest focus:outline-none focus:border-primary/40 transition-all uppercase"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 text-[9px] font-black text-slate-800 uppercase tracking-[0.4em]">
                                    <th className="text-left py-8 px-8">Index</th>
                                    <th className="text-left py-8 px-8">Operator</th>
                                    <th className="text-left py-8 px-8">Gate Level</th>
                                    <th className="text-left py-8 px-8">Resolved</th>
                                    <th className="text-left py-8 px-8">Experience</th>
                                    <th className="text-right py-8 px-8">Protocol</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    [1, 2, 3, 4, 5].map((i) => (
                                        <tr key={i}>
                                            <td colSpan={6} className="py-10 px-8">
                                                <div className="h-10 bg-white/5 rounded-2xl w-full" />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    filteredUsers.slice(3).map((u) => (
                                        <tr
                                            key={u.id}
                                            className={clsx(
                                                "group transition-colors relative",
                                                currentUser?.username === u.username ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-white/[0.02]"
                                            )}
                                        >
                                            <td className="py-8 px-8 font-black text-slate-800 text-sm tracking-tighter">
                                                #{u.rank.toString().padStart(2, '0')}
                                            </td>
                                            <td className="py-8 px-8">
                                                <div className="flex items-center gap-5">
                                                    <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center font-black text-sm text-slate-600 transition-colors group-hover:border-primary/40">
                                                        {u.username[0].toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-white font-black text-sm tracking-tight uppercase leading-none">{u.username}</span>
                                                        <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest leading-none">{u.tags?.[0] || 'OPERATOR'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-8 px-8">
                                                <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none">LVL {u.level}</span>
                                                </div>
                                            </td>
                                            <td className="py-8 px-8">
                                                <div className="flex items-center gap-3 text-slate-400 font-black text-sm uppercase tracking-tighter leading-none">
                                                    <Code className="w-4 h-4 text-primary" />
                                                    {u.problems_solved}
                                                </div>
                                            </td>
                                            <td className="py-8 px-8 font-black text-primary text-sm tracking-tighter leading-none">
                                                {u.experience.toLocaleString()} <span className="text-[10px] text-slate-800">XP</span>
                                            </td>
                                            <td className="py-8 px-8 text-right">
                                                <Link
                                                    href={`/profile/${u.username}`}
                                                    className="h-10 px-8 rounded-xl bg-white/5 border border-white/5 text-white font-black text-[9px] uppercase tracking-widest inline-flex items-center gap-2 hover:bg-primary hover:border-primary transition-all"
                                                >
                                                    Access
                                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
