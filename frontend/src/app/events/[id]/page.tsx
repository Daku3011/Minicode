"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Users, Trophy, Clock, ArrowLeft, ExternalLink, CheckCircle, UserPlus, LogOut, Send, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface EventDetail {
    id: number;
    title: string;
    description: string;
    event_type: string;
    difficulty: string | null;
    start_date: string;
    end_date: string | null;
    max_participants: number | null;
    current_participants: number;
    prize_description: string | null;
    rules: string | null;
    problem_ids: number[];
    status: string;
    author_name: string;
    created_at: string;
    is_joined: boolean;
    participants: {
        id: number;
        user_id: number;
        username: string;
        full_name: string | null;
        avatar_url: string | null;
        team_name: string | null;
        joined_at: string;
    }[];
}

interface LeaderboardEntry {
    rank: number;
    user_id: number;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    score: number;
    submitted_at: string;
}

export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [event, setEvent] = useState<EventDetail | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"details" | "participants" | "leaderboard">("details");
    const [joining, setJoining] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [repoUrl, setRepoUrl] = useState("");
    const [submissionNotes, setSubmissionNotes] = useState("");
    const [showSubmitForm, setShowSubmitForm] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchEvent();
            fetchLeaderboard();
        }
    }, [params.id]);

    const fetchEvent = async () => {
        try {
            const response = await api.get(`/events/${params.id}`);
            setEvent(response.data);
        } catch (error) {
            console.error("Failed to fetch event:", error);
            router.push("/events");
        } finally {
            setLoading(false);
        }
    };

    const fetchLeaderboard = async () => {
        try {
            const response = await api.get(`/events/${params.id}/leaderboard`);
            setLeaderboard(response.data);
        } catch (error) {
            console.error("Failed to fetch leaderboard:", error);
        }
    };

    const handleJoin = async () => {
        if (!event) return;
        setJoining(true);
        try {
            await api.post(`/events/${event.id}/join`);
            fetchEvent();
        } catch (error: any) {
            alert(error.response?.data?.detail || "Failed to join event");
        } finally {
            setJoining(false);
        }
    };

    const handleLeave = async () => {
        if (!event) return;
        if (!confirm("Are you sure you want to leave this event?")) return;
        try {
            await api.post(`/events/${event.id}/leave`);
            fetchEvent();
        } catch (error: any) {
            alert(error.response?.data?.detail || "Failed to leave event");
        }
    };

    const handleSubmit = async () => {
        if (!event || !repoUrl) return;
        setSubmitting(true);
        try {
            await api.post(`/events/${event.id}/submit`, {
                repo_url: repoUrl,
                submission_notes: submissionNotes
            });
            setShowSubmitForm(false);
            setRepoUrl("");
            setSubmissionNotes("");
            alert("Submission recorded successfully!");
        } catch (error: any) {
            alert(error.response?.data?.detail || "Failed to submit");
        } finally {
            setSubmitting(false);
        }
    };

    const getTimeRemaining = (endDate: string | null) => {
        if (!endDate) return "No deadline";
        const end = new Date(endDate);
        const now = new Date();
        const diff = end.getTime() - now.getTime();
        
        if (diff <= 0) return "Ended";
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const getEventTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            weekly_challenge: "Weekly Challenge",
            team_project: "Team Project",
            announcement: "Announcement"
        };
        return labels[type] || type;
    };

    const getDifficultyColor = (difficulty: string | null) => {
        switch (difficulty?.toLowerCase()) {
            case "easy": return "text-green-400 bg-green-500/10 border-green-500/20";
            case "medium": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
            case "hard": return "text-red-400 bg-red-500/10 border-red-500/20";
            default: return "text-slate-400 bg-slate-500/10 border-slate-500/20";
        }
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-[#0f0a1e] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-[#0f0a1e] flex items-center justify-center">
                <p className="text-slate-400">Event not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#0f0a1e]">
            {/* Background */}
            <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <Link 
                    href="/events" 
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Events
                </Link>

                {/* Header */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 mb-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="px-3 py-1 rounded-full text-xs font-bold border bg-purple-500/10 text-purple-400 border-purple-500/20">
                                    {getEventTypeLabel(event.event_type)}
                                </span>
                                {event.difficulty && (
                                    <span className={clsx(
                                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                                        getDifficultyColor(event.difficulty)
                                    )}>
                                        {event.difficulty}
                                    </span>
                                )}
                                <span className={clsx(
                                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                                    event.status === "active" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                )}>
                                    {event.status}
                                </span>
                            </div>
                            
                            <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
                                {event.title}
                            </h1>
                            
                            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    <span>{event.current_participants}{event.max_participants ? `/${event.max_participants}` : ""} participants</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{getTimeRemaining(event.end_date)} remaining</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>by {event.author_name}</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            {event.status === "active" && (
                                <>
                                    {event.is_joined ? (
                                        <>
                                            <button
                                                onClick={() => setShowSubmitForm(!showSubmitForm)}
                                                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                                            >
                                                <Send className="w-4 h-4" /> Submit Work
                                            </button>
                                            <button
                                                onClick={handleLeave}
                                                className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border border-white/10"
                                            >
                                                <LogOut className="w-4 h-4" /> Leave Event
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={handleJoin}
                                            disabled={joining}
                                            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                                        >
                                            {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                            {joining ? "Joining..." : "Join Event"}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    
                    {/* Submit Form */}
                    {showSubmitForm && (
                        <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                            <h3 className="text-lg font-bold text-white mb-4">Submit Your Work</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">GitHub Repository URL *</label>
                                    <input
                                        type="url"
                                        value={repoUrl}
                                        onChange={(e) => setRepoUrl(e.target.value)}
                                        placeholder="https://github.com/username/repo"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Notes (optional)</label>
                                    <textarea
                                        value={submissionNotes}
                                        onChange={(e) => setSubmissionNotes(e.target.value)}
                                        placeholder="Any notes about your submission..."
                                        rows={3}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!repoUrl || submitting}
                                        className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all"
                                    >
                                        {submitting ? "Submitting..." : "Submit"}
                                    </button>
                                    <button
                                        onClick={() => setShowSubmitForm(false)}
                                        className="bg-white/5 hover:bg-white/10 text-slate-400 px-4 py-2 rounded-lg font-medium text-sm transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {[
                        { id: "details", label: "Details" },
                        { id: "participants", label: `Participants (${event.current_participants})` },
                        { id: "leaderboard", label: "Leaderboard" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={clsx(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                activeTab === tab.id
                                    ? "bg-purple-600 text-white"
                                    : "bg-white/5 text-slate-400 hover:bg-white/10"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === "details" && (
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8">
                        <div className="prose prose-invert max-w-none">
                            <div className="text-slate-300 whitespace-pre-wrap">{event.description}</div>
                            
                            {event.rules && (
                                <>
                                    <h3 className="text-xl font-bold text-white mt-8 mb-4">Rules</h3>
                                    <div className="text-slate-300 whitespace-pre-wrap">{event.rules}</div>
                                </>
                            )}
                            
                            {event.prize_description && (
                                <>
                                    <h3 className="text-xl font-bold text-white mt-8 mb-4">Prizes</h3>
                                    <div className="flex items-center gap-3 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                        <Trophy className="w-8 h-8 text-amber-400" />
                                        <p className="text-amber-200">{event.prize_description}</p>
                                    </div>
                                </>
                            )}
                            
                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <p className="text-sm text-slate-400">Start Date</p>
                                    <p className="text-white font-medium">{new Date(event.start_date).toLocaleDateString()}</p>
                                </div>
                                {event.end_date && (
                                    <div className="p-4 bg-white/5 rounded-xl">
                                        <p className="text-sm text-slate-400">End Date</p>
                                        <p className="text-white font-medium">{new Date(event.end_date).toLocaleDateString()}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "participants" && (
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                        {event.participants.length === 0 ? (
                            <div className="p-8 text-center">
                                <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-400">No participants yet. Be the first to join!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/10">
                                {event.participants.map((participant) => (
                                    <div key={participant.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold overflow-hidden">
                                            {participant.avatar_url ? (
                                                <img src={participant.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                participant.username.slice(0, 2).toUpperCase()
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium">{participant.full_name || participant.username}</p>
                                            <p className="text-sm text-slate-400">@{participant.username}{participant.team_name ? ` • Team: ${participant.team_name}` : ""}</p>
                                        </div>
                                        <p className="text-xs text-slate-500">Joined {new Date(participant.joined_at).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "leaderboard" && (
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                        {leaderboard.length === 0 ? (
                            <div className="p-8 text-center">
                                <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-400">No submissions yet. Be the first to submit!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/10">
                                {leaderboard.map((entry, index) => (
                                    <div key={entry.user_id} className={clsx(
                                        "p-4 flex items-center gap-4",
                                        index === 0 && "bg-amber-500/5",
                                        index === 1 && "bg-slate-400/5",
                                        index === 2 && "bg-orange-600/5"
                                    )}>
                                        <div className={clsx(
                                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                                            index === 0 && "bg-amber-500/20 text-amber-400",
                                            index === 1 && "bg-slate-400/20 text-slate-300",
                                            index === 2 && "bg-orange-600/20 text-orange-400",
                                            index > 2 && "bg-white/10 text-slate-400"
                                        )}>
                                            {entry.rank}
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold overflow-hidden">
                                            {entry.avatar_url ? (
                                                <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                entry.username.slice(0, 2).toUpperCase()
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium">{entry.full_name || entry.username}</p>
                                            <p className="text-sm text-slate-400">@{entry.username}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-white">{entry.score} XP</p>
                                            <p className="text-xs text-slate-500">{new Date(entry.submitted_at).toLocaleDateString()}</p>
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
