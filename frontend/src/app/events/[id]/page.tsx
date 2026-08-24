"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Users, Trophy, Clock, ArrowLeft, ExternalLink, UserPlus, LogOut, Send, Loader2, Plus, X, Check, User, Mail, Bell } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { clsx } from "clsx";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/useIsMobile";
import MobileSubmitNotice from "@/components/MobileSubmitNotice";

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
    user_submission_status: string | null; // null, "submitted", "rewarded", "disqualified", "withdrawn", "completed"
    user_xp_awarded: number;
    user_feedback: string | null;
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
    user_id?: number;
    username?: string;
    full_name?: string | null;
    avatar_url?: string | null;
    score?: number;
    submitted_at?: string;
    xp_awarded?: number;
    feedback?: string | null;
    is_team?: boolean;
    team_name?: string;
    member_count?: number;
    members?: Array<{
        id: number;
        username: string;
        full_name?: string | null;
        avatar_url?: string | null;
    }>;
}

interface Invitation {
    id: number;
    event_id: number;
    event_title: string;
    from_username: string;
    from_avatar: string | null;
    team_name: string;
    created_at: string;
}

export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const isMobile = useIsMobile();
    const [event, setEvent] = useState<EventDetail | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"details" | "participants" | "leaderboard">("details");
    const [joining, setJoining] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [repoUrl, setRepoUrl] = useState("");
    const [submissionNotes, setSubmissionNotes] = useState("");
    const [showSubmitForm, setShowSubmitForm] = useState(false);

    // Team system
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [teamName, setTeamName] = useState("");
    const [inviteUsername, setInviteUsername] = useState("");
    const [sendingInvite, setSendingInvite] = useState(false);
    const [invitedMembers, setInvitedMembers] = useState<string[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [showInvitations, setShowInvitations] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchEvent();
            fetchLeaderboard();
            fetchInvitations();
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

    const fetchInvitations = async () => {
        try {
            const response = await api.get("/events/invitations");
            setInvitations(response.data);
        } catch (error) {
            // Silently fail - user might not be logged in
        }
    };

    const handleJoin = async (asTeam: boolean = false) => {
        if (!event) return;
        setJoining(true);
        try {
            if (asTeam && teamName) {
                await api.post(`/events/${event.id}/join`, { team_name: teamName });
            } else {
                await api.post(`/events/${event.id}/join`);
            }
            setShowTeamModal(false);
            setTeamName("");
            setInvitedMembers([]);
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

    const sendInvite = async () => {
        if (!inviteUsername || !event) return;
        setSendingInvite(true);
        try {
            await api.post(`/events/${event.id}/invite`, {
                to_username: inviteUsername,
                team_name: teamName || `${user?.username}'s Team`,
            });
            setInvitedMembers([...invitedMembers, inviteUsername]);
            setInviteUsername("");
        } catch (error: any) {
            alert(error.response?.data?.detail || "Failed to send invitation");
        } finally {
            setSendingInvite(false);
        }
    };

    const respondToInvitation = async (invitationId: number, action: "accept" | "reject") => {
        try {
            await api.post(`/events/invitations/${invitationId}/respond`, { action });
            setInvitations(prev => prev.filter(i => i.id !== invitationId));
            if (action === "accept") {
                fetchEvent();
            }
        } catch (error: any) {
            alert(error.response?.data?.detail || "Failed to respond");
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
            <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center">
                <p className="text-slate-500 font-bold uppercase tracking-widest">Event not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-slate-50 font-display">
            {/* Background */}
            <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-blue-50 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                {user?.role === "faculty" ? (
                    <Link href="/faculty/events" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold uppercase tracking-widest text-xs transition-colors mb-6">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Events
                    </Link>
                ) : (
                    <Link href="/events" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold uppercase tracking-widest text-xs transition-colors mb-6">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Events
                    </Link>
                )}

                {/* Header */}
                <div className="bg-white border border-blue-100 rounded-3xl p-6 md:p-8 mb-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-blue-50 text-blue-600 border-blue-100">
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

                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase leading-none">
                                {event.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 uppercase tracking-widest font-black">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-primary" />
                                    <span>{event.current_participants}{event.max_participants ? `/${event.max_participants}` : ""} participants</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-primary" />
                                    <span>{getTimeRemaining(event.end_date)} remaining</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary" />
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
                                            {/* Show status badge if submitted/rewarded/etc */}
                                            {event.user_submission_status && (
                                                <div className={clsx(
                                                    "px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2",
                                                    event.user_submission_status === "rewarded" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                                                        event.user_submission_status === "disqualified" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                                                            event.user_submission_status === "withdrawn" ? "bg-slate-500/20 text-slate-400 border border-slate-500/30" :
                                                                event.user_submission_status === "completed" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                                                                    "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                                )}>
                                                    {event.user_submission_status === "rewarded" && <><Trophy className="w-4 h-4" /> +{event.user_xp_awarded} XP Awarded</>}
                                                    {event.user_submission_status === "disqualified" && <><X className="w-4 h-4" /> Disqualified</>}
                                                    {event.user_submission_status === "withdrawn" && <><LogOut className="w-4 h-4" /> Withdrawn</>}
                                                    {event.user_submission_status === "completed" && <><Check className="w-4 h-4" /> Event Completed</>}
                                                    {event.user_submission_status === "submitted" && <><Send className="w-4 h-4" /> Submitted - Awaiting Review</>}
                                                </div>
                                            )}
                                            {event.user_feedback && (
                                                <div className="px-4 py-2 rounded-xl bg-blue-50 border border-blue-100 text-sm text-slate-700 font-medium">
                                                    <span className="text-slate-500 font-bold block mb-1">Faculty Feedback:</span> {event.user_feedback}
                                                </div>
                                            )}
                                            {/* Only show submit button if submitted but not yet reviewed */}
                                            {(!event.user_submission_status || event.user_submission_status === "submitted") && (
                                                isMobile ? (
                                                    <MobileSubmitNotice
                                                        title="Event submission available on desktop"
                                                        description="Open MiniCode on a desktop browser to submit your event work."
                                                    />
                                                ) : (
                                                <button
                                                    onClick={() => setShowSubmitForm(!showSubmitForm)}
                                                    className={clsx(
                                                        "px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm border text-black",
                                                        event.user_submission_status === "submitted"
                                                            ? "bg-white border-amber-500 text-amber-600 hover:bg-amber-50"
                                                            : "bg-primary border-primary text-black hover:bg-blue-600 hover:text-white"
                                                    )}
                                                >
                                                    <Send className="w-4 h-4" />
                                                    {event.user_submission_status === "submitted" ? "Update Submission" : "Submit Work"}
                                                </button>
                                                )
                                            )}
                                            <button
                                                onClick={handleLeave}
                                                className="bg-white hover:bg-red-50 text-slate-500 hover:text-red-500 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all border border-blue-100 shadow-sm cursor-pointer"
                                            >
                                                <LogOut className="w-4 h-4 text-red-500" /> Leave Event
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setShowTeamModal(true)}
                                                disabled={joining}
                                                className="bg-gray-500/10 hover:bg-blue-600 disabled:opacity-50 text-blue-500 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer border border-blue-500 hover:text-white"
                                            >
                                                {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                                {joining ? "Joining..." : "Join Event"}
                                            </button>
                                            {event.event_type === "team_project" && (
                                                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest text-center mt-2">
                                                    You can join solo or create a team
                                                </p>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                            {/* Event not active */}
                            {event.status !== "active" && event.is_joined && (
                                <div className={clsx(
                                    "px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2",
                                    event.status === "completed" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                                        "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                                )}>
                                    {event.status === "completed" ? <><Check className="w-4 h-4" /> Event Completed</> : <><X className="w-4 h-4" /> Event {event.status}</>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Form */}
                    {showSubmitForm && !isMobile && (
                        <div className="mt-6 p-6 bg-white rounded-xl border border-blue-100 shadow-sm">
                            <h3 className="text-lg font-black uppercase text-slate-900 tracking-tight mb-4">Submit Your Work</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">GitHub Repository URL *</label>
                                    <input
                                        type="url"
                                        value={repoUrl}
                                        onChange={(e) => setRepoUrl(e.target.value)}
                                        placeholder="https://github.com/username/repo"
                                        className="w-full bg-white border border-blue-200 rounded-xl py-3 px-4 text-slate-900 placeholder:text-slate-400 font-bold focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Notes (optional)</label>
                                    <textarea
                                        value={submissionNotes}
                                        onChange={(e) => setSubmissionNotes(e.target.value)}
                                        placeholder="Any notes about your submission..."
                                        rows={3}
                                        className="w-full bg-white border border-blue-200 rounded-xl py-3 px-4 text-slate-900 placeholder:text-slate-400 font-bold focus:outline-none focus:ring-1 focus:ring-primary resize-none shadow-sm"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!repoUrl || submitting}
                                        className="bg-primary hover:bg-blue-600 disabled:opacity-50 text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-sm"
                                    >
                                        {submitting ? "Submitting..." : "Submit"}
                                    </button>
                                    <button
                                        onClick={() => setShowSubmitForm(false)}
                                        className="bg-white border border-blue-100 hover:bg-red-500 text-slate-500 hover:text-slate-900 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Invitation Banner */}
                {invitations.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 mb-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                                <Bell className="w-4 h-4" />
                                Team Invitations ({invitations.length})
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {invitations.map((inv) => (
                                <div key={inv.id} className="flex items-center justify-between p-4 bg-white border border-blue-100 shadow-sm rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-primary text-xs font-black overflow-hidden">
                                            {inv.from_avatar ? (
                                                <img src={inv.from_avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                inv.from_username.slice(0, 2).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-900 font-bold">
                                                <span className="text-primary font-black">@{inv.from_username}</span> invited you to join <span className="text-slate-900 font-black">{inv.team_name}</span>
                                            </p>
                                            <p className="text-xs text-slate-500 font-medium tracking-wide">for {inv.event_title}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => respondToInvitation(inv.id, "accept")}
                                            className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => respondToInvitation(inv.id, "reject")}
                                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
                                "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm border",
                                activeTab === tab.id
                                    ? "bg-primary text-slate-500/30 border-primary"
                                    : "bg-white text-slate-500 border-blue-100 hover:bg-blue-50 hover:text-slate-900"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === "details" && (
                    <div className="bg-white border border-blue-100 rounded-3xl p-6 md:p-8 shadow-sm">
                        <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-headings:text-slate-900 prose-headings:font-black prose-strong:text-blue-600 prose-code:text-blue-600 prose-code:bg-blue-50 prose-pre:bg-slate-900 prose-pre:text-white prose-pre:rounded-xl">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{event.description}</ReactMarkdown>

                            {event.rules && (
                                <>
                                    <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mt-8 mb-4">Rules</h3>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{event.rules}</ReactMarkdown>
                                </>
                            )}

                            {event.prize_description && (
                                <>
                                    <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mt-8 mb-4">Prizes</h3>
                                    <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                                        <Trophy className="w-8 h-8 text-amber-500" />
                                        <div className="text-amber-800 font-bold prose prose-amber max-w-none prose-p:text-amber-800">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{event.prize_description}</ReactMarkdown>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                    <p className="text-xs uppercase tracking-widest font-bold text-slate-500">Start Date</p>
                                    <p className="text-slate-900 font-black">{new Date(event.start_date).toLocaleDateString()}</p>
                                </div>
                                {event.end_date && (
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                        <p className="text-xs uppercase tracking-widest font-bold text-slate-500">End Date</p>
                                        <p className="text-slate-900 font-black">{new Date(event.end_date).toLocaleDateString()}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "participants" && (
                    <div className="bg-white border border-blue-100 rounded-3xl overflow-hidden shadow-sm">
                        {event.participants.length === 0 ? (
                            <div className="p-8 text-center">
                                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No participants yet. Be the first to join!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-blue-50">
                                {event.participants.map((participant) => (
                                    <div key={participant.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-primary font-black overflow-hidden">
                                            {participant.avatar_url ? (
                                                <img src={participant.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                participant.username.slice(0, 2).toUpperCase()
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-slate-900 font-black tracking-tight">{participant.full_name || participant.username}</p>
                                            <p className="text-xs text-slate-500 font-bold tracking-wide">@{participant.username}{participant.team_name ? ` • Team: ${participant.team_name}` : ""}</p>
                                        </div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Joined {new Date(participant.joined_at).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "leaderboard" && (
                    <div className="bg-white border border-blue-100 rounded-3xl overflow-hidden shadow-sm">
                        {leaderboard.length === 0 ? (
                            <div className="p-8 text-center">
                                <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No submissions yet. Be the first to submit!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-blue-50">
                                {leaderboard.map((entry, index) => (
                                    <div key={entry.is_team ? entry.team_name : entry.user_id} className={clsx(
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
                                        {entry.is_team ? (
                                            <>
                                                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                                                    <Users className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-slate-900 font-black tracking-tight">{entry.team_name}</p>
                                                    <p className="text-xs text-slate-500 font-bold tracking-wide">
                                                        {entry.member_count} member{entry.member_count !== 1 ? 's' : ''}
                                                        {entry.members && ` • ${entry.members.map(m => m.username).join(', ')}`}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-black text-slate-900">{entry.xp_awarded} <span className="text-xs text-slate-500 font-bold uppercase">XP</span></p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold overflow-hidden">
                                                    {entry.avatar_url ? (
                                                        <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        entry.username?.slice(0, 2).toUpperCase()
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-slate-900 font-black tracking-tight">{entry.full_name || entry.username}</p>
                                                    <p className="text-xs text-slate-500 font-bold tracking-wide">@{entry.username}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-black text-slate-900">{entry.score || entry.xp_awarded || 0} <span className="text-xs text-slate-500 font-bold uppercase">XP</span></p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Join/Team Modal */}
            {showTeamModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white border border-blue-100 shadow-2xl rounded-3xl p-8 w-full max-w-lg">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Join Event</h3>
                            <button onClick={() => { setShowTeamModal(false); setTeamName(""); setInvitedMembers([]); }} className="text-slate-400 hover:text-slate-900 p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {event.event_type === "team_project" ? (
                            <div className="space-y-6">
                                <div className="flex gap-3 mb-6">
                                    <button
                                        onClick={() => handleJoin(false)}
                                        disabled={joining}
                                        className="flex-1 px-4 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-600 font-black uppercase tracking-widest text-xs transition-all border border-blue-100 shadow-sm"
                                    >
                                        <User className="w-4 h-4 inline mr-2 text-primary" />
                                        Join Solo
                                    </button>
                                    <button
                                        onClick={() => setTeamName(teamName || `${user?.username}'s Team`)}
                                        className={clsx(
                                            "flex-1 px-4 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-sm border",
                                            teamName
                                                ? "bg-primary text-white border-primary"
                                                : "bg-white hover:bg-blue-50 text-slate-600 border-blue-100"
                                        )}
                                    >
                                        <Users className="w-4 h-4 inline mr-2 text-primary" />
                                        Create Team
                                    </button>
                                </div>

                                {teamName && (
                                    <>
                                        <div>
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Team Name</label>
                                            <input
                                                type="text"
                                                value={teamName}
                                                onChange={(e) => setTeamName(e.target.value)}
                                                className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                                                placeholder="Enter team name"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Invite Members by Username</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={inviteUsername}
                                                    onChange={(e) => setInviteUsername(e.target.value)}
                                                    onKeyDown={(e) => e.key === "Enter" && sendInvite()}
                                                    className="flex-1 bg-white border border-blue-200 rounded-xl px-4 py-3 text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                                                    placeholder="Enter username"
                                                />
                                                <button
                                                    onClick={sendInvite}
                                                    disabled={sendingInvite || !inviteUsername}
                                                    className="px-6 py-3 rounded-xl bg-primary hover:bg-blue-600 disabled:opacity-50 text-white transition-all shadow-sm flex items-center justify-center font-black uppercase text-xs"
                                                >
                                                    {sendingInvite ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        {invitedMembers.length > 0 && (
                                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl shadow-sm">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Invited members:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {invitedMembers.map((m, i) => (
                                                        <span key={i} className="px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-primary font-black text-xs flex items-center gap-1.5 shadow-sm">
                                                            <User className="w-3 h-3" />
                                                            @{m}
                                                            <button onClick={() => setInvitedMembers(invitedMembers.filter((_, idx) => idx !== i))} className="hover:text-red-500 ml-1">
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => handleJoin(true)}
                                            disabled={joining || !teamName}
                                            className="w-full px-6 py-4 rounded-xl bg-primary hover:bg-blue-600 disabled:opacity-50 text-white font-black uppercase text-xs tracking-widest shadow-sm transition-all"
                                        >
                                            {joining ? "Joining..." : `Join as ${teamName}`}
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={() => handleJoin(false)}
                                disabled={joining}
                                className="w-full px-6 py-4 rounded-xl bg-primary hover:bg-blue-600 hover:text-white disabled:opacity-50 text-blue-500 font-black uppercase text-xs tracking-widest shadow-sm transition-all cursor-pointer"
                            >
                                {joining ? "Joining..." : "Join Event"}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
