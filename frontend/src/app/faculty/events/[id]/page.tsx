"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Users, Award, MessageSquare, Save, Loader2, ExternalLink, Star, X, Check, UserPlus, Crown, Trophy, GitBranch } from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";

interface TeamMember {
    id: number;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
}

interface Submission {
    id: number;
    repo_url: string;
    submission_notes: string | null;
    score: number;
    feedback: string | null;
    rank: number | null;
    submitted_by?: string;
    submitted_at: string;
}

interface Team {
    id: number;
    team_id: string;
    team_name: string;
    leader: TeamMember;
    members: TeamMember[];
    member_count: number;
    is_team: boolean;
    status: string;
    xp_awarded: number;
    feedback: string | null;
    joined_at: string;
    submissions: Submission[];
}

interface Individual {
    id: number;
    user_id: number;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    team_name: string | null;
    is_team: boolean;
    team_members: TeamMember[];
    status: string;
    xp_awarded: number;
    feedback: string | null;
    joined_at: string;
    submissions: Submission[];
}

interface ParticipantsResponse {
    teams: Team[];
    individuals: Individual[];
    total_teams: number;
    total_individuals: number;
}

export default function FacultyEventDetailPage() {
    const params = useParams();
    const [data, setData] = useState<ParticipantsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editXp, setEditXp] = useState(0);
    const [editFeedback, setEditFeedback] = useState("");
    const [editStatus, setEditStatus] = useState("");
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"all" | "teams" | "individuals">("all");

    useEffect(() => {
        fetchParticipants();
    }, [params.id]);

    const fetchParticipants = async () => {
        try {
            const response = await api.get(`/events/faculty/${params.id}/participants`);
            setData(response.data);
        } catch (error) {
            console.error("Failed to fetch participants:", error);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (xp: number, feedback: string | null, status: string) => {
        setEditingId(1); // Placeholder
        setEditXp(xp);
        setEditFeedback(feedback || "");
        setEditStatus(status);
    };

    const saveReward = async (participantId: number, isTeam: boolean = false) => {
        setSaving(true);
        try {
            const response = await api.put(`/events/faculty/${params.id}/participants/${participantId}/reward`, {
                xp_awarded: editXp,
                feedback: editFeedback,
                status: editStatus,
            });
            setEditingId(null);
            fetchParticipants();
            alert(response.data.is_team 
                ? `Team reward saved! ${response.data.member_count} members each received ${response.data.xp_per_member} XP.`
                : "Reward saved successfully!"
            );
        } catch (error) {
            console.error("Failed to save reward:", error);
            alert("Failed to save reward");
        } finally {
            setSaving(false);
        }
    };

    if (!data) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-[#05003] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
            </div>
        );
    }

    const allParticipants = [...data.teams, ...data.individuals];
    const filteredParticipants = activeTab === "all" 
        ? allParticipants 
        : activeTab === "teams" 
            ? data.teams 
            : data.individuals;

    const totalXP = [...data.teams, ...data.individuals].reduce((sum, p) => sum + p.xp_awarded, 0);
    const totalSubmissions = [...data.teams, ...data.individuals].reduce((sum, p) => sum + p.submissions.length, 0);
    const activeCount = [...data.teams, ...data.individuals].filter(p => p.status === "active").length;

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#05003]">
            <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent pointer-events-none" />

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
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
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{data.total_teams + data.total_individuals}</p>
                                <p className="text-xs text-slate-400">Total</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <GitBranch className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{data.total_teams}</p>
                                <p className="text-xs text-slate-400">Teams</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <Users className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{data.total_individuals}</p>
                                <p className="text-xs text-slate-400">Individuals</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                <Star className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{totalXP}</p>
                                <p className="text-xs text-slate-400">XP Awarded</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-rose-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{totalSubmissions}</p>
                                <p className="text-xs text-slate-400">Submissions</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Filter */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab("all")}
                        className={clsx(
                            "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                            activeTab === "all" 
                                ? "bg-purple-600 text-white" 
                                : "bg-white/5 text-slate-400 hover:bg-white/10"
                        )}
                    >
                        All ({data.total_teams + data.total_individuals})
                    </button>
                    <button
                        onClick={() => setActiveTab("teams")}
                        className={clsx(
                            "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                            activeTab === "teams" 
                                ? "bg-purple-600 text-white" 
                                : "bg-white/5 text-slate-400 hover:bg-white/10"
                        )}
                    >
                        <GitBranch className="w-4 h-4" /> Teams ({data.total_teams})
                    </button>
                    <button
                        onClick={() => setActiveTab("individuals")}
                        className={clsx(
                            "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                            activeTab === "individuals" 
                                ? "bg-purple-600 text-white" 
                                : "bg-white/5 text-slate-400 hover:bg-white/10"
                        )}
                    >
                        <Users className="w-4 h-4" /> Individuals ({data.total_individuals})
                    </button>
                </div>

                {/* Participants List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                    </div>
                ) : filteredParticipants.length === 0 ? (
                    <div className="text-center py-20">
                        <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-300 mb-2">No participants yet</h3>
                        <p className="text-slate-500">Students haven't joined this event yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredParticipants.map((p: any) => (
                            <div key={p.id} className={clsx(
                                "bg-white/5 backdrop-blur-sm border rounded-2xl overflow-hidden",
                                p.is_team ? "border-purple-500/30" : "border-white/10"
                            )}>
                                {/* Header */}
                                <div className="p-6 border-b border-white/10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {/* Avatar(s) */}
                                            <div className="relative">
                                                {p.is_team ? (
                                                    <div className="flex -space-x-3">
                                                        {p.members.slice(0, 3).map((member: TeamMember, idx: number) => (
                                                            <div 
                                                                key={member.id}
                                                                className={clsx(
                                                                    "w-12 h-12 rounded-full border-2 border-[#05003] flex items-center justify-center text-sm font-bold overflow-hidden bg-purple-500/20",
                                                                    idx === 0 && "ring-2 ring-purple-500"
                                                                )}
                                                            >
                                                                {member.avatar_url ? (
                                                                    <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="text-purple-400">{member.username.slice(0, 2).toUpperCase()}</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {p.member_count > 3 && (
                                                            <div className="w-12 h-12 rounded-full border-2 border-[#05003] bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                                                                +{p.member_count - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold overflow-hidden border border-purple-500/30">
                                                        {p.avatar_url ? (
                                                            <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            p.username.slice(0, 2).toUpperCase()
                                                        )}
                                                    </div>
                                                )}
                                                {p.is_team && (
                                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                                                        <Crown className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-bold text-white">
                                                        {p.is_team ? p.team_name : (p.full_name || p.username)}
                                                    </h3>
                                                    {p.is_team && (
                                                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] font-bold uppercase">
                                                            Team
                                                        </span>
                                                    )}
                                                    <span className={clsx(
                                                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase border ",
                                                        p.status === "active" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                                        p.status === "disqualified" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                                        "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                                    )}>
                                                        {p.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    {p.is_team ? (
                                                        <div className="flex items-center gap-2">
                                                            <Users className="w-3 h-3 text-slate-500" />
                                                            <span className="text-sm text-slate-400">
                                                                {p.members.map((m: TeamMember) => m.username).join(", ")}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-slate-400">@{p.username}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500">Joined</p>
                                            <p className="text-sm text-slate-400">{new Date(p.joined_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Submissions */}
                                {p.submissions && p.submissions.length > 0 && (
                                    <div className="p-6 border-b border-white/10">
                                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <GitBranch className="w-4 h-4" /> Submissions ({p.submissions.length})
                                        </h4>
                                        <div className="space-y-3">
                                            {p.submissions.map((sub: Submission) => (
                                                <div key={sub.id} className="p-4 bg-white/5 rounded-xl">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <a href={sub.repo_url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1">
                                                            <ExternalLink className="w-3 h-3" />
                                                            {sub.repo_url}
                                                        </a>
                                                        <div className="flex items-center gap-3">
                                                            {sub.submitted_by && (
                                                                <span className="text-xs text-slate-500">by @{sub.submitted_by}</span>
                                                            )}
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
                                                    <label className="text-sm font-medium text-slate-400 mb-1 block">
                                                        XP to Award {p.is_team && `(Will split among ${p.member_count || p.members?.length || 1} members)`}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={editXp}
                                                        onChange={(e) => setEditXp(parseInt(e.target.value) || 0)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                    />
                                                    {p.is_team && editXp > 0 && (
                                                        <p className="text-xs text-purple-400 mt-1">
                                                            ~{Math.floor(editXp / (p.member_count || p.members?.length || 1))} XP per member
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-slate-400 mb-1 block">Status</label>
                                                    <select
                                                        value={editStatus}
                                                        onChange={(e) => setEditStatus(e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
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
                                                    onClick={() => saveReward(p.id, p.is_team)}
                                                    disabled={saving}
                                                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white transition-all text-sm font-medium flex items-center gap-2"
                                                >
                                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                                                    {saving ? "Saving..." : p.is_team ? "Award Team" : "Save Reward"}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className="text-center">
                                                    <p className="text-xs text-slate-500">XP Awarded</p>
                                                    <p className="text-xl font-bold text-purple-400">{p.xp_awarded}</p>
                                                    {p.is_team && p.xp_awarded > 0 && (
                                                        <p className="text-[10px] text-slate-500">({Math.floor(p.xp_awarded / (p.member_count || p.members?.length || 1))}/member)</p>
                                                    )}
                                                </div>
                                                {p.feedback && (
                                                    <div className="text-center">
                                                        <p className="text-xs text-slate-500">Feedback</p>
                                                        <p className="text-sm text-slate-300 max-w-xs truncate">{p.feedback}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setEditingId(p.id);
                                                    setEditXp(p.xp_awarded);
                                                    setEditFeedback(p.feedback || "");
                                                    setEditStatus(p.status);
                                                }}
                                                className="px-4 py-2 rounded-lg bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition-all text-sm font-medium flex items-center gap-2"
                                            >
                                                <Award className="w-4 h-4" />
                                                {p.xp_awarded > 0 ? "Edit Reward" : p.is_team ? "Award Team XP" : "Award XP"}
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
