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
        <div className="min-h-[calc(100vh-64px)] bg-slate-50 text-slate-900 font-display relative overflow-x-hidden">
            {/* Minimalist Grid Pattern Only */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
                <div className="absolute inset-0 bg-[url('/grid.svg')]" />
            </div>

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        {/* <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-wider">Event Control</span>
                        </div> */}
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Event Management</h1>
                        <p className="text-slate-500 mt-2">Manage your events and hackathons with zero latency.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/events/create"
                            className="bg-gray-500/30 text-black hover:bg-blue-600 hover:text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2.5 transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" /> New Event
                        </Link>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search events..."
                            className="w-full bg-white border border-blue-200 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all shadow-sm",
                            showFilters ? "bg-blue-50 border-blue-200 text-primary" : "bg-white border-blue-200 text-slate-600 hover:text-slate-900"
                        )}
                    >
                        <Filter className="w-4 h-4" /> Filters
                    </button>
                </div>

                {showFilters && (
                    <div className="bg-white border border-blue-100 rounded-2xl p-6 mb-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Filter System</h3>
                            <button onClick={() => { setSelectedType(""); setSelectedStatus(""); }} className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-2 font-bold transition-colors">
                                <X className="w-3.5 h-3.5" /> Clear Filters
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block">Event Category</label>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setSelectedType("")} className={clsx("px-4 py-2 rounded-xl text-xs font-bold border transition-all shadow-sm", !selectedType ? "bg-blue-50 border-blue-200 text-primary" : "bg-white border-blue-100 text-slate-600 hover:text-slate-900")}>All Types</button>
                                    {EVENT_TYPES.map((t) => (
                                        <button key={t.id} onClick={() => setSelectedType(t.id)} className={clsx("px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 shadow-sm", selectedType === t.id ? "bg-blue-50 border-blue-200 text-primary" : "bg-white border-blue-100 text-slate-600 hover:text-slate-900")}>
                                            <span className="text-sm leading-none">{t.icon}</span> {t.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block">Current Status</label>
                                <div className="flex flex-wrap gap-2">
                                    {STATUSES.map((s) => (
                                        <button key={s.value} onClick={() => setSelectedStatus(s.value)} className={clsx("px-4 py-2 rounded-xl text-xs font-bold border transition-all shadow-sm", selectedStatus === s.value ? "bg-blue-50 border-blue-200 text-primary" : "bg-white border-blue-100 text-slate-600 hover:text-slate-900")}>{s.label}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Events Table Container */}
                <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-blue-100">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 whitespace-nowrap">Event Identity</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 whitespace-nowrap">Category Tag</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 whitespace-nowrap">Progress Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 whitespace-nowrap">Cohort Size</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 whitespace-nowrap">Timeline</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 whitespace-nowrap text-right">System Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-50">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center"><Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" /></td></tr>
                                ) : filteredEvents.length > 0 ? (
                                    filteredEvents.map((event) => (
                                        <tr key={event.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <p className="text-slate-900 font-bold text-base group-hover:text-primary transition-colors">{event.title}</p>
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1.5">{formatDate(event.created_at)}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={clsx("px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider ring-1", getEventTypeInfo(event.event_type).color.replace('border-', 'ring-'))}>
                                                    {getEventTypeInfo(event.event_type).name}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={clsx(
                                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ring-1",
                                                    event.status === "active" ? "bg-green-500/10 text-green-400 ring-green-500/20" :
                                                        event.status === "completed" ? "bg-slate-500/10 text-slate-400 ring-slate-500/20" :
                                                            event.status === "cancelled" ? "bg-red-500/10 text-red-400 ring-red-500/20" :
                                                                "bg-slate-500/10 text-slate-400 ring-slate-500/20"
                                                )}>
                                                    {event.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-sm font-black text-slate-400 flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-slate-700" />
                                                    {event.current_participants}{event.max_participants ? <span className="text-slate-700">/</span> : ""}{event.max_participants || ""}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3 text-slate-600">
                                                    <Clock className="w-4 h-4 text-slate-400" />
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 tracking-tight">{formatDate(event.start_date)}</p>
                                                        {event.end_date && <p className="text-[10px] text-slate-500 font-black uppercase mt-0.5">{getTimeRemaining(event.end_date)}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link
                                                        href={`/faculty/events/${event.id}`}
                                                        className="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                        title="Manage Participants"
                                                    >
                                                        <Users className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => startEdit(event)}
                                                        className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <Link
                                                        href={`/events/${event.id}`}
                                                        className="p-2 text-slate-500 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all"
                                                        title="View"
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteConfirm(event.id)}
                                                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
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
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-600">
                                            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                            <p className="text-sm">No events found</p>
                                            <Link href="/events/create" className="text-primary hover:underline text-xs mt-2 inline-block font-bold">
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            onClick={() => setEditingEvent(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <div
                            className="bg-white border border-blue-100 p-10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar relative z-10 shadow-xl"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <div className="space-y-1">
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Modify Parameters</h3>
                                    <p className="text-slate-500 text-sm font-medium">Updating event descriptor for {editingEvent?.title}</p>
                                </div>
                                <button onClick={() => setEditingEvent(null)} className="p-3 rounded-2xl bg-white border border-blue-100 text-slate-400 hover:text-slate-900 hover:bg-blue-50 transition-all">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">Event Designation</label>
                                    <input
                                        type="text"
                                        value={editForm.title}
                                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                        className="w-full bg-white border border-blue-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-400"
                                        placeholder="Enter descriptive title..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">Classification</label>
                                        <select
                                            value={editForm.event_type}
                                            onChange={(e) => setEditForm({ ...editForm, event_type: e.target.value })}
                                            className="w-full bg-white border border-blue-200 rounded-2xl px-6 py-4 text-slate-900 font-black appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                                        >
                                            {EVENT_TYPES.map((t) => (
                                                <option key={t.id} value={t.id} className="bg-white text-slate-900">{t.icon} {t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">Current Visibility</label>
                                        <select
                                            value={editForm.status}
                                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                            className="w-full bg-white border border-blue-200 rounded-2xl px-6 py-4 text-slate-900 font-black appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                                        >
                                            {STATUSES.filter(s => s.value).map((s) => (
                                                <option key={s.value} value={s.value} className="bg-white text-slate-900">{s.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">Deployment Date</label>
                                        <input
                                            type="datetime-local"
                                            value={editForm.start_date}
                                            onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                                            className="w-full bg-white border border-blue-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">Termination Sequence</label>
                                        <input
                                            type="datetime-local"
                                            value={editForm.end_date}
                                            onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                                            className="w-full bg-white border border-blue-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">Mission Intelligence</label>
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        rows={4}
                                        className="w-full bg-white border border-blue-200 rounded-2xl px-6 py-4 text-slate-900 font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none leading-relaxed"
                                        placeholder="Specify mission objectives..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">Cohort Maximum</label>
                                        <input
                                            type="number"
                                            value={editForm.max_participants}
                                            onChange={(e) => setEditForm({ ...editForm, max_participants: e.target.value })}
                                            className="w-full bg-white border border-blue-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                            placeholder="Unlimited"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">Achievement Reward</label>
                                        <input
                                            type="text"
                                            value={editForm.prize_description}
                                            onChange={(e) => setEditForm({ ...editForm, prize_description: e.target.value })}
                                            className="w-full bg-white border border-blue-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                            placeholder="e.g. 500 Credits"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 justify-center pt-6">
                                    <button
                                        onClick={() => setEditingEvent(null)}
                                        className="px-8 py-3 rounded-2xl bg-white border border-black-100 text-slate-500 hover:text-red-500 transition-all text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-red-500/20"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        onClick={saveEdit}
                                        disabled={saving}
                                        className="bg-primary text-blue-500 hover:bg-blue-600 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all disabled:opacity-90 border border-blue-400 cursor-pointer hover:text-white"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                        {saving ? "Processing..." : "Commit Changes"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation */}
                {deleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            onClick={() => setDeleteConfirm(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <div
                            className="bg-white border border-blue-100 p-10 rounded-3xl w-full max-w-md relative z-10 shadow-2xl text-center"
                        >
                            <div className="size-20 rounded-3xl bg-red-50 flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-10 h-10 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2 uppercase">Cancel Event?</h3>
                            <p className="text-slate-500 font-medium mb-10 text-sm">This will immediately terminate the event and notify all joined participants.</p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-8 py-3 rounded-2xl bg-white border border-blue-100 text-slate-500 hover:text-slate-900 text-xs font-black uppercase tracking-widest transition-colors duration-75"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={() => deleteConfirm && deleteEvent(deleteConfirm)}
                                    className="flex-1 px-8 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest transition-colors duration-75 shadow-md shadow-red-200"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
