"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { ArrowLeft, Code2, Save, X } from "lucide-react";
import { snippetApi } from "@/lib/snippet-api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

const LANGUAGES = [
    { value: "python", label: "Python" },
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "c", label: "C" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
];

export default function CreateSnippetPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [language, setLanguage] = useState("python");
    const [codeContent, setCodeContent] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [isPublic, setIsPublic] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const addTag = () => {
        const trimmed = tagInput.trim().toLowerCase();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
        }
        setTagInput("");
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !codeContent) return;

        setSubmitting(true);
        try {
            const res: any = await snippetApi.create({
                title,
                description: description || undefined,
                language,
                code_content: codeContent,
                tags,
                is_public: isPublic,
            });
            router.push(`/snippets/${res.data.id}`);
        } catch {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            <div className="max-w-4xl mx-auto px-4 py-10">
                <Link
                    href="/snippets"
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Snippets
                </Link>

                <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Code2 className="w-6 h-6 text-blue-600" />
                        <h1 className="text-xl font-bold text-slate-900">Create Snippet</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Snippet title"
                                required
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description..."
                                rows={2}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                >
                                    {LANGUAGES.map((l) => (
                                        <option key={l.value} value={l.value}>{l.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Visibility</label>
                                <select
                                    value={isPublic ? "public" : "private"}
                                    onChange={(e) => setIsPublic(e.target.value === "public")}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                >
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
                            <div className="flex gap-2 mb-2 flex-wrap">
                                {tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-200"
                                    >
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-blue-900">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                                    placeholder="Add a tag and press Enter"
                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={addTag}
                                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Code *</label>
                            <textarea
                                value={codeContent}
                                onChange={(e) => setCodeContent(e.target.value)}
                                placeholder="Paste your code here..."
                                required
                                rows={16}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                                spellCheck={false}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || !title || !codeContent}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            {submitting ? "Saving..." : "Save Snippet"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
