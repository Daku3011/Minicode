"use client";

import { useState } from "react";
import { 
    ChevronLeft, Send, Calendar, Users, Trophy, FileText, 
    Zap, Target, Layers, Lock, Plus, Trash2, ChevronRight, 
    Clock, Star, Loader2, AlertCircle, Megaphone, ShieldCheck, Eye, PenLine
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import api from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const eventTypes = [
    { 
        id: "weekly_challenge", 
        label: "Weekly Challenge", 
        icon: <Zap className="w-5 h-5" />,
        description: "Individual coding challenges with leaderboard rankings",
        color: "from-purple-500 to-indigo-500",
        glow: "shadow-purple-500/20"
    },
    { 
        id: "team_project", 
        label: "Team Project", 
        icon: <Users className="w-5 h-5" />,
        description: "Collaborative projects for groups of students",
        color: "from-blue-500 to-cyan-500",
        glow: "shadow-blue-500/20"
    },
    { 
        id: "announcement", 
        label: "Announcement", 
        icon: <Target className="w-5 h-5" />,
        description: "Important updates, deadlines, and notifications",
        color: "from-amber-500 to-orange-500",
        glow: "shadow-amber-500/20"
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
    const [previewMode, setPreviewMode] = useState(false);
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
                prize_description: formData.prize_description,
                rules: formData.rules,
            };

            await api.post("/events", payload);
            setShowSuccess(true);
            setTimeout(() => {
                router.push("/faculty/events");
            }, 1000);
        } catch (error) {
            console.error("Failed to create event:", error);
            alert("Failed to create event. Please try again.");
        } finally {
            setIsPublishing(false);
        }
    };

    const selectedLevel = levels.find(l => l.level === formData.min_level);

    return (
        <div className="min-h-[calc(100vh-64px)] bg-slate-50 text-slate-900 font-display relative overflow-x-hidden p-4 md:p-8">
            {/* Minimal Background Geometry */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.03]" />
            </div>
            
            <div className="relative z-10 max-w-5xl mx-auto space-y-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                    <div className="space-y-2">
                        <Link href="/faculty/profile" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-[10px] uppercase tracking-[0.2em] mb-2 font-black">
                            <ChevronLeft className="w-4 h-4" />
                            Return
                        </Link>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">Event<br/>Constructor</h1>
                        <p className="text-slate-500 text-sm tracking-tight font-medium">Orchestrate large-scale challenges and collaborative projects</p>
                    </div>
                    {/* <button
                        onClick={handlePublish}
                        disabled={isPublishing || !formData.title || !formData.description}
                        className="py-4 px-8 rounded-xl bg-gray-500/30 text-white text-base font-black flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-sm disabled:opacity-50"
                    >
                        {isPublishing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                SYNCING
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                PUBLISH
                            </>
                        )}
                    </button> */}
                </div>

                {showSuccess && (
                    <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex items-center gap-4 text-emerald-600 shadow-sm">
                        <Zap className="w-6 h-6" />
                        <span className="text-sm font-black uppercase tracking-tight">Synchronization successful. Redirecting...</span>
                    </div>
                )}

                <div className="space-y-8">
                    {/* Event Category */}
                    <div className="bg-white border border-blue-100 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
                        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3 uppercase">
                            <Layers className="w-5 h-5 text-primary" />
                            Protocol category
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {eventTypes.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setFormData({ ...formData, event_type: type.id })}
                                    className={clsx(
                                        "relative p-6 rounded-2xl border transition-all text-left shadow-sm",
                                        formData.event_type === type.id
                                            ? "border-blue-300 bg-blue-50/50 ring-1 ring-blue-300"
                                            : "border-blue-100 bg-white hover:border-blue-200"
                                    )}
                                >
                                    <div className={clsx(
                                        "w-10 h-10 rounded-xl bg-gradient-to-br mb-4 flex items-center justify-center text-white shadow-sm",
                                        type.color,
                                        type.glow
                                    )}>
                                        {type.icon}
                                    </div>
                                    <h4 className="font-black text-base text-slate-900 mb-1 uppercase tracking-tight">{type.label}</h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight leading-relaxed">{type.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Operational Details */}
                    <div className="bg-white border border-blue-100 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-3 mb-8 uppercase">
                            <FileText className="w-5 h-5 text-blue-500" />
                            Mission Parameters
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                            <div className="md:col-span-4 space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Protocol Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-white border border-blue-200 rounded-xl px-5 py-3 text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm shadow-sm"
                                    placeholder="Designate operation"
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Subject Vector</label>
                                <select
                                    value={formData.difficulty}
                                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                    className="w-full bg-white border border-blue-200 rounded-xl px-5 py-3 text-slate-900 font-bold appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer text-sm shadow-sm"
                                >
                                    <option value="" className="bg-white">UNCLASSIFIED</option>
                                    {subjects.map((s) => (
                                        <option key={s} value={s} className="bg-white">{s.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-6 space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Mission Briefing *</label>
                                    <div className="flex rounded-lg border border-blue-200 overflow-hidden shadow-sm">
                                        <button
                                            onClick={() => setPreviewMode(false)}
                                            className={clsx("px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5", !previewMode ? "bg-blue-100 text-primary" : "bg-white text-slate-500 hover:bg-blue-50")}
                                        >
                                            <PenLine className="w-3 h-3" /> Editor
                                        </button>
                                        <button
                                            onClick={() => setPreviewMode(true)}
                                            className={clsx("px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5", previewMode ? "bg-blue-100 text-primary" : "bg-white text-slate-500 hover:bg-blue-50")}
                                        >
                                            <Eye className="w-3 h-3" /> Preview
                                        </button>
                                    </div>
                                </div>
                                {previewMode ? (
                                    <div className="min-h-[160px] bg-white border border-blue-200 rounded-xl px-5 py-4 overflow-auto">
                                        {formData.description ? (
                                            <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-headings:text-slate-900 prose-headings:font-black prose-strong:text-blue-600 prose-code:text-blue-600 prose-code:bg-blue-50 prose-pre:bg-slate-900 prose-pre:text-white prose-pre:rounded-xl">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{formData.description}</ReactMarkdown>
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-300 py-10 space-y-2">
                                                <FileText className="w-8 h-8 opacity-30" />
                                                <p className="text-xs font-bold uppercase tracking-[0.2em]">No content to preview</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <textarea
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={4}
                                        className="w-full bg-white border border-blue-200 rounded-xl px-5 py-4 text-slate-700 font-medium text-sm leading-relaxed focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:slate-400 resize-none transition-all shadow-sm"
                                        placeholder="Define objectives, constraints, and engagement vectors... (Markdown supported)"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Temporal & Participation */}
                    <div className="bg-white border border-blue-100 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-3 mb-8 uppercase">
                            <Clock className="w-5 h-5 text-emerald-500" />
                            Temporal Constraints
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Initiation Timestamp</label>
                                <input
                                    type="datetime-local"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full bg-white border border-blue-200 rounded-xl px-5 py-3 text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm shadow-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Termination Timestamp</label>
                                <input
                                    type="datetime-local"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full bg-white border border-blue-200 rounded-xl px-5 py-3 text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm shadow-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Participation Cap</label>
                                <div className="relative group">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="number"
                                        value={formData.max_participants}
                                        onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                                        className="w-full bg-white border border-blue-200 rounded-xl pl-12 pr-5 py-3 text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm shadow-sm placeholder:text-slate-400"
                                        placeholder="Unlimited"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Incentive Vector</label>
                                <div className="relative group">
                                    <Star className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.prize_description}
                                        onChange={(e) => setFormData({ ...formData, prize_description: e.target.value })}
                                        className="w-full bg-white border border-blue-200 rounded-xl pl-12 pr-5 py-3 text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm shadow-sm placeholder:text-slate-400"
                                        placeholder="Reward designation"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Authorization Clearance */}
                    <div className="bg-white border border-blue-100 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-3 mb-6 uppercase">
                            <Lock className="w-5 h-5 text-amber-500" />
                            Clearance Logic
                        </h3>

                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                            {levels.map((level) => (
                                <button
                                    key={level.level}
                                    onClick={() => setFormData({ ...formData, min_level: level.level })}
                                    className={clsx(
                                        "p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 shadow-sm",
                                        formData.min_level === level.level
                                            ? "border-amber-300 bg-amber-50 shadow-sm"
                                            : "border-blue-100 bg-white hover:border-blue-200"
                                    )}
                                >
                                    <div className={clsx(
                                        "text-2xl font-black",
                                        formData.min_level === level.level ? "text-amber-600" : "text-slate-400"
                                    )}>{level.level}</div>
                                    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none">{level.name.split(' ')[1]}</div>
                                </button>
                            ))}
                        </div>

                        {formData.min_level > 1 && (
                            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 shadow-sm">
                                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                                <p className="text-xs text-amber-700 font-bold uppercase tracking-tight leading-snug">
                                    Restricted Access: Only candidates with <span className="underline underline-offset-4 decoration-current">Level {formData.min_level}</span> clearance may interface with this protocol.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Final Actions */}
                    <div className="flex flex-col md:flex-row items-center justify-between p-6 md:p-8 bg-white border border-blue-100 rounded-3xl gap-6 shadow-sm">
                        <div className="flex items-center gap-4">
                             <div className="size-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
                                <Trophy className="w-6 h-6 text-primary" />
                             </div>
                             <div>
                                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Mainframe Sync</h4>
                                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Protocol activation ready</p>
                             </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handlePublish}
                                disabled={isPublishing || !formData.title || !formData.description}
                                className="py-4 px-8 bg-gray-500/30 text-black rounded-xl text-sm font-black uppercase hover:bg-blue-600 transition-all shadow-sm disabled:opacity-90 border border-gray-500/30 hover:text-white cursor-pointer"
                            >
                                {isPublishing ? "TRANSMITTING" : "OPEN EVENT"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-datetime-input::-webkit-calendar-picker-indicator {
                    opacity: 0.5;
                    cursor: pointer;
                }
                .custom-datetime-input::-webkit-calendar-picker-indicator:hover {
                    opacity: 1;
                }
            `}</style>
        </div>
    );
}
