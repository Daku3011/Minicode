"use client";

import { useEffect, useState, Suspense } from "react";
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
    const isCompact = false;
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [sort, setSort] = useState("newest");
    const [error, setError] = useState("");
    const [retry, setRetry] = useState(0);
    const pageSize = 24;

    const isFaculty = user?.role === "faculty" || user?.role === "admin";
    const userUnlockedLevel = user?.stats?.level || user?.unlocked_level || 1;

    useEffect(() => {
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            setLoading(true);
            setError("");
            try {
                const response = await api.get("/problems", {
                    signal: controller.signal,
                    params: { skip: page * pageSize, limit: pageSize, search: searchQuery,
                        subject: selectedSubject, difficulty: selectedDifficulty, sort },
                });
                if (controller.signal.aborted) return;
                setProblems(response.data.items || []);
                setTotal(response.data.total_count || 0);
            } catch {
                if (!controller.signal.aborted) setError("We couldn’t load the problems. The server may be starting up. Please try again.");
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }, 300);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [page, searchQuery, selectedSubject, selectedDifficulty, sort, retry]);

    const filteredProblems = problems;

    return (
        <div className="min-h-screen bg-card relative">
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
                                    "font-black text-foreground tracking-tight leading-[0.9] flex flex-col transition-all duration-300",
                                    isCompact ? "text-3xl md:text-4xl" : "text-5xl md:text-7xl"
                                )}>
                                <span className="text-foreground">
                                    {isFaculty ? "Manage" : "Explore"}
                                </span>
                                <span className="text-primary italic tracking-tighter bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                                    Problems
                                </span>
                            </h1>

                            <p className={clsx(
                                "text-muted-foreground max-w-2xl font-medium leading-relaxed mx-auto xl:mx-0 transition-all duration-300",
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
                                        <div className="bg-card p-5 rounded-xl border border-border shadow-sm min-w-[220px]">
                                            <p className="text-xs font-medium text-muted-foreground mb-2 leading-none">Total XP</p>
                                            <div className="flex items-end gap-2">
                                                <p className="text-4xl font-bold text-foreground tracking-tight leading-none">{user?.stats?.xp || 0}</p>
                                                <span className="text-muted-foreground text-sm font-semibold mb-1">XP</span>
                                            </div>
                                        </div>
                                        <div className="bg-card p-5 rounded-xl border border-border shadow-sm min-w-[220px]">
                                            <p className="text-xs font-medium text-muted-foreground mb-2 leading-none">Current Level</p>
                                            <p className="text-3xl font-bold text-foreground tracking-tight leading-none mt-1">
                                                {user?.stats?.level_name || "Beginner"}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Arena Controls */}
                    <div className="space-y-4 sticky top-0 z-30 bg-card/90 backdrop-blur-sm rounded-xl py-1">
                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    aria-label="Search problems"
                                    onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                                    placeholder="Search problems..."
                                    className="w-full bg-muted border border-blue-100 rounded-xl pl-14 pr-6 py-4 text-base text-foreground placeholder-slate-400 focus:outline-none focus:bg-card focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                                />
                            </div>

                            <button
                                aria-expanded={showFilters}
                                onClick={() => setShowFilters(!showFilters)}
                                className={clsx(
                                    "flex items-center justify-center gap-3 px-6 py-4 rounded-xl border font-medium text-sm transition-all duration-200",
                                    showFilters || [selectedSubject, selectedDifficulty].some(Boolean)
                                        ? "bg-blue-50 border-blue-200 text-blue-700"
                                        : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted"
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
                            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm relative z-20">
                                <div className="space-y-8">
                                    {/* Subject Categories */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <Layers className="w-4 h-4 text-muted-foreground" />
                                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Subject Categories</h3>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <button
                                                onClick={() => { setSelectedSubject(""); setPage(0); }}
                                                className={clsx(
                                                    "px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 shadow-sm",
                                                    !selectedSubject 
                                                        ? "bg-blue-600 text-white border-blue-600 shadow-blue-100" 
                                                        : "bg-card border-border text-muted-foreground hover:border-blue-200 hover:text-blue-700"
                                                )}
                                            >
                                                🎯 All Subjects
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {SUBJECT_CATEGORIES.map((category, catIdx) => (
                                                <div key={catIdx} className="bg-muted/50 border border-slate-100 rounded-2xl p-5 space-y-4">
                                                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                                        {category.title}
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {category.items.map(s => (
                                                            <button
                                                                key={s.id}
                                                                onClick={() => { setSelectedSubject(s.id); setPage(0); }}
                                                                className={clsx(
                                                                    "px-3.5 py-2 rounded-lg text-xs font-medium border transition-all duration-200 shadow-sm",
                                                                    selectedSubject === s.id 
                                                                        ? "bg-blue-600 text-white border-blue-600 shadow-blue-100" 
                                                                        : "bg-card border-border text-muted-foreground hover:border-blue-200 hover:text-blue-700"
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
                                            <Target className="w-4 h-4 text-muted-foreground" />
                                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Difficulty</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                onClick={() => { setSelectedDifficulty(""); setPage(0); }}
                                                className={clsx(
                                                    "px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 shadow-sm",
                                                    !selectedDifficulty 
                                                        ? "bg-blue-600 text-white border-blue-600 shadow-blue-100" 
                                                        : "bg-card border-border text-muted-foreground hover:border-blue-200 hover:text-blue-700"
                                                )}
                                            >
                                                All
                                            </button>
                                            {DIFFICULTIES.map(d => (
                                                <button
                                                    key={d}
                                                    onClick={() => { setSelectedDifficulty(d); setPage(0); }}
                                                    className={clsx(
                                                        "px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 shadow-sm",
                                                        selectedDifficulty === d 
                                                            ? "bg-blue-600 text-white border-blue-600 shadow-blue-100" 
                                                            : "bg-card border-border text-muted-foreground hover:border-blue-200 hover:text-blue-700"
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
                        <div className="flex flex-wrap items-center gap-4">
                            <h3 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">All Problems</h3>
                            <div className="h-px flex-1 bg-slate-200" />
                            <div className="flex items-center gap-3">
                                <div className="px-4 py-2 rounded-lg bg-muted border border-border">
                                    <span className="text-xs font-medium text-muted-foreground">{total} problems</span>
                                </div>
                                <div className="flex items-center p-1 bg-muted/80 rounded-xl border border-border/80">
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        title="Grid view"
                                        className={clsx(
                                            "p-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5",
                                            viewMode === "grid"
                                                ? "bg-card text-blue-600 shadow-sm font-semibold"
                                                : "text-muted-foreground hover:text-foreground"
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
                                                ? "bg-card text-blue-600 shadow-sm font-semibold"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <label className="flex items-center gap-3 text-sm text-muted-foreground">Sort by
                            <select aria-label="Sort problems" value={sort} onChange={e => { setSort(e.target.value); setPage(0); }} className="rounded-lg border border-border bg-card p-2 text-foreground">
                                <option value="newest">Newest first</option><option value="title">Title A–Z</option><option value="level">Level</option><option value="xp">Highest XP</option>
                            </select>
                        </label>
                        {error ? <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center text-amber-950"><p>{error}</p><button onClick={() => setRetry(n => n + 1)} className="mt-4 rounded-lg border border-amber-400 px-5 py-2 font-semibold">Try again</button></div> : loading ? (
                            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10" : "flex flex-col gap-4"}>
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className={viewMode === "grid" ? "h-[400px] w-full bg-muted rounded-xl border border-border overflow-hidden animate-pulse" : "h-20 w-full bg-muted rounded-2xl border border-border animate-pulse"} />
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
                                <Logo className="w-16 h-16 text-foreground mx-auto mb-8" variant="solid" />
                                <h3 className="text-4xl font-black text-foreground mb-4 tracking-tighter uppercase">No Problems Found</h3>
                                <p className="text-muted-foreground font-bold text-lg max-w-lg mx-auto uppercase tracking-widest">No matching patterns found</p>
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setPage(0);
                                        setSelectedSubject("");
                                        setSelectedDifficulty("");
                                    }}
                                    className="mt-8 px-6 py-3 bg-muted hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium border border-border transition-all"
                                >
                                    Clear filters
                                </button>
                            </div>
                        )}
                        {!loading && !error && total > pageSize && <nav aria-label="Problem pages" className="flex items-center justify-center gap-4">
                            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="rounded-lg border border-border px-4 py-2 disabled:opacity-40">Previous</button>
                            <span aria-live="polite" className="text-sm text-muted-foreground">Page {page + 1} of {Math.ceil(total / pageSize)}</span>
                            <button disabled={(page + 1) * pageSize >= total} onClick={() => setPage(p => p + 1)} className="rounded-lg border border-border px-4 py-2 disabled:opacity-40">Next</button>
                        </nav>}
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
