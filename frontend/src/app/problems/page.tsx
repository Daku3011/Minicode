"use client";

import { useEffect, useState } from "react";
import { PlayCircle, BarChart3, Trophy, Search, Filter, X, Plus } from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";
import ProblemCard from "@/components/ProblemCard";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Problem {
    id: number;
    title: string;
    difficulty: string;
    subject: string | null;
    level: number;
    xp_reward: number;
    created_at: string;
    author_id: number | null;
}

const SUBJECTS = [
    { id: "data-structures", name: "Data Structures", icon: "🌳" },
    { id: "algorithms", name: "Algorithms", icon: "⚙️" },
    { id: "dp", name: "Dynamic Programming", icon: "📊" },
    { id: "graphs", name: "Graph Theory", icon: "🔗" },
    { id: "math", name: "Mathematics", icon: "🔢" },
    { id: "strings", name: "String Processing", icon: "📝" },
    { id: "number-theory", name: "Number Theory", icon: "🔐" },
    { id: "combinatorics", name: "Combinatorics", icon: "🎲" },
    { id: "geometry", name: "Geometry", icon: "📐" },
    { id: "game-theory", name: "Game Theory", icon: "🎮" },
];

const DIFFICULTIES = [
    { value: "", label: "All Difficulties" },
    { value: "Easy", label: "Easy" },
    { value: "Medium", label: "Medium" },
    { value: "Hard", label: "Hard" },
];

export default function ProblemsPage() {
    const { user } = useAuth();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    const isFaculty = user?.role === "faculty" || user?.role === "admin";

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

    const filteredProblems = problems.filter((problem) => {
        const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSubject = !selectedSubject || problem.subject === selectedSubject;
        const matchesDifficulty = !selectedDifficulty || problem.difficulty === selectedDifficulty;
        return matchesSearch && matchesSubject && matchesDifficulty;
    });

    const activeFiltersCount = [selectedSubject, selectedDifficulty].filter(Boolean).length;

    return (
        <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 relative">
            <div className="absolute inset-0 pointer-events-none opacity-40 mesh-gradient z-0"></div>

            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 relative z-10">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                        {isFaculty ? "Problem Management" : "Coding Arena"}
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl">
                        {isFaculty
                            ? "Create, manage, and monitor coding challenges for your students."
                            : "Solve challenges, earn XP, and unlock harder problems."}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {isFaculty ? (
                        <Link
                            href="/problems/create"
                            className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                        >
                            <Plus className="w-4 h-4" />
                            New Problem
                        </Link>
                    ) : user && (
                        <>
                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-xs text-slate-400">Your Level</p>
                                <p className="text-lg font-black text-white">{(user as any).stats?.level || 1}</p>
                            </div>
                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-xs text-slate-400">XP</p>
                                <p className="text-lg font-black text-primary">{(user as any).stats?.xp || 0}</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6 relative z-10">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search problems..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={clsx(
                        "flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                        showFilters || activeFiltersCount > 0
                            ? "bg-primary/20 border-primary/30 text-primary"
                            : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                    )}
                >
                    <Filter className="w-4 h-4" />
                    Filters
                    {activeFiltersCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">
                            {activeFiltersCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-6 space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">Filter Problems</h3>
                        <button
                            onClick={() => { setSelectedSubject(""); setSelectedDifficulty(""); }}
                            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                        >
                            <X className="w-3 h-3" /> Clear All
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Subject Filter */}
                        <div>
                            <label className="text-xs font-medium text-slate-400 mb-2 block">Subject</label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedSubject("")}
                                    className={clsx(
                                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                                        !selectedSubject
                                            ? "bg-primary/20 border-primary/30 text-primary"
                                            : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                                    )}
                                >
                                    All
                                </button>
                                {SUBJECTS.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSelectedSubject(s.id)}
                                        className={clsx(
                                            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                                            selectedSubject === s.id
                                                ? "bg-primary/20 border-primary/30 text-primary"
                                                : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                                        )}
                                    >
                                        {s.icon} {s.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Difficulty Filter */}
                        <div>
                            <label className="text-xs font-medium text-slate-400 mb-2 block">Difficulty</label>
                            <div className="flex flex-wrap gap-2">
                                {DIFFICULTIES.map((d) => (
                                    <button
                                        key={d.value}
                                        onClick={() => setSelectedDifficulty(d.value)}
                                        className={clsx(
                                            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                                            selectedDifficulty === d.value
                                                ? "bg-primary/20 border-primary/30 text-primary"
                                                : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                                        )}
                                    >
                                        {d.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Problems List */}
            <div className="relative z-10 w-full space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white">
                        All Problems
                        <span className="text-sm font-normal text-slate-500 ml-2">
                            ({filteredProblems.length})
                        </span>
                    </h3>
                </div>

                <div className="space-y-4 max-w-4xl">
                    {loading ? (
                        [1, 2, 3].map((i) => (
                            <div key={i} className="h-32 w-full bg-white/5 animate-pulse rounded-2xl border border-white/5" />
                        ))
                    ) : filteredProblems.length > 0 ? (
                        filteredProblems.map((problem) => (
                            <ProblemCard key={problem.id} problem={problem} />
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-500 glass-card rounded-2xl">
                            No problems match your filters.
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
