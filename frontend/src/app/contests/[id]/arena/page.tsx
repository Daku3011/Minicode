"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Trophy,
    Clock,
    Users,
    ArrowLeft,
    Loader2,
    Play,
    Send,
    Check,
    X,
} from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import ContestTimer from "@/components/ContestTimer";
import { useIsMobile } from "@/hooks/useIsMobile";
import MobileSubmitNotice from "@/components/MobileSubmitNotice";

interface ContestArena {
    id: number;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    problems_json: string | null;
    status: string;
    is_registered: boolean;
    user_started: string | null;
}

interface StandingsEntry {
    rank: number;
    user_id: number;
    username: string;
    score: number;
    submissions: { problem_index: string; score: number }[];
}

export default function ContestArenaPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [contest, setContest] = useState<ContestArena | null>(null);
    const [standings, setStandings] = useState<StandingsEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"problems" | "standings">("problems");
    const [code, setCode] = useState("");
    const [selectedProblem, setSelectedProblem] = useState("A");
    const [submitting, setSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<any>(null);
    const [timeUp, setTimeUp] = useState(false);

    const contestId = Number(params.id);
    const isMobile = useIsMobile();
    const problemLabels = contest?.problems_json
        ? JSON.parse(contest.problems_json).map((_: any, i: number) =>
              String.fromCharCode(65 + i)
          )
        : ["A", "B", "C", "D"];

    useEffect(() => {
        if (params.id) {
            fetchArena();
        }
    }, [params.id]);

    const fetchArena = async () => {
        try {
            const res = await api.get(`/contests/${contestId}`);
            const c = res.data;

            if (!c.is_registered) {
                router.push(`/contests/${contestId}`);
                return;
            }

            if (c.status !== "active") {
                router.push(`/contests/${contestId}`);
                return;
            }

            if (!c.user_started) {
                await api.post(`/contests/${contestId}/start`);
                c.user_started = new Date().toISOString();
            }

            setContest(c);
            fetchStandings();
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to load arena");
            router.push("/contests");
        } finally {
            setLoading(false);
        }
    };

    const fetchStandings = async () => {
        try {
            const res = await api.get(`/contests/${contestId}/standings`);
            setStandings(res.data);
        } catch {
            // ignore
        }
    };

    const handleSubmit = async () => {
        if (!code.trim()) return;
        setSubmitting(true);
        setSubmitResult(null);
        try {
            const result = await api.post(`/contests/${contestId}/submit`, {
                problem_index: selectedProblem,
                code: code,
                language: "python",
            });
            setSubmitResult({ success: true, data: result.data });
            fetchStandings();
        } catch (err: any) {
            setSubmitResult({
                success: false,
                error: err.response?.data?.detail || "Submission failed",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleTimeEnd = useCallback(() => {
        setTimeUp(true);
        alert("Time is up! Your contest has ended.");
        router.push(`/contests/${contestId}`);
    }, [contestId, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
        );
    }

    if (error || !contest) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <p className="text-red-400 font-bold uppercase tracking-widest">
                    {error || "Failed to load arena"}
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col">
            {/* Top Bar */}
            <header className="bg-slate-800 border-b border-slate-700 px-4 md:px-8 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push(`/contests/${contestId}`)}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-black tracking-tight hidden md:block">
                        {contest.title}
                    </h1>
                </div>

                <ContestTimer
                    startTime={contest.start_time}
                    endTime={contest.end_time}
                    onEnd={handleTimeEnd}
                />

                <div className="flex items-center gap-4">
                    <button
                        onClick={fetchStandings}
                        className="text-sm text-slate-400 hover:text-white font-medium flex items-center gap-1.5 transition-colors"
                    >
                        <Users className="w-4 h-4" />
                        <span className="hidden sm:inline">Standings</span>
                    </button>
                    <div className="text-sm text-slate-400 font-medium">
                        {user?.username}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Problem Sidebar */}
                <aside className="bg-slate-800 border-r border-slate-700 w-full md:w-64 shrink-0">
                    <div className="p-4 border-b border-slate-700">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                            Problems
                        </h2>
                        <div className="space-y-2">
                            {problemLabels.map((label: string) => {
                                const myEntry = standings.find(
                                    (s) => s.user_id === user?.id
                                );
                                const solved = myEntry?.submissions.find(
                                    (s) => s.problem_index === label && s.score > 0
                                );
                                return (
                                    <button
                                        key={label}
                                        onClick={() => {
                                            setSelectedProblem(label);
                                            setSubmitResult(null);
                                        }}
                                        className={clsx(
                                            "w-full px-4 py-3 rounded-lg text-left font-bold transition-all flex items-center justify-between",
                                            selectedProblem === label
                                                ? "bg-violet-600 text-white"
                                                : solved
                                                  ? "bg-emerald-900/50 text-emerald-400"
                                                  : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                                        )}
                                    >
                                        <span>
                                            Problem {label}
                                        </span>
                                        {solved ? (
                                            <Check className="w-4 h-4 text-emerald-400" />
                                        ) : (
                                            <Play className="w-3.5 h-3.5 text-slate-500" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Mini Standings */}
                    <div className="p-4">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                            Leaderboard
                        </h2>
                        <div className="space-y-2">
                            {standings.slice(0, 5).map((entry) => (
                                <div
                                    key={entry.user_id}
                                    className={clsx(
                                        "flex items-center justify-between text-sm",
                                        entry.user_id === user?.id
                                            ? "text-violet-400 font-bold"
                                            : "text-slate-400"
                                    )}
                                >
                                    <span>
                                        #{entry.rank} {entry.username}
                                    </span>
                                    <span className="font-mono">{entry.score}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Editor Area */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Problem Tabs */}
                    <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center gap-4 shrink-0">
                        <span className="text-sm font-bold text-violet-400">
                            Problem {selectedProblem}
                        </span>
                        <span className="text-xs text-slate-500">|</span>
                        <span className="text-xs text-slate-400">
                            Python (pre-filled)
                        </span>
                    </div>

                    {/* Code Editor — submissions are desktop-only */}
                    <div className="flex-1 p-4 overflow-auto">
                        {isMobile ? (
                            <div className="h-full flex items-center justify-center">
                                <MobileSubmitNotice
                                    title="Contest submission available on desktop"
                                    description="Open MiniCode on a desktop browser to write and submit contest solutions."
                                />
                            </div>
                        ) : (
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full h-full bg-slate-950 text-green-400 font-mono text-sm p-4 rounded-lg border border-slate-700 focus:outline-none focus:border-violet-500 resize-none"
                                placeholder={`# Write your solution for Problem ${selectedProblem} here\n\ndef solve():\n    pass\n`}
                                spellCheck={false}
                            />
                        )}
                    </div>

                    {/* Bottom Bar */}
                    {!isMobile && (
                        <div className="bg-slate-800 border-t border-slate-700 px-4 py-3 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            {submitResult && (
                                <div
                                    className={clsx(
                                        "flex items-center gap-2 text-sm font-medium",
                                        submitResult.success
                                            ? "text-emerald-400"
                                            : "text-red-400"
                                    )}
                                >
                                    {submitResult.success ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Submitted (ID: {submitResult.data.submission_id})
                                        </>
                                    ) : (
                                        <>
                                            <X className="w-4 h-4" />
                                            {submitResult.error}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={submitting || !code.trim() || timeUp}
                            className="px-6 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-sm flex items-center gap-2 transition-all"
                        >
                            {submitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            Submit
                        </button>
                    </div>
                    )}
                </main>
            </div>
        </div>
    );
}
