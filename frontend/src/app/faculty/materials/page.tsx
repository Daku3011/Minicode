"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, Upload, FileText, Sparkles, Loader2, Trash2, BookOpen, Code2, Eye, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import api from "@/lib/api";
import BroadcastAlert from "@/components/BroadcastAlert";

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
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const templates: Record<string, { title: string; description: string; input_format: string; output_format: string; constraints: string }[]> = {
                "data-structures": [
                    {
                        title: "Binary Tree Level Order Traversal",
                        description: "Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
                        input_format: "First line contains integer n (number of nodes). Next n-1 lines contain parent-child relationships. Last line contains level order representation.",
                        output_format: "Print the level order traversal, each level on a new line.",
                        constraints: "1 <= n <= 1000\n-1000 <= node.val <= 1000"
                    }
                ],
                "algorithms": [
                    {
                        title: "Binary Search Implementation",
                        description: "Given a sorted array of integers and a target value, implement binary search to find the target. Return the index if found, otherwise return -1.",
                        input_format: "First line: n (array size), k (target). Second line: n space-separated integers.",
                        output_format: "Print the index of target, or -1 if not found.",
                        constraints: "1 <= n <= 10^6\n-10^9 <= arr[i] <= 10^9"
                    }
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
            await api.post("/problems", {
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
        <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0f] text-slate-100 font-display relative overflow-hidden">
            {/* Minimal Background */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
                <div className="absolute inset-0 bg-[url('/grid.svg')]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <Link href="/faculty/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-4 group">
                            <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                            Return
                        </Link>
                        <h1 className="text-5xl font-black text-white tracking-tight uppercase leading-none">Knowledge Matrix</h1>
                        <p className="text-slate-500 font-medium mt-3">Ingest curriculum data to synthesize algorithmic subjects</p>
                    </div>
                    <BroadcastAlert />
                </div>

                {/* Synthesis Control Box */}
                <div className="bg-white/[0.01] border border-white/5 p-8 rounded-3xl mb-10">
                    <h3 className="text-[10px] font-black text-white mb-8 flex items-center gap-3 uppercase tracking-widest leading-none">
                        <BookOpen className="w-4 h-4 text-primary" /> Synthesizer Protocol
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] block ml-1">Domain *</label>
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white font-black appearance-none focus:outline-none focus:border-primary/50 transition-all cursor-pointer"
                            >
                                <option value="" className="bg-[#0a0a0f]">Select</option>
                                {subjectAreas.map((s) => (
                                    <option key={s.id} value={s.id} className="bg-[#0a0a0f]">{s.icon} {s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] block ml-1">Complexity</label>
                            <select
                                value={selectedDifficulty}
                                onChange={(e) => setSelectedDifficulty(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white font-black appearance-none focus:outline-none focus:border-primary/50 transition-all cursor-pointer"
                            >
                                {difficulties.map((d) => (
                                    <option key={d.value} value={d.value} className="bg-[#0a0a0f]">{d.label} (+{d.xp} XP)</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] block ml-1">Heuristic Guidance</label>
                            <input
                                type="text"
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                placeholder="e.g. Focus on greedy patterns"
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-primary/50 transition-all placeholder:text-slate-800"
                            />
                        </div>
                    </div>
                </div>

                {/* Drop Zone */}
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={clsx(
                        "relative border-2 border-dashed rounded-3xl p-16 text-center transition-all duration-300 mb-12",
                        dragActive ? "border-primary bg-primary/5" : "border-white/5 bg-white/[0.01] hover:bg-white/[0.02]"
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
                    <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Upload className={clsx("w-8 h-8 transition-colors duration-300", dragActive ? "text-primary" : "text-slate-600")} />
                    </div>
                    <p className="text-xl font-black text-white mb-2 uppercase tracking-tight">Ingest Materials</p>
                    <p className="text-slate-600 font-bold text-xs uppercase tracking-widest leading-loose">
                        Drop items or <button onClick={() => fileInputRef.current?.click()} className="text-primary hover:text-white transition-colors underline decoration-primary/20 underline-offset-4">browse filesystem</button>
                    </p>
                </div>

                {/* Transfer Registry */}
                {files.length > 0 && (
                    <div className="space-y-4 mb-12">
                        <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 flex items-center justify-between">
                            Pending Registry
                            <span className="text-primary">{files.length}</span>
                        </h3>
                        {files.map((file) => (
                            <div
                                key={file.id}
                                className="bg-white/[0.01] border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-colors duration-300"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="h-12 w-12 rounded-xl bg-white/[0.03] flex items-center justify-center text-slate-600">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-black text-white uppercase tracking-tight">{file.name}</p>
                                            <p className="text-[10px] font-black text-slate-600 tracking-widest uppercase mt-1">{formatFileSize(file.size)} • {file.type.split('/')[1] || 'DOC'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        {file.status === "done" && (
                                            <button
                                                onClick={() => previewFile(file)}
                                                className="p-2.5 rounded-lg hover:bg-white/5 text-slate-600 hover:text-white transition-all"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => removeFile(file.id)}
                                            className="p-2.5 rounded-lg hover:bg-rose-500/10 text-slate-600 hover:text-rose-500 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {file.status === "uploading" && (
                                    <div className="mt-6 pt-6 border-t border-white/5">
                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all duration-300"
                                                style={{ width: `${file.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {file.status === "processing" && (
                                    <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-3 text-primary/60">
                                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Synthesizing...</span>
                                    </div>
                                )}

                                {file.generatedProblem && (
                                    <div className="mt-6 pt-6 border-t border-white/5">
                                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                                                    {file.generatedProblem.difficulty}
                                                </span>
                                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Logic Segment</span>
                                            </div>
                                            <h4 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{file.generatedProblem.title}</h4>
                                            <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2">{file.generatedProblem.description}</p>
                                        </div>

                                        <div className="flex gap-4">
                                            {file.status === "done" && !file.generatedProblem && (
                                                <button
                                                    onClick={() => generateProblemsFromMaterial(file.id)}
                                                    disabled={isGenerating || !selectedSubject}
                                                    className="bg-primary text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
                                                >
                                                    <Sparkles className="w-4 h-4" /> Synthesize
                                                </button>
                                            )}
                                            {file.generatedProblem && (
                                                <>
                                                    <button
                                                        onClick={() => generateProblemsFromMaterial(file.id)}
                                                        disabled={isGenerating}
                                                        className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                                                    >
                                                        Reroll
                                                    </button>
                                                    <button
                                                        onClick={() => createProblemFromMaterial(file)}
                                                        className="bg-primary text-white hover:bg-primary/90 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all"
                                                    >
                                                        <Code2 className="w-4 h-4" /> Commit
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Synthesis Context */}
                <div className="p-8 bg-white/[0.01] border border-white/5 rounded-3xl">
                    <div className="flex items-start gap-6">
                        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-white uppercase tracking-widest mb-2 leading-none">Architectural Logic</h4>
                            <p className="text-slate-600 font-medium text-sm leading-relaxed">
                                Upload specifications, documentation, or lecture assets. The system analyzes underlying methodologies to architect challenges aligned for deployment.
                                <span className="block mt-2 text-primary/80 font-black uppercase tracking-widest text-[10px]">Subject Domain lock required for mapping.</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Registry */}
            {showPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                    <div
                        className="bg-[#0a0a0f] border border-white/10 p-10 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto no-scrollbar relative z-10 shadow-2xl"
                    >
                        {(() => {
                            const file = files.find(f => f.id === showPreview);
                            if (!file?.generatedProblem) return null;
                            return (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-3xl font-black text-white uppercase tracking-tight leading-none">{file.generatedProblem.title}</h3>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-2">{file.generatedProblem.difficulty} Protocol • {file.name}</p>
                                        </div>
                                        <button onClick={() => setShowPreview(null)} className="p-2 rounded-lg hover:bg-white/5 text-slate-600 transition-colors">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block ml-1">Description</label>
                                            <p className="text-slate-400 font-medium leading-relaxed bg-white/[0.02] border border-white/5 rounded-2xl p-6">{file.generatedProblem.description}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block ml-1">Complexity constraints</label>
                                            <div className="font-mono text-xs bg-black p-4 rounded-xl border border-white/5 text-primary/60">{file.generatedProblem.constraints}</div>
                                        </div>
                                        <button
                                            onClick={() => setShowPreview(null)}
                                            className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all"
                                        >
                                            Close Segment
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
}
