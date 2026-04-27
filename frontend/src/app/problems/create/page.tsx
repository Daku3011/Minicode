"use client";

import { useState, useRef } from "react";
import {
    ChevronLeft, Send, Sparkles, BookOpen,
    Lock, Loader2, FileText, Code2, Eye, PenLine,
    Upload, Search, RotateCcw, Plus, Trash2, Lightbulb,
    FileInput, FileOutput, ListOrdered, Globe, Shield,
    Trophy
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import api from "@/lib/api";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const SUBJECT_CATEGORIES = [
    {
        title: "1. Core DSA Subjects",
        items: [
            { id: "data-structures", name: "Data Structures", icon: "🌳" },
            { id: "algorithms", name: "Algorithms", icon: "⚙️" },
            { id: "strings", name: "Arrays & Strings", icon: "📝" },
            { id: "linked-list", name: "Linked List", icon: "🔗" },
            { id: "stack-queue", name: "Stack & Queue", icon: "📚" },
            { id: "trees-binary-trees", name: "Trees & Binary Trees", icon: "🌲" },
            { id: "heap-priority-queue", name: "Heap / Priority Queue", icon: "📊" },
            { id: "graphs", name: "Graph Theory", icon: "⚙️" },
            { id: "dp", name: "Dynamic Programming", icon: "📉" },
            { id: "greedy-algorithms", name: "Greedy Algorithms", icon: "🍕" },
            { id: "backtracking", name: "Backtracking", icon: "↩️" },
            { id: "bit-manipulation", name: "Bit Manipulation", icon: "🔢" },
            { id: "math", name: "Mathematics", icon: "🔢" },
            { id: "number-theory", name: "Number Theory", icon: "🔐" },
            { id: "combinatorics", name: "Combinatorics", icon: "🎲" },
            { id: "geometry", name: "Geometry", icon: "📐" },
            { id: "game-theory", name: "Game Theory", icon: "🎮" },
        ]
    },
    {
        title: "2. Real-World Problem Domains",
        items: [
            { id: "logistics-routing", name: "Logistics & Routing Systems", icon: "🚚" },
            { id: "fintech-payment", name: "Fintech & Payment Systems", icon: "💳" },
            { id: "social-media", name: "Social Media Systems", icon: "📱" },
            { id: "ecommerce", name: "E-commerce Systems", icon: "🛒" },
            { id: "gaming-simulation", name: "Gaming & Simulation", icon: "🎮" },
            { id: "healthcare", name: "Healthcare Systems", icon: "🏥" },
            { id: "networking-systems", name: "Networking & Systems", icon: "🌐" },
            { id: "cybersecurity", name: "Cybersecurity & Cryptography", icon: "🔐" },
        ]
    },
    {
        title: "3. Trending / Future Tech",
        items: [
            { id: "ai-ml", name: "AI / Machine Learning Basics", icon: "🤖" },
            { id: "data-analytics", name: "Data Analytics & Big Data", icon: "📊" },
            { id: "blockchain", name: "Blockchain & Web3", icon: "⛓️" },
            { id: "cloud-distributed", name: "Cloud & Distributed Systems", icon: "☁️" },
            { id: "realtime-systems", name: "Real-time Systems", icon: "📡" },
            { id: "search-ranking", name: "Search & Ranking Systems", icon: "🔍" },
        ]
    }
];

const subjects = SUBJECT_CATEGORIES.flatMap(c => c.items);


const levels = [
    { level: 1, name: "Code Beginner", minXP: 0 },
    { level: 2, name: "Code Explorer", minXP: 100 },
    { level: 3, name: "Code Ninja", minXP: 300 },
    { level: 4, name: "Code Warrior", minXP: 600 },
    { level: 5, name: "Code Master", minXP: 1000 },
    { level: 6, name: "Code Legend", minXP: 1500 },
];

const xpRewards = [
    { value: 50, label: "50 XP - Easy" },
    { value: 100, label: "100 XP - Medium" },
    { value: 150, label: "150 XP - Medium" },
    { value: 200, label: "200 XP - Hard" },
    { value: 300, label: "300 XP - Hard" },
    { value: 500, label: "500 XP - Expert" },
];

export default function CreateProblemPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [isAiImproving, setIsAiImproving] = useState(false);
    const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
    const [formData, setFormData] = useState({
        title: "",
        difficulty: "Easy",
        subject: "algorithms",
        level: 1,
        xp_reward: 100,
        visibility: "public",
        description: "",
        hints: "",
        input_format: "",
        output_format: "",
        constraints: "",
    });
    const [testCases, setTestCases] = useState([
        { id: 1, input_data: "", expected_output: "", is_sample: true },
    ]);
    const [showSuccess, setShowSuccess] = useState(false);

    const handlePublish = async () => {
        if (!formData.title || !formData.description) {
            alert("Please fill in the required fields");
            return;
        }

        const validTestCases = testCases.filter(tc => tc.input_data.trim() && tc.expected_output.trim());
        if (validTestCases.length === 0) {
            alert("Please add at least one test case");
            return;
        }

        setIsPublishing(true);
        try {
            const problemData = {
                title: formData.title,
                description: formData.description,
                difficulty: formData.difficulty,
                subject: formData.subject,
                level: formData.level,
                xp_reward: formData.xp_reward,
                visibility: formData.visibility,
                hints: formData.hints || null,
                input_format: formData.input_format || null,
                output_format: formData.output_format || null,
                constraints: formData.constraints || null,
            };

            const problemRes = await api.post("/problems", problemData);
            const problemId = problemRes.data.id;

            for (const tc of validTestCases) {
                await api.post(`/problems/${problemId}/testcases`, {
                    input_data: tc.input_data,
                    expected_output: tc.expected_output,
                    is_sample: tc.is_sample,
                });
            }

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

    const addTestCase = () => {
        setTestCases([
            ...testCases,
            { id: Date.now(), input_data: "", expected_output: "", is_sample: false },
        ]);
    };

    const removeTestCase = (id: number) => {
        if (testCases.length > 1) {
            setTestCases(testCases.filter(tc => tc.id !== id));
        }
    };

    const updateTestCase = (id: number, field: string, value: string | boolean) => {
        setTestCases(testCases.map(tc =>
            tc.id === id ? { ...tc, [field]: value } : tc
        ));
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

    const handleAiImprove = async () => {
        setIsAiImproving(true);
        try {
            const res = await api.post("/problems/improve-ai", {
                title: formData.title,
                description: formData.description,
                difficulty: formData.difficulty,
                subject: formData.subject,
                hints: formData.hints || null,
                input_format: formData.input_format || null,
                output_format: formData.output_format || null,
                constraints: formData.constraints || null,
            });

            if (res.data) {
                setFormData(prev => ({
                    ...prev,
                    title: res.data.title || prev.title,
                    description: res.data.description || prev.description,
                    input_format: res.data.input_format || prev.input_format,
                    output_format: res.data.output_format || prev.output_format,
                    constraints: res.data.constraints || prev.constraints,
                    hints: res.data.hints || prev.hints,
                }));
            }
        } catch (error) {
            console.error("AI Improvement failed:", error);
            alert("AI Improvement failed. Ensure API key is configured.");
        } finally {
            setIsAiImproving(false);
        }
    };

    const selectedLevel = levels.find(l => l.level === formData.level);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
            {/* Header Section */}
            <div className="bg-white border-b border-blue-100">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <Link href="/faculty/problems" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-xs font-bold uppercase tracking-wider">
                                <ChevronLeft className="w-4 h-4" />
                                Back to Registry
                            </Link>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Forge <span className="text-blue-600">Problem</span></h1>
                            <p className="text-slate-500 font-medium text-sm">Architect logical challenges for your students</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                                <button
                                    onClick={() => setActiveTab('editor')}
                                    className={clsx(
                                        "flex items-center gap-2 px-6 py-2 rounded-lg transition-all font-bold text-xs uppercase tracking-wider",
                                        activeTab === 'editor' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    <PenLine className="w-4 h-4" />
                                    Editor
                                </button>
                                <button
                                    onClick={() => setActiveTab('preview')}
                                    className={clsx(
                                        "flex items-center gap-2 px-6 py-2 rounded-lg transition-all font-bold text-xs uppercase tracking-wider",
                                        activeTab === 'preview' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    <Eye className="w-4 h-4" />
                                    Preview
                                </button>
                            </div>
                            <button
                                onClick={handleAiImprove}
                                disabled={isAiImproving || !formData.title || !formData.description}
                                className="bg-slate-800 text-slate-200 hover:bg-slate-900 hover:text-white px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-lg shadow-slate-200 disabled:opacity-50 disabled:shadow-none"
                            >
                                {isAiImproving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                <span>{isAiImproving ? "Improving..." : "Improve with AI"}</span>
                            </button>
                            <button
                                onClick={handlePublish}
                                disabled={isPublishing || !formData.title || !formData.description}
                                className="bg-blue-600 text-white hover:bg-blue-700 px-10 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none"
                            >
                                {isPublishing ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                <span>{isPublishing ? "Publishing..." : "Publish Problem"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                {showSuccess && (
                    <div className="bg-emerald-50 border border-emerald-100 mb-10 p-6 rounded-2xl flex items-center gap-6 text-emerald-700 font-bold">
                        <div className="p-3 bg-emerald-100 rounded-xl">
                            <Sparkles className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm">Problem integrated successfully. Redirecting to registry...</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-8 space-y-8">
                        {activeTab === 'editor' ? (
                            <div className="bg-white border border-blue-100 p-8 space-y-10 rounded-3xl shadow-sm">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest block ml-1 leading-none">Problem Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-slate-50 border border-blue-100 rounded-2xl px-6 py-5 text-xl font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                                        placeholder="e.g. Invert a Binary Tree"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest block ml-1 leading-none">Problem Description (Markdown)</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={12}
                                        className="w-full bg-slate-50 text-slate-900 border border-blue-100 rounded-2xl p-6 text-sm font-medium leading-relaxed focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 resize-none"
                                        placeholder="Describe the problem, input format, and output format..."
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white border border-blue-100 p-8 min-h-[600px] rounded-3xl shadow-sm overflow-hidden">
                                {formData.description ? (
                                    <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-headings:text-slate-900 prose-headings:font-black prose-strong:text-blue-600 prose-code:text-blue-600 prose-code:bg-blue-50 prose-pre:bg-slate-900 prose-pre:text-white prose-pre:rounded-xl">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{formData.description}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-300 py-32 space-y-4">
                                        <FileText className="w-16 h-16 opacity-30" />
                                        <p className="text-sm font-bold uppercase tracking-[0.2em]">No content to preview</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Test Cases Section */}
                        <div className="bg-white border border-blue-100 p-8 space-y-8 rounded-3xl shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                                        <Code2 className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none">
                                        Test Cases
                                    </h3>
                                </div>
                                <button
                                    onClick={addTestCase}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Case
                                </button>
                            </div>

                            <p className="text-xs text-slate-500 font-medium">Add test cases to validate student solutions. Sample cases are visible to students.</p>

                            <div className="space-y-6">
                                {testCases.map((tc, index) => (
                                    <div key={tc.id} className="bg-slate-50 border border-blue-100 p-6 rounded-2xl space-y-4 relative group">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Test Case #{index + 1}</span>
                                            <div className="flex items-center gap-6">
                                                <label className="flex items-center gap-3 cursor-pointer group/toggle">
                                                    <div className="relative">
                                                        <input
                                                            type="checkbox"
                                                            checked={tc.is_sample}
                                                            onChange={(e) => updateTestCase(tc.id, 'is_sample', e.target.checked)}
                                                            className="sr-only"
                                                        />
                                                        <div className={clsx(
                                                            "w-10 h-5 rounded-full transition-colors duration-200",
                                                            tc.is_sample ? "bg-blue-600" : "bg-slate-300"
                                                        )} />
                                                        <div className={clsx(
                                                            "absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200",
                                                            tc.is_sample ? "translate-x-5" : "translate-x-0"
                                                        )} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sample / Visible</span>
                                                </label>
                                                {testCases.length > 1 && (
                                                    <button
                                                        onClick={() => removeTestCase(tc.id)}
                                                        className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                    <FileInput className="w-3.5 h-3.5 text-blue-500" />
                                                    Input Data
                                                </label>
                                                <textarea
                                                    value={tc.input_data}
                                                    onChange={(e) => updateTestCase(tc.id, 'input_data', e.target.value)}
                                                    rows={3}
                                                    className="w-full bg-white border border-blue-100 rounded-xl px-4 py-3 text-sm font-mono text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300 resize-none"
                                                    placeholder="Standard input string..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                    <FileOutput className="w-3.5 h-3.5 text-blue-500" />
                                                    Expected Output
                                                </label>
                                                <textarea
                                                    value={tc.expected_output}
                                                    onChange={(e) => updateTestCase(tc.id, 'expected_output', e.target.value)}
                                                    rows={3}
                                                    className="w-full bg-white border border-blue-100 rounded-xl px-4 py-3 text-sm font-mono text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300 resize-none"
                                                    placeholder="Expected standard output..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Format & Constraints */}
                        <div className="bg-white border border-blue-100 p-8 space-y-8 rounded-3xl shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                                    <ListOrdered className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none">
                                    Format, Constraints & Hints
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest block ml-1 leading-none">Input Format</label>
                                    <textarea
                                        value={formData.input_format}
                                        onChange={(e) => setFormData({ ...formData, input_format: e.target.value })}
                                        rows={4}
                                        className="w-full bg-slate-50 text-slate-900 border border-blue-100 rounded-2xl p-6 text-sm font-medium focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 resize-none"
                                        placeholder="Describe parameters/data input..."
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest block ml-1 leading-none">Output Format</label>
                                    <textarea
                                        value={formData.output_format}
                                        onChange={(e) => setFormData({ ...formData, output_format: e.target.value })}
                                        rows={4}
                                        className="w-full bg-slate-50 text-slate-900 border border-blue-100 rounded-2xl p-6 text-sm font-medium focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 resize-none"
                                        placeholder="Describe return values/results..."
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest block ml-1 leading-none">Constraints</label>
                                    <textarea
                                        value={formData.constraints}
                                        onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                                        rows={4}
                                        className="w-full bg-slate-50 text-slate-900 border border-blue-100 rounded-2xl p-6 text-sm font-medium focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 resize-none"
                                        placeholder="e.g. 1 <= N <= 10^5"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest block ml-1 leading-none">Hints</label>
                                    <textarea
                                        value={formData.hints}
                                        onChange={(e) => setFormData({ ...formData, hints: e.target.value })}
                                        rows={4}
                                        className="w-full bg-slate-50 text-slate-900 border border-blue-100 rounded-2xl p-6 text-sm font-medium focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 resize-none"
                                        placeholder="Provide helpful hints for students..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Controls */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* AI Generation */}
                        <div className="bg-white border-2 border-blue-600 p-8 space-y-6 rounded-3xl shadow-xl shadow-blue-100 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Sparkles className="w-20 h-20 text-blue-600" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Sparkles className="w-5 h-5" />
                                        AI Blueprint
                                    </h3>
                                    {isAiGenerating && (
                                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">Upload a PDF or TXT problem statement and let AI draft the description and title for you.</p>

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isAiGenerating}
                                    className={clsx(
                                        "w-full p-6 rounded-2xl border-2 border-dashed flex flex-col items-center gap-4 transition-all",
                                        isAiGenerating
                                            ? "bg-slate-50 border-slate-200"
                                            : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-400"
                                    )}
                                >
                                    <Upload className="w-8 h-8" />
                                    <span className="text-xs font-black uppercase tracking-widest">Inject Blueprint</span>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        accept=".pdf,.txt"
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Subject Selection */}
                        <div className="bg-white border border-blue-100 p-8 space-y-6 rounded-3xl shadow-sm">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 leading-none">
                                <BookOpen className="w-4 h-4 text-blue-600" />
                                Subject
                            </h3>
                            <div className="space-y-6">
                                {SUBJECT_CATEGORIES.map((category, catIdx) => (
                                    <div key={catIdx} className="space-y-3">
                                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{category.title}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                            {category.items.map((sub) => (
                                                <button
                                                    key={sub.id}
                                                    onClick={() => setFormData({ ...formData, subject: sub.id })}
                                                    className={clsx(
                                                        "flex items-center justify-between p-3 rounded-xl border transition-all group text-left",
                                                        formData.subject === sub.id
                                                            ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                                                            : "border-slate-100 bg-slate-50 text-slate-500 hover:border-blue-200 hover:bg-white hover:text-slate-700"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                                                        <span className="text-base flex-shrink-0">{sub.icon}</span>
                                                        <span className="font-semibold text-xs uppercase tracking-wider leading-tight break-words whitespace-normal flex-1">{sub.name}</span>
                                                    </div>
                                                    {formData.subject === sub.id && (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Access & Visibility */}
                        <div className="bg-white border border-blue-100 p-8 space-y-6 rounded-3xl shadow-sm">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 leading-none">
                                <Shield className="w-4 h-4 text-blue-600" />
                                Visibility
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={() => setFormData({ ...formData, visibility: "public" })}
                                    className={clsx(
                                        "p-5 rounded-2xl border transition-all flex items-center gap-4",
                                        formData.visibility === "public"
                                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                                            : "border-slate-100 bg-slate-50 text-slate-400 hover:border-emerald-200"
                                    )}
                                >
                                    <div className={clsx(
                                        "p-2 rounded-lg",
                                        formData.visibility === "public" ? "bg-emerald-100" : "bg-white"
                                    )}>
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-[10px] uppercase tracking-widest mb-0.5">Public Domain</p>
                                        <p className="text-[9px] opacity-70 font-medium tracking-tight">Available to all students</p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setFormData({ ...formData, visibility: "private" })}
                                    className={clsx(
                                        "p-5 rounded-2xl border transition-all flex items-center gap-4",
                                        formData.visibility === "private"
                                            ? "border-rose-500 bg-rose-50 text-rose-700 shadow-sm"
                                            : "border-slate-100 bg-slate-50 text-slate-400 hover:border-rose-200"
                                    )}
                                >
                                    <div className={clsx(
                                        "p-2 rounded-lg",
                                        formData.visibility === "private" ? "bg-rose-100" : "bg-white"
                                    )}>
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-[10px] uppercase tracking-widest mb-0.5">Restricted</p>
                                        <p className="text-[9px] opacity-70 font-medium tracking-tight">Only visible to your cohorts</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Difficulty & XP */}
                        <div className="bg-white border border-blue-100 p-8 space-y-8 rounded-3xl shadow-sm">
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 leading-none">
                                    <Search className="w-4 h-4 text-blue-600" />
                                    Difficulty
                                </h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {["Easy", "Medium", "Hard"].map((diff) => (
                                        <button
                                            key={diff}
                                            onClick={() => setFormData({ ...formData, difficulty: diff })}
                                            className={clsx(
                                                "py-4 rounded-xl border transition-all font-black text-[10px] uppercase tracking-widest",
                                                formData.difficulty === diff
                                                    ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                                                    : "border-slate-100 bg-slate-50 text-slate-400 hover:bg-white hover:text-slate-600"
                                            )}
                                        >
                                            {diff}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-100 space-y-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest leading-none">Level Gate</p>
                                    <span className="text-blue-600 font-black text-2xl tracking-tighter tabular-nums">0{formData.level}</span>
                                </div>
                                <div className="grid grid-cols-6 gap-2">
                                    {levels.map((lvl) => (
                                        <button
                                            key={lvl.level}
                                            onClick={() => setFormData({ ...formData, level: lvl.level })}
                                            className={clsx(
                                                "aspect-square rounded-lg flex items-center justify-center text-[10px] font-black transition-all",
                                                formData.level === lvl.level
                                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                                    : "bg-slate-50 text-slate-400 border border-slate-100 hover:text-slate-700"
                                            )}
                                        >
                                            {lvl.level}
                                        </button>
                                    ))}
                                </div>
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                                    <Lock className="w-4 h-4 text-blue-600 opacity-50" />
                                    <p className="text-[10px] text-blue-700 font-bold uppercase tracking-tight leading-none">
                                        Required: {selectedLevel?.name}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-100 space-y-6">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 leading-none">
                                    <Trophy className="w-4 h-4 text-amber-500" />
                                    Reward Bounty
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {xpRewards.map((xp) => (
                                        <button
                                            key={xp.value}
                                            onClick={() => setFormData({ ...formData, xp_reward: xp.value })}
                                            className={clsx(
                                                "p-4 rounded-xl border transition-all font-black text-[10px] uppercase tracking-widest",
                                                formData.xp_reward === xp.value
                                                    ? "border-amber-500 bg-amber-50 text-amber-700 shadow-sm shadow-amber-100"
                                                    : "border-slate-100 bg-slate-50 text-slate-400 hover:bg-white hover:text-slate-600"
                                            )}
                                        >
                                            {xp.label}
                                        </button>
                                    ))}
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
