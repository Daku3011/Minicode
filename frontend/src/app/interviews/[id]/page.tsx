"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { interviewApi } from "@/lib/interview-api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Clock, Calendar, Users, Play, CheckCircle, ChevronRight, ArrowLeft } from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";

interface Session {
    id: number;
    candidate_id: number;
    status: string;
    start_time: string | null;
    end_time: string | null;
    score: number | null;
    evaluation: Record<string, unknown> | null;
}

interface InterviewDetail {
    id: number;
    creator_id: number;
    candidate_emails: string[];
    problems_json: number[];
    duration_minutes: number;
    scheduled_at: string | null;
    status: string;
    feedback: string | null;
    created_at: string;
    sessions: Session[];
}

const STATUS_STYLES: Record<string, string> = {
    scheduled: "text-blue-700 bg-blue-50 border-blue-200",
    in_progress: "text-amber-700 bg-amber-50 border-amber-200",
    completed: "text-emerald-700 bg-emerald-50 border-emerald-200",
    evaluated: "text-violet-700 bg-violet-50 border-violet-200",
    pending: "text-slate-600 bg-slate-50 border-slate-200",
};

export default function InterviewDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [interview, setInterview] = useState<InterviewDetail | null>(null);
    const [loading, setLoading] = useState(true);

    const interviewId = Number(params.id);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await interviewApi.get(interviewId);
                setInterview(res.data);
            } catch (e) {
                console.error("Failed to load interview", e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [interviewId]);

    const handleCreateSession = async () => {
        if (!user) return;
        try {
            const res = await interviewApi.createSession(interviewId, user.id);
            router.push(`/interviews/session/${res.data.session_id}`);
        } catch (e) {
            console.error("Failed to create session", e);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <LoadingSpinner />
            </div>
        );
    }

    if (!interview) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
                Interview not found.
            </div>
        );
    }

    const hasActiveSession = interview.sessions.some(
        (s) => s.status === "pending" || s.status === "in_progress"
    );

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
                onClick={() => router.push("/interviews")}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Interviews
            </button>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Interview #{interview.id}</h1>
                        <span className={clsx(
                            "text-xs font-semibold px-2.5 py-1 rounded-full border inline-block mt-2",
                            STATUS_STYLES[interview.status]
                        )}>
                            {interview.status.replace("_", " ")}
                        </span>
                    </div>
                    {!hasActiveSession && (
                        <button
                            onClick={handleCreateSession}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            <Play className="w-4 h-4" />
                            Start Session
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap gap-6 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4" />
                        {interview.duration_minutes} minutes
                    </div>
                    {interview.scheduled_at && (
                        <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="w-4 h-4" />
                            {new Date(interview.scheduled_at).toLocaleString()}
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-600">
                        <Users className="w-4 h-4" />
                        {interview.candidate_emails.length} candidate{interview.candidate_emails.length !== 1 ? "s" : ""}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                        <CheckCircle className="w-4 h-4" />
                        {interview.problems_json.length} problem{interview.problems_json.length !== 1 ? "s" : ""}
                    </div>
                </div>

                {interview.candidate_emails.length > 0 && (
                    <div className="mt-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Candidates</p>
                        <div className="flex flex-wrap gap-2">
                            {interview.candidate_emails.map((email) => (
                                <span key={email} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                                    {email}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Sessions</h2>
                {interview.sessions.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-8">No sessions yet. Click "Start Session" to begin.</p>
                ) : (
                    <div className="space-y-3">
                        {interview.sessions.map((s) => (
                            <Link
                                key={s.id}
                                href={`/interviews/session/${s.id}`}
                                className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <span className={clsx(
                                        "text-xs font-semibold px-2.5 py-1 rounded-full border",
                                        STATUS_STYLES[s.status]
                                    )}>
                                        {s.status.replace("_", " ")}
                                    </span>
                                    <div className="text-sm text-slate-600">
                                        {s.start_time && (
                                            <span>Started {new Date(s.start_time).toLocaleString()}</span>
                                        )}
                                        {!s.start_time && <span>Not started</span>}
                                    </div>
                                    {s.score != null && (
                                        <span className="text-sm font-semibold text-slate-800">{s.score}/100</span>
                                    )}
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300" />
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {interview.feedback && (
                <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-3">Feedback</h2>
                    <div className="prose prose-sm max-w-none text-slate-700">
                        {interview.feedback}
                    </div>
                </div>
            )}
        </div>
    );
}
