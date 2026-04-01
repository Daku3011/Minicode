"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Users, Award, MessageSquare, Save, Loader2, ExternalLink, Star, X, Check, UserPlus } from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";

interface Participant {
    id: number;
    user_id: number;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    team_name: string | null;
    team_members: { id: number; username: string; full_name: string | null; avatar_url: string | null }[];
    status: string;
    xp_awarded: number;
    feedback: string | null;
    joined_at: string;
    submissions: { id: number; repo_url: string; submission_notes: string | null; score: number; feedback: string | null; rank: number | null; submitted_at: string }[];
}

export default function FacultyEventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editXp, setEditXp] = useState(0);
    const [editFeedback, setEditFeedback] = useState("");
    const [editStatus, setEditStatus] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchParticipants();
    }, [params.id]);

    const fetchParticipants = async () => {
        try {
            const response = await api.get(`/events/faculty/${params.id}/participants`);
            setParticipants(response.data);
        } catch (error) {
            console.error("Failed to fetch participants:", error);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (p: Participant) => {
        setEditingId(p.id);
        setEditXp(p.xp_awarded);
        setEditFeedback(p.feedback || "");
        setEditStatus(p.status);
    };

    const saveReward = async (participantId: number) => {
        setSaving(true);
        try {
            await api.put(`/events/faculty/${params.id}/participants/${participantId}/reward`, {
                xp_awarded: editXp,
                feedback: editFeedback,
                status: editStatus,
            });
            setEditingId(null);
            fetchParticipants();
        } catch (error) {
            console.error("Failed to save reward:", error);
            alert("Failed to save reward");
        } finally {
            setSaving(false);
        }
    };

    const totalXP = participants.reduce((sum, p) => sum + p.xp_awarded, 0);
    const totalSubmissions = participants.reduce((sum, p) => sum + p.submissions.length, 0);
    const activeCount = participants.filter(p => p.status === "active").length;

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#0f0a1e]">
            <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link href="/faculty/events" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Event Management
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white mb-2">Participants & Submissions</h1>
                        <p className="text-slate-400">Review submissions, award XP, and provide feedback</p>
                    </div>
                    <Link
                        href={`/events/${params.id}`}
                        className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-medium"
                    >
                        View Event Page <ExternalLink className="w-4 h-4" />
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{participants.length}</p>
                                <p className="text-xs text-slate-400">Total Participants</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <Check className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{activeCount}</p>
                                <p className="text-xs text-slate-400">Active</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <Star className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{totalXP}</p>
                                <p className="text-xs text-slate-400">XP Awarded</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{totalSubmissions}</p>
                                <p className="text-xs text-slate-400">Submissions</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Participants List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                    </div>
                ) : participants.length === 0 ? (
                    <div className="text-center py-20">
                        <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-300 mb-2">No participants yet</h3>
                        <p className="text-slate-500">Students haven't joined this event yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {participants.map((p, index) => (
                            <div key={p.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                                {/* Participant Header */}
                                <div className="p-6 border-b border-white/10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold overflow-hidden">
                                                {p.avatar_url ? (
                                                    <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    p.username.slice(0, 2).toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-bold text-white">{p.full_name || p.username}</h3>
                                                    <span className={clsx(
                                                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                                                        p.status === "active" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                                        p.status === "disqualified" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                                        "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                                    )}>
                                                        {p.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-400">@{p.username}{p.team_name ? ` • Team: ${p.team_name}` : ""}</p>
                                                {p.team_members.length > 0 && (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <UserPlus className="w-3 h-3 text-slate-500" />
                                                        <span className="text-xs text-slate-500">
                                                            Members: {p.team_members.map(m => m.username).join(", ")}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500">Joined</p>
                                            <p className="text-sm text-slate-400">{new Date(p.joined_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Submissions */}
                                {p.submissions.length > 0 && (
                                    <div className="p-6 border-b border-white/10">
                                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Submissions ({p.submissions.length})</h4>
                                        <div className="space-y-3">
                                            {p.submissions.map((sub) => (
                                                <div key={sub.id} className="p-4 bg-white/5 rounded-xl">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <a href={sub.repo_url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1">
                                                            <ExternalLink className="w-3 h-3" />
                                                            {sub.repo_url}
                                                        </a>
                                                        <div className="flex items-center gap-3">
                                                            {sub.score > 0 && (
                                                                <span className="text-sm font-bold text-green-400">Score: {sub.score}</span>
                                                            )}
                                                            <span className="text-xs text-slate-500">{new Date(sub.submitted_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    {sub.submission_notes && (
                                                        <p className="text-sm text-slate-400">{sub.submission_notes}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Reward Section */}
                                <div className="p-6">
                                    {editingId === p.id ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-slate-400 mb-1 block">XP to Award</label>
                                                    <input
                                                        type="number"
                                                        value={editXp}
                                                        onChange={(e) => setEditXp(parseInt(e.target.value) || 0)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-slate-400 mb-1 block">Status</label>
                                                    <select
                                                        value={editStatus}
                                                        onChange={(e) => setEditStatus(e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                    >
                                                        <option value="active">Active</option>
                                                        <option value="withdrawn">Withdrawn</option>
                                                        <option value="disqualified">Disqualified</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-slate-400 mb-1 block">Feedback</label>
                                                <textarea
                                                    value={editFeedback}
                                                    onChange={(e) => setEditFeedback(e.target.value)}
                                                    rows={2}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                                                    placeholder="Provide feedback..."
                                                />
                                            </div>
                                            <div className="flex gap-3 justify-end">
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-all text-sm font-medium"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => saveReward(p.id)}
                                                    disabled={saving}
                                                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white transition-all text-sm font-medium flex items-center gap-2"
                                                >
                                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                                                    {saving ? "Saving..." : "Save Reward"}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className="text-center">
                                                    <p className="text-xs text-slate-500">XP Awarded</p>
                                                    <p className="text-xl font-bold text-purple-400">{p.xp_awarded}</p>
                                                </div>
                                                {p.feedback && (
                                                    <div className="text-center">
                                                        <p className="text-xs text-slate-500">Feedback</p>
                                                        <p className="text-sm text-slate-300 max-w-xs truncate">{p.feedback}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => startEdit(p)}
                                                className="px-4 py-2 rounded-lg bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition-all text-sm font-medium flex items-center gap-2"
                                            >
                                                <Award className="w-4 h-4" />
                                                {p.xp_awarded > 0 ? "Edit Reward" : "Award XP"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
