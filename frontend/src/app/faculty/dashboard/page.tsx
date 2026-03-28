"use client";

import { useState, useEffect } from "react";
import { Plus, Download, Terminal, CheckCircle2, TrendingUp, AlertTriangle, List, MoreHorizontal, Lightbulb, Search, Settings, MoreVertical, Edit, Trash, BarChart3, Users, Timer } from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";
import api from "@/lib/api";

interface FacultyAnalytics {
    problem_title: string;
    total_submissions: number;
    accepted_count: number;
    average_score: number;
}

interface Problem {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    created_at: string;
    status?: "Active" | "Draft";
}

export default function FacultyDashboard() {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [analytics, setAnalytics] = useState<Record<number, FacultyAnalytics>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const response = await api.get("/faculty/problems");
                const fetchedProblems = response.data.map((p: any) => ({ ...p, status: "Active" }));
                setProblems(fetchedProblems);

                const analyticsData: Record<number, FacultyAnalytics> = {};
                for (const p of fetchedProblems) {
                    try {
                        const stats = await api.get(`/faculty/analytics/${p.id}`);
                        analyticsData[p.id] = stats.data;
                    } catch (e) {
                        console.error(`Failed to fetch analytics for problem ${p.id}`, e);
                    }
                }
                setAnalytics(analyticsData);
            } catch (error) {
                console.error("Failed to fetch faculty problems:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProblems();
    }, []);

    const totalSubmissions = Object.values(analytics).reduce((acc, curr) => acc + curr.total_submissions, 0);
    const totalAccepted = Object.values(analytics).reduce((acc, curr) => acc + curr.accepted_count, 0);
    const overallPassRate = totalSubmissions > 0 ? (totalAccepted / totalSubmissions) * 100 : 0;

    return (
        <main className="min-h-screen level-0 text-foreground pb-24 md:pb-12 relative overflow-hidden">
            {/* High-Fidelity Infrastructure Glow */}
            <div className="fixed top-[-5%] right-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[140px] rounded-full pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 relative z-10">
                {/* Header Section: Minimalist & Authoritative */}
                <div className="flex items-end justify-between mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tightest italic uppercase">Operations</h1>
                        <div className="flex items-center gap-4">
                             <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-atmospheric light-emission" />
                             <span className="text-[10px] font-mono font-bold text-foreground/40 uppercase tracking-[0.4em]">SYSTEM_STABLE // CLUSTER_ALPHA</span>
                        </div>
                    </div>
                </div>

                {/* Top Analytics: The Glass Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20 animate-in fade-in slide-in-from-top-12 duration-1000 delay-100">
                    <div className="lg:col-span-2 glass rounded-[3rem] p-10 relative overflow-hidden group shadow-glass no-border-separation">
                        <div className="absolute top-[-10%] right-[-10%] p-10 text-primary/5 group-hover:scale-110 transition-transform duration-1000">
                            <TrendingUp className="w-48 h-48" />
                        </div>
                        <div className="relative z-10 space-y-8">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.5em] text-primary">AGGREGATE_PULSE</span>
                            <div className="space-y-2">
                                <h3 className="text-6xl md:text-7xl font-bold tracking-tightest italic">92%</h3>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-primary light-emission" />
                                    <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">+4.2%_DELTA</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 level-1 rounded-[3rem] p-10 flex flex-col justify-between group hover:bg-primary/[0.02] transition-colors shadow-atmospheric no-border-separation">
                        <div className="space-y-6">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.5em] text-foreground/20">SUCCESS_RATIO</span>
                            <div className="space-y-1">
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-6xl font-bold tracking-tightest leading-none italic font-mono tabular-nums">{overallPassRate.toFixed(1)}</h3>
                                    <span className="text-foreground/20 text-2xl font-bold font-mono italic">.4</span>
                                </div>
                                <p className="text-foreground/30 text-[10px] font-mono font-bold uppercase tracking-widest">Global_Mean_Output</p>
                            </div>
                        </div>
                        <div className="mt-8 flex gap-2">
                            {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                                <div key={i} className="flex-1 h-12 level-2 rounded-2xl overflow-hidden self-end">
                                    <div className="bg-primary/20 w-full rounded-full transition-all duration-1500 ease-out light-emission" style={{ height: `${h}%` }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Problems Section: High-Density List */}
                <div className="space-y-10 mb-24 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                    <div className="flex items-center justify-between px-4">
                        <div className="space-y-1">
                            <h3 className="text-3xl font-bold tracking-tightest italic uppercase">Active_Nodes</h3>
                            <p className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.4em]">Logic Domain Management</p>
                        </div>
                        <Link href="/faculty/problems/create" className="flex items-center gap-4 px-10 py-5 liquid-gradient text-primary-foreground rounded-2xl font-bold text-sm shadow-atmospheric light-emission hover:scale-105 active:scale-95 transition-all">
                            <Plus className="w-5 h-5" />
                            <span className="uppercase tracking-widest">GENERATE_NODE</span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {loading ? (
                            [1, 2].map(i => <div key={i} className="h-40 level-1 animate-pulse rounded-[2.5rem] shadow-atmospheric" />)
                        ) : problems.map((problem) => (
                            <div key={problem.id} className="group level-1 rounded-[3rem] p-10 flex items-center justify-between hover:bg-primary/[0.02] transition-all shadow-atmospheric no-border-separation hover:scale-[1.01]">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <h4 className="text-2xl font-bold tracking-tightest italic uppercase">{problem.title}</h4>
                                        <div className={clsx("px-4 py-1.5 rounded-full text-[8px] font-mono font-bold uppercase tracking-[0.4em] level-2", problem.status === 'Active' ? 'text-primary/60' : 'text-foreground/20')}>
                                            {problem.status || 'ACTIVE'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 text-foreground/20 text-[10px] font-mono font-bold uppercase tracking-[0.3em] font-bold">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-3.5 h-3.5" />
                                            <span>{analytics[problem.id]?.total_submissions || 0}_SUBMITS</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Timer className="w-3.5 h-3.5" />
                                            <span>2H_DELTA</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="p-4 level-2 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all shadow- atmospheric group/btn">
                                    <MoreVertical className="w-6 h-6 opacity-30 group-hover/btn:opacity-100" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Latest Student Pulse: The Command Station */}
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
                    <div className="space-y-1 px-4">
                        <h3 className="text-3xl font-bold tracking-tightest italic uppercase">Domain_Monitoring</h3>
                        <p className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.4em]">Real-time Logic Evolution</p>
                    </div>
                    
                    <div className="glass rounded-[4rem] p-12 md:p-16 shadow-glass no-border-separation relative overflow-hidden">
                        {/* Background Scanline Effect */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(186,158,255,0.02)_1px,transparent_1px)] bg-[length:100%_4px] pointer-events-none" />
                        
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-12 mb-16 relative z-10">
                            <div className="flex items-center gap-8">
                                <div className="relative">
                                    <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl animate-pulse" />
                                    <img src="https://ui-avatars.com/api/?name=Alex+Rivera&background=7c3aed&color=fff" alt="Student" className="relative w-24 h-24 rounded-3xl border-2 border-primary/20 shadow-atmospheric" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-4xl font-bold tracking-tightest italic uppercase">Alex Rivera</h4>
                                    <p className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.5em] italic">NODE_SIG: CS-302_ADVANCED_ALGO</p>
                                </div>
                            </div>
                            <div className="p-6 level-2 rounded-3xl shadow-atmospheric">
                                <BarChart3 className="w-8 h-8 text-primary opacity-60" />
                            </div>
                        </div>

                        <div className="space-y-16 relative z-10">
                            {/* Chart Module: Tonal Precision */}
                            <div className="space-y-8">
                                <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-foreground/20">
                                    <span>COMMIT_STREAMS // LIVE_FEED</span>
                                    <span className="text-primary tracking-widest italic">42_OPS_DETECTION_WINDOW</span>
                                </div>
                                <div className="flex items-end gap-3 md:gap-6 h-40 md:h-56">
                                    {[15, 30, 20, 60, 45, 10, 25, 5, 20, 40].map((h, i) => (
                                        <div key={i} className="flex-1 group relative">
                                            <div className={clsx("w-full level-2 rounded-t-2xl group-hover:bg-primary/20 transition-all duration-1000 ease-in-out", i % 3 === 0 ? "bg-primary/30 shadow-atmospheric light-emission" : "opacity-30")} style={{ height: `${h}%` }} />
                                            {i % 3 === 0 && (
                                                <div className="absolute top-[-4px] w-full h-1 bg-primary rounded-full blur-[2px] light-emission" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* AI Intervention Module */}
                            <div className="p-10 rounded-[3.5rem] level-2 flex items-start gap-8 group hover:bg-primary/[0.04] transition-all shadow-atmospheric no-border-separation">
                                <div className="p-5 glass rounded-2xl text-primary shadow-atmospheric light-emission">
                                    <Lightbulb className="w-8 h-8 group-hover:animate-bounce" />
                                </div>
                                <div className="space-y-4 pt-2">
                                    <p className="text-2xl font-medium tracking-tight leading-snug">
                                        Logic bottleneck detected at <span className="text-primary italic font-mono px-3 py-1 level-1 rounded-xl shadow-inner">reify_domain.py:84</span> inside the recurrence vector.
                                    </p>
                                    <p className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.6em] italic">EVALUATION_THRESHOLD_BREACHED // INTERVENE_CLEARED</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
