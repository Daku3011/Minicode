"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { clsx } from "clsx";
import {
    ArrowLeft,
    ThumbsUp,
    ThumbsDown,
    Trash2,
    Edit3,
    Clock,
    User,
    Globe,
    Lock,
} from "lucide-react";
import { snippetApi } from "@/lib/snippet-api";
import { useAuth } from "@/contexts/AuthContext";

interface Snippet {
    id: number;
    user_id: number;
    title: string;
    description?: string;
    language: string;
    code_content: string;
    tags_json?: string;
    is_public: boolean;
    upvotes: number;
    downvotes: number;
    created_at: string;
    updated_at?: string;
}

interface Comment {
    id: number;
    content: string;
    created_at: string;
}

export default function SnippetDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [snippet, setSnippet] = useState<Snippet | null>(null);
    const [votes, setVotes] = useState({ upvotes: 0, downvotes: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        snippetApi.get(Number(id))
            .then((res: any) => {
                setSnippet(res.data.snippet);
                setVotes({ upvotes: res.data.snippet.upvotes, downvotes: res.data.snippet.downvotes });
            })
            .catch(() => router.push("/snippets"))
            .finally(() => setLoading(false));
    }, [id, router]);

    const handleVote = async (voteType: "upvote" | "downvote") => {
        if (!snippet) return;
        try {
            const res: any = await snippetApi.vote(snippet.id, voteType);
            setVotes(res.data);
        } catch {}
    };

    const handleDelete = async () => {
        if (!snippet || !confirm("Delete this snippet?")) return;
        try {
            await snippetApi.delete(snippet.id);
            router.push("/snippets");
        } catch {}
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
                <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!snippet) return null;

    const tags: string[] = snippet.tags_json ? JSON.parse(snippet.tags_json) : [];
    const isOwner = user && user.id === snippet.user_id;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            <div className="max-w-4xl mx-auto px-4 py-10">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 min-w-0">
                                <h1 className="text-xl font-bold text-slate-900 truncate">
                                    {snippet.title}
                                </h1>
                                {snippet.description && (
                                    <p className="text-sm text-slate-500 mt-1">{snippet.description}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-4">
                                {isOwner && (
                                    <>
                                        <button
                                            onClick={() => router.push(`/snippets/${snippet.id}/edit`)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs">
                            <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 border border-blue-200 font-medium">
                                {snippet.language}
                            </span>
                            {snippet.is_public ? (
                                <span className="flex items-center gap-1 text-slate-400">
                                    <Globe className="w-3.5 h-3.5" /> Public
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-slate-400">
                                    <Lock className="w-3.5 h-3.5" /> Private
                                </span>
                            )}
                            <span className="flex items-center gap-1 text-slate-400">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(snippet.created_at).toLocaleDateString()}
                            </span>
                        </div>

                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                                {tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-6">
                        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto text-sm font-mono leading-relaxed">
                            <code>{snippet.code_content}</code>
                        </pre>
                    </div>

                    <div className="px-6 pb-6 flex items-center gap-3">
                        <button
                            onClick={() => handleVote("upvote")}
                            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors"
                        >
                            <ThumbsUp className="w-4 h-4" />
                            {votes.upvotes}
                        </button>
                        <button
                            onClick={() => handleVote("downvote")}
                            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-colors"
                        >
                            <ThumbsDown className="w-4 h-4" />
                            {votes.downvotes}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
