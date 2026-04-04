"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PlayCircle, BarChart3, Trophy, Search, Filter, X, Plus, Sparkles, Terminal, Layers, Zap, Target } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { clsx } from "clsx";
import Link from "next/link";
import ProblemCard from "@/components/ProblemCard";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import MagneticWrapper from "@/components/MagneticWrapper";

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
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

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

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 5 },
        show: { 
            opacity: 1, 
            y: 0, 
            transition: {
                duration: 0.3
            }
        }
    };

    return (
        <div className="flex flex-col min-h-screen relative overflow-hidden">
            {/* Ambient Page Glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 blur-[120px] -z-10 pointer-events-none" />

            <main className="flex-1 px-4 md:px-12 py-16 md:py-24">
                <div className="max-w-[1400px] mx-auto space-y-16">
                    
                    {/* Hero: Identity Section */}
                    <div className="flex flex-col xl:flex-row items-center xl:items-end justify-between gap-12">
                        <motion.div 
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-6 text-center xl:text-left"
                        >
                            <motion.div 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
                            >
                                <div className="relative">
                                    <Sparkles className="w-4 h-4 text-white text-primary" />
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300">Mission Intelligence</span>
                            </motion.div>

                            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight leading-[0.9] flex flex-col">
                                <span className="text-white drop-shadow-2xl">
                                    {isFaculty ? "ORCHESTRATE" : "CONQUER"}
                                </span>
                                <span className="bg-gradient-to-r from-primary via-blue-400 to-secondary bg-clip-text text-transparent italic tracking-tighter">
                                    THE MATRIX
                                </span>
                            </h1>

                            <p className="text-slate-400 text-lg md:text-xl max-w-2xl font-medium leading-relaxed mx-auto xl:mx-0 opacity-80">
                                {isFaculty
                                    ? "Architect the next generation of logical enigmas for the elite coding core."
                                    : "Push through the spectral noise. Optimize algorithms. Rise to the zenith of the global board."}
                            </p>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.15 }}
                        >
                            {isFaculty ? (
                                <Link 
                                    href="/problems/create" 
                                    className="premium-btn py-6 px-12 rounded-3xl group transition-all relative overflow-hidden shadow-2xl shadow-primary/20"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-20 group-hover:opacity-40 transition-opacity" />
                                    <Plus className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500 relative z-10" />
                                    <span className="text-xl relative z-10 font-black tracking-widest">DEPLOY TASK</span>
                                </Link>
                            ) : (
                                <div className="flex flex-wrap justify-center gap-6">
                                    <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 min-w-[200px] relative group overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Zap className="w-16 h-16 text-primary" />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3">Stored Energy</p>
                                        <div className="flex items-end gap-2">
                                            <p className="text-5xl font-black text-white tracking-tighter leading-none">{user?.stats?.xp || 0}</p>
                                            <span className="text-primary text-sm text-white mb-1">XP</span>
                                        </div>
                                    </div>
                                    <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 min-w-[200px] relative group overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Target className="w-16 h-16 text-white" />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3">Current Grade</p>
                                        <p className="text-4xl font-black text-white tracking-tighter leading-none mt-1">
                                            {user?.stats?.level_name?.toUpperCase() || "UNRANKED"}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Arena Controls: Filtering System */}
                    <div className="space-y-8 sticky top-24 z-30">
                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="relative flex-1 group">
                                <div className="absolute inset-0 bg-primary/10 rounded-[2rem] blur-2xl group-focus-within:bg-primary/20 transition-all opacity-0 group-hover:opacity-100" />
                                <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500 group-focus-within:text-primary transition-all duration-300" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="SCANNING ARENA FOR PATTERNS..."
                                    className="relative w-full bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2rem] pl-16 pr-8 py-7 text-base text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/40 transition-all font-bold tracking-wide shadow-2xl"
                                />
                            </div>
                            
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowFilters(!showFilters)}
                                className={clsx(
                                    "relative flex items-center justify-center gap-4 px-10 py-7 rounded-[2rem] border font-black text-xs tracking-[0.3em] transition-all duration-500 backdrop-blur-2xl",
                                    showFilters || [selectedSubject, selectedDifficulty].some(Boolean)
                                        ? "bg-primary/20 border-primary/40 text-primary shadow-[0_0_40px_rgba(137,91,245,0.2)]"
                                        : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                                )}
                            >
                                <Filter className="w-5 h-5" />
                                FILTER MATRIX
                                {[selectedSubject, selectedDifficulty].filter(Boolean).length > 0 && (
                                    <span className="flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-[10px] shadow-lg shadow-primary/40">
                                        {[selectedSubject, selectedDifficulty].filter(Boolean).length}
                                    </span>
                                )}
                            </motion.button>
                        </div>

                        <AnimatePresence>
                            {showFilters && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                    className="relative z-20"
                                >
                                    <div className="glass-card rounded-[3rem] p-10 border border-white/10 space-y-12 shadow-2xl overflow-hidden relative">
                                        {/* Decorative Background for Filters */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                                        
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 relative z-10">
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <Layers className="w-4 h-4 text-primary" />
                                                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em]">Subject Dimension</h3>
                                                </div>
                                                <div className="flex flex-wrap gap-3">
                                                    <button 
                                                        onClick={() => setSelectedSubject("")}
                                                        className={clsx(
                                                            "px-6 py-3.5 rounded-2xl text-xs font-black tracking-widest border transition-all duration-300", 
                                                            !selectedSubject ? "bg-primary text-white border-primary shadow-lg shadow-primary/30" : "bg-white/5 border-white/5 text-slate-500 hover:border-white/20 hover:text-slate-300"
                                                        )}
                                                    >
                                                        UNIVERSE
                                                    </button>
                                                    {SUBJECTS.map(s => (
                                                        <button 
                                                            key={s.id}
                                                            onClick={() => setSelectedSubject(s.id)}
                                                            className={clsx(
                                                                "px-6 py-3.5 rounded-2xl text-xs font-black tracking-widest border transition-all duration-300", 
                                                                selectedSubject === s.id ? "bg-primary text-white border-primary shadow-lg shadow-primary/30" : "bg-white/5 border-white/5 text-slate-500 hover:border-white/20 hover:text-slate-300"
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
                                                    <Target className="w-4 h-4 text-secondary" />
                                                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em]">Difficulty Tier</h3>
                                                </div>
                                                <div className="flex flex-wrap gap-3">
                                                    <button 
                                                        onClick={() => setSelectedDifficulty("")}
                                                        className={clsx(
                                                            "px-6 py-3.5 rounded-2xl text-xs font-black tracking-widest border transition-all duration-300", 
                                                            !selectedDifficulty ? "bg-secondary text-white border-secondary shadow-lg shadow-secondary/30" : "bg-white/5 border-white/5 text-slate-500 hover:border-white/20 hover:text-slate-300"
                                                        )}
                                                    >
                                                        TOTALITY
                                                    </button>
                                                    {DIFFICULTIES.map(d => (
                                                        <button 
                                                            key={d}
                                                            onClick={() => setSelectedDifficulty(d)}
                                                            className={clsx(
                                                                "px-6 py-3.5 rounded-2xl text-xs font-black tracking-widest border transition-all duration-300", 
                                                                selectedDifficulty === d ? "bg-secondary text-white border-secondary shadow-lg shadow-secondary/30" : "bg-white/5 border-white/5 text-slate-500 hover:border-white/20 hover:text-slate-300"
                                                            )}
                                                        >
                                                            {d.toUpperCase()}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Problem Matrix: The Grid */}
                    <div className="space-y-12">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-6"
                        >
                            <h3 className="text-4xl font-black text-white tracking-tight">MISSION CATALOG</h3>
                            <div className="h-[2px] flex-1 bg-gradient-to-r from-white/10 via-white/[0.02] to-transparent" />
                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">{filteredProblems.length} SIGNALS</span>
                            </div>
                        </motion.div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="h-[440px] w-full bg-white/[0.03] animate-pulse rounded-[3rem] border border-white/5 overflow-hidden" />
                                ))}
                            </div>
                        ) : filteredProblems.length > 0 ? (
                            <motion.div 
                                variants={container}
                                initial="hidden"
                                animate="show"
                                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10"
                            >
                                {filteredProblems.map((problem) => (
                                    <motion.div key={problem.id} variants={item} className="h-full">
                                        <ProblemCard problem={problem} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-32 text-center glass-card rounded-[4rem] border border-white/5 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-primary/5 blur-[100px] pointer-events-none" />
                                <div className="relative z-10">
                                    <div className="inline-flex p-10 rounded-[2.5rem] bg-white/5 mb-8 border border-white/10 shadow-2xl">
                                        <Terminal className="w-20 h-20 text-slate-800" />
                                    </div>
                                    <h3 className="text-4xl font-black text-white mb-4 tracking-tighter">NULL SECTOR REACHED</h3>
                                    <p className="text-slate-500 font-medium text-lg max-w-lg mx-auto">No matching logic patterns found in the current coordinate space. Recalibrate your spectral filters.</p>
                                    <motion.button 
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setSearchQuery("");
                                            setSelectedSubject("");
                                            setSelectedDifficulty("");
                                        }}
                                        className="mt-10 px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-sm font-black tracking-widest border border-white/10"
                                    >
                                        RESET ALL COORDINTAES
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function ProblemsPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-[#0a0a14]">
                <div className="relative">
                    <motion.div 
                        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-20 h-20 border-2 border-primary/30 border-t-primary rounded-full shadow-[0_0_50px_rgba(137,91,245,0.3)]"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                    </div>
                </div>
            </div>
        }>
            <ProblemsContent />
        </Suspense>
    );
}
