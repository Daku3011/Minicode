"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { clsx } from "clsx";
import {
    ArrowLeft,
    ThumbsUp,
    ThumbsDown,
    Trash2,
    Clock,
    User,
    Globe,
    Lock,
    MessageSquare,
    Send,
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
    user_id?: number;
    author_name?: string;
    author_avatar?: string | null;
    created_at: string;
}

export default function SnippetDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [snippet, setSnippet] = useState<Snippet | null>(null);
    const [votes, setVotes] = useState({ upvotes: 0, downvotes: 0 });
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [postingComment, setPostingComment] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        snippetApi.get(Number(id))
            .then((res: any) => {
                setSnippet(res.data.snippet);
                setVotes({ upvotes: res.data.snippet.upvotes, downvotes: res.data.snippet.downvotes });
                setComments(res.data.comments || []);
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

    const handleComment = async () => {
        if (!snippet || !newComment.trim()) return;
        setPostingComment(true);
        try {
            const res: any = await snippetApi.comment(snippet.id, newComment.trim());
            setComments((prev) => [...prev, res.data]);
            setNewComment("");
        } catch {}
        finally {
            setPostingComment(false);
        }
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
                                    <button
                                        onClick={handleDelete}
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                        aria-label="Delete snippet"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
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
                            aria-label="Upvote snippet"
                        >
                            <ThumbsUp className="w-4 h-4" />
                            {votes.upvotes}
                        </button>
                        <button
                            onClick={() => handleVote("downvote")}
                            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-colors"
                            aria-label="Downvote snippet"
                        >
                            <ThumbsDown className="w-4 h-4" />
                            {votes.downvotes}
                        </button>
                    </div>

                    {/* Comments */}
                    <div className="border-t border-slate-100 p-6 space-y-5">
                        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                            Comments ({comments.length})
                        </h2>

                        {comments.length === 0 && (
                            <p role="status" className="text-sm text-slate-400 py-2">
                                No comments yet. Start the conversation.
                            </p>
                        )}

                        {comments.length > 0 && (
                            <ul role="list" className="space-y-4">
                                {comments.map((comment) => (
                                    <li key={comment.id} className="flex gap-3">
                                        <div className="h-8 w-8 shrink-0 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-slate-500">
                                            {comment.author_avatar ? (
                                                <img
                                                    src={comment.author_avatar}
                                                    alt=""
                                                    referrerPolicy="no-referrer"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-4 h-4" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                                            <div className="flex flex-wrap items-center gap-x-2 text-xs">
                                                <span className="font-semibold text-slate-700">
                                                    {comment.author_name || "unknown"}
                                                </span>
                                                <span className="text-slate-400">
                                                    {new Date(comment.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-600">
                                                {comment.content}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {user ? (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleComment();
                                }}
                                className="flex items-end gap-3 pt-1"
                            >
                                <label htmlFor="snippet-comment" className="sr-only">
                                    Add a comment
                                </label>
                                <textarea
                                    id="snippet-comment"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment…"
                                    rows={2}
                                    className="flex-1 resize-none rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                    type="submit"
                                    disabled={postingComment || !newComment.trim()}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                                    aria-label="Post comment"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        ) : (
                            <p className="text-sm text-slate-400">
                                Log in to join the discussion.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
