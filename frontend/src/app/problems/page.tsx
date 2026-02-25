"use client";

import { useEffect, useState } from "react";
import { Search, Filter, Trophy } from "lucide-react";
import ProblemCard from "@/components/ProblemCard";
import api from "@/lib/api";

interface Problem {
    id: number;
    title: string;
    difficulty: string;
}

export default function ProblemsPage() {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const response = await api.get("/problems");
                setProblems(response.data);
            } catch (error) {
                console.error("Failed to fetch problems:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProblems();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
                        Practice <span className="gradient-text">Arena</span>
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Master your skills with hand-picked DSA challenges.
                    </p>
                </div>

                <div className="flex items-center bg-white/5 rounded-full px-6 py-4 glass">
                    <div className="flex items-center space-x-6">
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-bold text-emerald-400">12</span>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Solved</span>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-bold text-primary">#42</span>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Rank</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Filters */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass rounded-2xl p-6 space-y-6">
                        <div>
                            <label className="text-sm font-semibold text-white mb-3 block">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Find a problem..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-white mb-3 block">Difficulty</label>
                            <div className="space-y-2">
                                {['Easy', 'Medium', 'Hard'].map((diff) => (
                                    <label key={diff} className="flex items-center space-x-3 cursor-pointer group">
                                        <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary" />
                                        <span className="text-sm text-muted-foreground group-hover:text-white transition-colors">{diff}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all">
                            Reset Filters
                        </button>
                    </div>

                    <div className="glass rounded-2xl p-6 bg-gradient-to-br from-primary/20 to-transparent border-primary/20">
                        <div className="flex items-center space-x-2 mb-3">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            <h3 className="text-sm font-bold text-white">Daily Challenge</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                            Solve the Daily Challenge to earn double points and climb the leaderboard.
                        </p>
                        <button className="w-full py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all">
                            Join Challenge
                        </button>
                    </div>
                </div>

                {/* Problem List */}
                <div className="lg:col-span-3">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-muted-foreground">Showing <span className="text-white font-medium">{problems.length}</span> individual problems</span>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Filter className="w-4 h-4" />
                            <span>Sort by: <span className="text-white font-medium cursor-pointer">Newest</span></span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {loading ? (
                            [1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-24 w-full bg-white/5 animate-pulse rounded-xl" />
                            ))
                        ) : (
                            problems.map((problem) => (
                                <ProblemCard key={problem.id} problem={problem} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
