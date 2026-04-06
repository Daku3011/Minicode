"use client";

import { useState, useEffect } from "react";
import { Plus, Download, Terminal, CheckCircle2, TrendingUp, AlertTriangle, List, MoreHorizontal, Link as LinkIcon, Edit, Trash, BarChart3, Bell } from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";
import api from "@/lib/api";
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
        <div className="bg-[#0a0a0f] text-slate-100 min-h-[calc(100vh-64px)] font-display relative">
            {/* Minimal Grid Background */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
                <div className="absolute inset-0 bg-[url('/grid.svg')]" />
            </div>

            {/* Inner Top Nav for Faculty specifically */}
            <div className="sticky top-0 z-40 w-full mb-8">
                <div className="flex items-center gap-8 border-b border-white/5 bg-[#0a0a14]/80 backdrop-blur-md px-6 py-3 w-full">
                    <nav className="flex items-center gap-8 overflow-x-auto no-scrollbar">
                        <button className="text-primary text-sm font-bold border-b-2 border-primary pb-2 whitespace-nowrap">Dashboard</button>
                        <button className="text-slate-500 hover:text-slate-100 text-sm font-medium transition-colors whitespace-nowrap pb-2">Curriculum</button>
                        <Link href="/faculty/students" className="text-slate-500 hover:text-slate-100 text-sm font-medium transition-colors whitespace-nowrap pb-2 text-link">Student Roster</Link>
                        <button className="text-slate-500 hover:text-slate-100 text-sm font-medium transition-colors whitespace-nowrap pb-2">Reports</button>
                    </nav>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto space-y-12 relative z-10 px-4 md:px-8 mb-20">
                {/* Header & Stats Overview */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-wider">Faculty Portal</span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tight leading-none">Faculty Overview</h1>
                        <p className="text-slate-500 text-lg mt-2 font-medium">Real-time performance analytics for CS101: Data Structures</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <BroadcastAlert />
                        <button className="bg-white/5 border border-white/10 text-slate-100 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2.5 hover:bg-white/10 transition-all">
                            <Download className="w-4 h-4" /> Export
                        </button>
                        <Link href="/faculty/problems" className="bg-primary text-white hover:bg-primary/90 px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2.5 transition-all">
                            <Plus className="w-4 h-4" /> New Assignment
                        </Link>
                    </div>
                </div>

                {/* High-Level Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Total Submissions</p>
                        <div className="flex items-baseline gap-3 mt-3">
                            <h3 className="text-4xl font-black text-slate-100 tracking-tight leading-none">{totalSubmissions.toLocaleString()}</h3>
                            <span className="text-emerald-500 text-[10px] font-black tracking-widest flex items-center uppercase"><TrendingUp className="w-3 h-3 mr-1" /> +12.5%</span>
                        </div>
                        <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-3/4 rounded-full"></div>
                        </div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Avg Pass Rate</p>
                        <div className="flex items-baseline gap-3 mt-3">
                            <h3 className="text-4xl font-black text-slate-100 tracking-tight leading-none">{overallPassRate.toFixed(1)}%</h3>
                            <span className="text-emerald-500 text-[10px] font-black tracking-widest flex items-center uppercase"><TrendingUp className="w-3 h-3 mr-1" /> +3.2%</span>
                        </div>
                        <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${overallPassRate}%` }}></div>
                        </div>
                    </div>
                    <div className="bg-white/[0.02] border border-orange-500/20 p-6 rounded-2xl relative overflow-hidden group">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Priority Focus Area</p>
                        <div className="flex items-baseline gap-3 mt-3">
                            <h3 className="text-xl font-bold text-slate-100 truncate uppercase tracking-tight">
                                {problems.length > 0 ? problems[0].title : "Initializing..."}
                            </h3>
                        </div>
                        <p className="text-orange-400 text-[10px] font-black mt-3 flex items-center gap-2 uppercase tracking-widest">
                            <AlertTriangle className="w-3.5 h-3.5" /> Sector Flagged
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Problem Manager Table */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
                                <List className="w-4 h-4 text-primary" /> Logic Registry
                            </h2>
                            <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:text-white transition-colors">Audit All</button>
                        </div>
                        <div className="bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                            <div className="overflow-x-auto no-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/[0.02] border-b border-white/5">
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Subject Identity</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Complexity</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Success Factor</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">System Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {problems.length > 0 ? problems.map((problem: Problem) => {
                                            const stats = analytics[problem.id];
                                            const successRate = stats && stats.total_submissions > 0
                                                ? Math.round((stats.accepted_count / stats.total_submissions) * 100)
                                                : 0; 

                                            return (
                                                <tr key={problem.id} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-8 py-6 font-bold text-slate-200">
                                                        <Link href={`/problems/${problem.id}`} className="hover:text-primary transition-colors text-link">
                                                            {problem.title}
                                                        </Link>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={clsx("px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                                                            problem.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                                                problem.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                                                    "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                                        )}>{problem.difficulty}</span>
                                                    </td>
                                                    <td className="px-8 py-6 text-sm font-black text-slate-400">{successRate}%</td>
                                                    <td className="px-8 py-6 text-right">
                                                        <button className="text-slate-600 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr><td colSpan={4} className="px-8 py-16 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest">Awaiting System Deployment</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Student Insights View */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
                                <BarChart3 className="w-4 h-4 text-primary" /> Intelligence
                            </h2>
                        </div>
                        <div className="bg-white/[0.02] border border-white/5 p-10 rounded-2xl flex flex-col items-center justify-center min-h-[350px] text-center relative overflow-hidden group">
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 mb-6 opacity-20">
                                <BarChart3 className="w-12 h-12 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Void Sector</h3>
                            <p className="text-slate-500 mt-4 max-w-xs text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                Intelligence feeds will materialize as cohorts interact with the curriculum.
                            </p>
                            <button className="mt-10 px-8 py-2.5 rounded-xl border border-white/10 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:border-white/30 hover:text-white transition-all">
                                Sync Manual
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
