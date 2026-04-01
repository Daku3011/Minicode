"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Search, Filter, X, Calendar, ChevronRight, Loader2, CheckCircle, AlertCircle, Users, Clock } from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Event {
    id: number;
    title: string;
    description: string;
    event_type: string;
    difficulty: string | null;
    subject: string | null;
    start_date: string;
    end_date: string | null;
    max_participants: number | null;
    current_participants: number;
    prize_description: string | null;
    rules: string | null;
    status: string;
    author_name: string;
    created_at: string;
    is_joined: boolean;
}

const EVENT_TYPES = [
    { id: "weekly_challenge", name: "Weekly Challenge", icon: "⚡", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
    { id: "team_project", name: "Team Project", icon: "👥", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    { id: "announcement", name: "Announcement", icon: "📢", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
];

const STATUSES = [
    { value: "", label: "All Statuses" },
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

export default function FacultyEventsPage() {
    const { user } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [editForm, setEditForm] = useState({ title: "", description: "", event_type: "", difficulty: "", subject: "", start_date: "", end_date: "", max_participants: "", prize_description: "", rules: "", status: "" });
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [eventsRes] = await Promise.all([
                api.get("/events/faculty/my-events"),
            ]);
            setEvents(eventsRes.data);
        } catch (error) {
            console.error("Failed to fetch events:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEvents = events.filter((e) => {
        const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = !selectedType || e.event_type === selectedType;
        const matchesStatus = !selectedStatus || e.status === selectedStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    const startEdit = (event: Event) => {
        setEditingEvent(event);
        setEditForm({
            title: event.title,
            description: event.description,
            event_type: event.event_type,
            difficulty: event.difficulty || "",
            subject: event.subject || "",
            start_date: event.start_date.slice(0, 16),
            end_date: event.end_date ? event.end_date.slice(0, 16) : "",
            max_participants: event.max_participants?.toString() || "",
            prize_description: event.prize_description || "",
            rules: event.rules || "",
            status: event.status,
        });
    };

    const saveEdit = async () => {
        if (!editingEvent) return;
        setSaving(true);
        try {
            await api.put(`/events/${editingEvent.id}`, {
                ...editForm,
                max_participants: editForm.max_participants ? parseInt(editForm.max_participants) : null,
            });
            setEditingEvent(null);
            fetchData();
        } catch (error) {
            console.error("Failed to update event:", error);
            alert("Failed to update event");
        } finally {
            setSaving(false);
        }
    };

    const deleteEvent = async (id: number) => {
        try {
            await api.delete(`/events/${id}`);
            setDeleteConfirm(null);
            fetchData();
        } catch (error) {
            console.error("Failed to delete event:", error);
            alert("Failed to delete event");
        }
    };

    const getEventTypeInfo = (type: string) => {
        return EVENT_TYPES.find(t => t.id === type) || EVENT_TYPES[2];
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const getTimeRemaining = (endDate: string | null) => {
        if (!endDate) return "No deadline";
        const end = new Date(endDate);
        const now = new Date();
        const diff = end.getTime() - now.getTime();
        if (diff <= 0) return "Ended";
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        return `${days}d remaining`;
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#0f0a1e]">
            <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white mb-2">Event Management</h1>
                        <p className="text-slate-400">Create, edit, and manage events, challenges, and projects</p>
                    </div>
                    <Link
                        href="/events/create"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-purple-500/20"
                    >
                        <Plus className="w-4 h-4" /> New Event
                    </Link>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search events..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                            showFilters ? "bg-purple-500/20 border-purple-500/30 text-purple-400" : "bg-white/5 border-white/10 text-slate-400"
                        )}
                    >
                        <Filter className="w-4 h-4" /> Filters
                    </button>
                </div>

                {showFilters && (
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white">Filter Events</h3>
                            <button onClick={() => { setSelectedType(""); setSelectedStatus(""); }} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                                <X className="w-3 h-3" /> Clear
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-400 mb-2 block">Event Type</label>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setSelectedType("")} className={clsx("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all", !selectedType ? "bg-purple-500/20 border-purple-500/30 text-purple-400" : "bg-white/5 border-white/10 text-slate-400")}>All</button>
                                    {EVENT_TYPES.map((t) => (
                                        <button key={t.id} onClick={() => setSelectedType(t.id)} className={clsx("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all", selectedType === t.id ? "bg-purple-500/20 border-purple-500/30 text-purple-400" : "bg-white/5 border-white/10 text-slate-400")}>{t.icon} {t.name}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-400 mb-2 block">Status</label>
                                <div className="flex flex-wrap gap-2">
                                    {STATUSES.map((s) => (
                                        <button key={s.value} onClick={() => setSelectedStatus(s.value)} className={clsx("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all", selectedStatus === s.value ? "bg-purple-500/20 border-purple-500/30 text-purple-400" : "bg-white/5 border-white/10 text-slate-400")}>{s.label}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Events Table */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Event</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Participants</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Dates</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center"><Loader2 className="w-6 h-6 text-purple-500 animate-spin mx-auto" /></td></tr>
                                ) : filteredEvents.length > 0 ? (
                                    filteredEvents.map((event) => (
                                        <tr key={event.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-white font-medium">{event.title}</p>
                                                <p className="text-xs text-slate-500 mt-1">{formatDate(event.created_at)}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold uppercase border", getEventTypeInfo(event.event_type).color)}>
                                                    {getEventTypeInfo(event.event_type).name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={clsx(
                                                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                                                    event.status === "active" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                                    event.status === "completed" ? "bg-slate-500/10 text-slate-400 border-slate-500/20" :
                                                    event.status === "cancelled" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                                    "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                                )}>
                                                    {event.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-300 flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {event.current_participants}{event.max_participants ? `/${event.max_participants}` : ""}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-300">{formatDate(event.start_date)}</p>
                                                {event.end_date && <p className="text-xs text-slate-500">to {formatDate(event.end_date)}</p>}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/faculty/events/${event.id}`}
                                                        className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all"
                                                        title="Manage Participants"
                                                    >
                                                        <Users className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => startEdit(event)}
                                                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <Link
                                                        href={`/events/${event.id}`}
                                                        className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all"
                                                        title="View"
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteConfirm(event.id)}
                                                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-50" />
                                            <p>No events found</p>
                                            <Link href="/events/create" className="text-purple-400 hover:underline text-sm mt-2 inline-block">
                                                Create your first event
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Edit Modal */}
                {editingEvent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-[#1a142e] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">Edit Event</h3>
                                <button onClick={() => setEditingEvent(null)} className="text-slate-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-400 mb-1 block">Title</label>
                                    <input
                                        type="text"
                                        value={editForm.title}
                                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-400 mb-1 block">Type</label>
                                        <select
                                            value={editForm.event_type}
                                            onChange={(e) => setEditForm({ ...editForm, event_type: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        >
                                            {EVENT_TYPES.map((t) => (
                                                <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-400 mb-1 block">Status</label>
                                        <select
                                            value={editForm.status}
                                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        >
                                            {STATUSES.filter(s => s.value).map((s) => (
                                                <option key={s.value} value={s.value}>{s.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-400 mb-1 block">Start Date</label>
                                        <input
                                            type="datetime-local"
                                            value={editForm.start_date}
                                            onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-400 mb-1 block">End Date</label>
                                        <input
                                            type="datetime-local"
                                            value={editForm.end_date}
                                            onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-400 mb-1 block">Description</label>
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        rows={3}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-400 mb-1 block">Max Participants</label>
                                        <input
                                            type="number"
                                            value={editForm.max_participants}
                                            onChange={(e) => setEditForm({ ...editForm, max_participants: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-400 mb-1 block">Prize Description</label>
                                        <input
                                            type="text"
                                            value={editForm.prize_description}
                                            onChange={(e) => setEditForm({ ...editForm, prize_description: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end pt-2">
                                    <button
                                        onClick={() => setEditingEvent(null)}
                                        className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-all text-sm font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={saveEdit}
                                        disabled={saving}
                                        className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white transition-all text-sm font-medium flex items-center gap-2"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                        {saving ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation */}
                {deleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-[#1a142e] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Cancel Event?</h3>
                                    <p className="text-sm text-slate-400">This will mark the event as cancelled.</p>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-all text-sm font-medium"
                                >
                                    Keep
                                </button>
                                <button
                                    onClick={() => deleteEvent(deleteConfirm)}
                                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all text-sm font-medium"
                                >
                                    Cancel Event
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
