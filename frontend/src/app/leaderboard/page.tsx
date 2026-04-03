"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Trophy, Medal, Crown, TrendingUp, Search,
    Filter, ArrowUpRight, Zap, Star, ShieldCheck,
    Activity, Code
} from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import MagneticWrapper from "../../components/MagneticWrapper";

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
            // Add mock data for tags and streaks if not present
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
        <div className="min-h-screen pt-32 pb-24 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Hero Header */}
                <div className="text-center mb-24 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <span className="text-primary font-black text-[10px] uppercase tracking-[0.6em] mb-6 block">Status Network</span>
                        <h1 className="text-7xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
                            HIERARCHY <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">&</span> RANK
                        </h1>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium leading-relaxed mb-12">
                            The definitive record of operational excellence. Track real-time performance
                            metrics across the global Minicode network.
                        </p>
                    </motion.div>

                    {/* Decorative Nebula */}
                    <div className="absolute -top-64 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
                </div>

                {/* Top 3 Podium */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 items-end">
                    {/* Rank 2 */}
                    {topThree[1] && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="order-2 md:order-1 h-[320px] glass-card rounded-[3rem] p-8 border border-white/10 relative group hover:border-slate-400/30 transition-all duration-300"
                        >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 h-14 w-14 rounded-2xl bg-slate-500/20 backdrop-blur-xl border border-slate-500/30 flex items-center justify-center shadow-2xl">
                                <Medal className="w-8 h-8 text-slate-400" />
                            </div>
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-500/20 to-transparent border-4 border-slate-500/30 mb-6 flex items-center justify-center overflow-hidden">
                                    <span className="text-3xl font-black text-slate-400">{topThree[1].username[0].toUpperCase()}</span>
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">{topThree[1].username}</h3>
                                <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
                                    <Star className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RANK 02</span>
                                </div>
                                <div className="text-primary font-black text-lg">{topThree[1].score.toLocaleString()} XP</div>
                            </div>
                        </motion.div>
                    )}

                    {/* Rank 1 */}
                    {topThree[0] && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className="order-1 md:order-2 h-[400px] glass-card rounded-[3rem] p-8 border border-amber-500/30 relative group hover:border-amber-500/50 transition-all duration-300 shadow-[0_0_50px_rgba(245,158,11,0.05)]"
                        >
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 h-20 w-20 rounded-[2rem] bg-amber-500/20 backdrop-blur-xl border border-amber-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                                <Crown className="w-10 h-10 text-amber-500" />
                            </div>
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500/20 to-transparent border-4 border-amber-500/30 mb-6 flex items-center justify-center overflow-hidden shadow-2xl">
                                    <span className="text-5xl font-black text-amber-500">{topThree[0].username[0].toUpperCase()}</span>
                                </div>
                                <h3 className="text-3xl font-black text-white mb-2">{topThree[0].username}</h3>
                                <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
                                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                                    <span className="text-xs font-black text-amber-500 uppercase tracking-widest">SUPREME OPERATOR</span>
                                </div>
                                <div className="text-amber-500 font-black text-2xl tracking-tighter">{topThree[0].score.toLocaleString()} XP</div>
                            </div>
                        </motion.div>
                    )}

                    {/* Rank 3 */}
                    {topThree[2] && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="order-3 md:order-3 h-[280px] glass-card rounded-[3rem] p-8 border border-rose-500/20 relative group hover:border-rose-400/30 transition-all duration-300"
                        >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 h-14 w-14 rounded-2xl bg-rose-500/20 backdrop-blur-xl border border-rose-500/30 flex items-center justify-center shadow-2xl">
                                <Zap className="w-8 h-8 text-rose-400" />
                            </div>
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-500/20 to-transparent border-4 border-rose-500/30 mb-6 flex items-center justify-center overflow-hidden">
                                    <span className="text-2xl font-black text-rose-400">{topThree[2].username[0].toUpperCase()}</span>
                                </div>
                                <h3 className="text-xl font-black text-white mb-2">{topThree[2].username}</h3>
                                <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
                                    <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">RANK 03</span>
                                </div>
                                <div className="text-rose-400 font-black text-lg">{topThree[2].score.toLocaleString()} XP</div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Main Table Interface */}
                <div className="glass-card rounded-[3rem] p-8 border border-white/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] via-transparent to-transparent pointer-events-none" />

                    {/* Table Header Controls */}
                    <div className="flex flex-col lg:flex-row items-center justify-between mb-12 gap-8 relative z-10">
                        <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-3xl">
                            {[
                                { id: "global", label: "Global" },
                                { id: "department", label: "Department" },
                                { id: "friends", label: "Contacts" },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={clsx(
                                        "px-8 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest relative whitespace-nowrap",
                                        activeTab === tab.id ? "text-white" : "text-slate-500 hover:text-white"
                                    )}
                                >
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="tab-pill-leader"
                                            className="absolute inset-0 bg-primary/20 rounded-xl border border-primary/30"
                                            transition={{ duration: 0.2 }}
                                        />
                                    )}
                                    <span className="relative z-10">{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full lg:w-96 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-600 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="IDENTIFY USER..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-xs text-white placeholder-slate-700 font-bold tracking-widest focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/40 transition-all shadow-2xl"
                            />
                        </div>
                    </div>

                    {/* Table Content */}
                    <div className="overflow-x-auto relative z-10">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                                    <th className="text-left py-6 px-6 pb-8">Rank</th>
                                    <th className="text-left py-6 px-6 pb-8">Operator</th>
                                    <th className="text-left py-6 px-6 pb-8">Clearance</th>
                                    <th className="text-left py-6 px-6 pb-8">Resolved</th>
                                    <th className="text-left py-6 px-6 pb-8">Experience Points</th>
                                    <th className="text-right py-6 px-6 pb-8">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    [1, 2, 3, 4, 5].map((i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="py-8 px-6">
                                                <div className="h-12 bg-white/5 rounded-2xl w-full" />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    filteredUsers.slice(3).map((u, i) => (
                                        <motion.tr
                                            key={u.id}
                                            initial={{ opacity: 0, x: -5 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.02 * i }}
                                            className={clsx(
                                                "group hover:bg-white/[0.02] transition-colors relative",
                                                currentUser?.username === u.username && "bg-primary/5"
                                            )}
                                        >
                                            <td className="py-6 px-6 font-black text-slate-500 text-sm">
                                                #{u.rank.toString().padStart(2, '0')}
                                            </td>
                                            <td className="py-6 px-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-sm text-slate-400 group-hover:border-primary/50 transition-colors">
                                                        {u.username[0].toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-white font-black text-sm">{u.username}</span>
                                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">{u.tags?.[0] || 'OPERATOR'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6 px-6">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20">
                                                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">LVL {u.level}</span>
                                                </div>
                                            </td>
                                            <td className="py-6 px-6 font-bold text-white text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Code className="w-4 h-4 text-secondary/60" />
                                                    {u.problems_solved}
                                                </div>
                                            </td>
                                            <td className="py-6 px-6 font-black text-primary text-sm">
                                                {u.experience.toLocaleString()} XP
                                            </td>
                                            <td className="py-6 px-6 text-right">
                                                <MagneticWrapper>
                                                    <Link
                                                        href={`/profile/${u.username}`}
                                                        className="h-10 px-6 rounded-xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest inline-flex items-center gap-2 hover:bg-primary hover:border-primary transition-all"
                                                    >
                                                        Details
                                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                                    </Link>
                                                </MagneticWrapper>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Insight */}
                {/* <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-16 text-center"
                >
                    <div className="inline-flex items-center gap-6 px-8 py-4 bg-white/[0.01] rounded-3xl border border-white/5 backdrop-blur-xl">
                        <Activity className="w-5 h-5 text-emerald-400" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Real-time synchronization active. Last update <span className="text-white font-black">Just Now</span>
                        </span>
                    </div>
                </motion.div> */}
            </div>
        </div>
    );
}
