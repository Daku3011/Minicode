"use client";

import { useState, useEffect } from "react";
import { Plus, Download, Terminal, CheckCircle2, TrendingUp, AlertTriangle, List, MoreHorizontal, Lightbulb, Search, Settings, MoreVertical, Edit, Trash, BarChart3 } from "lucide-react";
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

    const totalActiveProblems = problems.length;
    const totalSubmissions = Object.values(analytics).reduce((acc, curr) => acc + curr.total_submissions, 0);
    const totalAccepted = Object.values(analytics).reduce((acc, curr) => acc + curr.accepted_count, 0);
    const overallPassRate = totalSubmissions > 0 ? (totalAccepted / totalSubmissions) * 100 : 0;

    return (
        <div className="bg-[#f6f5f8] dark:bg-[#0f0a1e] text-slate-900 dark:text-slate-100 min-h-[calc(100vh-64px)] font-display relative overflow-x-hidden">
            {/* Background Gradient */}
            <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

            {/* Inner Top Nav for Faculty specifically */}
            <div className="flex items-center gap-8 border-b border-primary/10 bg-[#1a142e]/50 backdrop-blur-md px-6 py-3 relative z-10 w-full mb-8">
                <nav className="flex items-center gap-6 overflow-x-auto">
                    <button className="text-primary text-sm font-semibold border-b-2 border-primary pb-1 whitespace-nowrap">Dashboard</button>
                    <button className="text-slate-400 hover:text-slate-100 text-sm font-medium transition-colors whitespace-nowrap">Curriculum</button>
                    <button className="text-slate-400 hover:text-slate-100 text-sm font-medium transition-colors whitespace-nowrap">Student Roster</button>
                    <button className="text-slate-400 hover:text-slate-100 text-sm font-medium transition-colors whitespace-nowrap">Reports</button>
                </nav>
            </div>

            <main className="flex-1 px-6 lg:px-10 max-w-7xl mx-auto w-full space-y-8 relative z-10 mb-20">
                {/* Header & Stats Overview */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-100 tracking-tight">Faculty Overview</h1>
                        <p className="text-slate-400 mt-2">Real-time performance analytics for CS101: Data Structures</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="bg-[#1a142e] border border-primary/20 text-slate-100 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-primary/10 transition-all shadow-sm">
                            <Download className="w-4 h-4" /> Export Data
                        </button>
                        <Link href="/problems/create" className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(137,91,245,0.3)]">
                            <Plus className="w-4 h-4 text-white" /> New Assignment
                        </Link>
                    </div>
                </div>

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
                        <div className="bg-[#1a142e]/60 backdrop-blur-md border border-primary/10 rounded-xl overflow-hidden shadow-lg">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-primary/5 text-slate-400 text-xs uppercase tracking-widest border-b border-primary/10">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold whitespace-nowrap">Problem Name</th>
                                            <th className="px-6 py-4 font-semibold">Difficulty</th>
                                            <th className="px-6 py-4 font-semibold">Success</th>
                                            {/* <th className="px-6 py-4 font-semibold">Status</th> */}
                                            <th className="px-6 py-4 font-semibold text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-primary/5">
                                        {problems.length > 0 ? problems.map((problem) => {
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
                        <div className="bg-[#1a142e]/60 backdrop-blur-md border border-primary/10 p-6 rounded-xl shadow-lg flex flex-col items-center justify-center min-h-[250px] text-center">
                            <BarChart3 className="w-12 h-12 text-slate-600 mb-4" />
                            <h3 className="text-lg font-bold text-slate-300">Awaiting Submissions</h3>
                            <p className="text-sm text-slate-500 mt-2 max-w-xs">
                                Student insights and activity charts will populate automatically once assignments are submitted.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
