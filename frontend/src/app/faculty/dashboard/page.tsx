"use client";

import { useState, useEffect } from "react";
import { Plus, Download, CheckCircle2, TrendingUp, AlertTriangle, List, MoreHorizontal, Link as LinkIcon, Edit, Trash, BarChart3, Bell } from "lucide-react";
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
        <div className="bg-slate-50 text-slate-900 min-h-[calc(100vh-64px)] font-display relative">
            {/* Subtle light grid background */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.015]">
                <div className="absolute inset-0 bg-[url('/grid.svg')]" />
            </div>

            {/* Inner Top Sub-Nav */}
            <div className="sticky top-0 z-40 w-full mb-8">
                <div className="flex items-center gap-8 border-b border-blue-100 bg-white/90 backdrop-blur-md px-6 py-3 w-full shadow-sm">
                    <nav className="flex items-center gap-8 overflow-x-auto no-scrollbar">
                        <button className="text-blue-600 text-sm font-bold border-b-2 border-blue-600 pb-2 whitespace-nowrap">Dashboard</button>
                        <button className="text-slate-400 hover:text-slate-700 text-sm font-medium transition-colors whitespace-nowrap pb-2">Curriculum</button>
                        <Link href="/faculty/students" className="text-slate-400 hover:text-slate-700 text-sm font-medium transition-colors whitespace-nowrap pb-2 text-link">Student Roster</Link>
                        <button className="text-slate-400 hover:text-slate-700 text-sm font-medium transition-colors whitespace-nowrap pb-2">Reports</button>
                    </nav>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto space-y-12 relative z-10 px-4 md:px-8 mb-20">
                {/* Header & Stats Overview */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-[10px] font-black uppercase tracking-wider">Faculty Portal</span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">Faculty Overview</h1>
                        <p className="text-slate-500 text-lg mt-2 font-medium">Real-time performance analytics for CS101: Data Structures</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <BroadcastAlert />
                        <button className="bg-white border border-blue-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2.5 hover:bg-blue-50 transition-all shadow-sm">
                            <Download className="w-4 h-4" /> Export
                        </button>
                        <Link href="/faculty/problems" className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2.5 transition-all shadow-sm shadow-blue-200">
                            <Plus className="w-4 h-4" /> New Assignment
                        </Link>
                    </div>
                </div>

                {/* High-Level Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-blue-100 p-6 rounded-2xl relative overflow-hidden group shadow-sm hover:shadow-blue-md transition-all">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Total Submissions</p>
                        <div className="flex items-baseline gap-3 mt-3">
                            <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-none">{totalSubmissions.toLocaleString()}</h3>
                            <span className="text-emerald-600 text-[10px] font-black tracking-widest flex items-center uppercase"><TrendingUp className="w-3 h-3 mr-1" /> +12.5%</span>
                        </div>
                        <div className="mt-6 h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-3/4 rounded-full"></div>
                        </div>
                    </div>
                    <div className="bg-white border border-blue-100 p-6 rounded-2xl relative overflow-hidden group shadow-sm hover:shadow-blue-md transition-all">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Avg Pass Rate</p>
                        <div className="flex items-baseline gap-3 mt-3">
                            <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-none">{overallPassRate.toFixed(1)}%</h3>
                            <span className="text-emerald-600 text-[10px] font-black tracking-widest flex items-center uppercase"><TrendingUp className="w-3 h-3 mr-1" /> +3.2%</span>
                        </div>
                        <div className="mt-6 h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${overallPassRate}%` }}></div>
                        </div>
                    </div>
                    <div className="bg-white border border-amber-200 p-6 rounded-2xl relative overflow-hidden group shadow-sm bg-amber-50/30">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Priority Focus Area</p>
                        <div className="flex items-baseline gap-3 mt-3">
                            <h3 className="text-xl font-bold text-slate-900 truncate uppercase tracking-tight">
                                {problems.length > 0 ? problems[0].title : "Initializing..."}
                            </h3>
                        </div>
                        <p className="text-amber-600 text-[10px] font-black mt-3 flex items-center gap-2 uppercase tracking-widest">
                            <AlertTriangle className="w-3.5 h-3.5" /> Sector Flagged
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Problem Manager Table */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                <List className="w-4 h-4 text-blue-600" /> Logic Registry
                            </h2>
                            <button className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] hover:text-blue-800 transition-colors">Audit All</button>
                        </div>
                        <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto no-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-blue-50 border-b border-blue-100">
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Subject Identity</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Complexity</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Success Factor</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">System Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-blue-50">
                                        {problems.length > 0 ? problems.map((problem: Problem) => {
                                            const stats = analytics[problem.id];
                                            const successRate = stats && stats.total_submissions > 0
                                                ? Math.round((stats.accepted_count / stats.total_submissions) * 100)
                                                : 0; 

                                            return (
                                                <tr key={problem.id} className="hover:bg-blue-50/50 transition-colors group">
                                                    <td className="px-8 py-6 font-bold text-slate-800">
                                                        <Link href={`/problems/${problem.id}`} className="hover:text-blue-600 transition-colors">
                                                            {problem.title}
                                                        </Link>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={clsx("px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                                                            problem.difficulty === "Easy" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                                                problem.difficulty === "Medium" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                                                    "bg-rose-50 text-rose-700 border border-rose-200"
                                                        )}>{problem.difficulty}</span>
                                                    </td>
                                                    <td className="px-8 py-6 text-sm font-black text-slate-600">{successRate}%</td>
                                                    <td className="px-8 py-6 text-right">
                                                        <button className="text-slate-300 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr><td colSpan={4} className="px-8 py-16 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">Awaiting System Deployment</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Student Insights View */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                <BarChart3 className="w-4 h-4 text-blue-600" /> Intelligence
                            </h2>
                        </div>
                        <div className="bg-white border border-blue-100 p-10 rounded-2xl flex flex-col items-center justify-center min-h-[350px] text-center relative overflow-hidden shadow-sm">
                            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 mb-6 opacity-60">
                                <BarChart3 className="w-12 h-12 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Void Sector</h3>
                            <p className="text-slate-400 mt-4 max-w-xs text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                Intelligence feeds will materialize as cohorts interact with the curriculum.
                            </p>
                            <button className="mt-10 px-8 py-2.5 rounded-xl border border-blue-200 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:border-blue-400 hover:text-blue-600 transition-all">
                                Sync Manual
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
