"use client";

import { useState, useRef } from "react"; 
import { 
    ChevronLeft, Send, Sparkles, BookOpen, 
    Lock, Loader2, FileText, Code2, Eye, PenLine, 
    Upload, Search, RotateCcw, Plus, Trash2, Lightbulb,
    FileInput, FileOutput, ListOrdered
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
    const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
    const [formData, setFormData] = useState({
        title: "",
        difficulty: "Easy",
        subject: "algorithms",
        level: 1,
        xp_reward: 100,
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
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-2xl font-black text-white focus:outline-none focus:border-primary/40 transition-all placeholder:text-slate-500 uppercase tracking-tighter"
                                        placeholder="Enter Mission Label..."
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] block ml-1 leading-none">Logical Stream (Markdown)</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={15}
                                        className="w-full bg-white/5 text-white border border-white/10 rounded-2xl p-8 text-sm font-bold leading-relaxed focus:outline-none focus:border-primary/40 transition-all placeholder:text-slate-500 resize-none uppercase tracking-tight"
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
                                        <p className="text-[15px] font-black uppercase tracking-[0.4em] text-slate-500">Signal Expected</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Test Cases Section */}
                    <div className="bg-white/[0.02] border border-white/5 p-10 space-y-8 rounded-3xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2 leading-none">
                                <Code2 className="w-4 h-4 text-primary" />
                                Test Cases
                            </h3>
                            <button
                                onClick={addTestCase}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                Add
                            </button>
                        </div>
                        
                        <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest">Add test cases to validate student solutions</p>
                        
                        <div className="space-y-6">
                            {testCases.map((tc, index) => (
                                <div key={tc.id} className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Test Case #{index + 1}</span>
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={tc.is_sample}
                                                    onChange={(e) => updateTestCase(tc.id, 'is_sample', e.target.checked)}
                                                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
                                                />
                                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Sample (Visible)</span>
                                            </label>
                                            {testCases.length > 1 && (
                                                <button
                                                    onClick={() => removeTestCase(tc.id)}
                                                    className="p-2 text-slate-700 hover:text-rose-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                                <FileInput className="w-3 h-3" />
                                                Input
                                            </label>
                                            <textarea
                                                value={tc.input_data}
                                                onChange={(e) => updateTestCase(tc.id, 'input_data', e.target.value)}
                                                rows={3}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-primary/40 transition-all placeholder:text-slate-600 resize-none"
                                                placeholder="Enter input data..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                                <FileOutput className="w-3 h-3" />
                                                Expected Output
                                            </label>
                                            <textarea
                                                value={tc.expected_output}
                                                onChange={(e) => updateTestCase(tc.id, 'expected_output', e.target.value)}
                                                rows={3}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-primary/40 transition-all placeholder:text-slate-600 resize-none"
                                                placeholder="Enter expected output..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hints Section */}
                    <div className="bg-white/[0.02] border border-white/5 p-10 space-y-8 rounded-3xl">
                        <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2 leading-none">
                            <Lightbulb className="w-4 h-4 text-amber-400" />
                            Hints (Optional)
                        </h3>
                        <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest">Provide hints to help students who are stuck</p>
                        <textarea
                            value={formData.hints}
                            onChange={(e) => setFormData({ ...formData, hints: e.target.value })}
                            rows={4}
                            className="w-full bg-white/5 text-white border border-white/10 rounded-2xl p-8 text-sm font-bold leading-relaxed focus:outline-none focus:border-primary/40 transition-all placeholder:text-slate-500 resize-none uppercase tracking-tight"
                            placeholder="Enter hints for students (supports Markdown)..."
                        />
                    </div>

                    {/* Input/Output Format & Constraints */}
                    <div className="bg-white/[0.02] border border-white/5 p-10 space-y-8 rounded-3xl">
                        <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2 leading-none">
                            <ListOrdered className="w-4 h-4 text-primary" />
                            Format & Constraints
                        </h3>
                        
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                    <FileInput className="w-3 h-3" />
                                    Input Format
                                </label>
                                <textarea
                                    value={formData.input_format}
                                    onChange={(e) => setFormData({ ...formData, input_format: e.target.value })}
                                    rows={3}
                                    className="w-full bg-white/5 text-white border border-white/10 rounded-2xl p-6 text-sm font-bold leading-relaxed focus:outline-none focus:border-primary/40 transition-all placeholder:text-slate-500 resize-none uppercase tracking-tight"
                                    placeholder="Describe the input format (e.g., First line contains n, next line contains n integers)..."
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                    <FileOutput className="w-3 h-3" />
                                    Output Format
                                </label>
                                <textarea
                                    value={formData.output_format}
                                    onChange={(e) => setFormData({ ...formData, output_format: e.target.value })}
                                    rows={3}
                                    className="w-full bg-white/5 text-white border border-white/10 rounded-2xl p-6 text-sm font-bold leading-relaxed focus:outline-none focus:border-primary/40 transition-all placeholder:text-slate-500 resize-none uppercase tracking-tight"
                                    placeholder="Describe the output format (e.g., Print a single integer representing the sum)..."
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                    <Search className="w-3 h-3" />
                                    Constraints
                                </label>
                                <textarea
                                    value={formData.constraints}
                                    onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                                    rows={3}
                                    className="w-full bg-white/5 text-white border border-white/10 rounded-2xl p-6 text-sm font-bold leading-relaxed focus:outline-none focus:border-primary/40 transition-all placeholder:text-slate-500 resize-none uppercase tracking-tight"
                                    placeholder="List constraints (e.g., 1 ≤ n ≤ 10^5, 1 ≤ arr[i] ≤ 10^9)..."
                                />
                            </div>
                        </div>
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

                            {/* XP Reward Selection */}
                            <div className="pt-8 border-t border-white/5 space-y-8">
                                <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2 leading-none">
                                    <Sparkles className="w-4 h-4 text-amber-400" />
                                    XP Bounty
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {xpRewards.map((xp) => (
                                        <button
                                            key={xp.value}
                                            onClick={() => setFormData({ ...formData, xp_reward: xp.value })}
                                            className={clsx(
                                                "p-4 rounded-xl border transition-all font-black text-[10px] uppercase tracking-widest",
                                                formData.xp_reward === xp.value
                                                    ? "border-amber-400 bg-amber-400/10 text-amber-400"
                                                    : "border-white/5 bg-white/5 text-slate-700 hover:text-slate-500"
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
