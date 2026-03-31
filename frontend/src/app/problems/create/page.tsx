"use client";

import { useState, useRef } from "react";
import { ChevronLeft, Save, Send, Plus, Trash2, Sparkles, BookOpen, Tag, Lock, Loader2, FileText, Code2, Eye, PenLine } from "lucide-react";
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
    { level: 1, name: "Beginner", minXP: 0 },
    { level: 2, name: "Explorer", minXP: 100 },
    { level: 3, name: "Ninja", minXP: 300 },
    { level: 4, name: "Warrior", minXP: 600 },
    { level: 5, name: "Master", minXP: 1000 },
    { level: 6, name: "Legend", minXP: 1500 },
];

export default function CreateProblemPage() {
    const router = useRouter();
    const [isPublishing, setIsPublishing] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        difficulty: "Easy",
        subject: "",
        level: 1,
        input_format: "",
        output_format: "",
        constraints: "",
        hints: "",
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [testCases, setTestCases] = useState([{ input: "", output: "", is_sample: true }]);

    const addTestCase = () => setTestCases([...testCases, { input: "", output: "", is_sample: false }]);
    const removeTestCase = (index: number) => setTestCases(testCases.filter((_, i) => i !== index));

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsGenerating(true);
        const formDataPayload = new FormData();
        formDataPayload.append("file", file);

        try {
            const response = await api.post("/problems/generate-ai", formDataPayload);
            const data = response.data;
            
            setFormData({
                ...formData,
                title: data.title || "",
                description: data.description || "",
                subject: data.subject || formData.subject, // Auto-select subject
                difficulty: data.difficulty || "Medium",
                input_format: data.input_format || "As per problem description",
                output_format: data.output_format || "As per problem description",
                constraints: data.constraints || "1 <= values <= 10^9",
                hints: data.hint || "",
            });
            
            // Clear the file input for future identical uploads
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error: any) {
            console.error("Failed to generate problem with AI:", error);
            alert(error.response?.data?.detail || "Failed to generate problem. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const generateWithAI = () => {
        fileInputRef.current?.click();
    };

    const handlePublish = async () => {
        if (!formData.title || !formData.description) {
            alert("Please fill in the required fields");
            return;
        }

        setIsPublishing(true);
        try {
            // Create problem
            const problemResponse = await api.post("/problems", {
                title: formData.title,
                description: formData.description,
                difficulty: formData.difficulty,
                subject: formData.subject,
                level: formData.level,
                input_format: formData.input_format,
                output_format: formData.output_format,
                constraints: formData.constraints,
                hints: formData.hints,
            });


            const problemId = problemResponse.data.id;

            // Create test cases
            for (const tc of testCases) {
                if (tc.input && tc.output) {
                    await api.post(`/problems/${problemId}/testcases`, {
                        input_data: tc.input,
                        expected_output: tc.output,
                        is_sample: tc.is_sample,
                    });
                }
            }

            router.push("/faculty/profile");
        } catch (error) {
            console.error("Failed to publish problem:", error);
            alert("Failed to publish problem. Please try again.");
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#0f0a1e]">
            {/* Background */}
            <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <Link href="/faculty/profile" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white mb-2">Create New Problem</h1>
                        <p className="text-slate-400">Design a coding challenge with test cases and constraints</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-5 py-2.5 rounded-xl font-bold bg-white/5 text-white hover:bg-white/10 transition-all border border-white/10">
                            <Save className="w-4 h-4 inline mr-2" />
                            Save Draft
                        </button>
                        <button
                            onClick={handlePublish}
                            disabled={isPublishing || !formData.title || !formData.description}
                            className="px-5 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-all flex items-center gap-2"
                        >
                            {isPublishing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Publishing...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Publish Problem
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Subject & Level Selection */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-400" />
                            Subject & Difficulty
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-400">Subject *</label>
                                <select
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:bg-white/10 transition-all cursor-pointer"
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map((s) => (
                                        <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-400">Difficulty</label>
                                <select
                                    value={formData.difficulty}
                                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:bg-white/10 transition-all cursor-pointer"
                                >
                                    <option value="Easy">Easy (100 XP)</option>
                                    <option value="Medium">Medium (200 XP)</option>
                                    <option value="Hard">Hard (400 XP)</option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-400">Unlock Level</label>
                                <select
                                    value={formData.level}
                                    onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:bg-white/10 transition-all cursor-pointer"
                                >
                                    {levels.map((l) => (
                                        <option key={l.level} value={l.level}>Level {l.level}: {l.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* AI Generate Button */}
                        <div className="mt-6 pt-6 border-t border-white/10">
                            <button
                                onClick={generateWithAI}
                                disabled={isGenerating}
                                className="flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white transition-all"
                            >
                                {isGenerating ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Sparkles className="w-5 h-5" />
                                )}
                                <span className="font-bold">Generate from File with AI</span>
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".txt,.pdf"
                                className="hidden"
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                Upload a lecture note or file (PDF/TXT) to automatically generate a problem and detect the subject.
                            </p>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Code2 className="w-5 h-5 text-green-400" />
                            Problem Details
                        </h3>

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-400">Problem Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="e.g., Two Sum"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-400">Problem Description * (Markdown supported)</label>
                                <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                                    <button 
                                        onClick={() => setActiveTab("write")}
                                        className={clsx("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all", activeTab === "write" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white")}
                                    >
                                        <PenLine className="w-3 h-3" />
                                        Write
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab("preview")}
                                        className={clsx("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all", activeTab === "preview" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white")}
                                    >
                                        <Eye className="w-3 h-3" />
                                        Preview
                                    </button>
                                </div>
                            </div>
                            
                            {activeTab === "write" ? (
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={10}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm min-h-[300px]"
                                    placeholder="Describe the problem in detail. Use Markdown for formatting.&#10;&#10;**Example:**&#10;Given an array of integers `nums` and an integer `target`..."
                                />
                            ) : (
                                <div className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-6 text-white min-h-[300px] overflow-y-auto prose prose-invert prose-slate prose-p:leading-relaxed prose-pre:bg-black/20 prose-pre:border prose-pre:border-white/5 prose-code:text-blue-400 prose-code:bg-blue-400/10 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none max-w-none prose-headings:text-white prose-headings:font-bold prose-strong:text-blue-500">
                                    {formData.description ? (
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {formData.description}
                                        </ReactMarkdown>
                                    ) : (
                                        <p className="text-slate-500 italic">No description to preview</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-400">Input Format</label>
                                <textarea
                                    value={formData.input_format}
                                    onChange={(e) => setFormData({ ...formData, input_format: e.target.value })}
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm"
                                    placeholder="Describe the input format..."
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-400">Output Format</label>
                                <textarea
                                    value={formData.output_format}
                                    onChange={(e) => setFormData({ ...formData, output_format: e.target.value })}
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm"
                                    placeholder="Describe the output format..."
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-400">Constraints</label>
                            <textarea
                                value={formData.constraints}
                                onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                                rows={3}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm"
                                placeholder="1 <= n <= 10^5&#10;1 <= arr[i] <= 10^9"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-400">Hints (Optional)</label>
                            <textarea
                                value={formData.hints}
                                onChange={(e) => setFormData({ ...formData, hints: e.target.value })}
                                rows={2}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm"
                                placeholder="Optional hints to help students..."
                            />
                        </div>
                    </div>

                    {/* Test Cases */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white">Test Cases</h3>
                            <button
                                onClick={addTestCase}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all text-sm font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                Add Test Case
                            </button>
                        </div>

                        <div className="space-y-4">
                            {testCases.map((tc, i) => (
                                <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-4 relative group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={clsx(
                                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                                tc.is_sample ? "bg-green-500/20 text-green-400" : "bg-slate-500/20 text-slate-400"
                                            )}>
                                                {tc.is_sample ? "Sample" : "Hidden"}
                                            </span>
                                            <span className="text-sm text-slate-400">Test Case {i + 1}</span>
                                        </div>
                                        <label className="flex items-center gap-2 text-sm text-slate-400">
                                            <input
                                                type="checkbox"
                                                checked={tc.is_sample}
                                                onChange={(e) => {
                                                    const newTc = [...testCases];
                                                    newTc[i].is_sample = e.target.checked;
                                                    setTestCases(newTc);
                                                }}
                                                className="rounded border-white/20 bg-white/5 text-blue-500"
                                            />
                                            Sample
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-400">Input</label>
                                            <textarea
                                                value={tc.input}
                                                onChange={(e) => {
                                                    const newTc = [...testCases];
                                                    newTc[i].input = e.target.value;
                                                    setTestCases(newTc);
                                                }}
                                                className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                                                placeholder="Input data..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-400">Expected Output</label>
                                            <textarea
                                                value={tc.output}
                                                onChange={(e) => {
                                                    const newTc = [...testCases];
                                                    newTc[i].output = e.target.value;
                                                    setTestCases(newTc);
                                                }}
                                                className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                                                placeholder="Expected output..."
                                            />
                                        </div>
                                    </div>

                                    {testCases.length > 1 && (
                                        <button
                                            onClick={() => removeTestCase(i)}
                                            className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
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
                        className="px-8 py-3 rounded-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white transition-all shadow-lg shadow-blue-500/20"
                    >
                        {isPublishing ? "Publishing..." : "Publish Problem"}
                    </button>
                </div>
            </div>
        </div>
    );
}
