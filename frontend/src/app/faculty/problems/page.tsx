"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Search, Filter, X, BookOpen, ChevronRight, Loader2, CheckCircle, AlertCircle, Bell, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { SUBJECT_CATEGORIES, SUBJECTS } from "@/constants/subjects";

interface Problem {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    subject: string | null;
    level: number;
    xp_reward: number;
    author_id: number | null;
    created_at: string;
    visibility: string;
}

interface User {
    id: number;
    username: string;
    full_name: string | null;
}

const LEVELS = [
    { level: 1, name: "Beginner", color: "text-green-400 bg-green-500/10 border-green-500/20" },
    { level: 2, name: "Explorer", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    { level: 3, name: "Ninja", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
    { level: 4, name: "Warrior", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
    { level: 5, name: "Master", color: "text-red-400 bg-red-500/10 border-red-500/20" },
    { level: 6, name: "Legend", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
];

export default function FacultyProblemsPage() {
    const { user } = useAuth();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [users, setUsers] = useState<Record<number, User>>({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("");
    const [selectedLevel, setSelectedLevel] = useState("");
    const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
    const [editForm, setEditForm] = useState({ title: "", difficulty: "", subject: "", level: 1, description: "", visibility: "public" });
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchData();

        const handleOpenNews = () => {
            // BroadcastAlert handles its own visibility via the event
        };

        window.addEventListener('minicode:openNews', handleOpenNews);
        return () => window.removeEventListener('minicode:openNews', handleOpenNews);
    }, []);

    const fetchData = async () => {
        try {
            const [problemsRes, usersRes] = await Promise.all([
                api.get("/problems"),
                api.get("/admin/users").catch(() => ({ data: [] })),
            ]);
            setProblems(problemsRes.data);
            const userMap: Record<number, User> = {};
            usersRes.data.forEach((u: User) => { userMap[u.id] = u; });
            setUsers(userMap);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProblems = problems.filter((p) => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDifficulty = !selectedDifficulty || p.difficulty === selectedDifficulty;
        const matchesLevel = !selectedLevel || p.level === parseInt(selectedLevel);
        return matchesSearch && matchesDifficulty && matchesLevel;
    });

    const startEdit = (problem: Problem) => {
        setEditingProblem(problem);
        setEditForm({
            title: problem.title,
            difficulty: problem.difficulty,
            subject: problem.subject || "",
            level: problem.level,
            description: problem.description,
            visibility: problem.visibility || "public",
        });
    };

    const saveEdit = async () => {
        if (!editingProblem) return;
        setSaving(true);
        try {
            await api.put(`/problems/${editingProblem.id}`, editForm);
            setEditingProblem(null);
            fetchData();
        } catch (error) {
            console.error("Failed to update problem:", error);
            alert("Failed to update problem");
        } finally {
            setSaving(false);
        }
    };

    const deleteProblem = async (id: number) => {
        try {
            await api.delete(`/problems/${id}`);
            setDeleteConfirm(null);
            fetchData();
        } catch (error) {
            console.error("Failed to delete problem:", error);
            alert("Failed to delete problem");
        }
    };

    const getSubjectInfo = (id: string | null) => {
        return SUBJECTS.find((s) => s.id === id) || { name: "Not Set", icon: "📋" };
    };

    const getAuthorName = (authorId: number | null) => {
        if (!authorId) return "Unknown";
        const u = users[authorId];
        return u?.full_name || u?.username || "Unknown";
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">

            <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-px w-8 bg-blue-600" />
                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Command Center</span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight leading-none">Problem <span className="text-slate-400">Registry</span></h1>
                        <p className="text-slate-500 text-lg font-medium opacity-80">Architect and oversee the matrix of logical challenges</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/problems/create"
                            className="premium-btn px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-primary/20"
                        >
                            <Plus className="w-5 h-5" />
                            New Problem
                        </Link>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Identify specific records..."
                            className="w-full bg-white border border-blue-200 rounded-2xl pl-12 pr-6 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all text-lg font-medium"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={clsx(
                            "flex items-center p-5 gap-3 px-8 h-full rounded-2xl border text-sm font-black uppercase tracking-wider transition-all",
                            showFilters ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-blue-200 text-slate-500 hover:text-slate-900 hover:bg-blue-50"
                        )}
                    >
                        <Filter className="w-4 h-4" />
                        <span>Logic Filter</span>
                    </button>
                </div>

                {showFilters && (
                    <div className="overflow-hidden mb-8">
                        <div className="bg-white border border-blue-100 rounded-3xl p-8 space-y-8 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                        <Filter className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">Refine Operations</h3>
                                </div>
                                <button onClick={() => { setSelectedDifficulty(""); setSelectedLevel(""); }} className="text-xs font-black text-slate-500 hover:text-rose-500 flex items-center gap-2 transition-colors uppercase tracking-[0.2em]">
                                    <X className="w-4 h-4" /> Reset Identity
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 block">Intensity Level</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        <button onClick={() => setSelectedDifficulty("")} className={clsx("py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all", !selectedDifficulty ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white border-slate-200 text-slate-500 hover:border-blue-200")}  >All</button>
                                        {["Easy", "Medium", "Hard"].map((d) => (
                                            <button key={d} onClick={() => setSelectedDifficulty(d)} className={clsx("py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all", selectedDifficulty === d ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white border-slate-200 text-slate-500 hover:border-blue-200")}>{d}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 block">Access Clearance</label>
                                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                                        <button onClick={() => setSelectedLevel("")} className={clsx("py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all", !selectedLevel ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white border-slate-200 text-slate-500 hover:border-blue-200")}>All</button>
                                        {LEVELS.map((l) => (
                                            <button key={l.level} onClick={() => setSelectedLevel(String(l.level))} className={clsx("py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all", selectedLevel === String(l.level) ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white border-slate-200 text-slate-500 hover:border-blue-200")}>{l.level}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Problems Table */}
                <div className="bg-white border border-blue-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-blue-100 bg-blue-50 relative">
                                    <th className="px-10 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Identity &amp; Origin</th>
                                    <th className="px-6 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Logic Core</th>
                                    <th className="px-6 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Intensity</th>
                                    <th className="px-6 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Clearance</th>
                                    <th className="px-6 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Value</th>
                                    <th className="px-10 py-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Protocols</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-50">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-10 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Synchronizing Data Streams...</span>
                                        </div>
                                    </td></tr>
                                ) : filteredProblems.length > 0 ? (
                                    filteredProblems.map((problem, idx) => (
                                        <tr key={problem.id} className="hover:bg-blue-50/50 transition-colors group/row">
                                            <td className="px-10 py-8">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-900 font-black text-lg tracking-tight group-hover/row:text-blue-600 transition-colors">{problem.title}</span>
                                                        {problem.visibility === "private" && (
                                                            <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-500 border border-rose-500/20">Classified</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">{new Date(problem.created_at).toLocaleDateString()}</span>
                                                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{getAuthorName(problem.author_id)}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-8">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl grayscale group-hover/row:grayscale-0 transition-all">{getSubjectInfo(problem.subject).icon}</span>
                                                    <span className="text-sm font-black text-slate-500 uppercase tracking-tighter">{getSubjectInfo(problem.subject).name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-8">
                                                <span className={clsx(
                                                    "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                                    problem.difficulty === "Easy" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                                        problem.difficulty === "Medium" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                            "bg-rose-50 text-rose-700 border-rose-200"
                                                )}>
                                                    {problem.difficulty}
                                                </span>
                                            </td>
                                            <td className="px-6 py-8">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[10px] font-black text-blue-700">
                                                        {problem.level}
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Level</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-8">
                                                <span className="text-lg font-black text-slate-900 tabular-nums tracking-tight">
                                                    <span className="text-blue-600 mr-1">+</span>{problem.xp_reward}
                                                    <span className="text-[9px] text-slate-400 ml-1 uppercase">XP</span>
                                                </span>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="inline-flex items-center justify-end gap-2 rounded-2xl border border-blue-100 bg-blue-50/50 px-2 py-1.5 opacity-70 group-hover/row:opacity-100 transition-all duration-300">
                                                    <button
                                                        onClick={() => startEdit(problem)}
                                                        className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all border border-transparent hover:border-blue-100"
                                                        aria-label="Reconfigure"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <Link
                                                        href={`/problems/${problem.id}`}
                                                        className="p-3 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all border border-transparent hover:border-emerald-100"
                                                        aria-label="Inspect"
                                                    >
                                                        <ChevronRight className="w-5 h-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteConfirm(problem.id)}
                                                        className="p-3 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all border border-transparent hover:border-rose-500/20"
                                                        aria-label="Decommission"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-10 py-32 text-center">
                                            <div className="flex flex-col items-center gap-6 opacity-50">
                                                <BookOpen className="w-16 h-16 text-blue-300" />
                                                <div className="space-y-1">
                                                    <p className="text-xl font-black text-slate-700 uppercase tracking-wider">Registry Void</p>
                                                    <p className="text-sm text-slate-400 font-medium">No logical challenges detected in this sector</p>
                                                </div>
                                                {/* <Link href="/problems/create" className="premium-btn py-4 px-8 mt-4">
                                                    Forge First Entry
                                                </Link> */}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Edit Modal */}
                {editingProblem && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div
                            onClick={() => setEditingProblem(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-md"
                        />
                        <div className="bg-white border border-blue-100 rounded-[3rem] p-10 w-full max-w-2xl relative z-10 shadow-2xl">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                                        <Edit className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Reconfigure Problem</h3>
                                        <p className="text-slate-400 text-sm font-medium">Updating logic sector: {editingProblem?.id}</p>
                                    </div>
                                </div>
                                <button onClick={() => setEditingProblem(null)} className="p-3 text-slate-400 hover:text-slate-900 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Display Alias</label>
                                    <input
                                        type="text"
                                        value={editForm.title}
                                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                        className="w-full bg-slate-50 border border-blue-200 rounded-2xl px-6 py-4 text-slate-900 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                                        placeholder="Enter problem title..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Logic Tier</label>
                                        <select
                                            value={editForm.difficulty}
                                            onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                                            className="w-full bg-slate-50 border border-blue-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none"
                                        >
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Access Level</label>
                                        <select
                                            value={editForm.level}
                                            onChange={(e) => setEditForm({ ...editForm, level: parseInt(e.target.value) })}
                                            className="w-full bg-slate-50 border border-blue-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none"
                                        >
                                            {LEVELS.map((l) => (
                                                <option key={l.level} value={l.level}>Lvl {l.level}: {l.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Access Control (Visibility)</label>
                                    <select
                                        value={editForm.visibility}
                                        onChange={(e) => setEditForm({ ...editForm, visibility: e.target.value })}
                                        className="w-full bg-slate-50 border border-blue-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none"
                                    >
                                        <option value="public">Public Domain (Visible to all)</option>
                                        <option value="private">Classified (Restricted to cohorts)</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Domain Sector</label>
                                    <select
                                        value={editForm.subject}
                                        onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                                        className="w-full bg-slate-50 border border-blue-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none"
                                    >
                                        <option value="">Not Set</option>
                                        {SUBJECTS.map((s) => (
                                            <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Problem Schematics</label>
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        rows={6}
                                        className="w-full bg-slate-50 border border-blue-200 rounded-2xl px-6 py-4 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none leading-relaxed"
                                        placeholder="Define technical requirements..."
                                    />
                                </div>
                                <div className="flex gap-4 justify-end pt-6">
                                    <button
                                        onClick={() => setEditingProblem(null)}
                                        className="px-8 py-4 rounded-2xl bg-slate-100 text-slate-500 hover:text-slate-900 transition-all text-sm font-black uppercase tracking-widest"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        onClick={saveEdit}
                                        disabled={saving}
                                        className="premium-btn py-4 px-10 rounded-2xl disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                        <span>{saving ? "Commiting..." : "Confirm Protocol"}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation */}
                {deleteConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div
                            onClick={() => setDeleteConfirm(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-md"
                        />
                        <div className="bg-white border border-rose-200 rounded-[2.5rem] p-10 w-full max-w-md relative z-10 shadow-2xl">
                            <div className="flex flex-col items-center text-center">
                                <div className="h-20 w-20 rounded-full bg-rose-500/10 flex items-center justify-center mb-6">
                                    <AlertCircle className="w-10 h-10 text-rose-500" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Decommission Entry?</h3>
                                <p className="text-slate-500 font-medium mb-10 leading-relaxed">This action will permanently erase the logical challenge from the registry. This is irreversible.</p>

                                <div className="flex flex-col w-full gap-3">
                                    <button
                                        onClick={() => deleteConfirm && deleteProblem(deleteConfirm)}
                                        className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white transition-all text-sm font-black uppercase tracking-[0.2em] shadow-lg shadow-rose-900/20"
                                    >
                                        Confirm Deletion
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(null)}
                                        className="w-full py-4 rounded-2xl bg-slate-100 text-slate-500 hover:text-slate-900 transition-all text-sm font-black uppercase tracking-[0.2em]"
                                    >
                                        Abort Operation
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
