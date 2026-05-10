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
            <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
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
        <div className="min-h-[calc(100vh-64px)] bg-slate-50 font-display">
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
                <div className="absolute inset-0 bg-[url('/grid.svg')]" />
            </div>

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <Link href="/faculty/events" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold uppercase tracking-widest text-xs transition-colors mb-6">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Event Management
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Participants & Submissions</h1>
                        <p className="text-slate-500 mt-2 font-medium">Review submissions, award XP, and provide feedback</p>
                    </div>
                    <Link
                        href={`/events/${params.id}`}
                        className="flex items-center gap-2 text-primary hover:text-blue-600 text-sm font-black uppercase tracking-widest transition-colors"
                    >
                        View Event Page <ExternalLink className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
                    <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                                <Users className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-900">{data.total_teams + data.total_individuals}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center">
                                <GitBranch className="w-5 h-5 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-900">{data.total_teams}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Teams</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                <Users className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-900">{data.total_individuals}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Individuals</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                                <Star className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-900">{totalXP}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">XP Awarded</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-rose-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-900">{totalSubmissions}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Submissions</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab("all")}
                        className={clsx(
                            "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm border",
                            activeTab === "all" 
                                ? "bg-primary text-slate-500/30 border-primary" 
                                : "bg-white text-slate-500 border-blue-100 hover:bg-blue-50 hover:text-slate-900"
                        )}
                    >
                        All ({data.total_teams + data.total_individuals})
                    </button>
                    <button
                        onClick={() => setActiveTab("teams")}
                        className={clsx(
                            "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm border flex items-center gap-2",
                            activeTab === "teams" 
                                ? "bg-primary text-slate-500/30 border-primary" 
                                : "bg-white text-slate-500 border-blue-100 hover:bg-blue-50 hover:text-slate-900"
                        )}
                    >
                        <GitBranch className="w-4 h-4" /> Teams ({data.total_teams})
                    </button>
                    <button
                        onClick={() => setActiveTab("individuals")}
                        className={clsx(
                            "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm border flex items-center gap-2",
                            activeTab === "individuals" 
                                ? "bg-primary text-slate-500/30 border-primary" 
                                : "bg-white text-slate-500 border-blue-100 hover:bg-blue-50 hover:text-slate-900"
                        )}
                    >
                        <Users className="w-4 h-4" /> Individuals ({data.total_individuals})
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                ) : filteredParticipants.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-blue-100 rounded-3xl shadow-sm">
                        <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">No participants yet</h3>
                        <p className="text-slate-500 font-medium">Students haven't joined this event yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredParticipants.map((p: any) => (
                            <div key={p.id} className={clsx(
                                "bg-white border rounded-3xl overflow-hidden shadow-sm",
                                p.is_team ? "border-purple-200" : "border-blue-100"
                            )}>
                                <div className="p-6 border-b border-blue-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                {p.is_team ? (
                                                    <div className="flex -space-x-3">
                                                        {p.members.slice(0, 3).map((member: TeamMember, idx: number) => (
                                                            <div 
                                                                key={member.id}
                                                                className={clsx(
                                                                    "w-12 h-12 rounded-full border-2 border-white flex items-center justify-center text-sm font-bold overflow-hidden bg-purple-100",
                                                                    idx === 0 && "ring-2 ring-purple-400"
                                                                )}
                                                            >
                                                                {member.avatar_url ? (
                                                                    <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="text-purple-600 font-black">{member.username.slice(0, 2).toUpperCase()}</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {p.member_count > 3 && (
                                                            <div className="w-12 h-12 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                                +{p.member_count - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-primary font-black overflow-hidden">
                                                        {p.avatar_url ? (
                                                            <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            p.username.slice(0, 2).toUpperCase()
                                                        )}
                                                    </div>
                                                )}
                                                {p.is_team && (
                                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center border-2 border-white">
                                                        <Crown className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                                                        {p.is_team ? p.team_name : (p.full_name || p.username)}
                                                    </h3>
                                                    {p.is_team && (
                                                        <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-600 text-[10px] font-black uppercase">
                                                            Team
                                                        </span>
                                                    )}
                                                    <span className={clsx(
                                                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase border ",
                                                        p.status === "active" ? "bg-green-50 text-green-600 border-green-200" :
                                                        p.status === "disqualified" ? "bg-red-50 text-red-600 border-red-200" :
                                                        p.status === "withdrawn" ? "bg-slate-100 text-slate-500 border-slate-200" :
                                                        "bg-slate-100 text-slate-500 border-slate-200"
                                                    )}>
                                                        {p.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    {p.is_team ? (
                                                        <div className="flex items-center gap-2">
                                                            <Users className="w-3 h-3 text-slate-400" />
                                                            <span className="text-sm text-slate-500 font-medium">
                                                                {p.members.map((m: TeamMember) => m.username).join(", ")}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-slate-500 font-medium">@{p.username}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Joined</p>
                                            <p className="text-sm text-slate-900 font-black">{new Date(p.joined_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {p.submissions && p.submissions.length > 0 && (
                                    <div className="p-6 border-b border-blue-50">
                                        <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <GitBranch className="w-4 h-4 text-primary" /> Submissions ({p.submissions.length})
                                        </h4>
                                        <div className="space-y-3">
                                            {p.submissions.map((sub: Submission) => (
                                                <div key={sub.id} className="p-4 bg-slate-50 border border-blue-100 rounded-xl">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <a href={sub.repo_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-blue-600 text-sm font-black flex items-center gap-1 transition-colors">
                                                            <ExternalLink className="w-3 h-3" />
                                                            {sub.repo_url}
                                                        </a>
                                                        <div className="flex items-center gap-3">
                                                            {sub.submitted_by && (
                                                                <span className="text-xs text-slate-500 font-medium">by @{sub.submitted_by}</span>
                                                            )}
                                                            {sub.score > 0 && (
                                                                <span className="text-sm font-black text-green-600">Score: {sub.score}</span>
                                                            )}
                                                            <span className="text-xs text-slate-500 font-medium">{new Date(sub.submitted_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    {sub.submission_notes && (
                                                        <p className="text-sm text-slate-600 font-medium">{sub.submission_notes}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="p-6">
                                    {editingId === p.id ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">
                                                        XP to Award {p.is_team && `(Split among ${p.member_count || p.members?.length || 1} members)`}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={editXp}
                                                        onChange={(e) => setEditXp(parseInt(e.target.value) || 0)}
                                                        className="w-full bg-white border border-blue-200 rounded-xl px-5 py-3 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm"
                                                    />
                                                    {p.is_team && editXp > 0 && (
                                                        <p className="text-[10px] text-purple-600 font-black uppercase tracking-widest ml-1">
                                                            ~{Math.floor(editXp / (p.member_count || p.members?.length || 1))} XP per member
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">Status</label>
                                                    <select
                                                        value={editStatus}
                                                        onChange={(e) => setEditStatus(e.target.value)}
                                                        className="w-full bg-white border border-blue-200 rounded-xl px-5 py-3 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm"
                                                    >
                                                        <option value="active">Active</option>
                                                        <option value="withdrawn">Withdrawn</option>
                                                        <option value="disqualified">Disqualified</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">Feedback</label>
                                                <textarea
                                                    value={editFeedback}
                                                    onChange={(e) => setEditFeedback(e.target.value)}
                                                    rows={2}
                                                    className="w-full bg-white border border-blue-200 rounded-xl px-5 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none shadow-sm"
                                                    placeholder="Provide feedback..."
                                                />
                                            </div>
                                            <div className="flex gap-4 justify-end">
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="px-6 py-3 rounded-xl bg-white border border-blue-100 text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all text-xs font-black uppercase tracking-widest shadow-sm"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => saveReward(p.id, p.is_team)}
                                                    disabled={saving}
                                                    className="px-6 py-3 rounded-xl bg-primary hover:bg-blue-600 disabled:opacity-50 text-black transition-all text-xs font-black uppercase tracking-widest shadow-sm flex items-center gap-2 border border-blue-400 cursor-pointer hover:text-white"
                                                >
                                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                                                    {saving ? "Saving..." : p.is_team ? "Award Team" : "Save Reward"}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-8">
                                                <div className="text-center">
                                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">XP Awarded</p>
                                                    <p className="text-xl font-black text-slate-900">{p.xp_awarded}</p>
                                                    {p.is_team && p.xp_awarded > 0 && (
                                                        <p className="text-[10px] text-slate-500 font-medium">({Math.floor(p.xp_awarded / (p.member_count || p.members?.length || 1))}/member)</p>
                                                    )}
                                                </div>
                                                {p.feedback && (
                                                    <div className="text-center">
                                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Feedback</p>
                                                        <p className="text-sm text-slate-700 font-medium max-w-xs">{p.feedback}</p>
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
                                                className="px-6 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100 transition-all text-xs font-black uppercase tracking-widest shadow-sm flex items-center gap-2 cursor-pointer"
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
