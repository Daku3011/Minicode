"use client";

import { useState } from "react";
import { ChevronLeft, Save, Send, Calendar, Users, Trophy, FileText, Zap, Target, Layers, Lock, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import api from "@/lib/api";

const eventTypes = [
    { 
        id: "weekly_challenge", 
        label: "Weekly Challenge", 
        icon: <Zap className="w-5 h-5" />,
        description: "Individual coding challenges with leaderboard rankings",
        color: "from-purple-500 to-indigo-500"
    },
    { 
        id: "team_project", 
        label: "Team Project", 
        icon: <Users className="w-5 h-5" />,
        description: "Collaborative projects for groups of students",
        color: "from-blue-500 to-cyan-500"
    },
    { 
        id: "announcement", 
        label: "Announcement", 
        icon: <Target className="w-5 h-5" />,
        description: "Important updates, deadlines, and notifications",
        color: "from-amber-500 to-orange-500"
    }
];

const levels = [
    { level: 1, name: "Code Beginner", minXP: 0 },
    { level: 2, name: "Code Explorer", minXP: 100 },
    { level: 3, name: "Code Ninja", minXP: 300 },
    { level: 4, name: "Code Warrior", minXP: 600 },
    { level: 5, name: "Code Master", minXP: 1000 },
    { level: 6, name: "Code Legend", minXP: 1500 },
];

const subjects = [
    "Data Structures",
    "Algorithms",
    "Dynamic Programming",
    "Graph Theory",
    "Mathematics",
    "String Processing",
    "Number Theory",
    "Combinatorics",
    "Geometry",
    "Game Theory"
];

export default function CreateEventPage() {
    const router = useRouter();
    const [isPublishing, setIsPublishing] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        event_type: "weekly_challenge",
        difficulty: "",
        start_date: new Date().toISOString().slice(0, 16),
        end_date: "",
        max_participants: "",
        prize_description: "",
        rules: "",
        min_level: 1,
        associated_problems: [] as number[],
    });
    const [showSuccess, setShowSuccess] = useState(false);

    const handlePublish = async () => {
        if (!formData.title || !formData.description) {
            alert("Please fill in the required fields");
            return;
        }

        setIsPublishing(true);
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                event_type: formData.event_type,
                difficulty: formData.difficulty || null,
                start_date: new Date(formData.start_date).toISOString(),
                end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
                max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
                prize_description: formData.prize_description || null,
                rules: formData.rules || null,
            };

            await api.post("/events", payload);
            setShowSuccess(true);
            setTimeout(() => {
                router.push("/faculty/profile");
            }, 1500);
        } catch (error) {
            console.error("Failed to create event:", error);
            alert("Failed to create event. Please try again.");
        } finally {
            setIsPublishing(false);
        }
    };

    const selectedType = eventTypes.find(t => t.id === formData.event_type);
    const selectedLevel = levels.find(l => l.level === formData.min_level);

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#0f0a1e]">
            {/* Background */}
            <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <Link href="/faculty/profile" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Faculty Dashboard
                </Link>

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white mb-2">Create New Event</h1>
                        <p className="text-slate-400">Set up challenges, projects, or announcements for your students</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-5 py-2.5 rounded-xl font-bold bg-white/5 text-white hover:bg-white/10 transition-all border border-white/10">
                            <Save className="w-4 h-4 inline mr-2" />
                            Save Draft
                        </button>
                        <button
                            onClick={handlePublish}
                            disabled={isPublishing || !formData.title || !formData.description}
                            className="px-5 py-2.5 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white transition-all flex items-center gap-2"
                        >
                            {isPublishing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Publish Event
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Success Message */}
                {showSuccess && (
                    <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 text-center font-bold">
                        Event created successfully! Redirecting...
                    </div>
                )}

                <div className="space-y-8">
                    {/* Event Type Selection */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-purple-400" />
                            Event Type
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {eventTypes.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setFormData({ ...formData, event_type: type.id })}
                                    className={clsx(
                                        "p-4 rounded-xl border-2 transition-all text-left",
                                        formData.event_type === type.id
                                            ? "border-purple-500 bg-purple-500/10"
                                            : "border-white/10 bg-white/5 hover:border-white/20"
                                    )}
                                >
                                    <div className={clsx(
                                        "w-10 h-10 rounded-lg bg-gradient-to-br mb-3 flex items-center justify-center text-white",
                                        type.color
                                    )}>
                                        {type.icon}
                                    </div>
                                    <h4 className="font-bold text-white mb-1">{type.label}</h4>
                                    <p className="text-xs text-slate-400">{type.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-400" />
                            Basic Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-slate-400">Event Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    placeholder="e.g., Weekly Challenge #42: Two Sum"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Difficulty</label>
                                <select
                                    value={formData.difficulty}
                                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 hover:bg-white/10 transition-all cursor-pointer"
                                >
                                    <option value="">Any Level</option>
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Subject</label>
                                <select
                                    value={formData.difficulty}
                                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 hover:bg-white/10 transition-all cursor-pointer"
                                >
                                    <option value="">Any Subject</option>
                                    {subjects.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-slate-400">Description *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={5}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-mono text-sm"
                                    placeholder="Describe the event, objectives, and requirements..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Schedule & Participation */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-green-400" />
                            Schedule & Participation
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Start Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">End Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Max Participants</label>
                                <input
                                    type="number"
                                    value={formData.max_participants}
                                    onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    placeholder="Leave empty for unlimited"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Prize Description</label>
                                <input
                                    type="text"
                                    value={formData.prize_description}
                                    onChange={(e) => setFormData({ ...formData, prize_description: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    placeholder="e.g., 500 XP + Badge"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Level Unlock */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Lock className="w-5 h-5 text-amber-400" />
                            Level Unlock Requirement
                        </h3>
                        <p className="text-sm text-slate-400">
                            Students must reach this level to participate in this event.
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            {levels.map((level) => (
                                <button
                                    key={level.level}
                                    onClick={() => setFormData({ ...formData, min_level: level.level })}
                                    className={clsx(
                                        "p-3 rounded-xl border-2 text-center transition-all",
                                        formData.min_level === level.level
                                            ? "border-amber-500 bg-amber-500/10"
                                            : "border-white/10 bg-white/5 hover:border-white/20"
                                    )}
                                >
                                    <div className="text-2xl font-black text-white mb-1">{level.level}</div>
                                    <div className="text-xs text-slate-400">{level.name}</div>
                                    <div className="text-[10px] text-amber-400 mt-1">{level.minXP}+ XP</div>
                                </button>
                            ))}
                        </div>

                        {formData.min_level > 1 && (
                            <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                <Lock className="w-5 h-5 text-amber-400" />
                                <p className="text-sm text-amber-200">
                                    Only students at <span className="font-bold">{selectedLevel?.name}</span> (Level {formData.min_level}) or higher can participate.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Rules */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-6">
                        <h3 className="text-lg font-bold text-white">Event Rules & Guidelines</h3>
                        <textarea
                            value={formData.rules}
                            onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                            rows={6}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-mono text-sm"
                            placeholder="List the rules, scoring criteria, and any specific requirements..."
                        />
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-8 flex items-center justify-end gap-4">
                    <Link href="/faculty/profile" className="px-6 py-3 rounded-xl font-bold bg-white/5 text-white hover:bg-white/10 transition-all border border-white/10">
                        Cancel
                    </Link>
                    <button
                        onClick={handlePublish}
                        disabled={isPublishing || !formData.title || !formData.description}
                        className="px-8 py-3 rounded-xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white transition-all shadow-lg shadow-purple-500/20"
                    >
                        {isPublishing ? "Creating Event..." : "Create Event"}
                    </button>
                </div>
            </div>
        </div>
    );
}
