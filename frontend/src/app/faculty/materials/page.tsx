"use client";

import { useState, useRef } from "react";
import { ChevronLeft, Upload, FileText, Sparkles, Loader2, Trash2, BookOpen, Code2, CheckCircle, AlertCircle, Send, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import api from "@/lib/api";

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
        <div className="min-h-[calc(100vh-64px)] bg-[#0f0a1e]">
            <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link href="/faculty/profile" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-black text-white mb-2">Study Materials</h1>
                    <p className="text-slate-400">Upload study materials to automatically generate problem statements</p>
                </div>

                {/* Subject & Difficulty Selection */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-emerald-400" />
                        Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="text-sm font-medium text-slate-400 mb-2 block">Subject Area *</label>
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            >
                                <option value="">Select Subject</option>
                                {subjectAreas.map((s) => (
                                    <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-400 mb-2 block">Difficulty</label>
                            <select
                                value={selectedDifficulty}
                                onChange={(e) => setSelectedDifficulty(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            >
                                {difficulties.map((d) => (
                                    <option key={d.value} value={d.value}>{d.label} ({d.xp} XP)</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-400 mb-2 block">Custom Prompt (Optional)</label>
                            <input
                                type="text"
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                placeholder="e.g., Focus on arrays and sorting"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            />
                        </div>
                    </div>
                </div>

                {/* Upload Area */}
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={clsx(
                        "border-2 border-dashed rounded-2xl p-12 text-center transition-all mb-8",
                        dragActive ? "border-emerald-500 bg-emerald-500/10" : "border-white/20 hover:border-white/40"
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
                    <Upload className={clsx("w-12 h-12 mx-auto mb-4 transition-colors", dragActive ? "text-emerald-400" : "text-slate-500")} />
                    <p className="text-white font-bold mb-2">
                        Drag & drop files here, or{" "}
                        <button onClick={() => fileInputRef.current?.click()} className="text-emerald-400 hover:text-emerald-300 underline">
                            browse
                        </button>
                    </p>
                    <p className="text-sm text-slate-500">Supports PDF, DOC, TXT, MD, and code files</p>
                </div>

                {/* Uploaded Files */}
                {files.length > 0 && (
                    <div className="space-y-4 mb-8">
                        <h3 className="text-lg font-bold text-white">Uploaded Materials ({files.length})</h3>
                        {files.map((file) => (
                            <div key={file.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{file.name}</p>
                                            <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {file.status === "done" && (
                                            <button onClick={() => previewFile(file)} className="p-2 text-slate-400 hover:text-blue-400 transition-colors" title="Preview">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button onClick={() => removeFile(file.id)} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Progress */}
                                {file.status === "uploading" && (
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-slate-400">Uploading...</span>
                                            <span className="text-white">{Math.round(file.progress)}%</span>
                                        </div>
                                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${file.progress}%` }} />
                                        </div>
                                    </div>
                                )}

                                {file.status === "processing" && (
                                    <div className="flex items-center gap-2 text-amber-400 mb-4">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm">Analyzing content with AI...</span>
                                    </div>
                                )}

                                {file.status === "error" && (
                                    <div className="flex items-center gap-2 text-red-400 mb-4">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-sm">Generation failed. Try again.</span>
                                    </div>
                                )}

                                {/* Generated Problem */}
                                {file.generatedProblem && (
                                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Sparkles className="w-4 h-4 text-emerald-400" />
                                            <span className="text-sm font-bold text-emerald-400">Generated Problem</span>
                                            <span className={clsx(
                                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                                                file.generatedProblem.difficulty === "Easy" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                                file.generatedProblem.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                "bg-red-500/10 text-red-400 border-red-500/20"
                                            )}>
                                                {file.generatedProblem.difficulty}
                                            </span>
                                        </div>
                                        <h4 className="text-white font-bold mb-2">{file.generatedProblem.title}</h4>
                                        <p className="text-sm text-slate-400 whitespace-pre-wrap line-clamp-4 mb-3">{file.generatedProblem.description}</p>
                                        
                                        {file.generatedProblem.constraints && (
                                            <div className="text-xs text-slate-500 font-mono bg-black/20 rounded-lg p-3">
                                                <p className="font-bold text-slate-400 mb-1">Constraints:</p>
                                                <p>{file.generatedProblem.constraints}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3">
                                    {file.status === "done" && !file.generatedProblem && (
                                        <button
                                            onClick={() => generateProblemsFromMaterial(file.id)}
                                            disabled={isGenerating || !selectedSubject}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium transition-all"
                                        >
                                            <Sparkles className="w-4 h-4" />
                                            Generate Problem
                                        </button>
                                    )}
                                    {file.generatedProblem && (
                                        <>
                                            <button
                                                onClick={() => generateProblemsFromMaterial(file.id)}
                                                disabled={isGenerating}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                Regenerate
                                            </button>
                                            <button
                                                onClick={() => createProblemFromMaterial(file)}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-all"
                                            >
                                                <Code2 className="w-4 h-4" />
                                                Create as Problem
                                            </button>
                                        </>
                                    )}
                                    {file.status === "error" && (
                                        <button
                                            onClick={() => generateProblemsFromMaterial(file.id)}
                                            disabled={!selectedSubject}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-all"
                                        >
                                            <Loader2 className="w-4 h-4" />
                                            Retry
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Info Box */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                        <div>
                            <h4 className="text-amber-400 font-bold mb-1">AI-Powered Generation</h4>
                            <p className="text-sm text-amber-200/80">
                                Upload your study materials (lecture notes, textbooks, code files) and our AI will analyze them to generate relevant coding problems. 
                                Select the subject area and difficulty level to customize the output.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Preview Modal */}
                {showPreview && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-[#1a142e] border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                            {(() => {
                                const file = files.find(f => f.id === showPreview);
                                if (!file?.generatedProblem) return null;
                                return (
                                    <>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-bold text-white">{file.generatedProblem.title}</h3>
                                            <button onClick={() => setShowPreview(null)} className="text-slate-400 hover:text-white">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="space-y-4 text-sm text-slate-300 whitespace-pre-wrap">
                                            <p>{file.generatedProblem.description}</p>
                                            {file.generatedProblem.input_format && (
                                                <div>
                                                    <p className="font-bold text-white mb-1">Input Format:</p>
                                                    <p className="font-mono bg-black/20 p-3 rounded-lg">{file.generatedProblem.input_format}</p>
                                                </div>
                                            )}
                                            {file.generatedProblem.output_format && (
                                                <div>
                                                    <p className="font-bold text-white mb-1">Output Format:</p>
                                                    <p className="font-mono bg-black/20 p-3 rounded-lg">{file.generatedProblem.output_format}</p>
                                                </div>
                                            )}
                                            {file.generatedProblem.constraints && (
                                                <div>
                                                    <p className="font-bold text-white mb-1">Constraints:</p>
                                                    <p className="font-mono bg-black/20 p-3 rounded-lg">{file.generatedProblem.constraints}</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
