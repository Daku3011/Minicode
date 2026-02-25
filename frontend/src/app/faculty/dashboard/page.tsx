"use client";

import { useState, useEffect } from "react";
import { Plus, LayoutDashboard, Database, BarChart3, Users, Settings, Search, MoreVertical, Edit, Trash, ExternalLink } from "lucide-react";
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
}

export default function FacultyDashboard() {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [analytics, setAnalytics] = useState<Record<number, FacultyAnalytics>>({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const response = await api.get("/faculty/problems");
                const fetchedProblems = response.data;
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

    // Summary calculations
    const totalActiveProblems = problems.length;
    const totalSubmissions = Object.values(analytics).reduce((acc, curr) => acc + curr.total_submissions, 0);
    const totalAccepted = Object.values(analytics).reduce((acc, curr) => acc + curr.accepted_count, 0);
    const overallPassRate = totalSubmissions > 0 ? Math.round((totalAccepted / totalSubmissions) * 100) : 0;

    return (
        <div className="flex h-screen bg-[#020617]">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-white/[0.02] flex flex-col">
                <div className="p-8">
                    <div className="flex items-center space-x-3 group cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white ring-4 ring-primary/20 rotate-3 group-hover:rotate-0 transition-transform duration-300">
                            <Database className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-black text-white tracking-tight">MiniCode <span className="text-primary text-xs ml-1 bg-primary/10 px-2 py-0.5 rounded-full uppercase">Faculty</span></span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {[
                        { id: "overview", icon: LayoutDashboard, label: "Dashboard" },
                        { id: "problems", icon: Database, label: "My Problems" },
                        { id: "analytics", icon: BarChart3, label: "Analytics" },
                        { id: "students", icon: Users, label: "Student List" },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={clsx(
                                "w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                                activeTab === item.id
                                    ? "bg-primary/10 text-primary border border-primary/20"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:bg-white/5 hover:text-white transition-all">
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-12">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2">Faculty Dashboard</h1>
                        <p className="text-muted-foreground">Manage your curriculum and monitor student outcomes.</p>
                    </div>
                    <Link href="/problems/create" className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-black flex items-center space-x-2 shadow-lg shadow-primary/20 transition-all hover:-translate-y-1">
                        <Plus className="w-5 h-5" />
                        <span>Create New Problem</span>
                    </Link>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[
                        { label: "Active Problems", value: totalActiveProblems.toString(), icon: Database, color: "text-indigo-400" },
                        { label: "Total Submissions", value: totalSubmissions.toString(), icon: BarChart3, color: "text-emerald-400" },
                        { label: "Overall Pass Rate", value: `${overallPassRate}%`, icon: Users, color: "text-amber-400" },
                    ].map((stat, i) => (
                        <div key={i} className="glass rounded-3xl p-8 border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
                            <stat.icon className={clsx("w-6 h-6 mb-4", stat.color)} />
                            <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Problem Table */}
                <div className="glass rounded-3xl overflow-hidden border-white/5">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white">Your Problem Library</h3>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 text-white w-64"
                                    placeholder="Search problems..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    <th className="px-8 py-5">Problem Title</th>
                                    <th className="px-8 py-5">Difficulty</th>
                                    <th className="px-8 py-5">Success Rate</th>
                                    <th className="px-8 py-5">Created On</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.02]">
                                {problems.map((problem) => {
                                    const stats = analytics[problem.id];
                                    const successRate = stats && stats.total_submissions > 0
                                        ? Math.round((stats.accepted_count / stats.total_submissions) * 100)
                                        : 0;

                                    return (
                                        <tr key={problem.id} className="group hover:bg-white/[0.01] transition-colors">
                                            <td className="px-8 py-6">
                                                <Link href={`/problems/${problem.id}`} className="flex items-center space-x-3">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                    <span className="font-bold text-white group-hover:text-primary transition-colors">{problem.title}</span>
                                                </Link>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={clsx(
                                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                    problem.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-400" :
                                                        problem.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"
                                                )}>
                                                    {problem.difficulty}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center space-x-2">
                                                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden max-w-[100px]">
                                                        <div className="h-full bg-primary" style={{ width: `${successRate}%` }} />
                                                    </div>
                                                    <span className="text-xs font-bold text-white">{successRate}%</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm text-muted-foreground">
                                                {new Date(problem.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-all">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-all">
                                                        <BarChart3 className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 rounded-lg hover:bg-white/5 text-rose-400/50 hover:text-rose-400 hover:bg-rose-400/10 transition-all">
                                                        <Trash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-6 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground font-bold uppercase tracking-widest">
                        <span>Showing {problems.length} of 24 problems</span>
                        <div className="flex space-x-1">
                            <button className="w-8 h-8 rounded-lg border border-white/5 flex items-center justify-center hover:bg-white/5 transition-all outline-none">1</button>
                            <button className="w-8 h-8 rounded-lg border border-white/5 flex items-center justify-center hover:bg-white/5 transition-all outline-none">2</button>
                            <button className="w-8 h-8 rounded-lg border border-white/5 flex items-center justify-center hover:bg-white/5 transition-all outline-none">3</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
