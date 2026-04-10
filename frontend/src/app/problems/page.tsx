"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter, Plus, Layers, Target } from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";
import ProblemCard from "@/components/ProblemCard";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";

interface Problem {
    id: number;
    title: string;
    difficulty: string;
    subject: string | null;
    level: number;
    xp_reward: number;
    description?: string;
}

const SUBJECTS = [
    { id: "data-structures", name: "Data Structures", icon: "🌳" },
    { id: "algorithms", name: "Algorithms", icon: "⚙️" },
    { id: "dp", name: "Dynamic Programming", icon: "📊" },
    { id: "graphs", name: "Graph Theory", icon: "🔗" },
    { id: "math", name: "Mathematics", icon: "🔢" },
    { id: "strings", name: "Strings", icon: "📝" },
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

function ProblemsContent() {
    const { user } = useAuth();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    const isFaculty = user?.role === "faculty" || user?.role === "admin";
    const userUnlockedLevel = user?.unlocked_level || 1;

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

    return (
        <div className="flex flex-col min-h-screen relative overflow-hidden bg-[#05003]">
            {/* Ambient Page Glow - Static */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 blur-[100px] -z-3 pointer-events-none" />

            <main className="flex-1 px-4 md:px-12 py-12 md:py-16 relative z-10">
                <div className="max-w-[1600px] mx-auto space-y-16">

                    {/* Hero Section */}
                    <div className="flex flex-col xl:flex-row items-center xl:items-end justify-between gap-12">
                        <div className="space-y-6 text-center xl:text-left transition-all duration-300">
                            {/* <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-white/5 border border-white/10">
                                <Sparkles className="w-4 h-4 text-primary" />
                                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Mission Intelligence</span>
                            </div> */}

                            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight leading-[0.9] flex flex-col uppercase">
                                <span className="text-white">
                                    {isFaculty ? "ORCHESTRATE" : "CONQUER"}
                                </span>
                                <span className="text-primary italic tracking-tighter bg-gradient-to-r from-slate-500 to-blue-600 bg-clip-text text-transparent">
                                    THE MATRIX
                                </span>
                            </h1>

                            <p className="text-slate-500 text-lg md:text-xl max-w-2xl font-medium leading-relaxed mx-auto xl:mx-0 uppercase tracking-tight">
                                {isFaculty
                                    ? "Architect the next generation of logical enigmas for the elite coding core."
                                    : "Push through the spectral noise. Optimize algorithms. Rise to the zenith."}
                            </p>
                        </div>

                        <div>
                            {isFaculty ? (
                                <Link
                                    href="/problems/create"
                                    className="h-20 px-12 rounded-3xl bg-primary text-white font-black text-xl uppercase tracking-widest flex items-center gap-4 hover:bg-primary/90 transition-all shadow-2xl shadow-primary/20"
                                >
                                    <Plus className="w-6 h-6" />
                                    <span>DEPLOY TASK</span>
                                </Link>
                            ) : (
                                <div className="flex flex-wrap justify-center gap-6">
                                    <div className="bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 min-w-[200px]">
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-3 leading-none">Stored Energy</p>
                                        <div className="flex items-end gap-2">
                                            <p className="text-5xl font-black text-white tracking-tighter leading-none">{user?.stats?.xp || 0}</p>
                                            <span className="text-white text-sm font-black mb-1">XP</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 min-w-[200px]">
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-3 leading-none">Current Grade</p>
                                        <p className="text-4xl font-black text-white tracking-tighter leading-none mt-1 uppercase">
                                            {user?.stats?.level_name || "UNRANKED"}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Arena Controls */}
                    <div className="space-y-8 sticky top-24 z-30">
                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-600 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="SCANNING ARENA FOR PATTERNS..."
                                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] pl-16 pr-8 py-7 text-base text-white placeholder-slate-800 focus:outline-none focus:border-primary/40 transition-all font-black"
                                />
                            </div>

                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={clsx(
                                    "flex items-center justify-center gap-4 px-10 py-7 rounded-[2rem] border font-black text-xs tracking-[0.3em] transition-all duration-300",
                                    showFilters || [selectedSubject, selectedDifficulty].some(Boolean)
                                        ? "bg-primary/20 border-primary/40 text-white"
                                        : "bg-white/5 border-white/10 text-slate-500 hover:text-white"
                                )}
                            >
                                <Filter className="w-5 h-5" />
                                FILTER MATRIX
                                {[selectedSubject, selectedDifficulty].filter(Boolean).length > 0 && (
                                    <span className="flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-[10px]">
                                        {[selectedSubject, selectedDifficulty].filter(Boolean).length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {showFilters && (
                            <div className="bg-[#0a0a14] rounded-[3rem] p-10 border border-white/10 space-y-12 shadow-2xl relative z-20">
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <Layers className="w-4 h-4 text-slate-600" />
                                            <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.5em]">Subject Dimension</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                onClick={() => setSelectedSubject("")}
                                                className={clsx(
                                                    "px-6 py-3.5 rounded-2xl text-xs font-black tracking-widest border transition-all duration-200",
                                                    !selectedSubject ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white/5 border-white/5 text-slate-600 hover:border-white/20 hover:text-white"
                                                )}
                                            >
                                                UNIVERSE
                                            </button>
                                            {SUBJECTS.map(s => (
                                                <button
                                                    key={s.id}
                                                    onClick={() => setSelectedSubject(s.id)}
                                                    className={clsx(
                                                        "px-6 py-3.5 rounded-2xl text-xs font-black tracking-widest border transition-all duration-200",
                                                        selectedSubject === s.id ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white/5 border-white/5 text-slate-600 hover:border-white/20 hover:text-white"
                                                    )}
                                                >
                                                    <span className="mr-2">{s.icon}</span>
                                                    {s.name.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <Target className="w-4 h-4 text-slate-600" />
                                            <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.5em]">Difficulty Tier</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                onClick={() => setSelectedDifficulty("")}
                                                className={clsx(
                                                    "px-6 py-3.5 rounded-2xl text-xs font-black tracking-widest border transition-all duration-200",
                                                    !selectedDifficulty ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white/5 border-white/5 text-slate-600 hover:border-white/20 hover:text-white"
                                                )}
                                            >
                                                TOTALITY
                                            </button>
                                            {DIFFICULTIES.map(d => (
                                                <button
                                                    key={d}
                                                    onClick={() => setSelectedDifficulty(d)}
                                                    className={clsx(
                                                        "px-6 py-3.5 rounded-2xl text-xs font-black tracking-widest border transition-all duration-200",
                                                        selectedDifficulty === d ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white/5 border-white/5 text-slate-600 hover:border-white/20 hover:text-white"
                                                    )}
                                                >
                                                    {d.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Problem Matrix */}
                    <div className="space-y-12">
                        <div className="flex items-center gap-6">
                            <h3 className="text-4xl font-black text-white tracking-tight uppercase">Mission Catalog</h3>
                            <div className="h-[1px] flex-1 bg-white/5" />
                            <div className="px-5 py-2 rounded-xl bg-white/5 border border-white/5">
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">{filteredProblems.length} SIGNALS</span>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="h-[400px] w-full bg-white/[0.02] rounded-[3rem] border border-white/5 overflow-hidden" />
                                ))}
                            </div>
                        ) : filteredProblems.length > 0 ? (
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
                            <div className="py-32 text-center bg-white/[0.01] rounded-[4rem] border border-dashed border-white/10">
                                <Logo className="w-16 h-16 text-slate-900 mx-auto mb-8" variant="solid" />
                                <h3 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">Null Sector Reached</h3>
                                <p className="text-slate-600 font-bold text-lg max-w-lg mx-auto uppercase tracking-widest">No matching patterns found</p>
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSelectedSubject("");
                                        setSelectedDifficulty("");
                                    }}
                                    className="mt-10 px-10 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black tracking-widest border border-white/5 uppercase transition-all"
                                >
                                    Reset Matrix
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
