"use client";

import { useState, useEffect } from "react";
import { Plus, Download, Terminal, CheckCircle2, TrendingUp, AlertTriangle, List, MoreHorizontal, Lightbulb, Search, Settings, MoreVertical, Edit, Trash, BarChart3, Bell } from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import MagneticWrapper from "@/components/MagneticWrapper";
import BroadcastAlert from "@/components/BroadcastAlert";

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

    const totalActiveProblems = problems.length;
    const totalSubmissions = Object.values(analytics).reduce((acc: number, curr: FacultyAnalytics) => acc + curr.total_submissions, 0);
    const totalAccepted = Object.values(analytics).reduce((acc: number, curr: FacultyAnalytics) => acc + curr.accepted_count, 0);
    const overallPassRate = totalSubmissions > 0 ? (totalAccepted / totalSubmissions) * 100 : 0;

    return (
        <div className="bg-[#0f0a1e] text-slate-100 min-h-[calc(100vh-64px)] font-display relative overflow-x-hidden">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-[#22d3ee]/10 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/grid.svg')] opacity-5" />
            </div>

            {/* Inner Top Nav for Faculty specifically */}
            <div className="sticky top-0 z-40 w-full mb-8">
                <div className="flex items-center gap-8 border-b border-primary/10 bg-[#1a142e]/40 backdrop-blur-xl px-6 py-3 w-full">
                    <nav className="flex items-center gap-8 overflow-x-auto no-scrollbar">
                        <button className="text-primary text-sm font-bold border-b-2 border-primary pb-2 whitespace-nowrap">Dashboard</button>
                        <button className="text-slate-400 hover:text-slate-100 text-sm font-medium transition-colors whitespace-nowrap pb-2">Curriculum</button>
                        <Link href="/faculty/students" className="text-slate-400 hover:text-slate-100 text-sm font-medium transition-colors whitespace-nowrap pb-2">Student Roster</Link>
                        <button className="text-slate-400 hover:text-slate-100 text-sm font-medium transition-colors whitespace-nowrap pb-2">Reports</button>
                    </nav>
                </div>
            </div>

            <main className="flex-1 px-6 lg:px-10 max-w-7xl mx-auto w-full space-y-10 relative z-10 mb-20">
                {/* Header & Stats Overview */}
                <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-4"
                >
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-wider">Faculty Portal</span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tight">Faculty Overview</h1>
                        <p className="text-slate-400 text-lg">Real-time performance analytics for CS101: Data Structures</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <BroadcastAlert />
                        <MagneticWrapper>
                            <button className="glass-card border-primary/20 text-slate-100 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2.5 hover:bg-primary/10 transition-all">
                                <Download className="w-4 h-4" /> Export Data
                            </button>
                        </MagneticWrapper>
                        <MagneticWrapper>
                            <Link href="/faculty/problems" className="premium-btn px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2.5 transition-all">
                                <Plus className="w-4 h-4" /> New Assignment
                            </Link>
                        </MagneticWrapper>
                    </div>
                </motion.div>

                {/* High-Level Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#1a142e]/60 backdrop-blur-md border border-primary/10 p-6 rounded-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Terminal className="text-primary w-16 h-16" />
                        </div>
                        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Submissions</p>
                        <div className="flex items-baseline gap-3 mt-2">
                            <h3 className="text-3xl font-bold text-slate-100">{totalSubmissions.toLocaleString()}</h3>
                            <span className="text-[#22d3ee] text-sm font-bold flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> +12.5%</span>
                        </div>
                        <div className="mt-4 h-1 w-full bg-primary/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-3/4 rounded-full shadow-[0_0_15px_rgba(137,91,245,0.5)]"></div>
                        </div>
                    </div>
                    <div className="bg-[#1a142e]/60 backdrop-blur-md border border-primary/10 p-6 rounded-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <CheckCircle2 className="text-[#22d3ee] w-16 h-16" />
                        </div>
                        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Avg Pass Rate</p>
                        <div className="flex items-baseline gap-3 mt-2">
                            <h3 className="text-3xl font-bold text-slate-100">{overallPassRate.toFixed(1)}%</h3>
                            <span className="text-[#22d3ee] text-sm font-bold flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> +3.2%</span>
                        </div>
                        <div className="mt-4 h-1 w-full bg-primary/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#22d3ee] rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)]" style={{ width: `${overallPassRate}%` }}></div>
                        </div>
                    </div>
                    <div className="bg-[#1a142e]/60 backdrop-blur-md border border-primary/10 p-6 rounded-xl relative overflow-hidden group border-l-4 border-l-orange-500/50">
                        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Most Struggled Problem</p>
                        <div className="flex items-baseline gap-3 mt-2">
                            <h3 className="text-xl font-bold text-slate-100 truncate">
                                {problems.length > 0 ? problems[0].title : "N/A"}
                            </h3>
                        </div>
                        <p className="text-orange-400 text-xs font-bold mt-2 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" /> Flagged for review
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Problem Manager Table */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                                <List className="w-5 h-5 text-primary" /> Problem Manager
                            </h2>
                            <button className="text-primary text-sm font-semibold hover:underline">View All</button>
                        </div>
                        <div className="glass-card rounded-2xl overflow-hidden shadow-2xl border-white/5">
                            <div className="overflow-x-auto no-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/[0.02] border-b border-white/5">
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Problem Name</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Difficulty</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Success</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {problems.length > 0 ? problems.map((problem: Problem) => {
                                            const stats = analytics[problem.id];
                                            const successRate = stats && stats.total_submissions > 0
                                                ? Math.round((stats.accepted_count / stats.total_submissions) * 100)
                                                : 0; 

                                            return (
                                                <tr key={problem.id} className="hover:bg-primary/5 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-slate-200">
                                                        <Link href={`/problems/${problem.id}`} className="hover:text-primary transition-colors">
                                                            {problem.title}
                                                        </Link>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                                            problem.difficulty === "Easy" ? "bg-green-500/10 text-green-500" :
                                                                problem.difficulty === "Medium" ? "bg-yellow-500/10 text-yellow-500" :
                                                                    "bg-red-500/10 text-red-500"
                                                        )}>{problem.difficulty}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-400">{successRate}%</td>
                                                    {/* <td className="px-6 py-4">
                                                        <div className={clsx("flex items-center gap-2", problem.status === "Active" ? "text-[#22d3ee]" : "text-slate-500")}>
                                                            <span className={clsx("size-2 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]", problem.status === "Active" ? "bg-[#22d3ee] animate-pulse" : "bg-slate-600 shadow-none")}></span>
                                                            {problem.status || "Active"}
                                                        </div>
                                                    </td> */}
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="text-slate-500 hover:text-primary transition-colors p-1 rounded hover:bg-white/5">
                                                            <MoreHorizontal className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No problems created yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Student Insights View */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-[#22d3ee]" /> Student Insights
                            </h2>
                        </div>
                        <div className="glass-card p-10 rounded-2xl flex flex-col items-center justify-center min-h-[350px] text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 mb-6 group-hover:scale-110 transition-transform duration-500">
                                <BarChart3 className="w-14 h-14 text-slate-600" />
                            </div>
                            <h3 className="text-2xl font-black text-white">Awaiting Submissions</h3>
                            <p className="text-slate-500 mt-4 max-w-xs text-sm font-medium leading-relaxed">
                                Student insights and activity charts will populate automatically once assignments are submitted.
                            </p>
                            <MagneticWrapper>
                                <button className="mt-8 px-6 py-2.5 rounded-xl border border-white/10 text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all">
                                    Refresh Data
                                </button>
                            </MagneticWrapper>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
