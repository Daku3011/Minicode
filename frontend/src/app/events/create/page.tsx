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
import { motion, AnimatePresence } from "framer-motion";
import MagneticWrapper from "@/components/MagneticWrapper";

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
            }, 1500);
        } catch (error) {
            console.error("Failed to create event:", error);
            alert("Failed to create event. Please try again.");
        } finally {
            setIsPublishing(false);
        }
    };

    const selectedLevel = levels.find(l => l.level === formData.min_level);

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0f] text-slate-100 font-display relative overflow-x-hidden">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/grid.svg')] opacity-5" />
            </div>
            
            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
                >
                    <div>
                        <Link href="/faculty/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest mb-4 group">
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Return to Command
                        </Link>
                        <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">Event Constructor</h1>
                        <p className="text-slate-500 font-medium tracking-wide">Orchestrate large-scale challenges and collaborative projects</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <MagneticWrapper>
                            <button
                                onClick={handlePublish}
                                disabled={isPublishing || !formData.title || !formData.description}
                                className="premium-btn px-8 py-3 rounded-xl font-black text-sm flex items-center gap-2.5 transition-all shadow-xl shadow-purple-500/20 disabled:opacity-50"
                            >
                                {isPublishing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        SYNCING...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        PUBLISH PROTOCOL
                                    </>
                                )}
                            </button>
                        </MagneticWrapper>
                    </div>
                </motion.div>

                <AnimatePresence>
                    {showSuccess && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="glass-card border-emerald-500/30 mb-8 p-6 flex items-center gap-4 text-emerald-400 font-black"
                        >
                            <div className="size-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <Zap className="w-5 h-5" />
                            </div>
                            Success: Event synchronized with the mainframe. Redirecting...
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-10">
                    {/* Event Category Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card relative overflow-hidden group"
                    >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500/40 group-hover:bg-purple-500 transition-colors" />
                        <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                <Layers className="w-5 h-5 text-purple-400" />
                            </div>
                            Protocol category
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {eventTypes.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setFormData({ ...formData, event_type: type.id })}
                                    className={clsx(
                                        "relative group/btn p-6 rounded-3xl border-2 transition-all transition-all duration-300 text-left overflow-hidden",
                                        formData.event_type === type.id
                                            ? "border-purple-500/50 bg-purple-500/5 shadow-2xl scale-105"
                                            : "border-white/5 bg-white/[0.02] hover:border-white/10"
                                    )}
                                >
                                    <div className={clsx(
                                        "w-12 h-12 rounded-2xl bg-gradient-to-br mb-4 flex items-center justify-center text-white shadow-lg",
                                        type.color,
                                        type.glow
                                    )}>
                                        {type.icon}
                                    </div>
                                    <h4 className="font-black text-lg text-white mb-2 uppercase tracking-tight">{type.label}</h4>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{type.description}</p>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Operational Details Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card space-y-8 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                            <FileText className="w-48 h-48 text-white" />
                        </div>
                        <h3 className="text-xl font-black text-white flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                <FileText className="w-5 h-5 text-blue-400" />
                            </div>
                            Core Operational Data
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
                            <div className="md:col-span-4 space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">Protocol Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white font-black placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all shadow-inner"
                                    placeholder="e.g., Quantum Supremacy Sprint #4"
                                />
                            </div>

                            <div className="md:col-span-2 space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">Target Subject</label>
                                <select
                                    value={formData.difficulty}
                                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white font-black appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all cursor-pointer shadow-inner"
                                >
                                    <option value="" className="bg-[#0a0a0f]">Unclassified</option>
                                    {subjects.map((s) => (
                                        <option key={s} value={s} className="bg-[#0a0a0f]">{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-6 space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">Mission Briefing *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={6}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-8 text-slate-300 font-medium text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500/20 placeholder-slate-700 resize-none shadow-inner"
                                    placeholder="Define the event objectives, constraints, and operational guidelines..."
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Temporal & Participation Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card space-y-8 relative overflow-hidden"
                    >
                        <h3 className="text-xl font-black text-white flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <Clock className="w-5 h-5 text-emerald-400" />
                            </div>
                            Temporal Constraints
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">Initiation Timestamp</label>
                                <input
                                    type="datetime-local"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white font-black focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all custom-datetime-input"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">Termination Timestamp</label>
                                <input
                                    type="datetime-local"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white font-black focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all custom-datetime-input"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">Participation Cap</label>
                                <div className="relative group">
                                    <Users className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-emerald-400 transition-colors" />
                                    <input
                                        type="number"
                                        value={formData.max_participants}
                                        onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white font-black focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-inner"
                                        placeholder="Unlimited"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">Incentive Vector</label>
                                <div className="relative group">
                                    <Star className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-amber-400 transition-colors" />
                                    <input
                                        type="text"
                                        value={formData.prize_description}
                                        onChange={(e) => setFormData({ ...formData, prize_description: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white font-black focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-inner"
                                        placeholder="e.g., 500 XP + Rare Badge"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Level Lock Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card relative overflow-hidden"
                    >
                        <h3 className="text-xl font-black text-white flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <Lock className="w-5 h-5 text-amber-400" />
                            </div>
                            Authorization Clearance
                        </h3>
                        <p className="text-sm text-slate-500 font-bold mb-8">Minimum candidate level required for initiation</p>

                        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                            {levels.map((level) => (
                                <button
                                    key={level.level}
                                    onClick={() => setFormData({ ...formData, min_level: level.level })}
                                    className={clsx(
                                        "p-6 rounded-3xl border-2 text-center transition-all group flex flex-col items-center justify-center gap-2",
                                        formData.min_level === level.level
                                            ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10 scale-105"
                                            : "border-white/5 bg-white/[0.02] hover:border-white/20"
                                    )}
                                >
                                    <div className={clsx(
                                        "text-4xl font-black transition-colors",
                                        formData.min_level === level.level ? "text-white" : "text-slate-700"
                                    )}>{level.level}</div>
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-tight">{level.name}</div>
                                    <div className="text-[10px] font-black text-amber-500/40">{level.minXP}+ XP</div>
                                </button>
                            ))}
                        </div>

                        {formData.min_level > 1 && (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="mt-8 flex items-center gap-4 p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl"
                            >
                                <AlertCircle className="w-6 h-6 text-amber-500" />
                                <p className="text-sm text-amber-400/80 font-bold">
                                    Restricted Access: Only candidates with <span className="text-white underline decoration-amber-500/50 underline-offset-4">{selectedLevel?.name}</span> clearance (Level {formData.min_level}) may interface with this protocol.
                                </p>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Operational Protocols (Rules) */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="glass-card space-y-6"
                    >
                         <h3 className="text-xl font-black text-white flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-slate-500/10 border border-slate-500/20">
                                <Target className="w-5 h-5 text-slate-400" />
                            </div>
                            Safety & Engagement Protocols (Rules)
                        </h3>
                        <textarea
                            value={formData.rules}
                            onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                            rows={8}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-8 text-slate-300 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500/20 placeholder-slate-800 resize-none shadow-inner"
                            placeholder="Enforce mandatory engagement rules, scoring vectors, and operational constraints..."
                        />
                    </motion.div>

                    {/* Final Actions */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col md:flex-row items-center justify-between p-10 bg-white/[0.02] border border-white/10 rounded-[32px] gap-8"
                    >
                        <div className="flex items-center gap-4">
                             <div className="size-16 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-lg">
                                <Trophy className="w-8 h-8 text-purple-400" />
                             </div>
                             <div>
                                <h4 className="text-xl font-black text-white uppercase tracking-tight">Mainframe Synchronization</h4>
                                <p className="text-slate-500 font-bold text-sm">Event data will be broadcast to all matching candidate nodes</p>
                             </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <Link href="/faculty/dashboard" className="px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-all">
                                SCRUB CONFIG
                            </Link>
                            <MagneticWrapper>
                                <button
                                    onClick={handlePublish}
                                    disabled={isPublishing || !formData.title || !formData.description}
                                    className="px-12 py-4 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl hover:shadow-white/40 disabled:opacity-50"
                                >
                                    {isPublishing ? "TRANSMITTING..." : "OPEN OPS CHANNEL"}
                                </button>
                            </MagneticWrapper>
                        </div>
                    </motion.div>
                </div>
            </div>

            <style jsx global>{`
                .custom-datetime-input::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                    opacity: 0.3;
                    cursor: pointer;
                }
                .custom-datetime-input::-webkit-calendar-picker-indicator:hover {
                    opacity: 1;
                }
            `}</style>
        </div>
    );
}
