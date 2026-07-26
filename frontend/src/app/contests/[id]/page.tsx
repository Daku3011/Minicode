"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Trophy,
    Clock,
    Users,
    Calendar,
    UserPlus,
    Loader2,
    Check,
    Play,
    X,
} from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import ContestTimer from "@/components/ContestTimer";

interface ContestDetail {
    id: number;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    registration_deadline: string | null;
    duration_minutes: number;
    problems_json: string | null;
    rules: string | null;
    scoring_type: string;
    status: string;
    author_name: string;
    participant_count: number;
    is_registered: boolean;
    user_started: string | null;
}

interface StandingsEntry {
    rank: number;
    user_id: number;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    score: number;
    started_at: string | null;
    finished_at: string | null;
    submissions: {
        problem_index: string;
        score: number;
        time_taken_seconds: number | null;
        submitted_at: string;
    }[];
}

export default function ContestDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [contest, setContest] = useState<ContestDetail | null>(null);
    const [standings, setStandings] = useState<StandingsEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [starting, setStarting] = useState(false);
    const [activeTab, setActiveTab] = useState<"details" | "standings">("details");

    useEffect(() => {
        if (params.id) {
            fetchContest();
            fetchStandings();
        }
    }, [params.id]);

    const fetchContest = async () => {
        try {
            const res = await api.get(`/contests/${params.id}`);
            setContest(res.data);
        } catch {
            router.push("/contests");
        } finally {
            setLoading(false);
        }
    };

    const fetchStandings = async () => {
        try {
            const res = await api.get(`/contests/${params.id}/standings`);
            setStandings(res.data);
        } catch {
            // standings may not be available yet
        }
    };

    const handleRegister = async () => {
        if (!contest) return;
        setRegistering(true);
        try {
            await api.post(`/contests/${contest.id}/register`);
            fetchContest();
        } catch (err: any) {
            alert(err.response?.data?.detail || "Registration failed");
        } finally {
            setRegistering(false);
        }
    };

    const handleStart = async () => {
        if (!contest) return;
        setStarting(true);
        try {
            await api.post(`/contests/${contest.id}/start`);
            router.push(`/contests/${contest.id}/arena`);
        } catch (err: any) {
            alert(err.response?.data?.detail || "Failed to start");
        } finally {
            setStarting(false);
        }
    };

    const problemCount = contest?.problems_json
        ? JSON.parse(contest.problems_json).length
        : 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    if (!contest) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <p className="text-slate-500 font-bold uppercase tracking-widest">Contest not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-5xl mx-auto px-4 py-8">
                <Link
                    href="/contests"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold uppercase tracking-widest text-xs transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Contests
                </Link>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 mb-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <span
                                    className={clsx(
                                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                        contest.status === "active"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            : contest.status === "upcoming"
                                              ? "bg-amber-50 text-amber-700 border-amber-200"
                                              : contest.status === "completed"
                                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                                : "bg-slate-100 text-slate-600 border-slate-200"
                                    )}
                                >
                                    {contest.status}
                                </span>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    {contest.scoring_type} scoring
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-none">
                                {contest.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 uppercase tracking-widest font-black">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-primary" />
                                    <span>{contest.participant_count} participants</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span>{new Date(contest.start_time).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-primary" />
                                    <span>{contest.duration_minutes} min</span>
                                </div>
                                {problemCount > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Trophy className="w-4 h-4 text-primary" />
                                        <span>{problemCount} problems</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 items-center">
                            <ContestTimer
                                startTime={contest.start_time}
                                endTime={contest.end_time}
                            />

                            {contest.status === "active" && (
                                <>
                                    {contest.is_registered ? (
                                        contest.user_started ? (
                                            <button
                                                onClick={() => router.push(`/contests/${contest.id}/arena`)}
                                                className="w-full px-6 py-3 rounded-xl bg-primary text-white font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm hover:bg-violet-700"
                                            >
                                                <Play className="w-4 h-4" />
                                                Enter Arena
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleStart}
                                                disabled={starting}
                                                className="w-full px-6 py-3 rounded-xl bg-primary text-white font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm hover:bg-violet-700 disabled:opacity-50"
                                            >
                                                {starting ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Play className="w-4 h-4" />
                                                )}
                                                Start Attempt
                                            </button>
                                        )
                                    ) : (
                                        <button
                                            onClick={handleRegister}
                                            disabled={registering}
                                            className="w-full px-6 py-3 rounded-xl bg-primary text-white font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm hover:bg-violet-700 disabled:opacity-50"
                                        >
                                            {registering ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <UserPlus className="w-4 h-4" />
                                            )}
                                            Register
                                        </button>
                                    )}
                                </>
                            )}

                            {contest.status === "completed" && (
                                <div className="px-4 py-3 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-bold text-sm flex items-center gap-2">
                                    <Check className="w-4 h-4" />
                                    Contest Ended
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 mb-6">
                    {["details", "standings"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={clsx(
                                "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm border",
                                activeTab === tab
                                    ? "bg-primary text-white border-primary"
                                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            )}
                        >
                            {tab === "details" ? "Details" : `Standings (${standings.length})`}
                        </button>
                    ))}
                </div>

                {activeTab === "details" && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {contest.description}
                        </p>

                        {contest.rules && (
                            <>
                                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 mt-8 mb-4">
                                    Rules
                                </h3>
                                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {contest.rules}
                                </p>
                            </>
                        )}

                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs uppercase tracking-widest font-bold text-slate-500">
                                    Start Time
                                </p>
                                <p className="text-slate-900 font-black">
                                    {new Date(contest.start_time).toLocaleString()}
                                </p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs uppercase tracking-widest font-bold text-slate-500">
                                    End Time
                                </p>
                                <p className="text-slate-900 font-black">
                                    {new Date(contest.end_time).toLocaleString()}
                                </p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs uppercase tracking-widest font-bold text-slate-500">
                                    Duration
                                </p>
                                <p className="text-slate-900 font-black">
                                    {contest.duration_minutes} minutes
                                </p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs uppercase tracking-widest font-bold text-slate-500">
                                    Scoring
                                </p>
                                <p className="text-slate-900 font-black capitalize">
                                    {contest.scoring_type}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "standings" && (
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                        {standings.length === 0 ? (
                            <div className="p-8 text-center">
                                <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                                    No submissions yet
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {standings.map((entry) => (
                                    <div
                                        key={entry.user_id}
                                        className={clsx(
                                            "p-4 flex items-center gap-4",
                                            entry.rank === 1 && "bg-amber-50",
                                            entry.rank === 2 && "bg-slate-50",
                                            entry.rank === 3 && "bg-orange-50"
                                        )}
                                    >
                                        <span
                                            className={clsx(
                                                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                                                entry.rank === 1 && "bg-amber-500/20 text-amber-600",
                                                entry.rank === 2 && "bg-slate-400/20 text-slate-500",
                                                entry.rank === 3 && "bg-orange-500/20 text-orange-600",
                                                entry.rank > 3 && "bg-slate-100 text-slate-500"
                                            )}
                                        >
                                            {entry.rank}
                                        </span>
                                        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold overflow-hidden">
                                            {entry.avatar_url ? (
                                                <img
                                                    src={entry.avatar_url}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                entry.username.slice(0, 2).toUpperCase()
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-slate-900 font-black tracking-tight">
                                                {entry.full_name || entry.username}
                                            </p>
                                            <p className="text-xs text-slate-500 font-bold tracking-wide">
                                                @{entry.username} · {entry.submissions.length} submissions
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-slate-900">
                                                {entry.score}{" "}
                                                <span className="text-xs text-slate-500 font-bold uppercase">
                                                    pts
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
