"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
    Play,
    Send,
    Settings,
    ChevronLeft,
    Loader2,
    CheckCircle2,
    XCircle,
    Brain,
    Github,
    Copy,
    RefreshCw,
    Terminal,
    FileCode
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import api from "@/lib/api";

interface TestCaseExample {
    id: number;
    input: string;
    expected_output: string;
}

export default function ProblemDetailPage() {
    const { id } = useParams();
    const [problem, setProblem] = useState<any>(null);
    const [testCases, setTestCases] = useState<TestCaseExample[]>([]);
    const [repoUrl, setRepoUrl] = useState<string | null>(null);
    const [isStarting, setIsStarting] = useState(false);
    const [language, setLanguage] = useState("python");
    const [activeTab, setActiveTab] = useState("description");
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
                language: language
            });

            const submission = response.data;

            setResult({
                status: submission.status === "accepted" ? "Accepted" :
                    submission.status === "wrong_answer" ? "Wrong Answer" : "Error",
                ai_feedback: submission.ai_feedback || "No feedback generated yet.",
                score: submission.score,
                code_evaluated: submission.code_content
            });
            setActiveTab("result");
        } catch (error: any) {
            console.error("Failed to submit:", error);
            setResult({
                status: "Error",
                ai_feedback: error.response?.data?.detail || "Submission processing failed."
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
        return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background">
            {/* Top Header Bar */}
            <div className="h-12 glass border-b border-white/10 flex items-center justify-between px-4">
                <div className="flex items-center space-x-4">
                    <Link href="/problems" className="p-1 hover:bg-white/5 rounded-md transition-colors">
                        <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                    </Link>
                    <div className="h-4 w-px bg-white/10" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-tight">{problem.title}</h2>
                    <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                        problem.difficulty === "Easy" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" :
                            problem.difficulty === "Medium" ? "text-amber-400 bg-amber-400/10 border-amber-400/20" :
                                "text-rose-400 bg-rose-400/10 border-rose-400/20"
                    )}>
                        {problem.difficulty}
                    </span>
                </div>

                <div className="flex items-center space-x-2">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-md px-3 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
                    >
                        <option value="python">Python 3</option>
                        <option value="cpp">C++ 17</option>
                        <option value="java">Java 11</option>
                    </select>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Side: Description & Feedback */}
                <div className="w-1/2 flex flex-col border-r border-white/10 overflow-hidden">
                    <div className="flex items-center border-b border-white/10 bg-white/5">
                        {["Description", "Result"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase())}
                                className={clsx(
                                    "px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all relative",
                                    activeTab === tab.toLowerCase() ? "text-primary" : "text-muted-foreground hover:text-white"
                                )}
                            >
                                {tab}
                                {activeTab === tab.toLowerCase() && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-6">
                        {activeTab === "description" && (
                            <div className="space-y-8">
                                {/* Problem Title & Description */}
                                <div>
                                    <h1 className="text-2xl font-bold text-white mb-6">{problem.id}. {problem.title}</h1>
                                    <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                        {problem.description}
                                    </div>
                                </div>

                                {/* Test Cases / Examples */}
                                {testCases.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center space-x-2">
                                            <Terminal className="w-4 h-4 text-primary" />
                                            <span>Examples</span>
                                        </h3>
                                        {testCases.map((tc, i) => (
                                            <div key={tc.id} className="glass rounded-xl border border-white/10 overflow-hidden">
                                                <div className="px-4 py-2 bg-white/5 border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                    Example {i + 1}
                                                </div>
                                                <div className="p-4 space-y-3">
                                                    <div>
                                                        <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400/80 mb-1 block">Input</span>
                                                        <pre className="bg-black/40 rounded-lg p-3 text-sm font-mono text-white overflow-x-auto">{tc.input}</pre>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] uppercase tracking-widest font-bold text-amber-400/80 mb-1 block">Expected Output</span>
                                                        <pre className="bg-black/40 rounded-lg p-3 text-sm font-mono text-white overflow-x-auto">{tc.expected_output}</pre>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Constraints */}
                                <div className="space-y-2">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Constraints</h3>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        <li>• Your solution must be in <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">solution.py</code></li>
                                        <li>• Push your code to the provisioned GitHub repository</li>
                                        <li>• The AI Judge will analyze your code from the repo</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {activeTab === "result" && result && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Status Banner */}
                                <div className={clsx("flex items-center justify-between p-6 rounded-2xl border",
                                    result.status === "Accepted"
                                        ? "bg-emerald-500/5 border-emerald-500/20"
                                        : "bg-rose-500/5 border-rose-500/20"
                                )}>
                                    <div className="flex items-center space-x-4">
                                        <div className={clsx("p-3 rounded-xl", result.status === "Accepted" ? "bg-emerald-500/20" : "bg-rose-500/20")}>
                                            {result.status === "Accepted" ? (
                                                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                            ) : (
                                                <XCircle className="w-8 h-8 text-rose-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className={clsx("text-xl font-bold", result.status === "Accepted" ? "text-emerald-400" : "text-rose-400")}>{result.status}</h3>
                                            <p className="text-sm text-muted-foreground">Evaluated by AI Judge (Gemini 2.0 Flash)</p>
                                        </div>
                                    </div>
                                    {result.score !== undefined && (
                                        <div className="text-right">
                                            <p className="text-3xl font-black text-white">{result.score}<span className="text-sm text-muted-foreground">/100</span></p>
                                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Score</p>
                                        </div>
                                    )}
                                </div>

                                {/* Code that was evaluated */}
                                {result.code_evaluated && (
                                    <div className="glass rounded-xl border border-white/10 overflow-hidden">
                                        <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center space-x-2">
                                            <FileCode className="w-3.5 h-3.5 text-primary" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Code Evaluated</span>
                                        </div>
                                        <pre className="p-4 text-sm font-mono text-white overflow-x-auto max-h-40 overflow-y-auto">{result.code_evaluated}</pre>
                                    </div>
                                )}

                                {/* AI Feedback */}
                                <div className="p-8 rounded-2xl glass border-white/10 relative overflow-hidden group">
                                    <div className="flex items-center space-x-3 mb-6 relative z-10">
                                        <div className="p-2 bg-primary/20 rounded-lg">
                                            <Brain className="w-5 h-5 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-bold text-white">AI Mentor Feedback</h3>
                                    </div>
                                    <div className="prose prose-invert max-w-none relative z-10 text-muted-foreground leading-relaxed text-sm">
                                        {result.ai_feedback.split('\n').map((line: string, i: number) => {
                                            // Basic markdown rendering
                                            if (line.startsWith('### ')) return <h4 key={i} className="text-white font-bold mt-4 mb-2 text-base">{line.replace('### ', '')}</h4>;
                                            if (line.startsWith('## ')) return <h3 key={i} className="text-white font-bold mt-4 mb-2 text-lg">{line.replace('## ', '')}</h3>;
                                            if (line.startsWith('# ')) return <h2 key={i} className="text-white font-bold mt-4 mb-2 text-xl">{line.replace('# ', '')}</h2>;
                                            if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc">{line.replace(/^[-*] /, '')}</li>;
                                            if (line.startsWith('```')) return null;
                                            if (line.trim() === '') return <br key={i} />;

                                            // Bold text
                                            const boldRendered = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
                                            // Inline code
                                            const codeRendered = boldRendered.replace(/`(.*?)`/g, '<code class="text-primary bg-primary/10 px-1 rounded text-xs">$1</code>');

                                            return <p key={i} dangerouslySetInnerHTML={{ __html: codeRendered }} />;
                                        })}
                                    </div>
                                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                </div>
                            </div>
                        )}

                        {activeTab === "result" && !result && (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                                <Brain className="w-12 h-12 text-muted-foreground" />
                                <p className="text-muted-foreground">No submission results yet. Submit your code to see AI feedback.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: GitHub Repo Sync flow */}
                <div className="w-1/2 bg-[#0a0a0a] flex flex-col p-8 items-center justify-center relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

                    {!repoUrl ? (
                        <div className="max-w-md text-center space-y-8 relative z-10">
                            <div className="w-20 h-20 mx-auto bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                                <Github className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-white mb-4">Start Coding Challenge</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                                    MiniCode uses a real-world workflow. Click below to automatically provision a private GitHub repository synced to your account. You will clone it, write your solution locally, and push back to submit.
                                </p>
                            </div>
                            <button
                                onClick={handleStart}
                                disabled={isStarting}
                                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl transition-all shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                            >
                                {isStarting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                                <span>{isStarting ? "Provisioning Repository..." : "Provision Repository"}</span>
                            </button>
                        </div>
                    ) : (
                        <div className="w-full max-w-lg space-y-8 relative z-10">
                            <div className="text-center space-y-2 mb-10">
                                <h3 className="text-2xl font-black text-white">Repository Ready</h3>
                                <p className="text-sm text-emerald-400 font-medium">Your private workspace has been created successfully.</p>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground ml-2">1. Clone the repository</label>
                                <div className="flex items-center space-x-2 bg-white/5 border border-white/10 p-2 rounded-xl">
                                    <code className="flex-1 px-4 text-xs font-mono text-primary truncate">
                                        git clone {repoUrl}.git
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(`git clone ${repoUrl}.git`)}
                                        className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground ml-2">2. Write & Push your solution</label>
                                <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-2 font-mono text-xs text-muted-foreground">
                                    <p>cd {repoUrl.split('/').pop()}</p>
                                    <p># ... edit solution.py and save</p>
                                    <p>git add .</p>
                                    <p>git commit -m &quot;My solution&quot;</p>
                                    <p>git push origin main</p>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/10">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-white text-black font-black rounded-2xl transition-all hover:bg-white/90 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {isSubmitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
                                    <span>{isSubmitting ? "Running AI Judge Analysis..." : "Sync latest commit & Evaluate"}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
