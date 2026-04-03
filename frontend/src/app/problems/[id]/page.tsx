"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Play,
    CheckCircle2,
    XCircle,
    Brain,
    Github,
    Copy,
    ChevronLeft,
    Trophy,
    Code2,
    Shield,
    Rocket,
    RotateCcw,
    Zap,
    ListTodo,
    Sparkles,
    Timer,
    FileCode,
    Settings,
    ArrowRight
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import Link from "next/link";
import { clsx } from "clsx";
import api from "@/lib/api";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from "framer-motion";

interface TestCaseExample {
    id: number;
    input: string;
    expected_output: string;
}

export default function ProblemDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [problem, setProblem] = useState<any>(null);
    const [testCases, setTestCases] = useState<TestCaseExample[]>([]);
    const [repoUrl, setRepoUrl] = useState<string | null>(null);
    const [isStarting, setIsStarting] = useState(false);
    const [activeTab, setActiveTab] = useState("description"); // "description" or "result"
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [repoError, setRepoError] = useState<string | null>(null);
    const [result, setResult] = useState<{ status: string; ai_feedback: string; score?: number; code_evaluated?: string } | null>(null);

    // Derived states
    const isProvisioned = !!repoUrl;
    const isLoading = isStarting;
    const isEvaluating = isSubmitting;

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const [problemRes, testCasesRes] = await Promise.all([
                    api.get(`/problems/${id}`),
                    api.get(`/problems/${id}/testcases`)
                ]);
                setProblem(problemRes.data);
                setTestCases(testCasesRes.data);
            } catch (error) {
                console.error("Failed to fetch problem", error);
            }
        };
        fetchProblem();
    }, [id]);

    const handleStart = async () => {
        setIsStarting(true);
        setRepoError(null);
        try {
            const response = await api.post(`/problems/${id}/start`);
            setRepoUrl(response.data.repo_url);
        } catch (error: any) {
            console.error("Failed to provision repo", error);
            const detail = error.response?.data?.detail || "Failed to provision repository. Did you grant GitHub access during login?";
            setRepoError(detail);
        } finally {
            setIsStarting(false);
        }
    };

    const pollSubmissionStatus = async (submissionId: number) => {
        const interval = setInterval(async () => {
            try {
                const response = await api.get(`/submissions/${submissionId}`);
                const submission = response.data;
                
                if (submission.status !== "pending") {
                    clearInterval(interval);
                    setIsSubmitting(false);
                    setResult({
                        status: submission.status === "accepted" ? "Accepted" :
                                submission.status === "wrong_answer" ? "Wrong Answer" : "Error",
                        ai_feedback: submission.ai_feedback || "No feedback generated yet.",
                        score: submission.score,
                        code_evaluated: submission.code_content
                    });
                }
            } catch (error) {
                console.error("Polling error:", error);
                clearInterval(interval);
                setIsSubmitting(false);
            }
        }, 2500); 
        
        setTimeout(() => clearInterval(interval), 60000);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setResult(null);
        setActiveTab("result");
        
        try {
            const response = await api.post(`/problems/${id}/submit`, {
                language: "python"
            });

            const submission = response.data;
            
            if (submission.status === "pending") {
                pollSubmissionStatus(submission.id);
            } else {
                setResult({
                    status: submission.status === "accepted" ? "Accepted" :
                        submission.status === "wrong_answer" ? "Wrong Answer" : "Error",
                    ai_feedback: submission.ai_feedback || "No feedback generated yet.",
                    score: submission.score || (submission.status === "accepted" ? 100 : 40),
                    code_evaluated: submission.code_content
                });
                setIsSubmitting(false);
            }
        } catch (error: any) {
            console.error("Failed to submit:", error);
            setResult({
                status: "Error",
                ai_feedback: error.response?.data?.detail || "Submission processing failed. Please check your repository."
            });
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    if (!problem) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-[#0a0a14] p-8">
                <LoadingSpinner size="lg" label="Decrypting Problem Node..." />
            </div>
        );
    }

    const confettiStyle = {
        backgroundImage: `radial-gradient(circle at 20% 30%, rgba(137, 91, 245, 0.05) 0%, transparent 20%),
                          radial-gradient(circle at 80% 10%, rgba(0, 242, 255, 0.05) 0%, transparent 20%)`
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-[#0d0a14]/80 backdrop-blur-3xl font-display text-slate-100 overflow-hidden relative">
            {/* Spectral Aura Accents */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 blur-[150px] -z-10" />
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/5 blur-[150px] -z-10" />

            {/* Premium Workspace Header */}
            <header className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] backdrop-blur-xl px-6 md:px-10 py-5 z-20">
                <div className="flex items-center gap-10">
                    <Link 
                        href="/problems" 
                        className="group flex items-center gap-3 text-slate-400 hover:text-white transition-all duration-300"
                    >
                        <div className="p-2 bg-white/5 rounded-xl border border-white/5 group-hover:bg-primary/20 group-hover:border-primary/40 transition-all">
                            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] hidden sm:block">Arena Return</span>
                    </Link>
                    
                    <div className="h-6 w-px bg-white/5 hidden sm:block" />
                    
                    <nav className="flex items-center gap-8 relative">
                        {[
                            { id: "description", label: "Quantum Specs" },
                            { id: "result", label: "Neural Result" }
                        ].map((tab) => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)} 
                                className={clsx(
                                    "relative text-xs font-black uppercase tracking-[0.3em] transition-all py-1.5",
                                    activeTab === tab.id ? "text-primary" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div 
                                        layoutId="activeTab"
                                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary shadow-[0_0_15px_rgba(137,91,245,0.4)]"
                                        transition={{ duration: 0.2 }}
                                    />
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-5 py-2.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(137,91,245,0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Node Sync Active</span>
                    </div>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {activeTab === "description" ? (
                    <motion.main 
                        key="description"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.3 }}
                        className="flex-1 flex overflow-hidden p-6 md:p-8 gap-8"
                    >
                        {/* Left Column: Problem Specs */}
                        <div className="flex-1 flex flex-col gap-8 overflow-y-auto pr-4 scroll-smooth custom-scrollbar">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className={clsx(
                                        "px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] shadow-lg",
                                        problem?.difficulty === 'Easy' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-500/10" :
                                        problem?.difficulty === 'Medium' ? "bg-orange-500/10 border-orange-500/20 text-orange-400 shadow-orange-500/10" :
                                        "bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-rose-500/10"
                                    )}>
                                        {problem?.difficulty || 'Medium'} Level
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                                        <Trophy className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{problem?.points || 0} XP</span>
                                    </div>
                                </div>

                                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                                    {problem?.title}
                                </h1>
                            </div>

                            <div className="glass-effect rounded-3xl p-8 border border-white/5 shadow-2xl relative group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Code2 className="w-32 h-32 text-primary" />
                                </div>
                                <div className="prose prose-invert prose-slate max-w-none prose-pre:bg-[#0a0a0a] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-2xl">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{problem?.description || ""}</ReactMarkdown>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="glass-effect rounded-3xl p-6 border border-white/5 space-y-4">
                                    <div className="flex items-center gap-3 text-primary">
                                        <Shield className="w-5 h-5" />
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em]">Constraints</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {problem?.constraints?.split('\n').filter(Boolean).map((constraint: string, i: number) => (
                                            <div key={i} className="flex gap-3 text-sm text-slate-400">
                                                <span className="text-primary font-bold">•</span>
                                                {constraint}
                                            </div>
                                        )) || <span className="text-slate-500 text-sm">No standard constraints applied.</span>}
                                    </div>
                                </div>

                                <div className="glass-effect rounded-3xl p-6 border border-white/5 space-y-4">
                                    <div className="flex items-center gap-3 text-cyan-400">
                                        <Sparkles className="w-5 h-5" />
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em]">Neural Hints</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {problem?.hints?.split('\n').filter(Boolean).map((hint: string, i: number) => (
                                            <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 text-sm text-slate-400">
                                                {hint}
                                            </div>
                                        )) || <span className="text-slate-500 text-sm">Solve to unlock Neural Guidance.</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Arena Connectivity */}
                        <div className="w-full max-w-md flex flex-col gap-6">
                            <div className="glass-effect rounded-3xl border border-white/10 overflow-hidden flex flex-col shadow-2xl relative">
                                <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/20 text-primary">
                                            <Rocket className="w-4 h-4" />
                                        </div>
                                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Arena Link</h2>
                                    </div>
                                    {isProvisioned && (
                                        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black uppercase tracking-widest text-emerald-400">
                                            Node Active
                                        </div>
                                    )}
                                </div>

                                <div className="p-8 space-y-8">
                                    {!isProvisioned ? (
                                        <div className="space-y-6 text-center py-4">
                                            <div className="w-20 h-20 bg-primary/10 rounded-[2rem] border-2 border-dashed border-primary/30 mx-auto flex items-center justify-center relative group">
                                                <Github className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                                                <div className="absolute inset-x-0 h-full w-full bg-primary/5 animate-pulse" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-black tracking-tight">Initialize Workspace</h3>
                                                <p className="text-sm text-slate-400 leading-relaxed px-4">
                                                    We'll create a private neural node for your code.
                                                </p>
                                            </div>
                                            <button 
                                                onClick={handleStart}
                                                disabled={isStarting}
                                                className="w-full h-14 bg-primary hover:bg-primary/90 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 group relative overflow-hidden shadow-[0_0_30px_rgba(137,91,245,0.3)]"
                                            >
                                                {isLoading ? (
                                                    <RotateCcw className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <Play className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                                                )}
                                                <span className="font-black uppercase tracking-[0.15em] text-sm">Deploy Node</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            <div className="space-y-4">
                                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Interactive Terminal</h3>
                                                <div className="space-y-3">
                                                    {[
                                                        { label: "Clone Node", cmd: `git clone ${repoUrl}` },
                                                        { label: "Push Flux", cmd: "git push origin main" }
                                                    ].map((item, i) => (
                                                        <div key={i} className="group flex flex-col gap-2">
                                                            <div className="flex items-center justify-between px-2">
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">{item.label}</span>
                                                                <button 
                                                                    onClick={() => copyToClipboard(item.cmd)}
                                                                    className="text-slate-600 hover:text-primary transition-colors"
                                                                >
                                                                    <Copy className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                            <div className="bg-[#050505] p-4 rounded-2xl border border-white/5 font-mono text-[10px] flex items-center justify-between group-hover:border-primary/30 transition-colors">
                                                                <span className="truncate text-slate-400">$ {item.cmd}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-white/5">
                                                <button 
                                                    onClick={handleSubmit}
                                                    disabled={isEvaluating}
                                                    className="w-full h-16 bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/40 rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-[0.98] group"
                                                >
                                                    {isEvaluating ? (
                                                        <RotateCcw className="w-5 h-5 animate-spin text-primary" />
                                                    ) : (
                                                        <Zap className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                                                    )}
                                                    <div className="text-left">
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-primary">Initiate Evaluation</div>
                                                        <div className="text-[8px] font-black uppercase tracking-widest text-slate-500">Sync & Analyze</div>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Node Progress */}
                            <div className="glass-effect rounded-3xl p-6 border border-white/5 flex items-center gap-6">
                                <div className="h-16 w-16 rounded-[1.25rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <ListTodo className="w-8 h-8 text-emerald-400" />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Progress Vector</div>
                                    <div className="text-lg font-black tracking-tight">Level 0: Synced</div>
                                </div>
                            </div>

                            {repoError && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold leading-tight"
                                >
                                    {repoError}
                                </motion.div>
                            )}
                        </div>
                    </motion.main>
                ) : (
                    <motion.main 
                        key="result"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="flex-1 flex flex-col items-center py-12 px-6 md:px-20 overflow-y-auto relative" 
                        style={confettiStyle}
                    >
                        {!result ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
                                {isEvaluating ? (
                                    <>
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse scale-150" />
                                            <Brain className="w-24 h-24 text-primary relative animate-bounce" />
                                        </div>
                                        <div className="space-y-3">
                                            <h3 className="text-3xl font-black text-white tracking-tight">Neural Judge Analyzing...</h3>
                                            <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">Scanning Repository • Verifying Logic • Generating Feedback</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-4 opacity-50">
                                        <Brain className="w-20 h-20 text-slate-600 mx-auto" />
                                        <p className="text-slate-500 font-black uppercase tracking-[0.2em]">Waiting for Submission</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="w-full max-w-4xl space-y-10">
                                {/* Result Hero */}
                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-8 relative">
                                        <div className={clsx(
                                            "absolute -inset-8 blur-[100px] rounded-full opacity-30",
                                            result.status === "Accepted" ? "bg-emerald-500" : "bg-rose-500"
                                        )} />
                                        <div className={clsx(
                                            "relative size-24 rounded-[2rem] border-2 flex items-center justify-center rotate-3",
                                            result.status === "Accepted" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                                        )}>
                                            {result.status === "Accepted" ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                                        </div>
                                    </div>
                                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-3">
                                        {result.status === "Accepted" ? "Neural Node Accepted" : "Sync Failed"}
                                    </h1>
                                    <p className="text-slate-400 text-lg md:text-xl font-medium">
                                        {result.status === "Accepted" ? "You've successfully bridged the logic gap." : "The judge found inconsistencies in your flux stream."}
                                    </p>
                                </div>

                                {/* Scoreboard */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="glass-effect rounded-3xl p-8 border border-white/5 flex flex-col justify-between h-44 group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Timer className="w-20 h-20 text-cyan-400" />
                                        </div>
                                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Success Rate</h3>
                                        <div className="text-5xl font-black text-white tracking-tighter">
                                            {result.status === "Accepted" ? "100%" : "FAIL"}
                                        </div>
                                    </div>
                                    <div className="glass-effect rounded-3xl p-8 border border-white/5 flex flex-col justify-between h-44 group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Trophy className="w-20 h-20 text-primary" />
                                        </div>
                                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Neural Reward</h3>
                                        <div className="text-5xl font-black text-primary tracking-tighter shadow-primary/20">
                                            {result.score || 0} <span className="text-xl text-slate-600">XP</span>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Feedback */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 px-2">
                                        <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                                            <Brain className="w-5 h-5 text-primary" />
                                        </div>
                                        <h2 className="text-xl font-black tracking-tight">Judge Analysis</h2>
                                    </div>
                                    <div className="glass-effect rounded-[2rem] p-8 md:p-10 border border-white/5 shadow-2xl relative overflow-hidden">
                                        <div className="prose prose-invert prose-slate max-w-none prose-p:leading-relaxed prose-pre:bg-[#0a0a0a] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-2xl prose-strong:text-primary prose-code:text-cyan-400 prose-code:bg-cyan-500/5 prose-code:px-2 prose-code:rounded">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.ai_feedback}</ReactMarkdown>
                                        </div>
                                    </div>
                                </div>

                                {/* Re-test Button */}
                                <div className="flex justify-center pt-8">
                                    <button 
                                        onClick={() => setActiveTab("description")}
                                        className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Re-open Specs
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.main>
                )}
            </AnimatePresence>
        </div>
    );
}

