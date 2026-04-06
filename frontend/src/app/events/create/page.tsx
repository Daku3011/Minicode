"use client";

import { useState } from "react";
import { 
    ChevronLeft, Send, Calendar, Users, Trophy, FileText, 
    Zap, Target, Layers, Lock, Plus, Trash2, ChevronRight, 
    Clock, Star, Loader2, AlertCircle, Megaphone, ShieldCheck
} from "lucide-react";
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
        <div className="min-h-[calc(100vh-64px)] bg-[#05050a] text-white font-black relative overflow-x-hidden p-6 md:p-12">
            {/* Minimal Background Geometry */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.02]" />
                <div className="absolute top-1/4 -left-20 w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-[160px]" />
            </div>
            
            <div className="relative z-10 max-w-5xl mx-auto space-y-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                    <div className="space-y-4">
                        <Link href="/faculty/profile" className="inline-flex items-center gap-2 text-slate-600 hover:text-white transition-colors text-[10px] uppercase tracking-[0.4em] mb-4">
                            <ChevronLeft className="w-4 h-4" />
                            Return
                        </Link>
                        <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-none">Event <br/> Constructor</h1>
                        <p className="text-slate-500 text-sm tracking-tight uppercase">Orchestrate large-scale challenges and collaborative projects</p>
                    </div>
                    <button
                        onClick={handlePublish}
                        disabled={isPublishing || !formData.title || !formData.description}
                        className="h-20 px-12 rounded-[1.75rem] bg-white text-black text-xl font-black italic flex items-center justify-center gap-3 hover:bg-slate-200 transition-all shadow-2xl disabled:opacity-50"
                    >
                        {isPublishing ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                SYNCING
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                PUBLISH
                            </>
                        )}
                    </button>
                </div>

                {showSuccess && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[2.5rem] flex items-center gap-6 text-emerald-400">
                        <Zap className="w-8 h-8" />
                        <span className="text-lg font-black uppercase tracking-tight italic">Synchronization successful. Redirecting...</span>
                    </div>
                )}

                <div className="space-y-12">
                    {/* Event Category */}
                    <div className="bg-white/[0.01] border border-white/5 rounded-[3.5rem] p-10 md:p-14 relative overflow-hidden backdrop-blur-md">
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                        <h3 className="text-2xl font-black text-white mb-10 flex items-center gap-4 italic uppercase">
                            <Layers className="w-7 h-7 text-primary" />
                            Protocol category
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {eventTypes.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setFormData({ ...formData, event_type: type.id })}
                                    className={clsx(
                                        "relative p-8 rounded-[2rem] border transition-all text-left group",
                                        formData.event_type === type.id
                                            ? "border-primary bg-primary/10 shadow-2xl scale-[1.02]"
                                            : "border-white/5 bg-white/[0.02] hover:border-white/10"
                                    )}
                                >
                                    <div className={clsx(
                                        "w-14 h-14 rounded-2xl bg-gradient-to-br mb-6 flex items-center justify-center text-white shadow-xl",
                                        type.color,
                                        type.glow
                                    )}>
                                        {type.icon}
                                    </div>
                                    <h4 className="font-black text-xl text-white mb-2 uppercase tracking-tighter italic">{type.label}</h4>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-tight leading-relaxed">{type.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Operational Details */}
                    <div className="bg-white/[0.01] border border-white/5 rounded-[3.5rem] p-10 md:p-14 relative overflow-hidden backdrop-blur-md">
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                        <h3 className="text-2xl font-black text-white flex items-center gap-4 mb-12 italic uppercase">
                            <FileText className="w-7 h-7 text-blue-400" />
                            Mission Parameters
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-6 gap-10">
                            <div className="md:col-span-4 space-y-4">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] ml-2">Protocol Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-white font-black placeholder-slate-500 focus:outline-none focus:border-primary transition-colors text-xl uppercase tracking-tighter"
                                    placeholder="DESIGNATE OPERATION"
                                />
                            </div>

                            <div className="md:col-span-2 space-y-4">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] ml-2">Subject Vector</label>
                                <select
                                    value={formData.difficulty}
                                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                    className="w-full h-[76px] bg-white/5 border border-white/10 rounded-2xl px-8 text-white font-black appearance-none focus:outline-none focus:border-primary transition-colors cursor-pointer uppercase tracking-tighter text-lg"
                                >
                                    <option value="" className="bg-[#05050a]">UNCLASSIFIED</option>
                                    {subjects.map((s) => (
                                        <option key={s} value={s} className="bg-[#05050a]">{s.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-6 space-y-4">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] ml-2">Mission Briefing *</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={8}
                                    className="w-full bg-white/5 border border-white/10 rounded-3xl px-10 py-10 text-slate-400 font-bold text-lg leading-relaxed focus:outline-none focus:border-primary placeholder-slate-500 resize-none transition-colors"
                                    placeholder="DEFINE OBJECTIVES, CONSTRAINTS, AND ENGAGEMENT VECTORS..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Temporal & Participation */}
                    <div className="bg-white/[0.01] border border-white/5 rounded-[3.5rem] p-10 md:p-14 relative overflow-hidden backdrop-blur-md">
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                        <h3 className="text-2xl font-black text-white flex items-center gap-4 mb-12 italic uppercase">
                            <Clock className="w-7 h-7 text-emerald-400" />
                            Temporal Constraints
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] ml-2">Initiation Timestamp</label>
                                <input
                                    type="datetime-local"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-white font-black focus:outline-none focus:border-emerald-500 transition-colors uppercase custom-datetime-input"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] ml-2">Termination Timestamp</label>
                                <input
                                    type="datetime-local"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-white font-black focus:outline-none focus:border-emerald-500 transition-colors uppercase custom-datetime-input"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] ml-2">Participation Cap</label>
                                <div className="relative group">
                                    <Users className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-800" />
                                    <input
                                        type="number"
                                        value={formData.max_participants}
                                        onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-8 py-6 text-white font-black focus:outline-none focus:border-emerald-500 transition-colors text-xl"
                                        placeholder="UNLIMITED"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] ml-2">Incentive Vector</label>
                                <div className="relative group">
                                    <Star className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-800" />
                                    <input
                                        type="text"
                                        value={formData.prize_description}
                                        onChange={(e) => setFormData({ ...formData, prize_description: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-8 py-6 text-white font-black focus:outline-none focus:border-emerald-500 transition-colors text-xl uppercase tracking-tighter"
                                        placeholder="REWARD DESIGNATION"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Authorization Clearance */}
                    <div className="bg-white/[0.01] border border-white/5 rounded-[3.5rem] p-10 md:p-14 relative overflow-hidden backdrop-blur-md">
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
                        <h3 className="text-2xl font-black text-white flex items-center gap-4 mb-10 italic uppercase">
                            <Lock className="w-7 h-7 text-amber-400" />
                            Clearance Logic
                        </h3>

                        <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
                            {levels.map((level) => (
                                <button
                                    key={level.level}
                                    onClick={() => setFormData({ ...formData, min_level: level.level })}
                                    className={clsx(
                                        "p-8 rounded-[2rem] border text-center transition-all flex flex-col items-center justify-center gap-3",
                                        formData.min_level === level.level
                                            ? "border-amber-500 bg-amber-500/10 shadow-2xl scale-[1.05]"
                                            : "border-white/5 bg-white/[0.02] hover:border-white/10"
                                    )}
                                >
                                    <div className={clsx(
                                        "text-5xl font-black italic",
                                        formData.min_level === level.level ? "text-white" : "text-slate-900"
                                    )}>{level.level}</div>
                                    <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none">{level.name.split(' ')[1]}</div>
                                </button>
                            ))}
                        </div>

                        {formData.min_level > 1 && (
                            <div className="mt-10 p-8 bg-amber-500/5 border border-amber-500/10 rounded-3xl flex items-center gap-6">
                                <AlertCircle className="w-8 h-8 text-amber-500 shrink-0" />
                                <p className="text-sm text-amber-500 font-black uppercase tracking-tight leading-relaxed">
                                    Restricted Access: Only candidates with <span className="text-white underline underline-offset-8">Level {formData.min_level}</span> clearance may interface with this protocol.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Final Actions */}
                    <div className="flex flex-col md:flex-row items-center justify-between p-12 bg-white/[0.02] border border-white/5 rounded-[4rem] gap-10">
                        <div className="flex items-center gap-8">
                             <div className="size-20 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center shadow-2xl">
                                <Trophy className="w-10 h-10 text-primary" />
                             </div>
                             <div>
                                <h4 className="text-2xl font-black text-white uppercase tracking-tighter italic">Mainframe Sync</h4>
                                <p className="text-slate-600 font-black text-[10px] uppercase tracking-widest">Protocol activation ready</p>
                             </div>
                        </div>
                        <div className="flex items-center gap-8">
                            <Link href="/faculty/profile" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 hover:text-white transition-colors">
                                SCRUB CONFIG
                            </Link>
                            <button
                                onClick={handlePublish}
                                disabled={isPublishing || !formData.title || !formData.description}
                                className="h-20 px-16 bg-white text-black rounded-[1.75rem] text-xl font-black uppercase italic hover:bg-slate-200 transition-all shadow-2xl disabled:opacity-50"
                            >
                                {isPublishing ? "TRANSMITTING" : "OPEN OPS"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-datetime-input::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                    opacity: 0.2;
                    cursor: pointer;
                }
                .custom-datetime-input::-webkit-calendar-picker-indicator:hover {
                    opacity: 1;
                }
            `}</style>
        </div>
    );
}
