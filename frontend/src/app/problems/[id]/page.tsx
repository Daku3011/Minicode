"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Play,
    Loader2,
    CheckCircle2,
    XCircle,
    Brain,
    Github,
    Copy,
    RefreshCw,
    Terminal,
    FileCode,
    Timer,
    Code,
    ArrowRight,
    Settings,
    Bell,
    ChevronLeft,
    ChevronRight,
    CloudSync,
    Layers
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import api from "@/lib/api";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
    const [result, setResult] = useState<{ status: string; ai_feedback: string; score?: number; code_evaluated?: string } | null>(null);

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
        try {
            const response = await api.post(`/problems/${id}/start`);
            setRepoUrl(response.data.repo_url);
        } catch (error) {
            console.error("Failed to provision repo", error);
            alert("Failed to provision repository. Did you grant GitHub access during login?");
        } finally {
            setIsStarting(false);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await api.post(`/problems/${id}/submit`, {
                language: "python"
            });

            const submission = response.data;

            setResult({
                status: submission.status === "accepted" ? "Accepted" :
                    submission.status === "wrong_answer" ? "Wrong Answer" : "Error",
                ai_feedback: submission.ai_feedback || "No feedback generated yet.",
                score: submission.score || (submission.status === "accepted" ? 100 : 40),
                code_evaluated: submission.code_content
            });
            setActiveTab("result");
        } catch (error: any) {
            console.error("Failed to submit:", error);
            setResult({
                status: "Error",
                ai_feedback: error.response?.data?.detail || "Submission processing failed. Please check your repository."
            });
            setActiveTab("result");
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    if (!problem) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-[#0d0a16]">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    const confettiStyle = {
        backgroundImage: `radial-gradient(circle at 20% 30%, rgba(137, 91, 245, 0.1) 0%, transparent 10%),
                          radial-gradient(circle at 80% 10%, rgba(16, 185, 129, 0.1) 0%, transparent 10%),
                          radial-gradient(circle at 50% 50%, rgba(137, 91, 245, 0.05) 0%, transparent 50%)`
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-[#0d0a16] font-display text-slate-100 overflow-hidden">
            {/* Minimal Sub-Header */}
            <header className="flex items-center justify-between border-b border-primary/20 bg-[#1b1429]/50 backdrop-blur-md px-4 md:px-8 py-2 z-20">
                <div className="flex items-center gap-6">
                    <button onClick={() => router.push('/problems')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase tracking-widest hidden sm:block">Back to Arena</span>
                    </button>
                    <div className="h-4 w-px bg-white/10 hidden sm:block" />
                    <nav className="hidden md:flex items-center gap-6">
                        <button onClick={() => setActiveTab("description")} className={clsx("text-sm font-bold uppercase tracking-wider transition-colors pb-1 border-b-2", activeTab === "description" ? "text-primary border-primary" : "text-slate-400 border-transparent hover:text-white")}>Problem</button>
                        <button onClick={() => setActiveTab("result")} className={clsx("text-sm font-bold uppercase tracking-wider transition-colors pb-1 border-b-2", activeTab === "result" ? "text-primary border-primary" : "text-slate-400 border-transparent hover:text-white")}>AI Feedback</button>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all">
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {activeTab === "description" ? (
                /* Main Workspace: Split Pane */
                <main className="flex flex-1 overflow-hidden">
                    {/* Left Pane: Problem Description */}
                    <section className="w-1/2 flex flex-col border-r border-primary/10 bg-[#1b1429]/30 overflow-y-auto">
                        <div className="p-8 max-w-2xl mx-auto w-full">
                            <div className="flex items-center gap-2 text-primary mb-4 font-mono text-xs uppercase tracking-widest">
                                <span className={clsx("px-2 py-0.5 rounded border",
                                    problem.difficulty === "Easy" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" :
                                    problem.difficulty === "Medium" ? "text-amber-400 bg-amber-400/10 border-amber-400/20" :
                                    "text-rose-400 bg-rose-400/10 border-rose-400/20"
                                )}>
                                    Level: {problem.difficulty}
                                </span>
                                <span className="text-slate-500">•</span>
                                <span>Core Algorithms</span>
                            </div>
                            
                            <h1 className="text-4xl font-extrabold text-white mb-6 pr-4">{problem.id}. {problem.title}</h1>
                            
                            <div className="prose prose-invert prose-slate mb-8 max-w-none">
                                <div className="text-slate-300 leading-relaxed text-base whitespace-pre-wrap">
                                    {problem.description}
                                </div>
                            </div>

                            {/* Examples */}
                            {testCases.map((tc, idx) => (
                                <div key={tc.id} className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-6">
                                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-[#06b6d4]" />
                                        EXAMPLE {idx + 1}
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex-1 flex flex-col items-center p-3 rounded-lg border border-primary/20 bg-[#1b1429]">
                                                <span className="text-[10px] text-slate-500 mb-1 font-bold tracking-widest uppercase">Input</span>
                                                <span className="font-mono text-sm text-[#06b6d4]">{tc.input}</span>
                                            </div>
                                            <ArrowRight className="text-primary hidden md:block w-5 h-5 shrink-0" />
                                            <div className="flex-1 flex flex-col items-center p-3 rounded-lg border border-primary/20 bg-[#1b1429]">
                                                <span className="text-[10px] text-slate-500 mb-1 font-bold tracking-widest uppercase">Expected Output</span>
                                                <span className="font-mono text-sm text-[#06b6d4]">{tc.expected_output}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Right Pane: Code Status & Evaluation */}
                    <section className="w-1/2 flex flex-col bg-[#1b1429]/50 relative">
                        {!repoUrl ? (
                            <div className="flex flex-col items-center justify-center p-12 h-full text-center relative overflow-hidden">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                                <div className="size-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl relative z-10 border border-white/5">
                                    <Github className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-3xl font-black text-white mb-4 relative z-10">Start Challenge</h3>
                                <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-md relative z-10">
                                    Click below to provision a private GitHub repository synced to your account. Clone it, write your solution locally, and push back to evaluate.
                                </p>
                                <button
                                    onClick={handleStart}
                                    disabled={isStarting}
                                    className="w-full max-w-sm flex items-center justify-center gap-3 px-8 py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-[0_0_30px_rgba(139,92,246,0.3)] disabled:opacity-50 relative z-10"
                                >
                                    {isStarting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CloudSync className="w-5 h-5" />}
                                    <span>{isStarting ? "Provisioning Repository..." : "Provision Repository"}</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full">
                                {/* Github Connection Widget */}
                                <div className="p-6">
                                    <div className="bg-[#0d0a16]/80 border border-primary/20 rounded-xl p-4 flex items-center justify-between shadow-xl">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-lg bg-slate-800 flex items-center justify-center border border-white/5">
                                                <Github className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-white font-bold text-sm">Connected to Github</h4>
                                                    <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                                                </div>
                                                <p className="text-slate-400 font-mono text-[10px] sm:text-xs truncate max-w-[200px] sm:max-w-xs">{repoUrl.replace('https://github.com/', '')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Terminal Instructions */}
                                <div className="flex-1 px-8 py-2 overflow-y-auto custom-scrollbar">
                                    <div className="flex flex-col gap-6">
                                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                            <Terminal className="w-4 h-4" />
                                            Terminal Workflow
                                        </h3>
                                        
                                        <div className="space-y-4 font-mono text-sm max-w-md">
                                            <div className="bg-black/40 border border-primary/20 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-primary text-xs font-bold uppercase">1. Clone</span>
                                                    <button onClick={() => copyToClipboard(`git clone ${repoUrl}.git`)} className="text-slate-500 hover:text-white"><Copy className="w-4 h-4" /></button>
                                                </div>
                                                <p className="text-slate-300 break-all text-xs">git clone {repoUrl}.git</p>
                                            </div>
                                            
                                            <div className="bg-black/40 border border-primary/20 rounded-lg p-4">
                                                <div className="mb-2">
                                                    <span className="text-[#06b6d4] text-xs font-bold uppercase">2. Code & Push</span>
                                                </div>
                                                <p className="text-slate-500 text-xs leading-relaxed">
                                                    cd {repoUrl.split('/').pop()}<br/>
                                                    <span className="text-slate-300"># edit solution.py</span><br/>
                                                    git add .<br/>
                                                    git commit -m "My solution"<br/>
                                                    git push origin main
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Action */}
                                <div className="p-8 bg-[#0d0a16]/80 backdrop-blur-md border-t border-primary/20">
                                    <button 
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="w-full h-16 rounded-xl bg-gradient-to-r from-primary via-primary to-[#06b6d4] text-white font-bold text-lg flex items-center justify-center gap-3 transition-transform hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_20px_rgba(137,91,245,0.4)] group disabled:opacity-50"
                                    >
                                        <RefreshCw className={clsx("w-6 h-6", isSubmitting ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500")} />
                                        {isSubmitting ? "ANALYZING REPO..." : "SYNC & EVALUATE CODE"}
                                    </button>
                                    <p className="text-center mt-4 text-slate-500 text-xs font-mono">
                                        Ensure your latest code is pushed to <span className="text-slate-400">main</span> branch
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>
                </main>
            ) : (
                /* Main Workspace: Full Screen AI Feedback */
                <main className="flex-1 flex flex-col items-center py-8 px-6 md:px-20 lg:px-40 overflow-y-auto relative" style={confettiStyle}>
                    {!result ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50 relative z-10">
                            <Brain className="w-16 h-16 text-slate-500" />
                            <p className="text-slate-400 text-lg">No submission results yet. Submit your code to see AI feedback.</p>
                        </div>
                    ) : (
                        <div className="max-w-4xl w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {/* Hero Section */}
                            <div className="flex flex-col items-center text-center mb-10">
                                <div className="mb-6 relative">
                                    <div className={clsx("absolute -inset-4 blur-xl rounded-full", result.status === "Accepted" ? "bg-[#10b981]/20" : "bg-rose-500/20")} />
                                    <div className={clsx("relative border p-6 rounded-full flex items-center justify-center", result.status === "Accepted" ? "bg-[#10b981]/10 border-[#10b981]/30" : "bg-rose-500/10 border-rose-500/30")}>
                                        {result.status === "Accepted" ? (
                                            <CheckCircle2 className="text-[#10b981] w-12 h-12" />
                                        ) : (
                                            <XCircle className="text-rose-500 w-12 h-12" />
                                        )}
                                    </div>
                                </div>
                                <h1 className="text-slate-100 text-4xl md:text-5xl font-black leading-tight tracking-tight mb-2">
                                    {result.status === "Accepted" ? "Review complete!" : "Keep Trying!"}
                                </h1>
                                <p className="text-slate-400 text-lg">
                                    {result.status === "Accepted" ? "You're crushing it! Here's how your solution performed." : "Every error is a step closer to mastery. Review the feedback below."}
                                </p>
                            </div>

                            {/* Score Matrix Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                                <div className={clsx("rounded-xl p-6 flex flex-col gap-4 border bg-[#2e2348]/40 backdrop-blur-md", result.status === "Accepted" ? "shadow-[0_0_20px_rgba(16,185,129,0.15)] border-[#10b981]/20" : "border-rose-500/20")}>
                                    <div className="flex items-center justify-between">
                                        <div className={clsx("p-2 rounded-lg", result.status === "Accepted" ? "bg-[#10b981]/20" : "bg-rose-500/20")}>
                                            <CheckCircle2 className={clsx("w-5 h-5", result.status === "Accepted" ? "text-[#10b981]" : "text-rose-500")} />
                                        </div>
                                        <span className={clsx("font-bold text-xs uppercase tracking-widest", result.status === "Accepted" ? "text-[#10b981]" : "text-rose-500")}>Correctness</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-slate-400 text-sm font-medium">Test Cases</h3>
                                        <p className="text-slate-100 text-2xl font-bold">{result.status === "Accepted" ? "100%" : "Failed"}</p>
                                    </div>
                                </div>
                                <div className="bg-[#2e2348]/40 backdrop-blur-md border border-primary/20 rounded-xl p-6 flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div className="bg-primary/20 p-2 rounded-lg">
                                            <Timer className="text-primary w-5 h-5" />
                                        </div>
                                        <span className="text-primary font-bold text-xs uppercase tracking-widest">Efficiency</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-slate-400 text-sm font-medium">Overall Score</h3>
                                        <p className="text-slate-100 text-2xl font-bold">{result.score}/100</p>
                                    </div>
                                </div>
                                {/* <div className="bg-[#2e2348]/40 backdrop-blur-md border border-primary/20 rounded-xl p-6 flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div className="bg-amber-500/20 p-2 rounded-lg">
                                            <Code className="text-amber-500 w-5 h-5" />
                                        </div>
                                        <span className="text-amber-500 font-bold text-xs uppercase tracking-widest">Quality</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-slate-400 text-sm font-medium">Code Quality</h3>
                                        <p className="text-slate-100 text-2xl font-bold">Analyzed</p>
                                    </div>
                                </div> */}
                            </div>

                            {/* Mentor's Notes Section */}
                            <div className="flex flex-col gap-6 mb-12">
                                <h2 className="text-slate-100 text-2xl font-bold tracking-tight px-2">Mentor's Notes</h2>
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary shadow-lg shadow-primary/20 bg-slate-800 flex items-center justify-center">
                                           <Brain className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex justify-center mt-1">
                                            <span className="bg-primary text-[10px] font-bold text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">AI Mentor</span>
                                        </div>
                                    </div>
                                    <div className="relative flex-1">
                                        <div className="bg-[#2e2348]/40 backdrop-blur-md border border-primary/20 rounded-2xl rounded-tl-none p-6 shadow-xl relative z-10">
                                            <div className="text-slate-200 text-sm leading-relaxed prose prose-invert prose-p:leading-relaxed prose-pre:bg-[#06b6d4]/10 prose-pre:border prose-pre:border-[#06b6d4]/20 prose-code:text-[#06b6d4] prose-code:bg-[#06b6d4]/10 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none max-w-none prose-headings:text-white prose-headings:font-bold prose-strong:text-primary prose-a:text-[#06b6d4]">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {result.ai_feedback}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                        {/* Chat Bubble Triangle */}
                                        <div className="absolute top-0 -left-2 w-0 h-0 border-t-[12px] border-t-primary/20 border-r-[12px] border-r-transparent"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            )}

            {/* Status Bar */}
            {/* <footer className="bg-[#1b1429] border-t border-primary/10 px-6 py-2 flex items-center justify-between text-[11px] font-mono text-slate-500 z-20 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-[#06b6d4] shadow-[0_0_5px_#06b6d4]"></span>
                        <span>API: Connected</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-primary font-bold px-2 py-0.5 bg-primary/10 rounded">PREMIUM ACCESS</span>
                </div>
            </footer> */}
        </div>
    );
}
