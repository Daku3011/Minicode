"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { clsx } from "clsx";
import {
    MessageSquare,
    ThumbsUp,
    CheckCircle2,
    Send,
    Pin,
    Loader2,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { discussionApi, Thread, Reply } from "@/lib/discussion-api";
import { useAuth } from "@/contexts/AuthContext";

function timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

export default function DiscussionPage() {
    const params = useParams();
    const problemId = Number(params.id);
    const { user } = useAuth();

    const [threads, setThreads] = useState<Thread[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [sort, setSort] = useState("latest");
    const [showNewThread, setShowNewThread] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [creating, setCreating] = useState(false);

    const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
    const [replies, setReplies] = useState<Reply[]>([]);
    const [repliesLoading, setRepliesLoading] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [replying, setReplying] = useState(false);

    const perPage = 20;

    const fetchThreads = useCallback(async () => {
        setLoading(true);
        try {
            const res = await discussionApi.listThreads(
                problemId,
                page,
                perPage,
                sort
            );
            setThreads(res.data.threads);
            setTotal(res.data.total);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }, [problemId, page, sort]);

    useEffect(() => {
        fetchThreads();
    }, [fetchThreads]);

    const handleCreateThread = async () => {
        if (!newTitle.trim() || !newContent.trim()) return;
        setCreating(true);
        try {
            await discussionApi.createThread(problemId, newTitle, newContent);
            setNewTitle("");
            setNewContent("");
            setShowNewThread(false);
            fetchThreads();
        } catch {
            // ignore
        } finally {
            setCreating(false);
        }
    };

    const handleSelectThread = async (thread: Thread) => {
        setSelectedThread(thread);
        setRepliesLoading(true);
        try {
            const res = await discussionApi.listReplies(
                problemId,
                thread.id,
                1,
                50
            );
            setReplies(res.data.replies);
        } catch {
            setReplies([]);
        } finally {
            setRepliesLoading(false);
        }
    };

    const handleReply = async () => {
        if (!replyContent.trim() || !selectedThread) return;
        setReplying(true);
        try {
            await discussionApi.createReply(
                problemId,
                selectedThread.id,
                replyContent
            );
            setReplyContent("");
            const res = await discussionApi.listReplies(
                problemId,
                selectedThread.id,
                1,
                50
            );
            setReplies(res.data.replies);
        } catch {
            // ignore
        } finally {
            setReplying(false);
        }
    };

    const handleVoteThread = async (threadId: number) => {
        try {
            await discussionApi.voteThread(problemId, threadId);
            fetchThreads();
        } catch {
            // ignore
        }
    };

    const handleAccept = async (replyId: number) => {
        if (!selectedThread) return;
        try {
            await discussionApi.acceptReply(
                problemId,
                selectedThread.id,
                replyId
            );
            const res = await discussionApi.listReplies(
                problemId,
                selectedThread.id,
                1,
                50
            );
            setReplies(res.data.replies);
        } catch {
            // ignore
        }
    };

    const totalPages = Math.ceil(total / perPage);

    if (selectedThread) {
        return (
            <div className="min-h-screen bg-[#0a0a14] pt-20 pb-12">
                <div className="max-w-3xl mx-auto px-4">
                    <button
                        onClick={() => setSelectedThread(null)}
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to discussions
                    </button>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            {selectedThread.is_pinned && (
                                <Pin className="w-4 h-4 text-amber-400" />
                            )}
                            {selectedThread.is_resolved && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            )}
                            <h1 className="text-xl font-bold text-white">
                                {selectedThread.title}
                            </h1>
                        </div>
                        <p className="text-sm text-slate-300 mb-4 whitespace-pre-wrap">
                            {selectedThread.content}
                        </p>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>
                                by {selectedThread.author_name} ·{" "}
                                {timeAgo(selectedThread.created_at)} ·{" "}
                                {selectedThread.view_count} views
                            </span>
                            <button
                                onClick={() =>
                                    handleVoteThread(selectedThread.id)
                                }
                                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                            >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                {selectedThread.vote_score}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        {repliesLoading ? (
                            <div className="text-center py-10">
                                <Loader2 className="w-6 h-6 text-slate-500 mx-auto animate-spin" />
                            </div>
                        ) : replies.length === 0 ? (
                            <div className="text-center py-10">
                                <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                                <p className="text-sm text-slate-500">
                                    No replies yet
                                </p>
                            </div>
                        ) : (
                            replies.map((reply) => (
                                <div
                                    key={reply.id}
                                    className={clsx(
                                        "bg-white/5 border rounded-xl p-5",
                                        reply.is_accepted_answer
                                            ? "border-emerald-500/50 bg-emerald-500/10"
                                            : "border-white/10"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white">
                                                {reply.author_name}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                {timeAgo(reply.created_at)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {reply.is_accepted_answer && (
                                                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Accepted Answer
                                                </span>
                                            )}
                                            {user &&
                                                selectedThread &&
                                                user.id ===
                                                    selectedThread.author_id &&
                                                !reply.is_accepted_answer && (
                                                    <button
                                                        onClick={() =>
                                                            handleAccept(
                                                                reply.id
                                                            )
                                                        }
                                                        className="text-xs text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        Accept
                                                    </button>
                                                )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                                        {reply.content}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>

                    {user && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="flex gap-3">
                                <textarea
                                    value={replyContent}
                                    onChange={(e) =>
                                        setReplyContent(e.target.value)
                                    }
                                    placeholder="Write a reply..."
                                    rows={3}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                                />
                                <button
                                    onClick={handleReply}
                                    disabled={
                                        replying || !replyContent.trim()
                                    }
                                    className={clsx(
                                        "self-end p-3 rounded-lg transition-all",
                                        replying || !replyContent.trim()
                                            ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                                            : "bg-primary/20 text-primary hover:bg-primary/30"
                                    )}
                                >
                                    {replying ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a14] pt-20 pb-12">
            <div className="max-w-3xl mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link
                            href={`/problems/${problemId}`}
                            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to problem
                        </Link>
                        <h1 className="text-2xl font-bold text-white">
                            Discussion
                        </h1>
                    </div>
                    {user && (
                        <button
                            onClick={() => setShowNewThread(!showNewThread)}
                            className="px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm font-medium"
                        >
                            New Thread
                        </button>
                    )}
                </div>

                {showNewThread && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 space-y-3">
                        <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Thread title"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                        <textarea
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            placeholder="Describe your question or topic..."
                            rows={4}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowNewThread(false)}
                                className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateThread}
                                disabled={
                                    creating ||
                                    !newTitle.trim() ||
                                    !newContent.trim()
                                }
                                className={clsx(
                                    "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                                    creating ||
                                        !newTitle.trim() ||
                                        !newContent.trim()
                                        ? "bg-gray-500/50 text-slate-300 cursor-not-allowed"
                                        : "bg-blue-500/50 text-white cursor-pointer hover:bg-blue-600/70"
                                )}
                            >
                                {creating ? "Posting..." : "Post Thread"}
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                    <select
                        value={sort}
                        onChange={(e) => {
                            setSort(e.target.value);
                            setPage(1);
                        }}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    >
                        <option value="latest" className="bg-slate-800">
                            Latest
                        </option>
                        <option value="top" className="bg-slate-800">
                            Top Voted
                        </option>
                        <option value="unresolved" className="bg-slate-800">
                            Unresolved
                        </option>
                    </select>
                    <span className="text-xs text-slate-500">
                        {total} thread{total !== 1 ? "s" : ""}
                    </span>
                </div>

                <div className="space-y-2">
                    {loading ? (
                        [1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                className="h-24 bg-white/5 rounded-xl border border-white/5"
                            />
                        ))
                    ) : threads.length === 0 ? (
                        <div className="text-center py-16">
                            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <p className="text-sm text-slate-500">
                                No discussions yet
                            </p>
                            {user && (
                                <p className="text-xs text-slate-600 mt-2">
                                    Start the first discussion thread
                                </p>
                            )}
                        </div>
                    ) : (
                        threads.map((thread) => (
                            <button
                                key={thread.id}
                                onClick={() => handleSelectThread(thread)}
                                className="w-full text-left group bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-white/20 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        {thread.is_pinned && (
                                            <Pin className="w-4 h-4 text-amber-400 shrink-0" />
                                        )}
                                        {thread.is_resolved && (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                        )}
                                        <span className="text-sm font-bold text-white truncate">
                                            {thread.title}
                                        </span>
                                    </div>
                                    <span className="text-xs text-slate-500 shrink-0">
                                        {timeAgo(thread.created_at)}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                                    {thread.content}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                    <span className="font-medium text-slate-400">
                                        {thread.author_name}
                                    </span>
                                    <span>{thread.reply_count} replies</span>
                                    <span className="flex items-center gap-1">
                                        <ThumbsUp className="w-3 h-3" />
                                        {thread.vote_score}
                                    </span>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm text-slate-400">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={page >= totalPages}
                            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
