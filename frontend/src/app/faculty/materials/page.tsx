"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, Upload, FileText, Sparkles, Loader2, Trash2, BookOpen, Code2, CheckCircle, AlertCircle, Send, Eye, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import MagneticWrapper from "@/components/MagneticWrapper";
import BroadcastAlert from "@/components/BroadcastAlert";
import { Bell } from "lucide-react";

const subjectAreas = [
    { id: "data-structures", name: "Data Structures", icon: "🌳" },
    { id: "algorithms", name: "Algorithms", icon: "⚙️" },
    { id: "dp", name: "Dynamic Programming", icon: "📊" },
    { id: "graphs", name: "Graph Theory", icon: "🔗" },
    { id: "math", name: "Mathematics", icon: "🔢" },
    { id: "strings", name: "String Processing", icon: "📝" },
    { id: "number-theory", name: "Number Theory", icon: "🔐" },
    { id: "combinatorics", name: "Combinatorics", icon: "🎲" },
];

const difficulties = [
    { value: "Easy", label: "Easy", xp: 100 },
    { value: "Medium", label: "Medium", xp: 200 },
    { value: "Hard", label: "Hard", xp: 400 },
];

interface UploadedFile {
    id: string;
    name: string;
    type: string;
    size: number;
    status: "uploading" | "processing" | "done" | "error";
    progress: number;
    generatedProblem?: {
        title: string;
        description: string;
        input_format: string;
        output_format: string;
        constraints: string;
        difficulty: string;
    };
}

export default function StudyMaterialsPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("Medium");
    const [isGenerating, setIsGenerating] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [customPrompt, setCustomPrompt] = useState("");
    const [showPreview, setShowPreview] = useState<string | null>(null);
    const [newsOpen, setNewsOpen] = useState(false);

    useEffect(() => {
        const handleOpenNews = () => setNewsOpen(true);
        window.addEventListener('minicode:openNews', handleOpenNews);
        return () => window.removeEventListener('minicode:openNews', handleOpenNews);
    }, []);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) handleFiles(e.dataTransfer.files);
    };

    const handleFiles = (fileList: FileList) => {
        const newFiles: UploadedFile[] = Array.from(fileList).map((file) => ({
            id: Math.random().toString(36).substring(7),
            name: file.name,
            type: file.type,
            size: file.size,
            status: "uploading" as const,
            progress: 0,
        }));
        setFiles((prev) => [...prev, ...newFiles]);
        newFiles.forEach((file) => simulateUpload(file.id));
    };

    const simulateUpload = (fileId: string) => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress >= 100) {
                clearInterval(interval);
                setFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, status: "done" as const, progress: 100 } : f));
            } else {
                setFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, progress: Math.min(progress, 99) } : f));
            }
        }, 300);
    };

    const generateProblemsFromMaterial = async (fileId: string) => {
        if (!selectedSubject) {
            alert("Please select a subject area first");
            return;
        }

        setIsGenerating(true);
        setFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, status: "processing" as const } : f));

        try {
            // Simulate AI generation with realistic problem templates
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const templates: Record<string, { title: string; description: string; input_format: string; output_format: string; constraints: string }[]> = {
                "data-structures": [
                    {
                        title: "Binary Tree Level Order Traversal",
                        description: "Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).\n\n**Example 1:**\nInput: root = [3,9,20,null,null,15,7]\nOutput: [[3],[9,20],[15,7]]\n\n**Example 2:**\nInput: root = [1]\nOutput: [[1]]\n\n**Example 3:**\nInput: root = []\nOutput: []",
                        input_format: "First line contains integer n (number of nodes). Next n-1 lines contain parent-child relationships. Last line contains level order representation.",
                        output_format: "Print the level order traversal, each level on a new line.",
                        constraints: "1 <= n <= 1000\n-1000 <= node.val <= 1000"
                    },
                    {
                        title: "Valid Parentheses",
                        description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
                        input_format: "A single line containing string s.",
                        output_format: "Print 'true' if valid, 'false' otherwise.",
                        constraints: "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'"
                    },
                ],
                "algorithms": [
                    {
                        title: "Binary Search Implementation",
                        description: "Given a sorted array of integers and a target value, implement binary search to find the target. Return the index if found, otherwise return -1.\n\n**Example 1:**\nInput: nums = [-1,0,3,5,9,12], target = 9\nOutput: 4\n\n**Example 2:**\nInput: nums = [-1,0,3,5,9,12], target = 2\nOutput: -1",
                        input_format: "First line: n (array size), k (target). Second line: n space-separated integers.",
                        output_format: "Print the index of target, or -1 if not found.",
                        constraints: "1 <= n <= 10^6\n-10^9 <= arr[i] <= 10^9"
                    },
                ],
                "dp": [
                    {
                        title: "Coin Change Problem",
                        description: "Given an array of coin denominations and a target amount, find the minimum number of coins needed to make up that amount. If it's not possible, return -1.\n\n**Example 1:**\nInput: coins = [1,2,5], amount = 11\nOutput: 3 (11 = 5 + 5 + 1)\n\n**Example 2:**\nInput: coins = [2], amount = 3\nOutput: -1",
                        input_format: "First line: target amount. Second line: n (number of coin types). Third line: n coin denominations.",
                        output_format: "Print the minimum number of coins, or -1 if impossible.",
                        constraints: "1 <= amount <= 10^4\n1 <= n <= 100\n1 <= coins[i] <= 2^31 - 1"
                    },
                ],
                "graphs": [
                    {
                        title: "BFS Shortest Path",
                        description: "Given an undirected graph with n vertices and m edges, find the shortest path from vertex 1 to vertex n using BFS.\n\n**Example:**\nInput:\n5 6\n1 2\n1 3\n2 4\n3 4\n4 5\n3 5\nOutput: 2",
                        input_format: "First line: n m (vertices, edges). Next m lines: u v (edges).",
                        output_format: "Print the shortest distance from vertex 1 to vertex n.",
                        constraints: "1 <= n <= 10^5\n1 <= m <= 2*10^5"
                    },
                ],
            };

            const subjectTemplates = templates[selectedSubject] || templates["algorithms"];
            const template = subjectTemplates[Math.floor(Math.random() * subjectTemplates.length)];

            setFiles((prev) => prev.map((f) => f.id === fileId ? {
                ...f,
                status: "done" as const,
                generatedProblem: {
                    title: template.title,
                    description: template.description,
                    input_format: template.input_format,
                    output_format: template.output_format,
                    constraints: template.constraints,
                    difficulty: selectedDifficulty,
                },
            } : f));
        } catch (error) {
            console.error("Failed to generate problem:", error);
            setFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, status: "error" as const } : f));
        } finally {
            setIsGenerating(false);
        }
    };

    const removeFile = (fileId: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
    };

    const createProblemFromMaterial = async (file: UploadedFile) => {
        if (!file.generatedProblem) return;

        try {
            const response = await api.post("/problems", {
                title: file.generatedProblem.title,
                description: file.generatedProblem.description,
                difficulty: file.generatedProblem.difficulty,
                subject: selectedSubject,
                input_format: file.generatedProblem.input_format,
                output_format: file.generatedProblem.output_format,
                constraints: file.generatedProblem.constraints,
            });

            alert("Problem created successfully!");
            router.push("/faculty/problems");
        } catch (error: any) {
            console.error("Failed to create problem:", error);
            alert(error.response?.data?.detail || "Failed to create problem");
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const previewFile = (file: UploadedFile) => {
        setShowPreview(file.id);
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#0f0a1e] text-slate-100 font-display relative overflow-x-hidden">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/grid.svg')] opacity-5" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Link href="/faculty/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest mb-4 group">
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Return to Command
                        </Link>
                        <h1 className="text-4xl font-black text-white tracking-tight mb-2">Knowledge Matrix</h1>
                        <p className="text-slate-500 font-medium">Ingest study materials to synthesize algorithmic challenges</p>
                    </motion.div>

                    <BroadcastAlert />
                </div>

                {/* Subject & Difficulty Selection */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card mb-10 overflow-hidden relative"
                >
                    <div className="absolute top-0 left-0 w-2 h-full bg-primary/40" />
                    <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                            <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        Synthesizer Protocol
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">Domain Target *</label>
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white font-black appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                            >
                                <option value="" className="bg-[#0f0a1e]">Select Domain</option>
                                {subjectAreas.map((s) => (
                                    <option key={s.id} value={s.id} className="bg-[#0f0a1e]">{s.icon} {s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">Complexity Level</label>
                            <select
                                value={selectedDifficulty}
                                onChange={(e) => setSelectedDifficulty(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white font-black appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                            >
                                {difficulties.map((d) => (
                                    <option key={d.value} value={d.value} className="bg-[#0f0a1e]">{d.label} (+{d.xp} XP)</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">Heuristic Guidance</label>
                            <input
                                type="text"
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                placeholder="e.g. Focus on greedy optimization"
                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-700"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Upload Area */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={clsx(
                        "relative group cursor-pointer border-2 border-dashed rounded-3xl p-16 text-center transition-all mb-12",
                        dragActive ? "border-primary bg-primary/5 shadow-[0_0_40px_rgba(168,85,247,0.1)]" : "border-white/5 bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/10"
                    )}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.md,.py,.java,.cpp"
                        onChange={(e) => e.target.files && handleFiles(e.target.files)}
                        className="hidden"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
                    
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                            <Upload className={clsx("w-10 h-10 transition-colors", dragActive ? "text-primary" : "text-slate-400")} />
                        </div>
                        <p className="text-2xl font-black text-white mb-3">
                            Feed the <span className="text-primary italic">Matrix</span>
                        </p>
                        <p className="text-slate-500 font-medium mb-6">
                            Drop documents or <button onClick={() => fileInputRef.current?.click()} className="text-primary hover:text-white transition-colors underline decoration-primary/30 underline-offset-4">browse filesystem</button>
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {['PDF', 'DOCX', 'TXT', 'MD', 'PY', 'JAVA', 'CPP'].map(ext => (
                                <span key={ext} className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-black text-slate-500 tracking-wider">
                                    {ext}
                                </span>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Uploaded Files */}
                <AnimatePresence mode="popLayout">
                    {files.length > 0 && (
                        <div className="space-y-6 mb-12">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-1 flex items-center justify-between">
                                Active Transfers 
                                <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-400">{files.length}</span>
                            </h3>
                            {files.map((file) => (
                                <motion.div 
                                    key={file.id} 
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="glass-card !p-6 border-white/5 hover:border-primary/20 group relative"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-5">
                                            <div className="h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                                <FileText className="w-7 h-7 text-slate-400 group-hover:text-primary transition-colors" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-white mb-1">{file.name}</p>
                                                <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">{formatFileSize(file.size)} • {file.type.split('/')[1] || 'DOC'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {file.status === "done" && (
                                                <button onClick={() => previewFile(file)} className="p-3 rounded-xl hover:bg-primary/10 text-slate-500 hover:text-primary transition-all" title="Review">
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            )}
                                            <button onClick={() => removeFile(file.id)} className="p-3 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-all">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Progress */}
                                    {file.status === "uploading" && (
                                        <div className="mt-6 pt-6 border-t border-white/5">
                                            <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] mb-3">
                                                <span>Stabilizing Connection...</span>
                                                <span className="text-primary">{Math.round(file.progress)}%</span>
                                            </div>
                                            <div className="h-2 bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
                                                <motion.div 
                                                    className="h-full bg-gradient-to-r from-primary to-secondary" 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${file.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {file.status === "processing" && (
                                        <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-3 text-secondary">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span className="text-sm font-black uppercase tracking-wider">Synthesizing Logic...</span>
                                        </div>
                                    )}

                                    {file.status === "error" && (
                                        <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-3 text-red-500">
                                            <AlertCircle className="w-5 h-5" />
                                            <span className="text-sm font-black uppercase tracking-wider">Sequence Failure</span>
                                        </div>
                                    )}

                                    {/* Generated Problem */}
                                    {file.generatedProblem && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-6 pt-6 border-t border-white/5"
                                        >
                                            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl mb-6 relative overflow-hidden group/opt">
                                                <div className="absolute top-0 right-0 p-3">
                                                    <Sparkles className="w-5 h-5 text-primary opacity-30 group-hover/opt:opacity-100 transition-opacity" />
                                                </div>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className={clsx(
                                                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] border shadow-sm",
                                                        file.generatedProblem.difficulty === "Easy" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                                        file.generatedProblem.difficulty === "Medium" ? "bg-primary/10 text-primary border-primary/20" :
                                                        "bg-red-500/10 text-red-400 border-red-500/20"
                                                    )}>
                                                        {file.generatedProblem.difficulty}
                                                    </span>
                                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Logic Output</span>
                                                </div>
                                                <h4 className="text-xl font-black text-white mb-3 tracking-tight">{file.generatedProblem.title}</h4>
                                                <p className="text-slate-400 text-sm font-medium leading-relaxed line-clamp-3 mb-6">{file.generatedProblem.description}</p>
                                                
                                                {file.generatedProblem.constraints && (
                                                    <div className="bg-black/40 rounded-xl p-4 border border-white/5 group-hover/opt:border-primary/10 transition-colors">
                                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Computational Constraints</p>
                                                        <p className="text-xs font-mono text-primary/70 leading-relaxed">{file.generatedProblem.constraints}</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-4">
                                                {file.status === "done" && !file.generatedProblem && (
                                                    <MagneticWrapper>
                                                        <button
                                                            onClick={() => generateProblemsFromMaterial(file.id)}
                                                            disabled={isGenerating || !selectedSubject}
                                                            className="premium-btn px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 disabled:opacity-50"
                                                        >
                                                            <Sparkles className="w-4 h-4" />
                                                            Synthesize Problem
                                                        </button>
                                                    </MagneticWrapper>
                                                )}
                                                {file.generatedProblem && (
                                                    <>
                                                        <MagneticWrapper>
                                                            <button
                                                                onClick={() => generateProblemsFromMaterial(file.id)}
                                                                disabled={isGenerating}
                                                                className="px-8 py-3 rounded-2xl bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2"
                                                            >
                                                                <Sparkles className="w-4 h-4" />
                                                                Regenerate
                                                            </button>
                                                        </MagneticWrapper>
                                                        <MagneticWrapper>
                                                            <button
                                                                onClick={() => createProblemFromMaterial(file)}
                                                                className="premium-btn px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all"
                                                            >
                                                                <Code2 className="w-4 h-4" />
                                                                Commit to Problem Bank
                                                            </button>
                                                        </MagneticWrapper>
                                                    </>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>

                {/* Info Box */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card bg-primary/5 border-primary/20 rounded-3xl p-8"
                >
                    <div className="flex items-start gap-6">
                        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 mt-1">
                            <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-white mb-2 tracking-tight uppercase">AI Synthesis Engine</h4>
                            <p className="text-slate-400 font-medium leading-relaxed">
                                Upload lecture notes, code repositories, or reference texts. The Matrix will parse the core logic and synthesize production-grade coding challenges mapped to your chosen domain. 
                                <span className="block mt-2 text-primary font-bold">Requires Subject Domain selection to initialize logic mapping.</span>
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Preview Modal */}
                <AnimatePresence>
                    {showPreview && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowPreview(null)}
                                className="absolute inset-0 bg-[#05020a]/80 backdrop-blur-md" 
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="glass-card p-10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar relative z-10 shadow-3xl border-white/10"
                            >
                                {(() => {
                                    const file = files.find(f => f.id === showPreview);
                                    if (!file?.generatedProblem) {
                                        return (
                                            <div className="text-center py-20">
                                                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-6" />
                                                <p className="text-slate-500 font-black uppercase tracking-widest">Awaiting Synthesis...</p>
                                            </div>
                                        );
                                    }
                                    return (
                                        <>
                                            <div className="flex items-center justify-between mb-10">
                                                <div className="space-y-1">
                                                    <h3 className="text-3xl font-black text-white tracking-tight">{file.generatedProblem.title}</h3>
                                                    <div className="flex items-center gap-3">
                                                        <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest">
                                                            {file.generatedProblem.difficulty}
                                                        </span>
                                                        <span className="text-xs font-bold text-slate-500">{file.name}</span>
                                                    </div>
                                                </div>
                                                <button onClick={() => setShowPreview(null)} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white transition-all">
                                                    <X className="w-6 h-6" />
                                                </button>
                                            </div>
                                            <div className="space-y-8">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">Mission Strategy</label>
                                                    <p className="text-slate-300 font-medium leading-relaxed whitespace-pre-wrap bg-white/[0.02] border border-white/5 rounded-2xl p-6">{file.generatedProblem.description}</p>
                                                </div>
                                                
                                                {file.generatedProblem.input_format && (
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">Input Protocol</label>
                                                        <div className="font-mono text-sm bg-black/40 p-4 rounded-2xl border border-white/5 text-primary/80">{file.generatedProblem.input_format}</div>
                                                    </div>
                                                )}
                                                
                                                {file.generatedProblem.output_format && (
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">Output Verification</label>
                                                        <div className="font-mono text-sm bg-black/40 p-4 rounded-2xl border border-white/5 text-secondary/80">{file.generatedProblem.output_format}</div>
                                                    </div>
                                                )}
                                                
                                                <div className="flex justify-end pt-6">
                                                    <MagneticWrapper>
                                                        <button 
                                                            onClick={() => setShowPreview(null)}
                                                            className="px-10 py-4 rounded-2xl bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white transition-all text-xs font-black uppercase tracking-widest"
                                                        >
                                                            Close Matrix
                                                        </button>
                                                    </MagneticWrapper>
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
