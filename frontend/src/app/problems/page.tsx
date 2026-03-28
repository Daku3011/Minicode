"use client";
import { useEffect, useState } from "react";
import { PlayCircle, BarChart3, Trophy, ChevronRight, Zap, Target, Flame, Users, BookOpen } from "lucide-react";
import ProblemCard from "@/components/ProblemCard";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Problem {
    id: number;
    title: string;
    difficulty: string;
    description?: string;
}

export default function ProblemsPage() {
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
        <main className="min-h-screen level-0 text-foreground pb-24 md:pb-12 relative overflow-hidden">
            {/* High-Fidelity Background Atmosphere */}
            <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[160px] rounded-full pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 relative z-10">
                {/* Header Section: Editorial Scale */}
                <div className="mb-14 animate-in fade-in slide-in-from-top-6 duration-1000">
                    <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tightest leading-none">
                        HELLO, <span className="text-primary italic">{user?.username.split(' ')[0].toUpperCase() || 'ALCHEMIST'}</span>
                    </h1>
                    <p className="text-foreground/40 mt-4 text-lg font-mono font-bold uppercase tracking-[0.3em]">
                        ENVIRONMENT_STABLE // READY_TO_EXECUTE
                    </p>
                </div>

                {/* Hero Stats/Progress Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16 animate-in fade-in slide-in-from-top-12 duration-1000 delay-200">
                    {/* Continue Solving: The Glass Module */}
                    <div className="lg:col-span-2 glass rounded-[3rem] p-10 md:p-12 relative overflow-hidden group shadow-glass no-border-separation">
                        <div className="absolute top-[-10%] right-[-10%] p-10 text-primary/5 group-hover:scale-110 transition-transform duration-1000">
                            <Zap className="w-64 h-64" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="w-2.5 h-2.5 bg-primary rounded-full animate-ping" />
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-primary">PROTOCOL_ACTIVE</span>
                                </div>
                                <h3 className="text-4xl md:text-5xl font-bold text-foreground tracking-tightest leading-tight">
                                    Architect a <br /> Distributed System
                                </h3>
                                <p className="text-foreground/40 text-sm font-mono font-bold tracking-widest">
                                    UPTIME: 142MIN // PROGRESS: 68.4%
                                </p>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="h-4 w-full level-2 rounded-full overflow-hidden shadow-inner">
                                    <div className="h-full w-[68%] liquid-gradient light-emission rounded-full transition-all duration-1500 ease-out" />
                                </div>
                                <button className="inline-flex items-center gap-4 px-10 py-5 liquid-gradient text-primary-foreground rounded-2xl font-bold text-lg light-emission hover:scale-105 active:scale-95 transition-all shadow-atmospheric">
                                    <span>RESUME_CORE</span>
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Goal: The Tonal Module */}
                    <div className="level-1 rounded-[3rem] p-10 md:p-12 flex flex-col items-center justify-center text-center gap-8 group hover:bg-primary/[0.02] transition-colors shadow-atmospheric">
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/[0.02]" />
                                <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={452.4} strokeDashoffset={452.4 * (1 - 0.72)} className="text-primary transition-all duration-1500 light-emission" strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold font-mono tabular-nums">72</span>
                                <span className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-widest">PERCENT</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-2xl font-bold font-mono tracking-tightest">WEEKLY_PULSE</h4>
                            <p className="text-foreground/30 text-[10px] font-bold uppercase tracking-[0.3em]">
                                03 / 05 TASKS ARCHED
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions: Asymmetrical Layout */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20 animate-in fade-in slide-in-from-top-12 duration-1000 delay-300">
                    {[
                        { label: 'DISCOVER', icon: Target, color: 'text-primary' },
                        { label: 'ASCEND', icon: Trophy, color: 'text-amber-400' },
                        { label: 'SYNERGY', icon: Users, color: 'text-sky-400' },
                        { label: 'ARCHIVE', icon: BookOpen, color: 'text-emerald-400' },
                    ].map((action, i) => (
                        <button key={i} className="flex flex-col items-start gap-4 p-8 glass rounded-[2rem] hover:bg-primary/[0.05] transition-all hover:-translate-y-2 group shadow-atmospheric">
                            <div className={`p-4 rounded-2xl level-2 ${action.color} group-hover:scale-110 transition-transform`}>
                                <action.icon className="w-7 h-7" />
                            </div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-foreground/30 group-hover:text-primary transition-colors">
                                {action.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Main List Section: Editorial Intent */}
                <div className="space-y-12 relative z-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-400">
                    <div className="flex items-center justify-between px-4">
                        <div className="space-y-1">
                            <h3 className="text-4xl font-bold tracking-tightest">THE_ARENA</h3>
                            <p className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.4em]">Curated Logic Challenges</p>
                        </div>
                        <button className="text-[10px] font-mono font-bold text-primary hover:text-primary/60 transition-colors uppercase tracking-[0.3em]">
                            View_All_Nodes →
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        {loading ? (
                            [1, 2, 3].map((i) => (
                                <div key={i} className="h-64 w-full level-1 animate-pulse rounded-[3rem] shadow-atmospheric" />
                            ))
                        ) : problems.length > 0 ? (
                            problems.map((problem) => (
                                <ProblemCard key={problem.id} problem={problem} />
                            ))
                        ) : (
                            <div className="p-20 text-center glass rounded-[3rem] shadow-glass">
                                <p className="text-xl font-mono font-bold text-foreground/20 uppercase tracking-widest">No challenges discovered in this quadrant.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
