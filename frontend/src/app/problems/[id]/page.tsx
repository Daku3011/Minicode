"use client";

import { useState, useEffect, Suspense } from "react";
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
    Sparkles,
    Timer,
    FileCode,
    Settings,
    ArrowRight,
    Lock
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import Link from "next/link";
import dynamic from 'next/dynamic';
import { clsx } from "clsx";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import remarkGfm from 'remark-gfm';

// Dynamically import ReactMarkdown for performance
const ReactMarkdown = dynamic(() => import('react-markdown'), { 
  loading: () => <div className="space-y-4"><div className="h-4 bg-white/5 rounded w-3/4"></div><div className="h-4 bg-white/5 rounded w-full"></div><div className="h-4 bg-white/5 rounded w-5/6"></div></div>
});

interface TestCaseExample {
    id: number;
    input: string;
    expected_output: string;
}

function ProblemDetailContent() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
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
    const isFaculty = user?.role === "faculty" || user?.role === "admin";
    const userUnlockedLevel = user?.unlocked_level || 1;
    const isLocked = problem && !isFaculty && problem.level > userUnlockedLevel;

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

    const listenSubmissionStatus = (submissionId: number) => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const getWsUrl = (url: string) => {
            if (url.startsWith('https://')) return url.replace('https://', 'wss://');
            if (url.startsWith('http://')) return url.replace('http://', 'ws://');
            return window.location.protocol === 'https:' ? `wss://${window.location.host}` : `ws://${window.location.host}`;
        };
        
        const ws = new WebSocket(`${getWsUrl(apiUrl)}/ws/submissions/${submissionId}`);
        
        const cleanup = () => {
             if (ws.readyState === WebSocket.OPEN) {
                 ws.close();
             }
        };

        const timeoutId = setTimeout(() => {
            cleanup();
            setIsSubmitting(false);
            setResult({ status: "Error", ai_feedback: "Submission processing timed out." });
        }, 60000);

        ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            if (data.status !== "pending") {
                clearTimeout(timeoutId);
                cleanup();
                try {
                    const response = await api.get(`/submissions/${submissionId}`);
                    const submission = response.data;
                    setResult({
                        status: submission.status === "accepted" ? "Accepted" :
                                submission.status === "wrong_answer" ? "Wrong Answer" : "Error",
                        ai_feedback: submission.ai_feedback || "No feedback generated yet.",
                        score: submission.score,
                        code_evaluated: submission.code_content
                    });
                } catch (e) {
                    setResult({ status: "Error", ai_feedback: "Failed to load final result." });
                } finally {
                    setIsSubmitting(false);
                }
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            cleanup();
            clearTimeout(timeoutId);
            
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
            setTimeout(() => { clearInterval(interval); setIsSubmitting(false); }, 60000);
        };
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
                listenSubmissionStatus(submission.id);
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
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-slate-50 p-8">
                <LoadingSpinner size="lg" label="RESTORING NODE..." />
            </div>
        );
    }

    // Lock screen for locked problems
    if (isLocked) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-slate-50 p-8">
                <div className="max-w-md text-center space-y-8">
                    <div className="w-32 h-32 bg-white/5 rounded-full border border-white/10 mx-auto flex items-center justify-center">
                        <Lock className="w-16 h-16 text-slate-500" />
                    </div>
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Access Denied</p>
                        <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">{problem?.title}</h2>
                        <p className="text-slate-500 font-bold text-sm uppercase tracking-tight">
                            This mission requires Level {problem?.level} clearance.
                            <br />
                            Your current level: <span className="text-primary">Level {userUnlockedLevel}</span>
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-3">How to Unlock</p>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-tight">
                                Complete previous missions to unlock this level and earn more XP rewards.
                            </p>
                        </div>
                        <Link 
                            href="/problems"
                            className="flex items-center justify-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Return to Mission Catalog
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 font-black text-slate-900 overflow-hidden relative">
            {/* Minimal Background Elements */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/5 blur-[150px] -z-10" />

            {/* Header */}
            <header className="flex items-center justify-between border-b border-blue-100 bg-white/90 backdrop-blur-md px-6 md:px-10 py-5 z-20">
                <div className="flex items-center gap-10">
                    <Link 
                        href="/problems" 
                        className="group flex items-center gap-3 text-slate-400 hover:text-slate-700 transition-colors"
                    >
                        <div className="p-2 bg-white border border-blue-100 rounded-xl group-hover:border-blue-400 group-hover:text-blue-600 transition-all shadow-sm">
                            <ChevronLeft className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block">Arena Exit</span>
                    </Link>
                    
                    <div className="h-4 w-[1px] bg-blue-100 hidden sm:block" />
                    
                    <nav className="flex items-center gap-8">
                        {[
                            { id: "description", label: "Specifications" },
                            { id: "result", label: "Final Result" }
                        ].map((tab) => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)} 
                                className={clsx(
                                    "relative text-[10px] font-black uppercase tracking-[0.3em] transition-all py-1.5",
                                    activeTab === tab.id ? "text-blue-600" : "text-slate-400 hover:text-slate-700"
                                )}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-blue-600 shadow-sm" />
                                )}
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            <div className="flex-1 overflow-hidden relative">
                {activeTab === "description" ? (
                    <main className="h-full flex overflow-hidden p-6 md:p-8 gap-8">
                        {/* Left Column: Specs */}
                        <div className="flex-1 flex flex-col gap-8 overflow-y-auto pr-4 custom-scrollbar">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className={clsx(
                                        "px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.2em]",
                                        problem?.difficulty === 'Easy' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                                        problem?.difficulty === 'Medium' ? "bg-primary/10 border-primary/20 text-primary" :
                                        "bg-rose-500/10 border-rose-500/20 text-rose-500"
                                    )}>
                                        {problem?.difficulty || 'Medium'} Tier
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-blue-100 shadow-sm">
                                        <Trophy className="w-3.5 h-3.5 text-blue-500" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{problem?.xp_reward || 0} Reward XP</span>
                                    </div>
                                </div>

                                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 leading-none uppercase">
                                    {problem?.title}
                                </h1>
                            </div>

                            <div className="bg-white rounded-3xl p-10 border border-blue-100 relative group transition-all hover:border-blue-200 shadow-sm">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Code2 className="w-24 h-24 text-blue-600" />
                                </div>
                                <div className="prose prose-slate max-w-none prose-p:text-slate-500 prose-p:font-bold prose-p:uppercase prose-p:tracking-tight prose-headings:uppercase prose-headings:font-black prose-headings:tracking-tighter prose-pre:bg-slate-900 prose-pre:border prose-pre:border-blue-100 prose-pre:rounded-2xl">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{problem?.description || ""}</ReactMarkdown>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                                <div className="bg-white hover:bg-slate-50 transition-colors rounded-3xl p-8 border border-blue-100 space-y-6 shadow-sm">
                                    <div className="flex items-center gap-3 text-blue-600">
                                        <Shield className="w-5 h-5" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Input Format</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {problem?.input_format ? (
                                            <div className="text-[15px] font-bold text-slate-600 uppercase tracking-tighter whitespace-pre-wrap">
                                                {problem.input_format}
                                            </div>
                                        ) : <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Standard Input</span>}
                                    </div>
                                </div>

                                <div className="bg-white hover:bg-slate-50 transition-colors rounded-3xl p-8 border border-blue-100 space-y-6 shadow-sm">
                                    <div className="flex items-center gap-3 text-blue-600">
                                        <Sparkles className="w-5 h-5" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Output Format</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {problem?.output_format ? (
                                            <div className="text-[15px] font-bold text-slate-600 uppercase tracking-tighter whitespace-pre-wrap">
                                                {problem.output_format}
                                            </div>
                                        ) : <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Standard Output</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                                <div className="bg-white hover:bg-slate-50 transition-colors rounded-3xl p-8 border border-blue-100 space-y-6 shadow-sm">
                                    <div className="flex items-center gap-3 text-blue-600">
                                        <Shield className="w-5 h-5" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Logical Constraints</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {problem?.constraints?.split('\n').filter(Boolean).map((constraint: string, i: number) => (
                                            <div key={i} className="flex gap-3 text-[15px] font-bold text-slate-600 uppercase tracking-tighter">
                                                <span className="text-blue-600">•</span>
                                                {constraint}
                                            </div>
                                        )) || <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Global Standards Applied</span>}
                                    </div>
                                </div>

                                <div className="bg-white hover:bg-slate-50 transition-colors rounded-3xl p-8 border border-blue-100 space-y-6 shadow-sm">
                                    <div className="flex items-center gap-3 text-blue-600">
                                        <Sparkles className="w-5 h-5" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Neural Guidance</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {problem?.hints?.split('\n').filter(Boolean).map((hint: string, i: number) => (
                                            <div key={i} className="p-4 rounded-xl bg-slate-50 border border-blue-100 text-[11px] font-bold text-slate-600 uppercase tracking-tighter">
                                                {hint}
                                            </div>
                                        )) || <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Guidance Locked</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Deployment */}
                        <div className="w-full max-w-md flex flex-col gap-6">
                            <div className="bg-white rounded-3xl border border-blue-100 overflow-hidden flex flex-col shadow-lg relative">
                                <div className="bg-blue-50 px-6 py-5 border-b border-blue-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Rocket className="w-4 h-4 text-blue-600" />
                                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Workstation</h2>
                                    </div>
                                    {isProvisioned && (
                                        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black uppercase tracking-widest text-emerald-500">
                                            Active
                                        </div>
                                    )}
                                </div>

                                <div className="p-8 space-y-10">
                                    {!isProvisioned ? (
                                        <div className="space-y-10 text-center py-4">
                                            <div className="w-20 h-20 bg-primary/5 rounded-full border border-primary/20 mx-auto flex items-center justify-center group transition-all hover:bg-primary/10">
                                                <Github className="w-8 h-8 text-primary" />
                                            </div>
                                            <div className="space-y-2 uppercase tracking-tighter">
                                                <h3 className="text-xl font-black text-slate-900">Initialize Node</h3>
                                                <p className="text-[10px] font-bold text-slate-400 tracking-widest">Deploying private work environment</p>
                                            </div>
                                            <button 
                                                onClick={handleStart}
                                                disabled={isStarting}
                                                className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center gap-4 transition-all disabled:opacity-50 shadow-md shadow-blue-100"
                                            >
                                                {isLoading ? (
                                                    <RotateCcw className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <Play className="w-5 h-5" />
                                                )}
                                                <span className="font-black uppercase tracking-[0.2em] text-xs">Deploy Workspace</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            <div className="space-y-4">
                                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Protocol Stream</h3>
                                                <div className="space-y-3">
                                                    {[
                                                        { label: "Clone Node", cmd: `git clone ${repoUrl}` },
                                                        { label: "Sync Changes", cmd: "git push origin main" }
                                                    ].map((item, i) => (
                                                        <div key={i} className="group space-y-2">
                                                            <div className="flex items-center justify-between px-2">
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{item.label}</span>
                                                                <button 
                                                                    onClick={() => copyToClipboard(item.cmd)}
                                                                    className="text-slate-800 hover:text-primary transition-colors"
                                                                >
                                                                    <Copy className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                            <div className="bg-black p-5 rounded-2xl border border-white/5 font-mono text-[11px] font-bold group-hover:border-primary/20 transition-colors">
                                                                <span className="truncate text-slate-500">$ {item.cmd}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-blue-100">
                                                <button 
                                                    onClick={handleSubmit}
                                                    disabled={isEvaluating}
                                                    className="w-full h-16 bg-blue-50 hover:bg-blue-100 border border-blue-100 hover:border-blue-300 rounded-2xl flex items-center justify-center gap-4 transition-all"
                                                >
                                                    {isEvaluating ? (
                                                        <RotateCcw className="w-5 h-5 animate-spin text-blue-600" />
                                                    ) : (
                                                        <Zap className="w-5 h-5 text-blue-600" />
                                                    )}
                                                    <div className="text-left font-black uppercase">
                                                        <div className="text-[11px] tracking-widest text-blue-600">Evaluate Logic</div>
                                                        <div className="text-[8px] tracking-widest text-slate-400">Scan Matrix</div>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {repoError && (
                                <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                    {repoError}
                                </div>
                            )}
                        </div>
                    </main>
                ) : (
                    <main className="h-full flex flex-col items-center py-12 px-6 md:px-20 overflow-y-auto">
                        {!result ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-12">
                                {isEvaluating ? (
                                    <>
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-blue-600/20 blur-3xl" />
                                            <Brain className="w-24 h-24 text-blue-600 relative" />
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Judge Online</h3>
                                            <p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em]">Analyzing Signal • Scanning Flux • Reporting Status</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-6 opacity-30">
                                        <Brain className="w-20 h-20 text-slate-900 mx-auto" />
                                        <p className="text-slate-900 font-black uppercase tracking-[0.4em]">Final Stream Pending</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="w-full max-w-4xl space-y-16 pb-20">
                                {/* Result Hero */}
                                <div className="flex flex-col items-center text-center space-y-8">
                                    <div className={clsx(
                                        "size-32 rounded-full border-4 flex items-center justify-center transition-all",
                                        result.status === "Accepted" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-[0_0_60px_rgba(16,185,129,0.2)]" : "bg-rose-500/10 border-rose-500/30 text-rose-500 shadow-[0_0_60px_rgba(244,63,94,0.2)]"
                                    )}>
                                        {result.status === "Accepted" ? <CheckCircle2 className="w-16 h-16" /> : <XCircle className="w-16 h-16" />}
                                    </div>
                                    <div className="space-y-3">
                                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 uppercase leading-none">
                                            {result.status === "Accepted" ? "Matrix Clear" : "Logic Failed"}
                                        </h1>
                                        <p className="text-slate-400 text-lg md:text-xl font-black uppercase tracking-widest">
                                            {result.status === "Accepted" ? "Neural Node Accepted" : "Sync Error Detected"}
                                        </p>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-white rounded-3xl p-10 border border-blue-100 space-y-3 shadow-sm">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Success Factor</h3>
                                        <div className="text-6xl font-black text-slate-900 tracking-tighter leading-none">
                                            {result.status === "Accepted" ? "100%" : "FAULT"}
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-3xl p-10 border border-blue-100 space-y-3 shadow-sm">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Neural Credit</h3>
                                        <div className="text-6xl font-black text-blue-600 tracking-tighter leading-none">
                                            {result.score || 0} <span className="text-xl text-slate-400">XP</span>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Feedback */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <Brain className="w-6 h-6 text-blue-600" />
                                        <h2 className="text-2xl font-black tracking-tighter uppercase text-slate-900">Judge Analytics</h2>
                                    </div>
                                    <div className="bg-white rounded-[2.5rem] p-10 border border-blue-100 shadow-xl">
                                        <div className="prose prose-slate max-w-none prose-p:text-slate-500 prose-p:font-bold prose-p:uppercase prose-p:tracking-tight prose-headings:uppercase prose-headings:font-black prose-headings:tracking-tighter prose-strong:text-blue-600 prose-code:text-blue-600 prose-code:bg-blue-50 prose-pre:bg-slate-900 prose-pre:border prose-pre:border-blue-100">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.ai_feedback}</ReactMarkdown>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-center">
                                    <button 
                                        onClick={() => setActiveTab("description")}
                                        className="flex items-center gap-3 px-12 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Return to Specs
                                    </button>
                                </div>
                            </div>
                        )}
                    </main>
                )}
            </div>
        </div>
    );
}

export default function ProblemDetailPage() {
    return (
        <Suspense fallback={null}>
            <ProblemDetailContent />
        </Suspense>
    );
}
