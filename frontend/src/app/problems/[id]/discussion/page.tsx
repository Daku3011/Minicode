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
    AlertCircle,
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
    const [createError, setCreateError] = useState<string | null>(null);

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
        } catch (err) {
            console.error("Failed to load threads:", err);
        } finally {
            setLoading(false);
        }
    }, [problemId, page, sort]);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const res = await discussionApi.listThreads(
                    problemId,
                    page,
                    perPage,
                    sort
                );
                if (!active) return;
                setThreads(res.data.threads);
                setTotal(res.data.total);
            } catch (err) {
                console.error("Failed to load threads:", err);
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, [problemId, page, sort]);

    const handleCreateThread = async () => {
        if (!newTitle.trim() || !newContent.trim()) return;
        setCreating(true);
        setCreateError(null);
        try {
            await discussionApi.createThread(problemId, newTitle, newContent);
            setNewTitle("");
            setNewContent("");
            setShowNewThread(false);
            fetchThreads();
        } catch (err) {
            console.error("Failed to create thread:", err);
            const detail = (
                err as { response?: { data?: { detail?: string } } }
            )?.response?.data?.detail;
            setCreateError(
                detail || "Could not post your thread. Please try again."
            );
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
        } catch (err) {
            console.error("Failed to post reply:", err);
            alert("Could not post your reply. Please try again.");
        } finally {
            setReplying(false);
        }
    };

    const handleVoteThread = async (threadId: number) => {
        try {
            await discussionApi.voteThread(problemId, threadId);
            if (selectedThread && selectedThread.id === threadId) {
                const res = await discussionApi.getThread(problemId, threadId);
                setSelectedThread({ ...selectedThread, ...res.data });
            } else {
                fetchThreads();
            }
        } catch (err) {
            console.error("Failed to vote:", err);
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
            setSelectedThread({ ...selectedThread, is_resolved: true });
        } catch (err) {
            console.error("Failed to accept reply:", err);
        }
    };

    const totalPages = Math.ceil(total / perPage);

    if (selectedThread) {
        return (
            <div className="min-h-screen bg-slate-50 pt-8 pb-12">
                <div className="max-w-3xl mx-auto px-4 sm:px-6">
                    <button
                        onClick={() => setSelectedThread(null)}
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to discussions
                    </button>

                    <div className="bg-white border border-blue-100 shadow-sm rounded-3xl p-8 mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            {selectedThread.is_pinned && (
                                <Pin className="w-4 h-4 text-blue-600 shrink-0" />
                            )}
                            {selectedThread.is_resolved && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                                {selectedThread.title}
                            </h1>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed mb-5 whitespace-pre-wrap">
                            {selectedThread.content}
                        </p>
                        <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-widest border-t border-blue-50 pt-4">
                            <span className="normal-case font-medium">
                                by{" "}
                                <span className="font-bold text-primary">
                                    {selectedThread.author_name}
                                </span>{" "}
                                · {timeAgo(selectedThread.created_at)} ·{" "}
                                {selectedThread.view_count} views
                            </span>
                            <button
                                onClick={() =>
                                    handleVoteThread(selectedThread.id)
                                }
                                aria-label="Upvote thread"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-100 bg-slate-50 hover:border-blue-300 hover:text-primary transition-colors"
                            >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                {selectedThread.vote_score}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        {repliesLoading ? (
                            <div className="text-center py-10">
                                <Loader2 className="w-6 h-6 text-primary mx-auto animate-spin" />
                            </div>
                        ) : replies.length === 0 ? (
                            <div role="status" className="text-center py-10">
                                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm text-slate-400 font-medium">
                                    No replies yet — be the first to answer.
                                </p>
                            </div>
                        ) : (
                            replies.map((reply) => (
                                <div
                                    key={reply.id}
                                    className={clsx(
                                        "bg-white border rounded-2xl p-5 shadow-sm",
                                        reply.is_accepted_answer
                                            ? "border-emerald-200 ring-1 ring-emerald-100"
                                            : "border-blue-100"
                                    )}
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary uppercase">
                                                {(reply.author_name || "?").slice(0, 2)}
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">
                                                {reply.author_name}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                {timeAgo(reply.created_at)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {reply.is_accepted_answer && (
                                                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
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
                                                        className="text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-1"
                                                    >
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Accept
                                                    </button>
                                                )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                        {reply.content}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>

                    {user && (
                        <div className="bg-white border border-blue-100 shadow-sm rounded-2xl p-4">
                            <div className="flex gap-3">
                                <label htmlFor="discussion-reply" className="sr-only">
                                    Write a reply
                                </label>
                                <textarea
                                    id="discussion-reply"
                                    value={replyContent}
                                    onChange={(e) =>
                                        setReplyContent(e.target.value)
                                    }
                                    placeholder="Write a reply..."
                                    rows={3}
                                    className="flex-1 bg-white border border-blue-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-colors"
                                />
                                <button
                                    onClick={handleReply}
                                    disabled={
                                        replying || !replyContent.trim()
                                    }
                                    aria-label="Post reply"
                                    className={clsx(
                                        "self-end p-3 rounded-xl transition-all",
                                        replying || !replyContent.trim()
                                            ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                                            : "bg-primary text-white hover:bg-blue-700 shadow-sm"
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
        <div className="min-h-screen bg-slate-50 pt-8 pb-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <Link
                            href={`/problems/${problemId}`}
                            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-1"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to problem
                        </Link>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                            Discussion
                        </h1>
                    </div>
                    {user && (
                        <button
                            onClick={() => {
                                setShowNewThread(!showNewThread);
                                setCreateError(null);
                            }}
                            className="px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-blue-700 shadow-md shadow-blue-100 transition-colors text-sm font-bold"
                        >
                            New Thread
                        </button>
                    )}
                </div>

                {showNewThread && (
                    <div className="bg-white border border-blue-100 shadow-sm rounded-2xl p-5 mb-6 space-y-3">
                        <label htmlFor="thread-title" className="sr-only">
                            Thread title
                        </label>
                        <input
                            id="thread-title"
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Thread title"
                            className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        />
                        <label htmlFor="thread-content" className="sr-only">
                            Thread content
                        </label>
                        <textarea
                            id="thread-content"
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            placeholder="Describe your question or topic..."
                            rows={4}
                            className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-colors"
                        />
                        {createError && (
                            <div
                                role="alert"
                                className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs font-semibold text-rose-600"
                            >
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                {createError}
                            </div>
                        )}
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowNewThread(false)}
                                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
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
                                    "px-5 py-2 rounded-xl text-sm font-bold transition-all",
                                    creating ||
                                        !newTitle.trim() ||
                                        !newContent.trim()
                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                        : "bg-primary text-white hover:bg-blue-700 shadow-sm"
                                )}
                            >
                                {creating ? "Posting..." : "Post Thread"}
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                    <label htmlFor="thread-sort" className="sr-only">
                        Sort threads
                    </label>
                    <select
                        id="thread-sort"
                        value={sort}
                        onChange={(e) => {
                            setSort(e.target.value);
                            setPage(1);
                        }}
                        className="bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                        <option value="latest">Latest</option>
                        <option value="top">Top Voted</option>
                        <option value="unresolved">Unresolved</option>
                    </select>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                        {total} thread{total !== 1 ? "s" : ""}
                    </span>
                </div>

                <div className="space-y-3">
                    {loading ? (
                        [1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                aria-hidden
                                className="h-24 bg-white/70 rounded-2xl border border-blue-50 animate-pulse"
                            />
                        ))
                    ) : threads.length === 0 ? (
                        <div role="status" className="text-center py-16">
                            <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-sm text-slate-500 font-medium">
                                No discussions yet
                            </p>
                            {user && (
                                <p className="text-xs text-slate-400 mt-2">
                                    Start the first discussion thread
                                </p>
                            )}
                        </div>
                    ) : (
                        threads.map((thread) => (
                            <button
                                key={thread.id}
                                onClick={() => handleSelectThread(thread)}
                                className="w-full text-left group bg-white border border-blue-100 rounded-2xl p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
                            >
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        {thread.is_pinned && (
                                            <Pin className="w-4 h-4 text-blue-600 shrink-0" />
                                        )}
                                        {thread.is_resolved && (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        )}
                                        <span className="text-base font-bold text-slate-900 truncate group-hover:text-primary transition-colors">
                                            {thread.title}
                                        </span>
                                    </div>
                                    <span className="text-xs text-slate-400 shrink-0">
                                        {timeAgo(thread.created_at)}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                                    {thread.content}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-slate-400">
                                    <span className="font-bold text-slate-500">
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
                            aria-label="Previous page"
                            className="p-2 rounded-lg border border-blue-100 bg-white text-slate-400 hover:text-primary hover:border-blue-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm text-slate-500 font-semibold">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={page >= totalPages}
                            aria-label="Next page"
                            className="p-2 rounded-lg border border-blue-100 bg-white text-slate-400 hover:text-primary hover:border-blue-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
