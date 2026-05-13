"use client";

import { useEffect, useState, useRef, use } from "react";
import Link from "next/link";
import {
    Shield, Brain, Code, BarChart3, Rocket, Swords, Sparkles,
    ArrowLeft, CheckCircle2, Circle, Lock, Trophy, Zap, Crown, Play,
    Loader2, Star, Upload, FileText, Send, Bot, User, X, MessageSquare,
    ExternalLink, Cloud, Smartphone, Layers, Server, GitBranch, Globe, Cpu,
} from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";

const iconMap: Record<string, React.ElementType> = {
    shield: Shield,
    brain: Brain,
    code: Code,
    chart: BarChart3,
    rocket: Rocket,
    swords: Swords,
    sparkles: Sparkles,
    cloud: Cloud,
    smartphone: Smartphone,
    layers: Layers,
    server: Server,
    "git-branch": GitBranch,
    globe: Globe,
    cpu: Cpu,
};

interface Milestone {
    id: number;
    title: string;
    description: string;
    order: number;
    xp_reward: number;
    content: string | null;
    hints: string | null;
    resources: { title: string; url: string; description: string }[];
    status: "locked" | "in_progress" | "completed" | "rewarded";
    completed_at: string | null;
    rewarded_at: string | null;
}

interface StreamData {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon: string;
    color: string;
    milestones: Milestone[];
}

interface ChatMessage {
    sender: "user" | "ai";
    text: string;
}

interface SubmitResult {
    status: string;
    score: number;
    xp_awarded: number;
    feedback: string;
    tips: string[];
}

export default function StreamDetailPage({ params }: { params: Promise<{ streamId: string }> }) {
    const { streamId } = use(params);
    const { user } = useAuth();
    const [stream, setStream] = useState<StreamData | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [expandedMilestone, setExpandedMilestone] = useState<number | null>(null);

    // Upload modal state
    const [uploadModal, setUploadModal] = useState<{ milestone: Milestone } | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);

    // Dynamic learning materials
    const [dynamicMaterials, setDynamicMaterials] = useState<Record<number, { hints: string; resources: { title: string; url: string; description: string }[] }>>({});
    const [generatingMaterials, setGeneratingMaterials] = useState<Set<number>>(new Set());

    // Chatbot state
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { sender: "ai", text: `Hi! I'm your stream assistant. Ask me anything about this learning path!` }
    ]);
    const [chatInput, setChatInput] = useState("");
    const [sendingChat, setSendingChat] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Resizable chatbot
    const [dimensions, setDimensions] = useState({ width: 400, height: 520 });
    const [isResizing, setIsResizing] = useState<"top" | "left" | "top-left" | null>(null);
    const resizerRef = useRef({ startX: 0, startY: 0, startWidth: 0, startHeight: 0 });

    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            const { startX, startY, startWidth, startHeight } = resizerRef.current;
            let newWidth = startWidth;
            let newHeight = startHeight;

            if (isResizing === "top" || isResizing === "top-left") {
                const deltaY = startY - e.clientY;
                newHeight = Math.max(400, Math.min(window.innerHeight * 0.9, startHeight + deltaY));
            }

            if (isResizing === "left" || isResizing === "top-left") {
                const deltaX = startX - e.clientX;
                newWidth = Math.max(320, Math.min(window.innerWidth * 0.9, startWidth + deltaX));
            }

            setDimensions({ width: newWidth, height: newHeight });
        };

        const handleMouseUp = () => setIsResizing(null);

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isResizing]);

    useEffect(() => {
        fetchStream();
    }, [streamId]);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatMessages]);

    const fetchStream = async () => {
        try {
            const response = await api.get(`/roadmap/streams/${streamId}`);
            setStream(response.data);
        } catch (error) {
            console.error("Failed to fetch stream:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadLearningMaterials = async (milestoneId: number) => {
        if (dynamicMaterials[milestoneId]) return;
        setGeneratingMaterials(prev => new Set(prev).add(milestoneId));
        try {
            const response = await api.post(`/roadmap/milestones/${milestoneId}/learning-materials`, {});
            setDynamicMaterials(prev => ({ ...prev, [milestoneId]: response.data }));
        } catch (error) {
            console.error("Failed to load learning materials:", error);
        } finally {
            setGeneratingMaterials(prev => {
                const next = new Set(prev);
                next.delete(milestoneId);
                return next;
            });
        }
    };

    const startMilestone = async (milestoneId: number) => {
        if (!user) return;
        setActionLoading(milestoneId);
        try {
            await api.post(`/roadmap/milestones/${milestoneId}/start`);
            await fetchStream();
        } catch (error) {
            console.error("Failed to start milestone:", error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles(files);
        setSubmitResult(null);
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmitFile = async () => {
        if (!uploadModal || selectedFiles.length === 0) return;
        setUploading(true);
        setSubmitResult(null);

        try {
            const formData = new FormData();
            selectedFiles.forEach(f => formData.append("files", f));
            const response = await api.post(
                `/roadmap/milestones/${uploadModal.milestone.id}/submit`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            setSubmitResult(response.data);
            if (response.data.status === "rewarded") {
                await fetchStream();
            }
        } catch (error: any) {
            console.error("Submit failed:", error);
            setSubmitResult({
                status: "error",
                score: 0,
                xp_awarded: 0,
                feedback: error.response?.data?.detail || "Submission failed. Please try again.",
                tips: [],
            });
        } finally {
            setUploading(false);
        }
    };

    const handleSendChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || sendingChat) return;

        const userQuery = chatInput.trim();
        setChatMessages(prev => [...prev, { sender: "user", text: userQuery }]);
        setChatInput("");
        setSendingChat(true);

        try {
            const response = await api.post(`/roadmap/streams/${streamId}/chat`, { query: userQuery });
            setChatMessages(prev => [...prev, { sender: "ai", text: response.data.response }]);
        } catch (error) {
            console.error("Chat failed:", error);
            setChatMessages(prev => [...prev, { sender: "ai", text: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setSendingChat(false);
        }
    };

    const statusIcon = (status: string) => {
        switch (status) {
            case "rewarded":
                return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
            case "completed":
                return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
            case "in_progress":
                return <Play className="w-6 h-6 text-violet-500" />;
            default:
                return <Lock className="w-6 h-6 text-slate-300" />;
        }
    };

    const completedCount = stream?.milestones.filter(
        (m) => m.status === "completed" || m.status === "rewarded"
    ).length || 0;
    const totalCount = stream?.milestones.length || 0;
    const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const Icon = stream ? iconMap[stream.icon] || Rocket : Rocket;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#faf8ff] pt-24 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            </div>
        );
    }

    if (!stream) {
        return (
            <div className="min-h-screen bg-[#faf8ff] pt-24 flex flex-col items-center justify-center gap-4">
                <p className="text-slate-600 text-lg font-semibold">Stream not found</p>
                <Link href="/roadmap" className="text-violet-600 hover:underline">Back to roadmaps</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#faf8ff] pt-24 pb-24 px-4 md:px-8 overflow-x-hidden relative">
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute top-20 left-1/4 h-[300px] w-[300px] rounded-full opacity-30 blur-3xl"
                    style={{ backgroundColor: `${stream.color}30` }} />
            </div>

            <div className="max-w-[900px] mx-auto relative z-10">
                <Link
                    href="/roadmap"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 font-medium text-sm mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Streams
                </Link>

                <div className="bg-white rounded-[2rem] border border-slate-200 p-8 md:p-10 mb-10 shadow-sm">
                    <div className="flex items-start gap-6 mb-8">
                        <div
                            className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${stream.color}15`, color: stream.color }}
                        >
                            <Icon className="w-10 h-10" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">{stream.name}</h1>
                            <p className="text-slate-500">{stream.description}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm font-medium text-slate-600">
                            <span>Overall Progress</span>
                            <span>{completedCount} / {totalCount} milestones</span>
                        </div>
                        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                    width: `${progressPct}%`,
                                    background: `linear-gradient(90deg, ${stream.color}, ${stream.color}aa)`,
                                }}
                            />
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                            <Star className="w-3.5 h-3.5" />
                            {progressPct}% complete
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-slate-200" />

                    <div className="space-y-6">
                        {stream.milestones.map((milestone) => (
                            <div key={milestone.id} className="relative pl-14">
                                <div
                                    className={clsx(
                                        "absolute left-0 w-12 h-12 rounded-full border-2 flex items-center justify-center bg-white z-10",
                                        milestone.status === "rewarded" ? "border-emerald-400" :
                                            milestone.status === "in_progress" ? "border-violet-400" :
                                                "border-slate-200"
                                    )}
                                >
                                    {statusIcon(milestone.status)}
                                </div>

                                <div className={clsx(
                                    "bg-white rounded-xl border p-6 transition-all",
                                    milestone.status === "rewarded" ? "border-emerald-200 bg-emerald-50/30" :
                                        milestone.status === "in_progress" ? "border-violet-200 shadow-sm" :
                                            milestone.status === "completed" ? "border-amber-200 bg-amber-50/30" :
                                                "border-slate-200 opacity-70"
                                )}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={clsx(
                                                    "text-xs font-bold px-2.5 py-0.5 rounded-full",
                                                    milestone.status === "rewarded" ? "bg-emerald-100 text-emerald-700" :
                                                        milestone.status === "in_progress" ? "bg-violet-100 text-violet-700" :
                                                            milestone.status === "completed" ? "bg-amber-100 text-amber-700" :
                                                                "bg-slate-100 text-slate-500"
                                                )}>
                                                    {milestone.status === "rewarded" ? "Completed" :
                                                        milestone.status === "in_progress" ? "In Progress" :
                                                            milestone.status === "completed" ? "Needs Improvement" :
                                                                `Milestone ${milestone.order}`}
                                                </span>
                                                <span className="text-xs font-semibold text-slate-400">
                                                    {milestone.order === 1 ? "Start here" : `Step ${milestone.order}`}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-1">{milestone.title}</h3>
                                            <p className="text-sm text-slate-500">{milestone.description}</p>

                                            {milestone.status !== "locked" && (
                                                <div className="mt-3">
                                                    <button
                                                        onClick={() => {
                                                            const next = expandedMilestone === milestone.id ? null : milestone.id;
                                                            setExpandedMilestone(next);
                                                            if (next) loadLearningMaterials(milestone.id);
                                                        }}
                                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors"
                                                    >
                                                        <FileText className="w-3.5 h-3.5" />
                                                        {expandedMilestone === milestone.id ? "Hide Materials" : "View Learning Materials"}
                                                    </button>

                                                    {expandedMilestone === milestone.id && (
                                                        <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                                                            {generatingMaterials.has(milestone.id) ? (
                                                                <div className="flex items-center gap-3 py-4 text-sm text-slate-500">
                                                                    <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                                                                    Generating personalized learning materials...
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    {(() => {
                                                                        const mats = dynamicMaterials[milestone.id];
                                                                        const hints = mats?.hints || milestone.hints;
                                                                        const resources = mats?.resources || milestone.resources;
                                                                        return (
                                                                            <>
                                                                                {hints && (
                                                                                    <div>
                                                                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Hints</p>
                                                                                        <div className="text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none">
                                                                                            <ReactMarkdown>{hints}</ReactMarkdown>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                                {resources && resources.length > 0 && (
                                                                                    <div>
                                                                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Resources</p>
                                                                                        <div className="space-y-2">
                                                                                            {resources.map((res, ri) => (
                                                                                                <a
                                                                                                    key={ri}
                                                                                                    href={res.url}
                                                                                                    target="_blank"
                                                                                                    rel="noopener noreferrer"
                                                                                                    className="block p-3 bg-white rounded-lg border border-slate-200 hover:border-violet-200 hover:shadow-sm transition-all"
                                                                                                >
                                                                                                    <p className="text-sm font-semibold text-slate-900">{res.title}</p>
                                                                                                    <p className="text-xs text-slate-500 mt-0.5">{res.description}</p>
                                                                                                </a>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </>
                                                                        );
                                                                    })()}
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
                                                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                                                <span className="text-xs font-bold text-amber-700">+{milestone.xp_reward} XP</span>
                                            </div>

                                            {!user ? (
                                                <Link
                                                    href="/login"
                                                    className="px-4 py-2 rounded-lg bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-colors"
                                                >
                                                    Login to Start
                                                </Link>
                                            ) : milestone.status === "locked" ? (
                                                <button
                                                    disabled
                                                    className="px-4 py-2 rounded-lg bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed"
                                                >
                                                    Locked
                                                </button>
                                            ) : milestone.status === "rewarded" ? (
                                                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Done
                                                </div>
                                            ) : milestone.status === "completed" ? (
                                                <button
                                                    onClick={() => setUploadModal({ milestone })}
                                                    className="px-4 py-2 rounded-lg bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-colors inline-flex items-center gap-1.5"
                                                >
                                                    <Upload className="w-3.5 h-3.5" />
                                                    Resubmit
                                                </button>
                                            ) : milestone.status === "in_progress" ? (
                                                <button
                                                    onClick={() => setUploadModal({ milestone })}
                                                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors inline-flex items-center gap-1.5"
                                                >
                                                    <Upload className="w-3.5 h-3.5" />
                                                    Submit Work
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {user && stream.milestones.length > 0 && !stream.milestones.some(m => m.status === "in_progress" || m.status === "locked") && (
                        <div className="mt-10 text-center">
                            {stream.milestones.every(m => m.status === "rewarded") ? (
                                <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
                                    <Crown className="w-8 h-8 text-amber-500" />
                                    <div className="text-left">
                                        <p className="text-lg font-black text-slate-900">Stream Complete!</p>
                                        <p className="text-sm text-slate-500">You&apos;ve mastered all milestones in this stream.</p>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            {uploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Submit: {uploadModal.milestone.title}</h3>
                            <button onClick={() => { setUploadModal(null); setSelectedFiles([]); setSubmitResult(null); }} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {!submitResult ? (
                            <>
                                <p className="text-sm text-slate-500 mb-6">
                                    Upload your work for AI evaluation. Supported formats: PDF, DOCX, TXT, code files.
                                </p>

                                <div className={clsx(
                                    "border-2 border-dashed rounded-xl p-8 text-center transition-colors mb-6",
                                    selectedFiles.length > 0 ? "border-emerald-300 bg-emerald-50" : "border-slate-300 hover:border-violet-300"
                                )}>
                                    {selectedFiles.length > 0 ? (
                                        <div className="space-y-3">
                                            <FileText className="w-10 h-10 text-emerald-500 mx-auto" />
                                            <p className="text-sm font-semibold text-slate-900">{selectedFiles.length} file(s) selected</p>
                                            <div className="flex flex-wrap justify-center gap-2">
                                                {selectedFiles.map((f, i) => (
                                                    <div key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs">
                                                        <span className="text-slate-700 max-w-[120px] truncate">{f.name}</span>
                                                        <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500 ml-1">&times;</button>
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => setSelectedFiles([])}
                                                className="text-xs text-violet-600 hover:underline"
                                            >
                                                Clear all and choose different files
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer space-y-3">
                                            <Upload className="w-10 h-10 text-slate-400 mx-auto" />
                                            <p className="text-sm font-semibold text-slate-600">Click to upload or drag & drop</p>
                                            <p className="text-xs text-slate-400">PDF, DOCX, TXT, code files (max 10MB each)</p>
                                            <input
                                                type="file"
                                                multiple
                                                onChange={handleFileSelect}
                                                className="hidden"
                                                accept=".pdf,.docx,.txt,.py,.js,.ts,.java,.cpp,.c,.html,.css,.md"
                                            />
                                        </label>
                                    )}
                                </div>

                                <button
                                    onClick={handleSubmitFile}
                                    disabled={selectedFiles.length === 0 || uploading}
                                    className="w-full py-3 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
                                >
                                    {uploading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> AI Evaluating...</>
                                    ) : (
                                        <><Zap className="w-4 h-4" /> Submit {selectedFiles.length > 1 ? `${selectedFiles.length} Files` : "File"} for AI Evaluation</>
                                    )}
                                </button>
                            </>
                        ) : (
                            <div className="space-y-5">
                                <div className={clsx(
                                    "p-4 rounded-xl border",
                                    submitResult.status === "rewarded" ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
                                )}>
                                    <div className="flex items-center gap-3 mb-2">
                                        {submitResult.status === "rewarded" ? (
                                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                        ) : (
                                            <Zap className="w-6 h-6 text-amber-600" />
                                        )}
                                        <div>
                                            <p className="font-bold text-slate-900">
                                                {submitResult.status === "rewarded" ? "Milestone Passed!" : "Needs Improvement"}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Score: {submitResult.score}/100
                                                {submitResult.xp_awarded > 0 && ` | +${submitResult.xp_awarded} XP earned`}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="prose prose-sm max-w-none text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-48 overflow-y-auto">
                                    <ReactMarkdown>{submitResult.feedback}</ReactMarkdown>
                                </div>

                                {submitResult.tips && submitResult.tips.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tips</p>
                                        {submitResult.tips.map((tip, i) => (
                                            <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                                                {tip}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    onClick={() => { setUploadModal(null); setSelectedFiles([]); setSubmitResult(null); }}
                                    className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Chatbot */}
            <div className="fixed bottom-8 right-8 z-50">
                {chatOpen ? (
                    <div
                        style={{ width: dimensions.width, height: dimensions.height }}
                        className={clsx(
                            "bg-white rounded-2xl border border-slate-200 shadow-xl flex flex-col overflow-hidden relative",
                            !isResizing && "transition-all duration-300"
                        )}
                    >
                        {/* Resize handles */}
                        <div
                            onMouseDown={(e) => {
                                e.preventDefault();
                                resizerRef.current = { startX: e.clientX, startY: e.clientY, startWidth: dimensions.width, startHeight: dimensions.height };
                                setIsResizing("top");
                            }}
                            className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize z-50 hover:bg-violet-200/50 transition-colors rounded-t-2xl"
                        />
                        <div
                            onMouseDown={(e) => {
                                e.preventDefault();
                                resizerRef.current = { startX: e.clientX, startY: e.clientY, startWidth: dimensions.width, startHeight: dimensions.height };
                                setIsResizing("left");
                            }}
                            className="absolute top-0 bottom-0 left-0 w-2 cursor-ew-resize z-50 hover:bg-violet-200/50 transition-colors rounded-l-2xl"
                        />
                        <div
                            onMouseDown={(e) => {
                                e.preventDefault();
                                resizerRef.current = { startX: e.clientX, startY: e.clientY, startWidth: dimensions.width, startHeight: dimensions.height };
                                setIsResizing("top-left");
                            }}
                            className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize z-50 hover:bg-violet-300/50 transition-colors rounded-tl-2xl"
                        />

                        <div className="p-4 flex items-center justify-between flex-shrink-0"
                            style={{ backgroundColor: stream.color, color: "white" }}>
                            <div className="flex items-center gap-2 font-bold text-sm">
                                <MessageSquare className="w-4 h-4" />
                                {stream.name} Assistant
                            </div>
                            <button onClick={() => setChatOpen(false)} className="text-white/80 hover:text-white text-xs font-bold">
                                Close
                            </button>
                        </div>

                        <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-4">
                            {chatMessages.map((msg, idx) => (
                                <div key={idx} className={clsx(
                                    "flex gap-3 max-w-[85%] rounded-xl p-3 text-sm font-medium leading-relaxed",
                                    msg.sender === "user"
                                        ? "bg-violet-600 text-white self-end ml-auto"
                                        : "bg-slate-100 text-white border border-slate-200 self-start"
                                )}>
                                    <div className="mt-0.5 flex-shrink-0">
                                        {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" style={{ color: stream.color }} />}
                                    </div>
                                    <div className="prose prose-sm max-w-none text-white">
                                        <ReactMarkdown
                                            components={{
                                                p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-black">{children}</p>,
                                                ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1 text-black">{children}</ul>,
                                                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1 text-black">{children}</ol>,
                                                li: ({ children }) => <li className="leading-relaxed text-black">{children}</li>,
                                                strong: ({ children }) => <strong className="font-extrabold text-black">{children}</strong>,
                                                code: ({ className, children }: any) =>
                                                    className
                                                        ? <pre className="bg-slate-900 text-slate-100 p-3 rounded-xl my-2 overflow-x-auto text-xs font-mono"><code className={className}>{children}</code></pre>
                                                        : <code className="bg-slate-800 text-white px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
                                                a: ({ href, children }) => (
                                                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-black underline hover:opacity-80 inline-flex items-center gap-0.5">
                                                        {children} <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                ),
                                            }}
                                        >
                                            {msg.text}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                            {sendingChat && (
                                <div className="bg-slate-100 self-start rounded-xl p-3 text-sm flex items-center gap-2 border border-slate-200">
                                    <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={handleSendChat} className="p-3 border-t border-slate-200 flex gap-2 items-center">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder={`Ask about ${stream.name}...`}
                                className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-violet-400"
                            />
                            <button
                                type="submit"
                                disabled={sendingChat || !chatInput.trim()}
                                className="p-2.5 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                style={{ backgroundColor: stream.color }}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                ) : (
                    <button
                        onClick={() => setChatOpen(true)}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl text-white font-bold text-sm shadow-lg hover:scale-105 transition-all"
                        style={{ backgroundColor: stream.color }}
                    >
                        <MessageSquare className="w-4 h-4" />
                        Stream Assistant
                    </button>
                )}
            </div>

            {/* Start first milestone button */}
            {user && stream.milestones.length > 0 && stream.milestones[0].status === "locked" && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
                    <button
                        onClick={() => startMilestone(stream.milestones[0].id)}
                        disabled={actionLoading !== null}
                        className="px-6 py-3 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-700 transition-colors shadow-lg inline-flex items-center gap-2 disabled:opacity-50"
                    >
                        {actionLoading === stream.milestones[0].id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Play className="w-4 h-4" />
                        )}
                        Start First Milestone
                    </button>
                </div>
            )}
        </div>
    );
}
