"use client";

import { useState, useRef } from "react";
import { 
    ChevronLeft, Send, Sparkles, BookOpen, 
    Lock, Loader2, FileText, Code2, Eye, PenLine, 
    Upload, Search, RotateCcw
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import api from "@/lib/api";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isAiGenerating, setIsAiGenerating] = useState(false);
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
            }, 1000);
        } catch (error) {
            console.error("Failed to create problem:", error);
            alert("Failed to create problem. Please try again.");
        } finally {
            setIsPublishing(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formDataAI = new FormData();
        formDataAI.append("file", file);

        setIsAiGenerating(true);
        try {
            const res = await api.post("/problems/generate-ai", formDataAI, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            
            if (res.data) {
                setFormData(prev => ({
                    ...prev,
                    title: res.data.title || prev.title,
                    description: res.data.description || prev.description,
                }));
                setActiveTab('editor');
            }
        } catch (error) {
            console.error("AI Generation failed:", error);
            alert("AI Generation failed. Ensure API key is configured.");
        } finally {
            setIsAiGenerating(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const selectedLevel = levels.find(l => l.level === formData.level);

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#05050a] text-white font-black overflow-x-hidden relative">
            {/* Minimal Grid - High Performance */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[url('/grid.svg')]" />
            
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div className="space-y-4">
                        <Link href="/faculty/problems" className="inline-flex items-center gap-2 text-slate-700 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">
                            <ChevronLeft className="w-4 h-4" />
                            Registry
                        </Link>
                        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none uppercase">Forge Task</h1>
                        <p className="text-slate-700 font-black text-[10px] uppercase tracking-widest leading-none">Architect logical challenges for the elite core</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                            <button 
                                onClick={() => setActiveTab('editor')}
                                className={clsx(
                                    "flex items-center gap-2 px-6 py-2 rounded-lg transition-all font-black text-[10px] uppercase tracking-widest",
                                    activeTab === 'editor' ? "bg-primary text-white" : "text-slate-600 hover:text-slate-400"
                                )}
                            >
                                <PenLine className="w-4 h-4" />
                                Editor
                            </button>
                            <button 
                                onClick={() => setActiveTab('preview')}
                                className={clsx(
                                    "flex items-center gap-2 px-6 py-2 rounded-lg transition-all font-black text-[10px] uppercase tracking-widest",
                                    activeTab === 'preview' ? "bg-primary text-white" : "text-slate-600 hover:text-slate-400"
                                )}
                            >
                                <Eye className="w-4 h-4" />
                                Preview
                            </button>
                        </div>
                        <button
                            onClick={handlePublish}
                            disabled={isPublishing || !formData.title || !formData.description}
                            className="bg-primary text-white hover:bg-primary/90 px-10 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-opacity disabled:opacity-50"
                        >
                            {isPublishing ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            <span>{isPublishing ? "Syncing" : "Publish"}</span>
                        </button>
                    </div>
                </div>

                {showSuccess && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 mb-10 p-6 rounded-2xl flex items-center gap-6 text-emerald-500 font-black uppercase tracking-widest">
                        <Sparkles className="w-5 h-5" />
                        <p className="text-[10px]">Challenge integrated successfully. Redirecting...</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
                    {/* Left Column */}
                    <div className="lg:col-span-8 space-y-8">
                        {activeTab === 'editor' ? (
                            <div className="bg-white/[0.02] border border-white/5 p-10 space-y-12 rounded-3xl">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] block ml-1 leading-none">Task Identifier</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-2xl font-black text-white focus:outline-none focus:border-primary/40 transition-all placeholder:text-slate-900 uppercase tracking-tighter"
                                        placeholder="Enter Mission Label..."
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] block ml-1 leading-none">Logical Stream (Markdown)</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={15}
                                        className="w-full bg-white/5 text-white border border-white/10 rounded-2xl p-8 text-sm font-bold leading-relaxed focus:outline-none focus:border-primary/40 transition-all placeholder:text-slate-900 resize-none uppercase tracking-tight"
                                        placeholder="# Specifications: Given an array of signals..."
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white/[0.02] border border-white/5 p-10 min-h-[600px] rounded-3xl">
                                {formData.description ? (
                                    <div className="prose prose-invert prose-slate max-w-none prose-p:text-slate-400 prose-p:font-bold prose-p:uppercase prose-p:tracking-tight prose-headings:uppercase prose-headings:font-black prose-headings:tracking-tighter prose-strong:text-primary prose-code:text-primary prose-code:bg-primary/5 prose-pre:bg-black prose-pre:border prose-pre:border-white/5">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{formData.description}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-900 py-32 space-y-4">
                                        <FileText className="w-16 h-16 opacity-30" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Signal Expected</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* AI Blueprinter - Minimalist Fix */}
                        <div className="bg-white/[0.03] border border-primary/20 p-8 space-y-8 rounded-3xl">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2 leading-none">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    AI Architect
                                </h3>
                                {isAiGenerating && (
                                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] leading-none">Syncing</span>
                                )}
                            </div>
                            
                            <p className="text-[9px] text-slate-700 font-black leading-relaxed uppercase tracking-widest">Upload logic documentation (PDF/TXT) to automatically forge a mission blueprint.</p>
                            
                            {isAiGenerating ? (
                                <div className="space-y-4">
                                    <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary " style={{ width: '100%', animation: 'linear-loader 2s infinite' }} />
                                    </div>
                                    <p className="text-center text-[9px] font-black text-primary uppercase tracking-widest leading-none">Analyzing Spectrum</p>
                                </div>
                            ) : (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-primary/5 text-slate-600 hover:text-primary p-10 rounded-2xl flex flex-col items-center gap-4 transition-all"
                                >
                                    <Upload className="w-8 h-8" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Inject Blueprint</span>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        className="hidden" 
                                        accept=".pdf,.txt"
                                    />
                                </button>
                            )}
                        </div>

                        {/* Subject Selection */}
                        <div className="bg-white/[0.02] border border-white/5 p-8 space-y-8 rounded-3xl">
                            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2 leading-none">
                                <BookOpen className="w-4 h-4 text-primary" />
                                Classification
                            </h3>
                            <div className="grid grid-cols-1 gap-1.5">
                                {subjects.map((sub) => (
                                    <button
                                        key={sub.id}
                                        onClick={() => setFormData({ ...formData, subject: sub.id })}
                                        className={clsx(
                                            "flex items-center justify-between p-4 rounded-xl border transition-all",
                                            formData.subject === sub.id
                                                ? "border-primary bg-primary/10 text-white"
                                                : "border-white/5 bg-white/5 text-slate-700 hover:text-slate-500"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-lg grayscale group-hover:grayscale-0">{sub.icon}</span>
                                            <span className="font-black text-[10px] uppercase tracking-widest">{sub.name}</span>
                                        </div>
                                        {formData.subject === sub.id && <div className="size-1.5 rounded-full bg-primary" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Complexity Toggle */}
                        <div className="bg-white/[0.02] border border-white/5 p-8 space-y-8 rounded-3xl">
                            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2 leading-none">
                                <Search className="w-4 h-4 text-primary" />
                                Severity
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                                {["Easy", "Medium", "Hard"].map((diff) => (
                                    <button
                                        key={diff}
                                        onClick={() => setFormData({ ...formData, difficulty: diff })}
                                        className={clsx(
                                            "py-4 rounded-xl border transition-all font-black text-[10px] uppercase tracking-widest",
                                            formData.difficulty === diff
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-white/5 bg-white/5 text-slate-700 hover:text-slate-500"
                                        )}
                                    >
                                        {diff}
                                    </button>
                                ))}
                            </div>

                            <div className="pt-8 border-t border-white/5 space-y-8">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">Clearance Gate</p>
                                    <span className="text-primary font-black text-xl leading-none">0{formData.level}</span>
                                </div>
                                <div className="grid grid-cols-6 gap-1.5">
                                    {levels.map((lvl) => (
                                        <button
                                            key={lvl.level}
                                            onClick={() => setFormData({ ...formData, level: lvl.level })}
                                            className={clsx(
                                                "aspect-square rounded-lg flex items-center justify-center text-[10px] font-black transition-all",
                                                formData.level === lvl.level
                                                    ? "bg-primary text-white"
                                                    : "bg-white/5 text-slate-800 hover:text-slate-600"
                                            )}
                                        >
                                            {lvl.level}
                                        </button>
                                    ))}
                                </div>
                                <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center gap-4">
                                    <Lock className="w-4 h-4 text-slate-800" />
                                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest leading-none">Min Requirement: {selectedLevel?.name}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes linear-loader {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .linear-loader {
                    animation: linear-loader 1.5s infinite;
                }
            `}</style>
        </div>
    );
}
