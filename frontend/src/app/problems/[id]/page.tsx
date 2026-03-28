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
    Layers,
    Target,
    Zap,
    Star,
    Code2,
    BarChart3
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import api from "@/lib/api";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from "@/contexts/AuthContext";

interface TestCaseExample {
    id: number;
    input: string;
    expected_output: string;
}

export default function ProblemDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
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
        <div className="flex flex-col h-[calc(100vh-64px)] level-0 text-foreground overflow-hidden selection:bg-primary/30">
            {/* Header: Minimalist & Integrated */}
            <header className="flex items-center justify-between border-none bg-background/20 backdrop-blur-2xl px-8 py-4 z-30 shadow-atmospheric">
                <div className="flex items-center gap-8">
                    <button onClick={() => router.push('/problems')} className="group flex items-center gap-3 text-foreground/40 hover:text-primary transition-all">
                        <div className="p-2 rounded-xl group-hover:bg-primary/10 transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] hidden sm:block">RETURN_TO_CORE</span>
                    </button>
                    <div className="h-6 w-px level-2 opacity-50 hidden sm:block" />
                    <div className="flex flex-col">
                        <h2 className="text-sm font-bold text-foreground tracking-tightest leading-none uppercase italic">{problem.title}</h2>
                        <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.4em] mt-2">ARENA_NODE_ACTIVE</span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <button className="p-3 text-foreground/30 hover:text-primary transition-colors relative group">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
                    </button>
                    <div className="h-10 w-10 rounded-2xl level-2 p-0.5 overflow-hidden shadow-atmospheric">
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt="Profile" className="h-full w-full object-cover rounded-[14px]" />
                        ) : (
                            <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-mono font-bold uppercase">
                                {user?.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Workspace: High-Fidelity Tonal Split */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Left Pane: Documentation & Rules */}
                <aside className="w-full md:w-1/2 lg:w-[40%] flex flex-col level-1 overflow-y-auto custom-scrollbar no-border-separation shadow-atmospheric">
                    <div className="p-10 md:p-14 space-y-16 animate-in fade-in slide-in-from-left-8 duration-1000">
                        {/* Tab Switcher (Mobile Only) */}
                        <div className="flex md:hidden items-center justify-center gap-4 mb-10">
                           <button onClick={() => setActiveTab("description")} className={clsx("px-6 py-3 rounded-2xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all", activeTab === 'description' ? "liquid-gradient text-primary-foreground shadow-atmospheric" : "level-2 text-foreground/40")}>PROBLEM_DOCS</button>
                           <button onClick={() => setActiveTab("result")} className={clsx("px-6 py-3 rounded-2xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all", activeTab === 'result' ? "liquid-gradient text-primary-foreground shadow-atmospheric" : "level-2 text-foreground/40")}>FEEDBACK_CORE</button>
                        </div>

                        {/* Problem Context: Editorial Intent */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className={clsx("px-4 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-[0.3em] level-2", 
                                    problem.difficulty === "Easy" ? "text-primary/60" :
                                    problem.difficulty === "Medium" ? "text-amber-400" :
                                    "text-rose-500"
                                )}>
                                    LVL // {problem.difficulty.toUpperCase()}
                                </div>
                                <div className="flex items-center gap-2 text-foreground/20 text-[10px] font-mono font-bold uppercase tracking-[0.4em]">
                                    <Target className="w-3.5 h-3.5" />
                                    <span>ARCHITECT_NODE</span>
                                </div>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tightest leading-[0.8] italic uppercase">{problem.title}</h1>
                            <div className="prose prose-invert prose-lg max-w-none">
                                <p className="text-foreground/50 text-xl leading-relaxed font-medium first-letter:text-4xl first-letter:font-bold first-letter:text-primary">
                                    {problem.description}
                                </p>
                            </div>
                        </div>

                        {/* Rules: The Alchemist Protocol */}
                        <div className="space-y-6">
                           <h3 className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.5em] flex items-center gap-3">
                               <Layers className="w-4 h-4" />
                               CORE_CONSTRAINTS
                           </h3>
                           <div className="grid grid-cols-1 gap-4">
                               {[
                                   "Modular architecture required (Python 3.10+)",
                                   "Edge-case parity mandatory",
                                   "Direct provision to main via secure tunnel",
                                   "Heuristic AI evaluation threshold: 85%"
                               ].map((rule, i) => (
                                   <div key={i} className="flex items-start gap-4 p-6 rounded-[2rem] level-2 group hover:bg-primary/[0.02] transition-colors no-border-separation">
                                       <div className="mt-1.5 w-2 h-2 rounded-full bg-primary light-emission shadow-atmospheric" />
                                       <p className="text-sm text-foreground/60 font-medium tracking-tight">{rule}</p>
                                   </div>
                               ))}
                           </div>
                        </div>

                        {/* Test Cases: Terminal Aesthetics */}
                        <div className="space-y-8 pb-16">
                            <h3 className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.5em] flex items-center gap-3">
                                <Code className="w-4 h-4" />
                                VERIFIED_SCENARIOS
                            </h3>
                            <div className="space-y-6">
                                {testCases.map((tc, idx) => (
                                    <div key={tc.id} className="p-8 rounded-[2.5rem] glass space-y-6 shadow-atmospheric no-border-separation">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.4em]">NODE_#{idx + 1}</span>
                                            <CheckCircle2 className="w-4 h-4 text-primary opacity-40" />
                                        </div>
                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="space-y-2">
                                                <span className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.3em]">INPUT_VECTOR</span>
                                                <div className="level-2 rounded-2xl p-4 font-mono text-xs text-primary/80 shadow-inner">{tc.input}</div>
                                            </div>
                                            <div className="space-y-2">
                                                <span className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.3em]">REIFIED_OUTPUT</span>
                                                <div className="level-2 rounded-2xl p-4 font-mono text-xs text-emerald-400 opacity-80 shadow-inner">{tc.expected_output}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Right Pane: Provision/Action Area */}
                <main className="hidden md:flex flex-1 flex-col level-0 relative overflow-y-auto no-scrollbar">
                    {/* Ambient Kinetic Glows */}
                    <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] bg-primary/2 blur-[200px] rounded-full pointer-events-none animate-pulse" />

                    {!repoUrl ? (
                         <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in-95 duration-1000">
                             <div className="w-32 h-32 level-1 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-atmospheric relative group">
                                 <div className="absolute -inset-4 bg-primary/5 blur-xl group-hover:bg-primary/20 transition-all rounded-full" />
                                 <Github className="w-16 h-16 text-foreground relative z-10" />
                             </div>
                             <h2 className="text-5xl font-bold text-foreground tracking-tightest mb-6 uppercase italic">Provision_Env</h2>
                             <p className="text-foreground/40 text-xl max-w-sm font-medium leading-relaxed mb-12 uppercase tracking-wide">
                                 Initializing secure <br /> logic quadrant...
                             </p>
                             <button
                                 onClick={handleStart}
                                 disabled={isStarting}
                                 className="w-full max-w-xs h-20 liquid-gradient text-primary-foreground rounded-2xl font-bold text-xl shadow-atmospheric light-emission hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                             >
                                 {isStarting ? <Loader2 className="w-7 h-7 animate-spin" /> : <Zap className="w-7 h-7" />}
                                 <span className="uppercase tracking-widest">{isStarting ? "PROCESSING..." : "ACTIVATE_ARENA"}</span>
                             </button>
                         </div>
                    ) : (
                        <div className="flex-1 flex flex-col p-12 md:p-16 animate-in fade-in slide-in-from-right-8 duration-1000">
                             <div className="mb-14">
                                <h3 className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.5em] mb-8 flex items-center gap-3">
                                    <Terminal className="w-4 h-4" />
                                    ENGINE_LOG_STREAMS
                                </h3>
                                <div className="glass rounded-[3rem] p-12 space-y-12 shadow-glass no-border-separation">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="p-5 level-2 rounded-3xl">
                                                <Github className="w-8 h-8 text-primary shadow-atmospheric" />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-foreground font-bold text-xl leading-none uppercase tracking-tightest">PROVISIONED_NODE_LIVE</h4>
                                                <p className="text-foreground/30 text-[10px] font-mono uppercase tracking-[0.3em] font-bold">
                                                    {repoUrl.replace('https://github.com/', 'NODE://')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-atmospheric light-emission" />
                                    </div>

                                    <div className="h-px level-2 opacity-50" />

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between group cursor-pointer" onClick={() => copyToClipboard(`git clone ${repoUrl}.git`)}>
                                            <div className="space-y-2">
                                                <span className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.4em]">SYNC_VECTOR</span>
                                                <p className="text-primary font-mono text-sm group-hover:underline underline-offset-8">git clone {repoUrl}.git</p>
                                            </div>
                                            <Copy className="w-5 h-5 text-foreground/20 group-hover:text-primary transition-colors" />
                                        </div>
                                        <div className="p-8 level-1 rounded-[2rem] font-mono text-xs text-foreground/40 leading-relaxed shadow-inner">
                                            <span className="text-primary italic opacity-70"># WORKFLOW_PROTOCOL:</span><br/>
                                            cd {repoUrl.split('/').pop()}<br/>
                                            <span className="text-foreground/20 italic">// implement core logic in domain master</span><br/>
                                            git add .<br/>
                                            git commit -m "sys: logic update"<br/>
                                            git push origin main
                                        </div>
                                    </div>
                                </div>
                             </div>

                             <div className="mt-auto space-y-6">
                                 <button 
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="w-full h-24 liquid-gradient text-primary-foreground rounded-[2.5rem] font-bold text-2xl shadow-atmospheric light-emission hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-6 group disabled:opacity-50"
                                 >
                                    <RefreshCw className={clsx("w-10 h-10 transition-transform duration-1000", isSubmitting ? "animate-spin" : "group-hover:rotate-180")} />
                                    <span className="uppercase tracking-[0.2em] italic">{isSubmitting ? "ANALYST_WORKING..." : "RUN_HEURISTIC_ANALYSIS"}</span>
                                 </button>
                                 <p className="text-center text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.4em]">PROBABILISTIC_EVAL_ACTIVE // INSTANT_INSIGHT_READY</p>
                             </div>
                        </div>
                    )}
                </main>

                {/* AI Feedback Overlay: The Digital Alchemist Vision */}
                {(activeTab === "result" || (result && activeTab !== "description")) && (
                    <div className="absolute inset-0 z-50 level-0/95 backdrop-blur-[60px] animate-in fade-in zoom-in-105 duration-700 flex items-center justify-center p-6 md:p-16 overflow-y-auto no-scrollbar selection:bg-primary/50">
                        <button onClick={() => { setActiveTab("description"); setResult(null); }} className="absolute top-10 right-10 p-4 rounded-full level-2 hover:bg-primary/10 transition-all group shadow-atmospheric">
                            <XCircle className="w-8 h-8 text-foreground/30 group-hover:text-primary transition-colors" />
                        </button>

                        <div className="max-w-5xl w-full py-20 space-y-20 animate-in slide-in-from-bottom-16 duration-1000 delay-100">
                             {!result ? (
                                 <div className="flex flex-col items-center justify-center py-24 text-center space-y-10">
                                     <div className="w-28 h-28 level-1 rounded-full flex items-center justify-center shadow-atmospheric relative">
                                         <div className="absolute inset-0 bg-primary/5 animate-pulse rounded-full blur-xl" />
                                         <Brain className="w-12 h-12 text-primary opacity-50 relative z-10" />
                                     </div>
                                     <div className="space-y-4">
                                         <h2 className="text-4xl font-bold text-foreground tracking-tightest uppercase italic">Awaiting_Insight</h2>
                                         <p className="text-foreground/30 text-[10px] font-mono font-bold uppercase tracking-[0.4em]">Transmitting logic vector to analyst grid...</p>
                                     </div>
                                 </div>
                             ) : (
                                 <div className="space-y-20">
                                     {/* Result Hero: Cinematic Scale */}
                                     <div className="flex flex-col items-center text-center space-y-10">
                                         <div className="relative">
                                             <div className={clsx("absolute -inset-16 blur-[100px] rounded-full", result.status === "Accepted" ? "bg-emerald-500/20" : "bg-primary/20")} />
                                             <div className={clsx("relative w-32 h-32 rounded-[2.5rem] flex items-center justify-center shadow-atmospheric light-emission", 
                                                 result.status === "Accepted" ? "level-1 text-emerald-400" : "level-1 text-primary"
                                             )}>
                                                 {result.status === "Accepted" ? <CheckCircle2 className="w-16 h-16" /> : <XCircle className="w-16 h-16" />}
                                             </div>
                                         </div>
                                         <div className="space-y-4">
                                             <h1 className="text-7xl md:text-9xl font-black text-foreground tracking-tightest leading-none italic uppercase">
                                                 {result.status === "Accepted" ? "Unified" : "Partial"}
                                             </h1>
                                             <p className="text-foreground/40 text-[10px] font-mono font-bold uppercase tracking-[0.5em] mt-4">
                                                 {result.status === "Accepted" ? "LOGIC_PARITY_ESTABLISHED // NODE_CLEARED" : "HEURISTIC_MISMATCH // RE-ARCHITECT_DOMAIN"}
                                             </p>
                                         </div>
                                     </div>

                                     {/* Metrics Grid: Tonal Precision */}
                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                         {[
                                             { label: 'EFFICIENCY_RATIO', value: `${result.score || (result.status === 'Accepted' ? 98 : 45)}%`, icon: Star, color: 'text-primary' },
                                             { label: 'RECOIL_THRESHOLD', value: 'NOMINAL', icon: Timer, color: 'text-primary/50' },
                                             { label: 'DOMAIN_COMPLEXITY', value: 'LINEAR', icon: Code2, color: 'text-primary/70' }
                                         ].map((stat, i) => (
                                             <div key={i} className="glass rounded-[2rem] p-10 flex flex-col items-center text-center gap-6 shadow-atmospheric no-border-separation hover:bg-primary/[0.02] transition-colors">
                                                 <div className={`p-4 level-2 rounded-2xl ${stat.color}`}>
                                                     <stat.icon className="w-8 h-8" />
                                                 </div>
                                                 <div className="space-y-2">
                                                     <span className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.4em]">{stat.label}</span>
                                                     <h4 className="text-4xl font-bold font-mono tracking-tightest leading-none italic">{stat.value}</h4>
                                                 </div>
                                             </div>
                                         ))}
                                     </div>

                                     {/* Feedback Module: Deep Insight */}
                                     <div className="space-y-12">
                                         <div className="flex items-center gap-8">
                                             <div className="h-px flex-1 level-2 opacity-30" />
                                             <h3 className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.6em]">ANALYST_INSIGHT_REIFIED</h3>
                                             <div className="h-px flex-1 level-2 opacity-30" />
                                         </div>

                                         <div className="glass rounded-[4rem] p-12 md:p-20 relative group shadow-glass no-border-separation">
                                             <div className="absolute top-12 left-12 text-primary opacity-5 transform group-hover:scale-110 transition-transform duration-1000">
                                                 <Brain className="w-32 h-32" />
                                             </div>
                                             <div className="relative z-10 prose prose-invert prose-2xl max-w-none text-foreground/60 font-medium leading-[1.8] prose-strong:text-primary prose-strong:font-black prose-code:font-mono prose-code:text-primary prose-code:bg-primary/10 prose-code:px-3 prose-code:py-1 prose-code:rounded-xl prose-code:before:content-none prose-code:after:content-none prose-ul:list-none prose-ul:pl-0 prose-li:mb-6">
                                                 <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                     {(() => {
                                                         const feedback = result.ai_feedback;
                                                         if (feedback && (feedback.trim().startsWith('{') || feedback.trim().startsWith('```json'))) {
                                                             try {
                                                                 const cleaned = feedback.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
                                                                 const parsed = JSON.parse(cleaned);
                                                                 return parsed.feedback || feedback;
                                                             } catch (e) {
                                                                 return feedback;
                                                             }
                                                         }
                                                         return feedback;
                                                     })()}
                                                 </ReactMarkdown>
                                             </div>
                                         </div>
                                     </div>

                                     <div className="flex justify-center pt-10">
                                         <button onClick={() => { setActiveTab("description"); setResult(null); }} className="px-16 py-6 level-1 hover:bg-primary/10 text-foreground font-mono font-bold uppercase tracking-[0.4em] rounded-[2rem] transition-all hover:-translate-y-2 shadow-atmospheric italic">
                                             DISMISS_OVERVIEW_MATRIX
                                         </button>
                                     </div>
                                 </div>
                             )}
                        </div>
                    </div>
                )}
            </div>

            {/* Status Footer: Precision Infrastructure */}
            <footer className="level-1 px-8 py-4 flex items-center justify-between z-30 shadow-atmospheric">
                <div className="flex items-center gap-12">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary light-emission shadow-atmospheric animate-pulse" />
                        <span className="text-[10px] font-mono font-bold text-foreground/40 uppercase tracking-[0.4em]">SYS_STABLE // ENGINE_V4.2.0</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-3">
                        <BarChart3 className="w-4 h-4 text-foreground/20" />
                        <span className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.3em] italic">LATENCY: 0.82MS // PROVISIONED</span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.6em] italic animate-pulse">PREMIUM_SESSION_ENCRYPTED</span>
                </div>
            </footer>
        </div>
    );
}
