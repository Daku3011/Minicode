"use client";

import { useState, useRef } from "react";
import { ChevronLeft, Upload, FileText, Sparkles, Loader2, Trash2, BookOpen, Code2, CheckCircle, AlertCircle } from "lucide-react";
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
    };
}

export default function StudyMaterialsPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
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

        // Simulate upload and processing
        newFiles.forEach((file) => {
            simulateUpload(file.id);
        });
    };

    const simulateUpload = (fileId: string) => {
        // Simulate progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progress >= 100) {
                clearInterval(interval);
                setFiles((prev) =>
                    prev.map((f) =>
                        f.id === fileId
                            ? { ...f, status: "processing" as const, progress: 100 }
                            : f
                    )
                );
                simulateProcessing(fileId);
            } else {
                setFiles((prev) =>
                    prev.map((f) =>
                        f.id === fileId ? { ...f, progress } : f
                    )
                );
            }
        }, 200);
    };

    const simulateProcessing = (fileId: string) => {
        setTimeout(() => {
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === fileId
                        ? {
                              ...f,
                              status: "done" as const,
                              generatedProblem: {
                                  title: "Generated Problem Title",
                                  description: "AI-generated problem description from the uploaded material.",
                              },
                          }
                        : f
                )
            );
        }, 2000);
    };

    const generateProblemsFromMaterial = async (fileId: string) => {
        if (!selectedSubject) {
            alert("Please select a subject area first");
            return;
        }

        setIsGenerating(true);
        // In production, this would call the Gemini API
        setTimeout(() => {
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === fileId
                        ? {
                              ...f,
                              generatedProblem: {
                                  title: `Problem: ${selectedSubject} - ${Date.now() % 1000}`,
                                  description: `AI-generated problem based on the uploaded study material covering ${selectedSubject}.`,
                              },
                          }
                        : f
                )
            );
            setIsGenerating(false);
        }, 3000);
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
                difficulty: "Medium",
                subject: selectedSubject,
            });
            alert("Problem created successfully!");
            router.push("/faculty/profile");
        } catch (error) {
            console.error("Failed to create problem:", error);
            alert("Failed to create problem");
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const completedFiles = files.filter((f) => f.status === "done");

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#0f0a1e]">
            {/* Background */}
            <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <Link href="/faculty/profile" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-white mb-2">Study Materials</h1>
                    <p className="text-slate-400">
                        Upload study materials to automatically generate problem statements
                    </p>
                </div>

                {/* Subject Selection */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-emerald-400" />
                        Select Subject Area
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {subjectAreas.map((subject) => (
                            <button
                                key={subject.id}
                                onClick={() => setSelectedSubject(subject.id)}
                                className={clsx(
                                    "p-3 rounded-xl border-2 text-left transition-all",
                                    selectedSubject === subject.id
                                        ? "border-emerald-500 bg-emerald-500/10"
                                        : "border-white/10 bg-white/5 hover:border-white/20"
                                )}
                            >
                                <span className="text-xl mb-1 block">{subject.icon}</span>
                                <span className="text-sm font-medium text-white">{subject.name}</span>
                            </button>
                        ))}
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
                        dragActive
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-white/20 hover:border-white/40"
                    )}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.md"
                        onChange={(e) => e.target.files && handleFiles(e.target.files)}
                        className="hidden"
                    />
                    <Upload className={clsx(
                        "w-12 h-12 mx-auto mb-4 transition-colors",
                        dragActive ? "text-emerald-400" : "text-slate-500"
                    )} />
                    <p className="text-white font-bold mb-2">
                        Drag & drop files here, or{" "}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-emerald-400 hover:text-emerald-300 underline"
                        >
                            browse
                        </button>
                    </p>
                    <p className="text-sm text-slate-500">
                        Supports PDF, DOC, DOCX, TXT, MD files
                    </p>
                </div>

                {/* Uploaded Files */}
                {files.length > 0 && (
                    <div className="space-y-4 mb-8">
                        <h3 className="text-lg font-bold text-white">Uploaded Materials</h3>
                        {files.map((file) => (
                            <div
                                key={file.id}
                                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{file.name}</p>
                                            <p className="text-xs text-slate-500">
                                                {formatFileSize(file.size)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFile(file.id)}
                                        className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Progress/Status */}
                                {file.status === "uploading" && (
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-slate-400">Uploading...</span>
                                            <span className="text-white">{file.progress}%</span>
                                        </div>
                                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 transition-all"
                                                style={{ width: `${file.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {file.status === "processing" && (
                                    <div className="flex items-center gap-2 text-amber-400 mb-4">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm">Analyzing content with AI...</span>
                                    </div>
                                )}

                                {file.status === "done" && (
                                    <div className="flex items-center gap-2 text-green-400 mb-4">
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="text-sm">Analysis complete</span>
                                    </div>
                                )}

                                {/* Generated Problem */}
                                {file.generatedProblem && (
                                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles className="w-4 h-4 text-emerald-400" />
                                            <span className="text-sm font-bold text-emerald-400">Generated Problem</span>
                                        </div>
                                        <h4 className="text-white font-bold mb-1">
                                            {file.generatedProblem.title}
                                        </h4>
                                        <p className="text-sm text-slate-400 line-clamp-3">
                                            {file.generatedProblem.description}
                                        </p>
                                    </div>
                                )}

                                {/* Actions */}
                                {file.status === "done" && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => generateProblemsFromMaterial(file.id)}
                                            disabled={isGenerating || !selectedSubject}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium transition-all"
                                        >
                                            <Sparkles className="w-4 h-4" />
                                            Generate Problems
                                        </button>
                                        {file.generatedProblem && (
                                            <button
                                                onClick={() => createProblemFromMaterial(file)}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all"
                                            >
                                                <Code2 className="w-4 h-4" />
                                                Create as Problem
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Info Box */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                        <div>
                            <h4 className="text-amber-400 font-bold mb-1">AI-Powered Generation</h4>
                            <p className="text-sm text-amber-200/80">
                                Our AI analyzes your uploaded study materials to automatically generate relevant coding problems. 
                                The generated problems are tailored to the selected subject area and follow competitive programming conventions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
