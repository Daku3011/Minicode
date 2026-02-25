"use client";

import { Trophy, Medal, Star, TrendingUp, Search } from "lucide-react";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import api from "@/lib/api";

interface Leader {
    id: number;
    name: string;
    username: string;
    score: number;
    problems: number;
    avatar: string | null;
    rank: number;
}

export default function LeaderboardPage() {
    const [leaders, setLeaders] = useState<Leader[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaders = async () => {
            try {
                const response = await api.get("/leaderboard");
                setLeaders(response.data);
            } catch (error) {
                console.error("Failed to fetch leaderboard: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaders();
    }, []);

    const topThree = leaders.slice(0, 3);
    const restLeaders = leaders.slice(3).filter(l => l.name.toLowerCase().includes(search.toLowerCase()) || l.username.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-extrabold text-white mb-4">
                    Hall of <span className="gradient-text">Fame</span>
                </h1>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    The top performers of MiniCode. Solve problems, earn XP, and secure your spot at the top.
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : topThree.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">No rankings yet.</div>
            ) : (
                <>
                    {/* Podium Section */}
                    <div className="flex flex-col md:flex-row items-end justify-center gap-4 mb-20">
                        {/* Rank 2 */}
                        {topThree[1] && (
                            <div className="order-2 md:order-1 flex flex-col items-center">
                                <div className="relative group">
                                    <div className="w-20 h-20 rounded-full glass border-2 border-slate-400 flex items-center justify-center text-xl font-bold text-white mb-4 relative z-10 overflow-hidden">
                                        {topThree[1].avatar ? <img src={topThree[1].avatar} alt="" className="w-full h-full object-cover" /> : topThree[1].username.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="absolute -inset-1 bg-slate-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="h-32 w-32 glass rounded-t-2xl flex flex-col items-center justify-center p-4 border-b-0 border-slate-400/30">
                                    <span className="text-2xl font-black text-slate-400">2nd</span>
                                    <span className="text-sm font-bold text-white mt-1">{topThree[1].name}</span>
                                    <span className="text-xs text-muted-foreground">{topThree[1].score} XP</span>
                                </div>
                            </div>
                        )}

                        {/* Rank 1 */}
                        {topThree[0] && (
                            <div className="order-1 md:order-2 flex flex-col items-center -translate-y-4">
                                <Trophy className="w-8 h-8 text-yellow-500 mb-2 animate-bounce" />
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full glass border-4 border-yellow-500 flex items-center justify-center text-2xl font-black text-white mb-4 relative z-10 overflow-hidden">
                                        {topThree[0].avatar ? <img src={topThree[0].avatar} alt="" className="w-full h-full object-cover" /> : topThree[0].username.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="absolute -inset-2 bg-yellow-500/20 blur-2xl opacity-100" />
                                </div>
                                <div className="h-44 w-40 glass rounded-t-2xl flex flex-col items-center justify-center p-4 border-b-0 border-yellow-500/30 bg-yellow-500/5">
                                    <span className="text-4xl font-black text-yellow-500">1st</span>
                                    <span className="text-sm font-bold text-white mt-1">{topThree[0].name}</span>
                                    <span className="text-xs text-muted-foreground">{topThree[0].score} XP</span>
                                </div>
                            </div>
                        )}

                        {/* Rank 3 */}
                        {topThree[2] && (
                            <div className="order-3 flex flex-col items-center">
                                <div className="relative group">
                                    <div className="w-20 h-20 rounded-full glass border-2 border-orange-600 flex items-center justify-center text-xl font-bold text-white mb-4 relative z-10 overflow-hidden">
                                        {topThree[2].avatar ? <img src={topThree[2].avatar} alt="" className="w-full h-full object-cover" /> : topThree[2].username.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="absolute -inset-1 bg-orange-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="h-24 w-32 glass rounded-t-2xl flex flex-col items-center justify-center p-4 border-b-0 border-orange-600/30">
                                    <span className="text-2xl font-black text-orange-600">3rd</span>
                                    <span className="text-sm font-bold text-white mt-1">{topThree[2].name}</span>
                                    <span className="text-xs text-muted-foreground">{topThree[2].score} XP</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Search & Filter */}
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                        <h2 className="text-xl font-bold text-white">Full Rankings</h2>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search student..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                    </div>

                    {/* Leaderboard Table */}
                    <div className="glass rounded-2xl overflow-hidden border-white/10">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="px-6 py-4 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Rank</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Student</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Problems</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {restLeaders.map((leader) => (
                                    <tr key={leader.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-white">#{leader.rank}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary overflow-hidden">
                                                    {leader.avatar ? <img src={leader.avatar} alt="" className="w-full h-full object-cover" /> : leader.username.slice(0, 2).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">
                                                    {leader.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {leader.problems} Solved
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-white">{leader.score} XP</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
