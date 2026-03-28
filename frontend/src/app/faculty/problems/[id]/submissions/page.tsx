"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    ChevronLeft, 
    Loader2, 
    ExternalLink, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    User as UserIcon,
    Search,
    Filter
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { clsx } from "clsx";

interface Submission {
    id: number;
    student_id: number;
    student_name: string;
    student_username: string;
    status: string;
    score: number;
    timestamp: string;
    repo_url: string;
}

export default function ProblemSubmissionsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [problemTitle, setProblemTitle] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subsRes, probRes] = await Promise.all([
                    api.get(`/submissions/faculty/${id}`),
                    api.get(`/problems/${id}`)
                ]);
                setSubmissions(subsRes.data);
                setProblemTitle(probRes.data.title);
            } catch (error) {
                console.error("Failed to fetch submissions", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const filteredSubmissions = submissions.filter(s => 
        s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.student_username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statusBadge = (status: string) => {
        switch (status) {
            case "accepted":
                return <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Accepted</span>;
            case "wrong_answer":
                return <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1"><XCircle className="w-3 h-3" /> Wrong Answer</span>;
            case "pending":
                return <span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
            default:
                return <span className="bg-slate-500/10 text-slate-500 px-2 py-1 rounded-full text-[10px] font-bold uppercase">{status}</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-[#0f0a1e]">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <main className="min-h-screen level-0 text-foreground pb-24 relative overflow-hidden">
            {/* Infrastructure Glow */}
            <div className="fixed top-[-10%] right-[-5%] w-[50%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="max-w-6xl mx-auto px-4 py-20 relative z-10">
                {/* Tactical Header */}
                <div className="space-y-12 mb-24 animate-in fade-in slide-in-from-top-8 duration-1000">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                        <div className="space-y-6">
                            <button 
                                onClick={() => router.back()}
                                className="group flex items-center gap-3 text-[10px] font-mono font-bold text-foreground/20 hover:text-primary transition-all uppercase tracking-[0.4em]"
                            >
                                <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> 
                                RETURN_TO_COMMAND
                            </button>
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tightest italic uppercase">
                                Archive_<span className="text-primary italic">{problemTitle || "NODE_DATA"}</span>
                            </h1>
                            <div className="flex items-center gap-4">
                                <div className="w-2.5 h-2.5 rounded-full bg-primary light-emission shadow-atmospheric" />
                                <p className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.5em] italic">
                                    {submissions.length}_ENTRIES_RECOVERED // HIERARCHY_OVERVIEW
                                </p>
                            </div>
                        </div>

                        <div className="relative w-full md:w-80 group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 group-focus-within:text-primary transition-colors" />
                            <input 
                                type="text" 
                                placeholder="SEARCH_OPERATIVE..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full level-1 rounded-2xl py-4 pl-14 pr-6 text-xs font-mono font-bold tracking-widest focus:outline-none focus:bg-primary/[0.02] focus:ring-1 focus:ring-primary/20 transition-all shadow-atmospheric"
                            />
                        </div>
                    </div>
                </div>

                {/* Submissions Grid: The High-Density Stream */}
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                    {filteredSubmissions.length > 0 ? filteredSubmissions.map((sub) => (
                        <div key={sub.id} className="group level-1 rounded-[2.5rem] p-8 pr-12 flex items-center justify-between hover:bg-primary/[0.02] transition-all shadow-atmospheric no-border-separation hover:scale-[1.01]">
                            <div className="flex items-center gap-10">
                                <div className="w-16 text-center">
                                    <span className="text-2xl font-mono font-bold italic text-foreground/10 group-hover:text-primary/20 transition-colors uppercase tracking-tightest">
                                        #{sub.id.toString().padStart(3, '0')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl glass border border-foreground/10 flex items-center justify-center text-[10px] font-mono font-bold text-primary overflow-hidden shadow-glass group-hover:border-primary/30 transition-colors">
                                        <UserIcon className="w-6 h-6 p-1 opacity-40" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-xl font-bold italic text-white group-hover:text-primary transition-colors uppercase tracking-tightest">
                                            {sub.student_name}
                                        </h4>
                                        <p className="text-[8px] font-mono font-bold text-foreground/20 uppercase tracking-[0.3em]">NODE_ID: {sub.student_username}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-16">
                                <div className="hidden lg:flex flex-col items-end gap-1">
                                    <span className="text-[8px] font-mono font-bold text-foreground/20 uppercase tracking-widest">TRANSMISSION_STAMP</span>
                                    <span className="text-[10px] font-mono font-bold text-foreground/40 uppercase tracking-widest">{new Date(sub.timestamp).toLocaleDateString()}</span>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="text-right space-y-2">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className={clsx(
                                                "text-2xl font-mono font-bold italic tabular-nums group-hover:scale-110 transition-transform",
                                                sub.score >= 80 ? "text-emerald-500 light-emission" : 
                                                sub.score >= 50 ? "text-amber-500" : "text-rose-500"
                                            )}>
                                                {sub.score}
                                            </span>
                                            <span className="text-[10px] font-mono font-bold text-foreground/20 italic">/100</span>
                                        </div>
                                        <div className="flex items-center justify-end">
                                            {sub.status === "accepted" ? (
                                                <div className="px-4 py-1 rounded-full level-2 text-[8px] font-mono font-bold text-emerald-500 uppercase tracking-[0.3em] italic shadow-glass light-emission">ACCEPTED</div>
                                            ) : sub.status === "wrong_answer" ? (
                                                <div className="px-4 py-1 rounded-full level-2 text-[8px] font-mono font-bold text-rose-500 uppercase tracking-[0.3em] italic shadow-glass">FAILED</div>
                                            ) : (
                                                <div className="px-4 py-1 rounded-full level-2 text-[8px] font-mono font-bold text-amber-500 uppercase tracking-[0.3em] italic shadow-glass animate-pulse">PENDING</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="w-px h-12 bg-white/5" />

                                    <a 
                                        href={sub.repo_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="w-14 h-14 rounded-2xl level-2 flex items-center justify-center text-foreground/20 hover:text-primary hover:bg-primary/5 transition-all shadow-atmospheric group/btn"
                                    >
                                        <ExternalLink className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="level-1 rounded-[3rem] p-32 text-center space-y-8 shadow-atmospheric no-border-separation">
                            <div className="w-20 h-20 rounded-[2rem] level-2 mx-auto flex items-center justify-center">
                                <Search className="w-8 h-8 text-foreground/10" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-2xl font-bold tracking-tightest italic uppercase text-foreground/20">Zero_Matches</h4>
                                <p className="text-[10px] font-mono font-bold text-foreground/10 uppercase tracking-[0.4em]">No operative data found for this specific query.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
