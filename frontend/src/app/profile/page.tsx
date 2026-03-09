"use client";

import { useEffect, useState } from "react";
import { PlayCircle, BarChart3, Trophy } from "lucide-react";
import ProblemCard from "@/components/ProblemCard";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Problem {
    id: number;
    title: string;
    difficulty: string;
}

export default function ProfilePage() {
    const { user } = useAuth();
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
        <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 relative">
            {/* Background Mesh Gradient */}
            <div className="absolute inset-0 pointer-events-none opacity-40 mesh-gradient z-0"></div>

            {/* Hero Section */}
            <section className="glass-card rounded-3xl p-8 md:p-12 mb-8 relative overflow-hidden z-10 border-white/5 shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-2xl text-center md:text-left">
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                            Welcome back, <span className="text-primary">{user?.username || 'Guest'}!</span> <br /> 
                            Ready to crush some code?
                        </h1>
                        <p className="text-slate-400 text-lg mb-8">
                            You're in the top 5% of learners this week. Pick up right where you left off in <span className="text-white font-medium italic">Advanced Python Patterns.</span>
                        </p>
                        <button className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(137,91,245,0.4)] transition-all flex items-center gap-3 mx-auto md:mx-0">
                            <PlayCircle className="w-6 h-6" />
                            Resume Learning
                        </button>
                    </div>
                    
                    <div className="relative w-64 h-64 flex items-center justify-center">
                        {/* Circular Ring Chart */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle className="text-slate-800" cx="128" cy="128" fill="transparent" r="110" stroke="currentColor" strokeWidth="12"></circle>
                            <circle className="text-primary transition-all duration-1000 ease-out" cx="128" cy="128" fill="transparent" r="110" stroke="currentColor" strokeDasharray="690" strokeDashoffset="172" strokeWidth="12" strokeLinecap="round"></circle>
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-4xl font-black text-white">75%</span>
                            <span className="text-xs text-slate-400 uppercase tracking-widest mt-1">Mastered</span>
                        </div>
                    </div>
                </div>
                {/* Decorative blur bg */}
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                {/* Left Column: Topics & Progress */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <BarChart3 className="text-primary w-5 h-5" />
                            Topics Mastered
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-semibold text-slate-200">Arrays & Lists</span>
                                    <span className="text-xs font-bold text-green-400">100%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-full rounded-full"></div>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-semibold text-slate-200">String Manipulation</span>
                                    <span className="text-xs font-bold text-green-400">100%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-full rounded-full"></div>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-semibold text-slate-200">Loops & Iteration</span>
                                    <span className="text-xs font-bold text-primary">85%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-[85%] rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-primary" />
                                Global Rank
                            </h3>
                            <span className="text-primary font-bold text-lg">#1,402</span>
                        </div>
                        <div className="flex items-end gap-2 h-24 pt-4">
                            <div className="bg-primary/20 w-full rounded-t-lg h-1/3 hover:bg-primary/40 transition-colors"></div>
                            <div className="bg-primary/40 w-full rounded-t-lg h-2/3 hover:bg-primary/60 transition-colors"></div>
                            <div className="bg-primary shadow-[0_0_15px_rgba(137,91,245,0.5)] w-full rounded-t-lg h-full"></div>
                            <div className="bg-primary/60 w-full rounded-t-lg h-1/2 hover:bg-primary/80 transition-colors"></div>
                            <div className="bg-primary/30 w-full rounded-t-lg h-2/5 hover:bg-primary/50 transition-colors"></div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Problem Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-bold text-white">Recommended for You</h3>
                        <span className="text-primary text-sm font-semibold hover:underline cursor-pointer">View Library</span>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            [1, 2, 3].map((i) => (
                                <div key={i} className="h-32 w-full bg-white/5 animate-pulse rounded-2xl border border-white/5" />
                            ))
                        ) : problems.length > 0 ? (
                            problems.slice(0, 3).map((problem) => (
                                <ProblemCard key={problem.id} problem={problem} />
                            ))
                        ) : (
                            <div className="p-8 text-center text-slate-500 glass-card rounded-2xl">
                                No challenges available right now.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
