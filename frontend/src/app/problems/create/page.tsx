"use client";

import { useState, useRef } from "react";
import { 
    ChevronLeft, Save, Send, Plus, Trash2, Sparkles, BookOpen, 
    Tag, Lock, Loader2, FileText, Code2, Eye, PenLine, 
    ChevronRight, Target, AlertCircle 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import api from "@/lib/api";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from "framer-motion";
import MagneticWrapper from "@/components/MagneticWrapper";
import BroadcastAlert from "@/components/BroadcastAlert";

const subjects = [
    { id: "data-structures", name: "Data Structures", icon: "🌳" },
    { id: "algorithms", name: "Algorithms", icon: "⚙️" },
    { id: "dp", name: "Dynamic Programming", icon: "📊" },
    { id: "graphs", name: "Graph Theory", icon: "🔗" },
    { id: "math", name: "Mathematics", icon: "🔢" },
    { id: "strings", name: "String Processing", icon: "📝" },
    { id: "number-theory", name: "Number Theory", icon: "🔐" },
    { id: "combinatorics", name: "Combinatorics", icon: "🎲" },
    { id: "geometry", name: "Geometry", icon: "📐" },
    { id: "game-theory", name: "Game Theory", icon: "🎮" },
    { id: "blockchain", name: "Blockchain & Smart Contracts", icon: "⛓️" },
];

const levels = [
    { level: 1, name: "Code Beginner", minXP: 0 },
    { level: 2, name: "Code Explorer", minXP: 100 },
    { level: 3, name: "Code Ninja", minXP: 300 },
    { level: 4, name: "Code Warrior", minXP: 600 },
    { level: 5, name: "Code Master", minXP: 1000 },
    { level: 6, name: "Code Legend", minXP: 1500 },
];

export default function CreateProblemPage() {
    const router = useRouter();
    const [isPublishing, setIsPublishing] = useState(false);
    const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
    const [formData, setFormData] = useState({
        title: "",
        difficulty: "Easy",
        subject: "algorithms",
        level: 1,
        description: "",
    });
    const [showSuccess, setShowSuccess] = useState(false);

    const handlePublish = async () => {
        if (!formData.title || !formData.description) {
            alert("Please fill in the required fields");
            return;
        }

        setIsPublishing(true);
        try {
            await api.post("/problems", formData);
            setShowSuccess(true);
            setTimeout(() => {
                router.push("/faculty/problems");
            }, 1500);
        } catch (error) {
            console.error("Failed to create problem:", error);
            alert("Failed to create problem. Please try again.");
        } finally {
            setIsPublishing(false);
        }
    };

    const selectedSubject = subjects.find(s => s.id === formData.subject);
    const selectedLevel = levels.find(l => l.level === formData.level);

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0f] text-slate-100 font-display relative overflow-x-hidden">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/grid.svg')] opacity-5" />
            </div>
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
                >
                    <div className="space-y-4">
                        <Link href="/faculty/problems" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest group">
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Return to Registry
                        </Link>
                        <h1 className="text-5xl font-black text-white tracking-tight leading-none">C-LEVEL CHALLENGE <span className="text-primary">FORGE</span></h1>
                        <p className="text-slate-500 text-lg font-medium tracking-wide">Architecting the next generation of logical barriers</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl">
                            <button 
                                onClick={() => setActiveTab('editor')}
                                className={clsx(
                                    "flex items-center gap-2.5 px-6 py-2.5 rounded-xl transition-all font-black text-xs uppercase tracking-widest",
                                    activeTab === 'editor' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                <PenLine className="w-4 h-4" />
                                Constructor
                            </button>
                            <button 
                                onClick={() => setActiveTab('preview')}
                                className={clsx(
                                    "flex items-center gap-2.5 px-6 py-2.5 rounded-xl transition-all font-black text-xs uppercase tracking-widest",
                                    activeTab === 'preview' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                <Eye className="w-4 h-4" />
                                Render
                            </button>
                        </div>
                        <MagneticWrapper>
                            <button
                                onClick={handlePublish}
                                disabled={isPublishing || !formData.title || !formData.description}
                                className="premium-btn px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-2xl hover:shadow-primary/30 disabled:opacity-50"
                            >
                                {isPublishing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        SYNCING...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        DECODE & FORGE
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
                            className="glass-card mb-12 p-8 border-emerald-500/30 flex items-center gap-6 text-emerald-400 font-black tracking-wide"
                        >
                            <div className="size-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-lg uppercase tracking-widest">Protocol Accepted</p>
                                <p className="text-emerald-500/60 font-bold">Challenge has been integrated into the global matrix. Redirecting...</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Column: Form Content */}
                    <div className="lg:col-span-8 space-y-10">
                        {activeTab === 'editor' ? (
                            <>
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-card p-10 space-y-10 relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                        <Code2 className="w-48 h-48 text-white" />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block ml-1">Challenge Designation *</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] px-8 py-6 text-2xl font-black text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder-slate-800"
                                            placeholder="IDENTIFIER: TWO_SUM_OPTIMIZED"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between ml-1">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Logical Schematics (Markdown) *</label>
                                            <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">GFM Protocol Enabled</span>
                                        </div>
                                        <div className="relative group">
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows={15}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] p-10 text-slate-300 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder-slate-900 resize-none"
                                                placeholder="# MISSION OBJECTIVE: Determine the sum of..."
                                            />
                                            <div className="absolute bottom-6 right-6 opacity-20 pointer-events-none font-mono text-[10px] text-white">READY_FOR_INPUT</div>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                            <Save className="w-5 h-5 text-primary" />
                                        </div>
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Auto-save buffer active</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <button className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 font-black text-[10px] uppercase tracking-widest transition-all">Clear Memory</button>
                                        <button className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest transition-all">Import Schema</button>
                                    </div>
                                </motion.div>
                            </>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="glass-card p-12 min-h-[600px] prose prose-invert prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none"
                            >
                                {formData.description ? (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{formData.description}</ReactMarkdown>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-700 py-24">
                                        <FileText className="w-16 h-16 mb-6 opacity-20" />
                                        <p className="text-xl font-black uppercase tracking-widest opacity-20">No data generated for rendering</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column: Sidebar Attributes */}
                    <div className="lg:col-span-4 space-y-10">
                        {/* Subject Selection */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-card p-8 space-y-8"
                        >
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-primary" />
                                Field Intelligence
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                {subjects.map((sub) => (
                                    <button
                                        key={sub.id}
                                        onClick={() => setFormData({ ...formData, subject: sub.id })}
                                        className={clsx(
                                            "flex items-center justify-between p-4 rounded-2xl border-2 transition-all group/sub",
                                            formData.subject === sub.id
                                                ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                                                : "border-white/5 bg-white/5 hover:border-white/10"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-2xl group-hover/sub:scale-110 transition-transform">{sub.icon}</span>
                                            <span className={clsx(
                                                "font-black text-xs uppercase tracking-wider",
                                                formData.subject === sub.id ? "text-white" : "text-slate-500"
                                            )}>{sub.name}</span>
                                        </div>
                                        {formData.subject === sub.id && (
                                            <div className="size-2 rounded-full bg-primary shadow-[0_0_10px_rgba(137,91,245,0.8)]" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Intensity Configuration */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-card p-8 space-y-8"
                        >
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary" />
                                Operational Intensity
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                                {["Easy", "Medium", "Hard"].map((diff) => (
                                    <button
                                        key={diff}
                                        onClick={() => setFormData({ ...formData, difficulty: diff })}
                                        className={clsx(
                                            "py-4 rounded-2xl border-2 transition-all font-black text-[10px] uppercase tracking-[0.2em]",
                                            formData.difficulty === diff
                                                ? (diff === "Easy" ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" :
                                                   diff === "Medium" ? "border-amber-500 bg-amber-500/10 text-amber-400" :
                                                   "border-rose-500 bg-rose-500/10 text-rose-400")
                                                : "border-white/5 bg-white/5 text-slate-600 hover:border-white/10 hover:text-slate-400"
                                        )}
                                    >
                                        {diff}
                                    </button>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-white/5 space-y-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Candidate Access Level</p>
                                    <span className="text-primary font-black text-xs">LVL {formData.level}</span>
                                </div>
                                <div className="grid grid-cols-6 gap-2">
                                    {levels.map((lvl) => (
                                        <button
                                            key={lvl.level}
                                            onClick={() => setFormData({ ...formData, level: lvl.level })}
                                            className={clsx(
                                                "aspect-square rounded-xl flex items-center justify-center text-xs font-black transition-all",
                                                formData.level === lvl.level
                                                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110"
                                                    : "bg-white/5 text-slate-700 hover:text-slate-500"
                                            )}
                                        >
                                            {lvl.level}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                                    <Lock className="w-4 h-4 text-primary" />
                                    <p className="text-[10px] text-slate-500 font-bold leading-tight">Minimum clearance required: <span className="text-white uppercase">{selectedLevel?.name}</span></p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-primary p-1 rounded-[2.5rem] relative group"
                        >
                            <div className="bg-[#0a0a0f] rounded-[2.3rem] p-10 relative overflow-hidden">
                                <div className="relative z-10 space-y-6">
                                    <div className="size-14 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                                        <Target className="w-7 h-7 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black text-white tracking-tighter uppercase">Finalization</h4>
                                        <p className="text-slate-600 font-bold text-xs mt-2 leading-relaxed">By committing this schema, you authorize its broadcast to all active student terminals.</p>
                                    </div>
                                    <div className="pt-4 flex items-center gap-4">
                                        <div className="flex -space-x-4">
                                            {[1,2,3].map(i => <div key={i} className="size-10 rounded-full border-4 border-[#0a0a0f] bg-slate-800" />)}
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">3 Nodes Online</span>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <div className="size-2 rounded-full bg-primary animate-ping" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
