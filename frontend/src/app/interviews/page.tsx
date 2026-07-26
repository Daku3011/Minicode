"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { interviewApi } from "@/lib/interview-api";
import LoadingSpinner from "@/components/LoadingSpinner";
import Link from "next/link";
import { Plus, Clock, Calendar, Users, ChevronRight } from "lucide-react";
import { clsx } from "clsx";

interface Interview {
    id: number;
    candidate_emails: string[];
    duration_minutes: number;
    scheduled_at: string | null;
    status: string;
    feedback: string | null;
    created_at: string;
    sessions: {
        id: number;
        candidate_id: number;
        status: string;
        start_time: string | null;
        score: number | null;
    }[];
}

const STATUS_STYLES: Record<string, string> = {
    scheduled: "text-blue-700 bg-blue-50 border-blue-200",
    in_progress: "text-amber-700 bg-amber-50 border-amber-200",
    completed: "text-emerald-700 bg-emerald-50 border-emerald-200",
    evaluated: "text-violet-700 bg-violet-50 border-violet-200",
};

export default function InterviewsPage() {
    const { user } = useAuth();
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await interviewApi.list();
                setInterviews(res.data);
            } catch (e) {
                console.error("Failed to load interviews", e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <LoadingSpinner />
                <p className="mt-4 text-slate-400">Loading interviews...</p>
            </div>
        );
    }

    const isFaculty = user?.role === "faculty" || user?.role === "admin";

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Interviews</h1>
                    <p className="text-slate-500 mt-1">Manage coding interviews and assessments.</p>
                </div>
                {isFaculty && (
                    <Link
                        href="/interviews/create"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New Interview
                    </Link>
                )}
            </div>

            {interviews.length === 0 ? (
                <div className="text-center py-16">
                    <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700">No interviews yet</h3>
                    <p className="text-slate-400 text-sm mt-1">
                        {isFaculty ? "Create your first interview to get started." : "No interviews assigned to you."}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {interviews.map((iv) => (
                        <Link
                            key={iv.id}
                            href={`/interviews/${iv.id}`}
                            className="block bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-5"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={clsx(
                                            "text-xs font-semibold px-2.5 py-1 rounded-full border",
                                            STATUS_STYLES[iv.status] || "text-slate-600 bg-slate-50 border-slate-200"
                                        )}>
                                            {iv.status.replace("_", " ")}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-slate-500">
                                            <Clock className="w-3 h-3" />
                                            {iv.duration_minutes} min
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-slate-500">
                                            <Users className="w-3 h-3" />
                                            {iv.candidate_emails.length} candidates
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        {iv.scheduled_at && (
                                            <span className="flex items-center gap-1 text-slate-600">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(iv.scheduled_at).toLocaleDateString("en-US", {
                                                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                                                })}
                                            </span>
                                        )}
                                        <span className="text-slate-400">
                                            Created {new Date(iv.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300 ml-4 flex-shrink-0" />
                            </div>

                            {iv.sessions.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-50">
                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                        <span>{iv.sessions.length} session{iv.sessions.length !== 1 ? "s" : ""}</span>
                                        {iv.sessions.some((s) => s.score != null) && (
                                            <span>
                                                Avg score: {Math.round(
                                                    iv.sessions.filter((s) => s.score != null).reduce((a, s) => a + (s.score || 0), 0) /
                                                    iv.sessions.filter((s) => s.score != null).length
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
