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
        <main className="min-h-screen level-0 text-foreground pb-24 relative overflow-hidden">
            {/* Ambient Infrastructure Glow */}
            <div className="fixed top-[-10%] left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-primary/5 blur-[160px] rounded-full pointer-events-none" />
            
            <div className="max-w-6xl mx-auto px-4 py-20 relative z-10">
                <div className="text-center mb-24 space-y-6 animate-in fade-in slide-in-from-top-8 duration-1000">
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tightest italic uppercase">
                        Hall_of_<span className="text-primary italic">Precision</span>
                    </h1>
                    <p className="text-[10px] font-mono font-bold text-foreground/30 uppercase tracking-[0.6em] max-w-lg mx-auto leading-relaxed">
                        Top level entities maintaining peak operational efficiency within the MiniCode domain. 
                    </p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-6">
                        <div className="w-16 h-16 level-1 rounded-full border-2 border-primary/20 border-t-primary animate-spin shadow-atmospheric light-emission" />
                        <span className="text-[10px] font-mono font-bold text-primary/40 uppercase tracking-[0.4em] animate-pulse">Syncing_Nodes...</span>
                    </div>
                ) : topThree.length === 0 ? (
                    <div className="text-center py-40 text-foreground/20 font-mono text-[10px] uppercase tracking-[0.4em]">Zero_Entries_Detected</div>
                ) : (
                    <>
                        {/* Podium Section: The Tonal Hierarchy */}
                        <div className="flex flex-col md:flex-row items-end justify-center gap-10 mb-32 animate-in fade-in zoom-in duration-1000 delay-200">
                            {/* Rank 2 */}
                            {topThree[1] && (
                                <div className="order-2 md:order-1 flex flex-col items-center group">
                                    <div className="relative mb-8">
                                        <div className="absolute -inset-6 bg-slate-400/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                        <div className="w-24 h-24 rounded-[2rem] glass border border-slate-400/20 flex items-center justify-center text-2xl font-bold text-white relative z-10 overflow-hidden shadow-glass transition-transform duration-700 group-hover:scale-105">
                                            {topThree[1].avatar ? <img src={topThree[1].avatar} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" /> : <span className="font-mono">{topThree[1].username.slice(0, 2).toUpperCase()}</span>}
                                        </div>
                                    </div>
                                    <div className="h-44 w-44 glass rounded-[3rem] flex flex-col items-center justify-center p-8 shadow-glass no-border-separation group-hover:bg-slate-400/[0.02] transition-colors">
                                        <span className="text-4xl font-bold italic tracking-tightest text-slate-400/40">02</span>
                                        <span className="text-sm font-bold text-white mt-4 uppercase tracking-widest">{topThree[1].name}</span>
                                        <span className="text-[10px] font-mono font-bold text-slate-400/60 mt-2 uppercase tracking-widest">{topThree[1].score}_XP</span>
                                    </div>
                                </div>
                            )}

                            {/* Rank 1 */}
                            {topThree[0] && (
                                <div className="order-1 md:order-2 flex flex-col items-center -translate-y-8 group">
                                    <div className="relative mb-8">
                                        <div className="absolute -inset-10 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                                        <div className="w-32 h-32 rounded-[2.5rem] glass border-2 border-primary flex items-center justify-center text-4xl font-bold text-white relative z-10 overflow-hidden shadow-glass light-emission transform transition-all duration-1000 group-hover:scale-110">
                                            {topThree[0].avatar ? <img src={topThree[0].avatar} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" /> : <span className="font-mono tracking-widest">{topThree[0].username.slice(0, 2).toUpperCase()}</span>}
                                        </div>
                                        <Trophy className="absolute -top-6 -right-6 w-12 h-12 text-primary light-emission animate-bounce" />
                                    </div>
                                    <div className="h-64 w-56 glass rounded-[4rem] flex flex-col items-center justify-center p-10 shadow-glass no-border-separation bg-primary/5 light-emission group-hover:bg-primary/10 transition-all">
                                        <span className="text-7xl font-bold italic tracking-tightest text-primary light-emission">01</span>
                                        <span className="text-lg font-bold text-white mt-6 uppercase tracking-[0.2em]">{topThree[0].name}</span>
                                        <span className="text-[10px] font-mono font-bold text-primary mt-3 uppercase tracking-[0.4em] italic">{topThree[0].score}_XP</span>
                                    </div>
                                </div>
                            )}

                            {/* Rank 3 */}
                            {topThree[2] && (
                                <div className="order-3 flex flex-col items-center group">
                                    <div className="relative mb-8">
                                        <div className="absolute -inset-6 bg-orange-600/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                        <div className="w-24 h-24 rounded-[2rem] glass border border-orange-600/20 flex items-center justify-center text-2xl font-bold text-white relative z-10 overflow-hidden shadow-glass transition-transform duration-700 group-hover:scale-105">
                                            {topThree[2].avatar ? <img src={topThree[2].avatar} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" /> : <span className="font-mono">{topThree[2].username.slice(0, 2).toUpperCase()}</span>}
                                        </div>
                                    </div>
                                    <div className="h-36 w-44 glass rounded-[3rem] flex flex-col items-center justify-center p-8 shadow-glass no-border-separation group-hover:bg-orange-600/[0.02] transition-colors">
                                        <span className="text-4xl font-bold italic tracking-tightest text-orange-600/40">03</span>
                                        <span className="text-sm font-bold text-white mt-4 uppercase tracking-widest">{topThree[2].name}</span>
                                        <span className="text-[10px] font-mono font-bold text-orange-600/60 mt-2 uppercase tracking-widest">{topThree[2].score}_XP</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Search & List Section */}
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 px-4">
                                <div className="space-y-1">
                                    <h3 className="text-3xl font-bold tracking-tightest italic uppercase">Operative_Directory</h3>
                                    <p className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.4em]">Global Node Distribution</p>
                                </div>
                                <div className="relative w-full sm:w-80 group">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="SEARCH_NODE..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full level-1 rounded-2xl py-4 pl-14 pr-6 text-xs font-mono font-bold tracking-widest focus:outline-none focus:bg-primary/[0.02] focus:ring-1 focus:ring-primary/20 transition-all shadow-atmospheric"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {restLeaders.map((leader) => (
                                    <div key={leader.id} className="group level-1 rounded-[2.5rem] p-8 pr-12 flex items-center justify-between hover:bg-primary/[0.02] transition-all shadow-atmospheric no-border-separation hover:scale-[1.01]">
                                        <div className="flex items-center gap-10">
                                            <div className="w-16 text-center">
                                                <span className="text-2xl font-mono font-bold italic text-foreground/20 group-hover:text-primary/40 transition-colors uppercase tracking-tightest">
                                                    #{leader.rank.toString().padStart(2, '0')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-2xl glass border border-foreground/10 flex items-center justify-center text-[10px] font-mono font-bold text-primary overflow-hidden shadow-glass group-hover:border-primary/30 transition-colors">
                                                    {leader.avatar ? <img src={leader.avatar} alt="" className="w-full h-full object-cover" /> : leader.username.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-xl font-bold italic text-white group-hover:text-primary transition-colors uppercase tracking-tightest">
                                                        {leader.name}
                                                    </span>
                                                    <p className="text-[8px] font-mono font-bold text-foreground/20 uppercase tracking-[0.3em]">NODE_ID: {leader.username}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-16">
                                            <div className="hidden md:flex flex-col items-end gap-1">
                                                <span className="text-[10px] font-mono font-bold text-foreground/40 uppercase tracking-widest">{leader.problems}_SOLVED</span>
                                            </div>
                                            <div className="text-right min-w-[100px]">
                                                <span className="text-2xl font-mono font-bold italic text-white group-hover:text-primary transition-colors tabular-nums">{leader.score}</span>
                                                <span className="text-[10px] font-mono font-bold text-foreground/30 ml-2 uppercase tracking-widest">XP</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
