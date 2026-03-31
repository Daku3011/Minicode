"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Search, Filter, X, BookOpen, ChevronRight, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

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

const SUBJECTS = [
    { id: "data-structures", name: "Data Structures", icon: "🌳" },
    { id: "algorithms", name: "Algorithms", icon: "⚙️" },
    { id: "dp", name: "Dynamic Programming", icon: "📊" },
    { id: "graphs", name: "Graph Theory", icon: "🔗" },
    { id: "math", name: "Mathematics", icon: "🔢" },
    { id: "strings", name: "String Processing", icon: "📝" },
    { id: "number-theory", name: "Number Theory", icon: "🔐" },
    { id: "combinatorics", name: "Combinatorics", icon: "🎲" },
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
    const [editForm, setEditForm] = useState({ title: "", difficulty: "", subject: "", level: 1, description: "" });
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [problemsRes, usersRes] = await Promise.all([
                api.get("/faculty/problems"),
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
        <div className="min-h-[calc(100vh-64px)] bg-[#0f0a1e]">
            <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white mb-2">Problem Management</h1>
                        <p className="text-slate-400">Create, edit, and manage coding challenges</p>
                    </div>
                    <Link
                        href="/problems/create"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-purple-500/20"
                    >
                        <Plus className="w-4 h-4" /> New Problem
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
                            placeholder="Search problems..."
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
                            <h3 className="text-sm font-bold text-white">Filter Problems</h3>
                            <button onClick={() => { setSelectedDifficulty(""); setSelectedLevel(""); }} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                                <X className="w-3 h-3" /> Clear
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-400 mb-2 block">Difficulty</label>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setSelectedDifficulty("")} className={clsx("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all", !selectedDifficulty ? "bg-purple-500/20 border-purple-500/30 text-purple-400" : "bg-white/5 border-white/10 text-slate-400")}>All</button>
                                    {["Easy", "Medium", "Hard"].map((d) => (
                                        <button key={d} onClick={() => setSelectedDifficulty(d)} className={clsx("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all", selectedDifficulty === d ? "bg-purple-500/20 border-purple-500/30 text-purple-400" : "bg-white/5 border-white/10 text-slate-400")}>{d}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-400 mb-2 block">Level</label>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setSelectedLevel("")} className={clsx("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all", !selectedLevel ? "bg-purple-500/20 border-purple-500/30 text-purple-400" : "bg-white/5 border-white/10 text-slate-400")}>All</button>
                                    {LEVELS.map((l) => (
                                        <button key={l.level} onClick={() => setSelectedLevel(String(l.level))} className={clsx("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all", selectedLevel === String(l.level) ? "bg-purple-500/20 border-purple-500/30 text-purple-400" : "bg-white/5 border-white/10 text-slate-400")}>Lvl {l.level}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Problems Table */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Problem</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Subject</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Difficulty</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Level</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Author</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">XP</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {loading ? (
                                    <tr><td colSpan={7} className="px-6 py-12 text-center"><Loader2 className="w-6 h-6 text-purple-500 animate-spin mx-auto" /></td></tr>
                                ) : filteredProblems.length > 0 ? (
                                    filteredProblems.map((problem) => (
                                        <tr key={problem.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-white font-medium">{problem.title}</p>
                                                <p className="text-xs text-slate-500 mt-1">{new Date(problem.created_at).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-300">{getSubjectInfo(problem.subject).icon} {getSubjectInfo(problem.subject).name}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={clsx(
                                                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                                                    problem.difficulty === "Easy" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                                    problem.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                    "bg-red-500/10 text-red-400 border-red-500/20"
                                                )}>
                                                    {problem.difficulty}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={clsx(
                                                    "px-1 py-0.5 rounded text-[10px] font-bold uppercase border",
                                                    LEVELS.find(l => l.level === problem.level)?.color || "bg-slate-200/10 text-slate-400 border-slate-500/20"
                                                )}>
                                                    Lvl- {problem.level}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-300">{getAuthorName(problem.author_id)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-purple-400">{problem.xp_reward} XP</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => startEdit(problem)}
                                                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <Link
                                                        href={`/problems/${problem.id}`}
                                                        className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all"
                                                        title="View"
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteConfirm(problem.id)}
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
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-50" />
                                            <p>No problems found</p>
                                            <Link href="/problems/create" className="text-purple-400 hover:underline text-sm mt-2 inline-block">
                                                Create your first problem
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Edit Modal */}
                {editingProblem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-[#1a142e] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">Edit Problem</h3>
                                <button onClick={() => setEditingProblem(null)} className="text-slate-400 hover:text-white">
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
                                        <label className="text-sm font-medium text-slate-400 mb-1 block">Difficulty</label>
                                        <select
                                            value={editForm.difficulty}
                                            onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        >
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-400 mb-1 block">Level</label>
                                        <select
                                            value={editForm.level}
                                            onChange={(e) => setEditForm({ ...editForm, level: parseInt(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        >
                                            {LEVELS.map((l) => (
                                                <option key={l.level} value={l.level}>Level {l.level}: {l.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-400 mb-1 block">Subject</label>
                                    <select
                                        value={editForm.subject}
                                        onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    >
                                        <option value="">Not Set</option>
                                        {SUBJECTS.map((s) => (
                                            <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-400 mb-1 block">Description</label>
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        rows={4}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                                    />
                                </div>
                                <div className="flex gap-3 justify-end pt-2">
                                    <button
                                        onClick={() => setEditingProblem(null)}
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
                                    <h3 className="text-lg font-bold text-white">Delete Problem?</h3>
                                    <p className="text-sm text-slate-400">This action cannot be undone.</p>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-all text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => deleteProblem(deleteConfirm)}
                                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all text-sm font-medium"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
