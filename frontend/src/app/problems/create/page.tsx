"use client";

import { useState } from "react";
import { ChevronLeft, Save, PlayCircle, Plus, Trash2, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function CreateProblemPage() {
    const [title, setTitle] = useState("");
    const [difficulty, setDifficulty] = useState("Easy");
    const [description, setDescription] = useState("");
    const [testCases, setTestCases] = useState([{ input: "", output: "" }]);
    const [isPublishing, setIsPublishing] = useState(false);
    const router = useRouter();

    const addTestCase = () => setTestCases([...testCases, { input: "", output: "" }]);
    const removeTestCase = (index: number) => setTestCases(testCases.filter((_, i) => i !== index));

    const handlePublish = async () => {
        setIsPublishing(true);
        try {
            await api.post("/problems", {
                title,
                description,
                difficulty,
            });
            // Ideally we also POST test cases here, but for now we create the problem
            router.push("/faculty/dashboard");
        } catch (error) {
            console.error("Failed to publish problem:", error);
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <Link href="/faculty/dashboard" className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-white mb-8 group transition-colors w-fit">
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Dashboard</span>
            </Link>

            <div className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2">Create New Problem</h1>
                    <p className="text-muted-foreground">Define your problem statement and test cases.</p>
                </div>
                <div className="flex items-center space-x-4">
                    <button className="px-6 py-3 rounded-2xl font-bold bg-white/5 text-white hover:bg-white/10 transition-all">
                        Save Draft
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className="px-6 py-3 rounded-2xl font-black bg-primary text-white shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all flex items-center space-x-2 disabled:opacity-50"
                    >
                        <Send className="w-5 h-5" />
                        <span>{isPublishing ? "Publishing..." : "Publish Problem"}</span>
                    </button>
                </div>
            </div>

            <div className="space-y-8">
                {/* Basic Info */}
                <div className="glass rounded-3xl p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Problem Title</label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="e.g. Find the Missing Integer"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Difficulty</label>
                            <select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                            >
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Problem Description (Markdown)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={8}
                            className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono text-sm leading-relaxed"
                            placeholder="Describe the problem, input format, and constraints..."
                        />
                    </div>
                </div>

                {/* Test Cases */}
                <div className="glass rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-white">Test Cases</h3>
                        <button
                            onClick={addTestCase}
                            className="text-xs font-bold text-primary hover:underline flex items-center space-x-1"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Test Case</span>
                        </button>
                    </div>

                    <div className="space-y-6">
                        {testCases.map((tc, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 relative group">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Input</label>
                                        <textarea
                                            value={tc.input}
                                            onChange={(e) => {
                                                const newTc = [...testCases];
                                                newTc[i].input = e.target.value;
                                                setTestCases(newTc);
                                            }}
                                            className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary/30"
                                            placeholder="Standard input..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Expected Output</label>
                                        <textarea
                                            value={tc.output}
                                            onChange={(e) => {
                                                const newTc = [...testCases];
                                                newTc[i].output = e.target.value;
                                                setTestCases(newTc);
                                            }}
                                            className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary/30"
                                            placeholder="Standard output..."
                                        />
                                    </div>
                                </div>
                                {testCases.length > 1 && (
                                    <button
                                        onClick={() => removeTestCase(i)}
                                        className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
