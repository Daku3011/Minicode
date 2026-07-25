"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter, Plus, Layers, Target, LayoutGrid, List } from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";
import ProblemCard from "@/components/ProblemCard";
import ProblemListItem from "@/components/ProblemListItem";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";
import { SUBJECT_CATEGORIES } from "@/constants/subjects";

interface Problem {
    id: number;
    title: string;
    difficulty: string;
    subject: string | null;
    level: number;
    xp_reward: number;
    description?: string;
    status?: string;
}

import { SUBJECTS } from "@/constants/subjects";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

function ProblemsContent() {
    const { user } = useAuth();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [isCompact, setIsCompact] = useState(false);
    const compactRafRef = useRef<number | null>(null);
    const pendingCompactRef = useRef(false);
    const compactTickingRef = useRef(false);

    const isFaculty = user?.role === "faculty" || user?.role === "admin";
    const userUnlockedLevel = user?.stats?.level || user?.unlocked_level || 1;

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const response = await api.get("/problems");
                setProblems(response.data.items || response.data || []);
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

    useEffect(() => {
        return () => {
            if (compactRafRef.current !== null) {
                cancelAnimationFrame(compactRafRef.current);
            }
        };
    }, []);

    const handleCardsScroll = (event: React.UIEvent<HTMLDivElement>) => {
        pendingCompactRef.current = event.currentTarget.scrollTop > 12;
        if (compactTickingRef.current) {
            return;
        }

        compactTickingRef.current = true;
        compactRafRef.current = requestAnimationFrame(() => {
            setIsCompact((prev) => (prev === pendingCompactRef.current ? prev : pendingCompactRef.current));
            compactTickingRef.current = false;
        });
    };

    return (
        <div className="min-h-screen bg-white relative">
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-blue-100 blur-3xl opacity-60" />
                <div className="absolute top-40 right-0 h-[320px] w-[320px] rounded-full bg-sky-100 blur-3xl opacity-50" />
                <div className="absolute bottom-20 left-0 h-[300px] w-[300px] rounded-full bg-cyan-100 blur-3xl opacity-40" />
            </div>

            <main className="px-4 md:px-12 py-10 md:py-16 relative z-10">
                <div className="max-w-[1600px] mx-auto flex flex-col gap-6">

                    {/* Hero Section */}
                    <div className={clsx(
                        "overflow-hidden transition-all duration-300 ease-out",
                        isCompact ? "max-h-24" : "max-h-[320px]"
                    )}>
                        <div className="flex flex-col xl:flex-row items-center xl:items-end justify-between gap-8">
                            <div className="space-y-4 text-center xl:text-left transition-all duration-300">
                                <h1 className={clsx(
                                    "font-black text-slate-950 tracking-tight leading-[0.9] flex flex-col transition-all duration-300",
                                    isCompact ? "text-3xl md:text-4xl" : "text-5xl md:text-7xl"
                                )}>
                                <span className="text-slate-950">
                                    {isFaculty ? "Manage" : "Explore"}
                                </span>
                                <span className="text-primary italic tracking-tighter bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                                    Problems
                                </span>
                            </h1>

                            <p className={clsx(
                                "text-slate-600 max-w-2xl font-medium leading-relaxed mx-auto xl:mx-0 transition-all duration-300",
                                isCompact ? "text-sm opacity-0 max-h-0 overflow-hidden" : "text-lg md:text-xl opacity-100"
                            )}>
                                {isFaculty
                                    ? "Create and organize coding problems for your students with clear levels and rewards."
                                    : "Find your next challenge, practice consistently, and build stronger problem-solving skills."}
                            </p>
                            </div>

                            <div className="transition-all duration-300">
                                {isFaculty ? (
                                    <Link
                                        href="/problems/create"
                                        className="h-14 px-8 rounded-lg bg-primary text-white font-semibold text-base flex items-center gap-3 hover:bg-violet-700 transition-all shadow-sm"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span>Create Problem</span>
                                    </Link>
                                ) : (
                                    <div className="flex flex-wrap justify-center gap-4">
                                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm min-w-[220px]">
                                            <p className="text-xs font-medium text-slate-500 mb-2 leading-none">Total XP</p>
                                            <div className="flex items-end gap-2">
                                                <p className="text-4xl font-bold text-slate-900 tracking-tight leading-none">{user?.stats?.xp || 0}</p>
                                                <span className="text-slate-600 text-sm font-semibold mb-1">XP</span>
                                            </div>
                                        </div>
                                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm min-w-[220px]">
                                            <p className="text-xs font-medium text-slate-500 mb-2 leading-none">Current Level</p>
                                            <p className="text-3xl font-bold text-slate-900 tracking-tight leading-none mt-1">
                                                {user?.stats?.level_name || "Beginner"}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Arena Controls */}
                    <div className="space-y-4 sticky top-0 z-30 bg-white/90 backdrop-blur-sm rounded-xl py-1">
                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search problems..."
                                    className="w-full bg-slate-50 border border-blue-100 rounded-xl pl-14 pr-6 py-4 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                                />
                            </div>

                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={clsx(
                                    "flex items-center justify-center gap-3 px-6 py-4 rounded-xl border font-medium text-sm transition-all duration-200",
                                    showFilters || [selectedSubject, selectedDifficulty].some(Boolean)
                                        ? "bg-blue-50 border-blue-200 text-blue-700"
                                        : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                )}
                            >
                                <Filter className="w-4 h-4" />
                                Filters
                                {[selectedSubject, selectedDifficulty].filter(Boolean).length > 0 && (
                                    <span className="flex items-center justify-center w-6 h-6 bg-primary text-black rounded-full text-xs">
                                        {[selectedSubject, selectedDifficulty].filter(Boolean).length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {showFilters && (
                            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative z-20">
                                <div className="space-y-8">
                                    {/* Subject Categories */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <Layers className="w-4 h-4 text-slate-500" />
                                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Subject Categories</h3>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <button
                                                onClick={() => setSelectedSubject("")}
                                                className={clsx(
                                                    "px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 shadow-sm",
                                                    !selectedSubject 
                                                        ? "bg-blue-600 text-white border-blue-600 shadow-blue-100" 
                                                        : "bg-white border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-700"
                                                )}
                                            >
                                                🎯 All Subjects
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {SUBJECT_CATEGORIES.map((category, catIdx) => (
                                                <div key={catIdx} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4">
                                                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                        {category.title}
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {category.items.map(s => (
                                                            <button
                                                                key={s.id}
                                                                onClick={() => setSelectedSubject(s.id)}
                                                                className={clsx(
                                                                    "px-3.5 py-2 rounded-lg text-xs font-medium border transition-all duration-200 shadow-sm",
                                                                    selectedSubject === s.id 
                                                                        ? "bg-blue-600 text-white border-blue-600 shadow-blue-100" 
                                                                        : "bg-white border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-700"
                                                                )}
                                                            >
                                                                <span className="mr-1.5">{s.icon}</span>
                                                                {s.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Difficulty */}
                                    <div className="space-y-4 pt-6 border-t border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <Target className="w-4 h-4 text-slate-500" />
                                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Difficulty</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                onClick={() => setSelectedDifficulty("")}
                                                className={clsx(
                                                    "px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 shadow-sm",
                                                    !selectedDifficulty 
                                                        ? "bg-blue-600 text-white border-blue-600 shadow-blue-100" 
                                                        : "bg-white border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-700"
                                                )}
                                            >
                                                All
                                            </button>
                                            {DIFFICULTIES.map(d => (
                                                <button
                                                    key={d}
                                                    onClick={() => setSelectedDifficulty(d)}
                                                    className={clsx(
                                                        "px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 shadow-sm",
                                                        selectedDifficulty === d 
                                                            ? "bg-blue-600 text-white border-blue-600 shadow-blue-100" 
                                                            : "bg-white border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-700"
                                                    )}
                                                >
                                                    {d}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Problem Matrix */}
                    <div className="space-y-8 pb-10">
                        <div className="flex items-center gap-6">
                            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">All Problems</h3>
                            <div className="h-px flex-1 bg-slate-200" />
                            <div className="flex items-center gap-3">
                                <div className="px-4 py-2 rounded-lg bg-slate-50 border border-slate-200">
                                    <span className="text-xs font-medium text-slate-600">{filteredProblems.length} problems</span>
                                </div>
                                <div className="flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200/80">
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        title="Grid view"
                                        className={clsx(
                                            "p-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5",
                                            viewMode === "grid"
                                                ? "bg-white text-blue-600 shadow-sm font-semibold"
                                                : "text-slate-500 hover:text-slate-800"
                                        )}
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        title="List view"
                                        className={clsx(
                                            "p-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5",
                                            viewMode === "list"
                                                ? "bg-white text-blue-600 shadow-sm font-semibold"
                                                : "text-slate-500 hover:text-slate-800"
                                        )}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10" : "flex flex-col gap-4"}>
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className={viewMode === "grid" ? "h-[400px] w-full bg-slate-100 rounded-xl border border-slate-200 overflow-hidden animate-pulse" : "h-20 w-full bg-slate-100 rounded-2xl border border-slate-200 animate-pulse"} />
                                ))}
                            </div>
                        ) : filteredProblems.length > 0 ? (
                            viewMode === "grid" ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                                    {filteredProblems.map((problem) => (
                                        <ProblemCard 
                                            key={problem.id} 
                                            problem={problem} 
                                            userUnlockedLevel={userUnlockedLevel}
                                            isFaculty={isFaculty}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {filteredProblems.map((problem) => (
                                        <ProblemListItem 
                                            key={problem.id} 
                                            problem={problem} 
                                            userUnlockedLevel={userUnlockedLevel}
                                            isFaculty={isFaculty}
                                        />
                                    ))}
                                </div>
                            )
                        ) : (
                            <div className="py-32 text-center bg-blue-50/30 rounded-[4rem] border border-dashed border-blue-100">
                                <Logo className="w-16 h-16 text-slate-900 mx-auto mb-8" variant="solid" />
                                <h3 className="text-4xl font-black text-slate-800 mb-4 tracking-tighter uppercase">No Problems Found</h3>
                                <p className="text-slate-500 font-bold text-lg max-w-lg mx-auto uppercase tracking-widest">No matching patterns found</p>
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSelectedSubject("");
                                        setSelectedDifficulty("");
                                    }}
                                    className="mt-8 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium border border-slate-200 transition-all"
                                >
                                    Clear filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function ProblemsPage() {
    return (
        <Suspense fallback={null}>
            <ProblemsContent />
        </Suspense>
    );
}
