"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { interviewApi } from "@/lib/interview-api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Clock, Play, StopCircle, Code2, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { clsx } from "clsx";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(
    () => import("@monaco-editor/react"),
    { ssr: false, loading: () => <div className="h-full flex items-center justify-center text-slate-400">Loading editor...</div> }
);

interface SessionData {
    id: number;
    interview_id: number;
    candidate_id: number;
    start_time: string | null;
    end_time: string | null;
    status: string;
    score: number | null;
    code_snapshots: Record<string, string>;
    recording: { problem_index: number; code: string; timestamp: string }[];
    evaluation: Record<string, unknown> | null;
    duration_minutes: number;
    problems: number[];
}

export default function InterviewSessionPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [sessionData, setSessionData] = useState<SessionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
    const [code, setCode] = useState("");
    const [sessionStarted, setSessionStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [ending, setEnding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const sessionId = Number(params.sessionId);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await interviewApi.getSession(sessionId);
                setSessionData(res.data);
                if (res.data.status === "in_progress") {
                    setSessionStarted(true);
                    const start = new Date(res.data.start_time).getTime();
                    const end = new Date(res.data.end_time).getTime();
                    setTimeLeft(Math.max(0, Math.floor((end - Date.now()) / 1000)));
                }
                const snapshots = res.data.code_snapshots || {};
                if (snapshots["0"]) {
                    setCode(snapshots["0"]);
                }
            } catch (e) {
                console.error("Failed to load session", e);
                setError("Failed to load session data.");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [sessionId]);

    useEffect(() => {
        if (sessionStarted && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        if (timerRef.current) clearInterval(timerRef.current);
                        handleEndSession();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [sessionStarted]);

    useEffect(() => {
        if (sessionData?.code_snapshots && sessionData.code_snapshots[String(currentProblemIndex)]) {
            setCode(sessionData.code_snapshots[String(currentProblemIndex)]);
        } else {
            setCode("");
        }
    }, [currentProblemIndex, sessionData?.code_snapshots]);

    const handleStartSession = async () => {
        try {
            const res = await interviewApi.startSession(sessionId);
            setSessionStarted(true);
            setTimeLeft(res.data.duration_minutes * 60);
            setSessionData((prev) =>
                prev ? { ...prev, status: "in_progress", start_time: res.data.start_time, end_time: res.data.end_time } : prev
            );
        } catch (e) {
            console.error("Failed to start session", e);
            setError("Failed to start session.");
        }
    };

    const handleEndSession = async () => {
        if (ending) return;
        setEnding(true);
        try {
            await interviewApi.endSession(sessionId);
            router.push(`/interviews/${sessionData?.interview_id}`);
        } catch (e) {
            console.error("Failed to end session", e);
            setEnding(false);
        }
    };

    const handleCodeChange = useCallback(
        async (value: string | undefined) => {
            const newCode = value || "";
            setCode(newCode);
            if (sessionStarted) {
                try {
                    await interviewApi.submitCode(sessionId, currentProblemIndex, newCode);
                } catch (e) {
                    console.error("Failed to save code", e);
                }
            }
        },
        [sessionStarted, sessionId, currentProblemIndex]
    );

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !sessionData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-slate-400">
                <AlertTriangle className="w-8 h-8 mb-2" />
                <p>{error || "Session not found."}</p>
                <button onClick={() => router.back()} className="mt-4 text-blue-600 hover:underline text-sm">
                    Go back
                </button>
            </div>
        );
    }

    const totalProblems = sessionData.problems.length;

    return (
        <div className="h-screen flex flex-col bg-slate-50">
            <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push(`/interviews/${sessionData.interview_id}`)}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-slate-800">Interview Session</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        {totalProblems > 1 &&
                            Array.from({ length: totalProblems }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentProblemIndex(i)}
                                    className={clsx(
                                        "w-8 h-8 rounded-lg text-xs font-medium transition-colors",
                                        i === currentProblemIndex
                                            ? "bg-blue-600 text-white"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    )}
                                >
                                    {i + 1}
                                </button>
                            ))}
                    </div>

                    <div className={clsx(
                        "flex items-center gap-2 px-4 py-1.5 rounded-lg font-mono text-sm font-bold",
                        sessionStarted
                            ? timeLeft < 300
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-slate-50 text-slate-700 border border-slate-200"
                            : "bg-slate-50 text-slate-400 border border-slate-200"
                    )}>
                        <Clock className="w-4 h-4" />
                        {sessionStarted ? formatTime(timeLeft) : "--:--"}
                    </div>

                    {!sessionStarted ? (
                        <button
                            onClick={handleStartSession}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
                        >
                            <Play className="w-4 h-4" />
                            Start
                        </button>
                    ) : (
                        <button
                            onClick={handleEndSession}
                            disabled={ending}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition-colors disabled:opacity-50"
                        >
                            <StopCircle className="w-4 h-4" />
                            {ending ? "Ending..." : "End"}
                        </button>
                    )}
                </div>
            </header>

            <div className="flex-1 flex">
                <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between px-6 py-2 bg-white border-b border-slate-100">
                        <span className="text-sm font-medium text-slate-700">
                            Problem {currentProblemIndex + 1}{totalProblems > 1 ? ` of ${totalProblems}` : ""}
                        </span>
                    </div>
                    <div className="flex-1">
                        <MonacoEditor
                            height="100%"
                            defaultLanguage="python"
                            theme="vs-light"
                            value={code}
                            onChange={handleCodeChange}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineNumbers: "on",
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                tabSize: 4,
                            }}
                        />
                    </div>
                </div>

                {totalProblems > 1 && (
                    <div className="w-12 flex flex-col items-center justify-center bg-white border-l border-slate-200 gap-2">
                        <button
                            onClick={() => setCurrentProblemIndex((p) => Math.max(0, p - 1))}
                            disabled={currentProblemIndex === 0}
                            className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-xs font-medium text-slate-500">
                            {currentProblemIndex + 1}/{totalProblems}
                        </span>
                        <button
                            onClick={() => setCurrentProblemIndex((p) => Math.min(totalProblems - 1, p + 1))}
                            disabled={currentProblemIndex === totalProblems - 1}
                            className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
