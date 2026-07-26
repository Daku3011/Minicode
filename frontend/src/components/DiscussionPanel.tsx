"use client";

import { useEffect, useState, useCallback } from "react";
import { clsx } from "clsx";
import {
    MessageSquare,
    ThumbsUp,
    CheckCircle2,
    X,
    Send,
    ChevronDown,
    ChevronUp,
    Pin,
    Loader2,
} from "lucide-react";
import { discussionApi, Thread, Reply } from "@/lib/discussion-api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface DiscussionPanelProps {
    isOpen: boolean;
    onClose: () => void;
    problemId: number;
}

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

export default function DiscussionPanel({
    isOpen,
    onClose,
    problemId,
}: DiscussionPanelProps) {
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
    const [selectedThread, setSelectedThread] = useState<number | null>(null);
    const [replies, setReplies] = useState<Reply[]>([]);
    const [replyContent, setReplyContent] = useState("");
    const [replying, setReplying] = useState(false);
    const [repliesPage, setRepliesPage] = useState(1);
    const [repliesTotal, setRepliesTotal] = useState(0);

    const fetchThreads = useCallback(async () => {
        setLoading(true);
        try {
            const res = await discussionApi.listThreads(
                problemId,
                page,
                20,
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
        if (isOpen) fetchThreads();
    }, [isOpen, fetchThreads]);

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

    const handleSelectThread = async (threadId: number) => {
        setSelectedThread(threadId);
        setRepliesPage(1);
        try {
            const res = await discussionApi.listReplies(
                problemId,
                threadId,
                1,
                50
            );
            setReplies(res.data.replies);
            setRepliesTotal(res.data.total);
        } catch {
            // ignore
        }
    };

    const handleReply = async () => {
        if (!replyContent.trim() || !selectedThread) return;
        setReplying(true);
        try {
            await discussionApi.createReply(
                problemId,
                selectedThread,
                replyContent
            );
            setReplyContent("");
            const res = await discussionApi.listReplies(
                problemId,
                selectedThread,
                1,
                50
            );
            setReplies(res.data.replies);
            setRepliesTotal(res.data.total);
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
            await discussionApi.acceptReply(problemId, selectedThread, replyId);
            const res = await discussionApi.listReplies(
                problemId,
                selectedThread,
                1,
                50
            );
            setReplies(res.data.replies);
        } catch {
            // ignore
        }
    };

    const selectedThreadData = threads.find((t) => t.id === selectedThread);

    return (
        <div
            className={clsx(
                "fixed inset-0 z-[100] transition-all duration-200 ease-in-out",
                isOpen
                    ? "visible pointer-events-auto"
                    : "invisible pointer-events-none"
            )}
        >
            <div
                onClick={onClose}
                className={clsx(
                    "fixed inset-0 bg-black/60",
                    isOpen ? "opacity-100 backdrop-blur-sm" : "opacity-0"
                )}
            />
            <div
                className={clsx(
                    "fixed top-0 right-0 w-80 md:w-96 h-full border-l border-white/10 bg-[#0a0a14] flex flex-col z-[101] shadow-2xl transition-transform duration-75 ease-out",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        {selectedThread ? "Thread" : "Discussion"}
                    </h2>
                    <div className="flex items-center gap-2">
                        {selectedThread && (
                            <button
                                onClick={() => setSelectedThread(null)}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors text-xs"
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {!selectedThread ? (
                    <>
                        <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                            >
                                <option value="latest" className="bg-slate-800">
                                    Latest
                                </option>
                                <option value="top" className="bg-slate-800">
                                    Top
                                </option>
                                <option
                                    value="unresolved"
                                    className="bg-slate-800"
                                >
                                    Unresolved
                                </option>
                            </select>
                            {user && (
                                <button
                                    onClick={() =>
                                        setShowNewThread(!showNewThread)
                                    }
                                    className="text-xs px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors font-medium"
                                >
                                    New Thread
                                </button>
                            )}
                        </div>

                        {showNewThread && (
                            <div className="px-4 py-3 border-b border-white/10 space-y-2 bg-white/5">
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="Title"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary/50"
                                />
                                <textarea
                                    value={newContent}
                                    onChange={(e) =>
                                        setNewContent(e.target.value)
                                    }
                                    placeholder="What's on your mind?"
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                                />
                                <button
                                    onClick={handleCreateThread}
                                    disabled={
                                        creating ||
                                        !newTitle.trim() ||
                                        !newContent.trim()
                                    }
                                    className={clsx(
                                        "w-full py-2 rounded-lg text-sm font-semibold transition-all",
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
                        )}

                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                            {loading ? (
                                [1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="h-20 bg-white/5 rounded-xl border border-white/5"
                                    />
                                ))
                            ) : threads.length === 0 ? (
                                <div className="text-center py-10">
                                    <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                                    <p className="text-xs text-slate-500">
                                        No discussions yet
                                    </p>
                                    {user && (
                                        <p className="text-[10px] text-slate-600 mt-1">
                                            Start a new thread
                                        </p>
                                    )}
                                </div>
                            ) : (
                                threads.map((thread) => (
                                    <button
                                        key={thread.id}
                                        onClick={() =>
                                            handleSelectThread(thread.id)
                                        }
                                        className="w-full text-left group bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 hover:border-white/20 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                {thread.is_pinned && (
                                                    <Pin className="w-3 h-3 text-amber-400 shrink-0" />
                                                )}
                                                {thread.is_resolved && (
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                                )}
                                                <span className="text-xs font-bold text-white truncate">
                                                    {thread.title}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-slate-500 shrink-0">
                                                {timeAgo(thread.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                                            {thread.content}
                                        </p>
                                        <div className="flex items-center gap-3 text-[10px] text-slate-500">
                                            <span>{thread.author_name}</span>
                                            <span>
                                                {thread.reply_count} replies
                                            </span>
                                            <span>
                                                {thread.vote_score} votes
                                            </span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        {selectedThreadData && (
                            <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                                <div className="flex items-center gap-1.5 mb-1">
                                    {selectedThreadData.is_pinned && (
                                        <Pin className="w-3 h-3 text-amber-400" />
                                    )}
                                    {selectedThreadData.is_resolved && (
                                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    )}
                                    <h3 className="text-sm font-bold text-white">
                                        {selectedThreadData.title}
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-400 mb-2">
                                    {selectedThreadData.content}
                                </p>
                                <div className="flex items-center justify-between text-[10px] text-slate-500">
                                    <span>
                                        by {selectedThreadData.author_name} ·{" "}
                                        {timeAgo(selectedThreadData.created_at)}
                                    </span>
                                    <button
                                        onClick={() =>
                                            handleVoteThread(
                                                selectedThreadData.id
                                            )
                                        }
                                        className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                                    >
                                        <ThumbsUp className="w-3 h-3" />
                                        {selectedThreadData.vote_score}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                            {replies.length === 0 ? (
                                <div className="text-center py-10">
                                    <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                                    <p className="text-xs text-slate-500">
                                        No replies yet
                                    </p>
                                </div>
                            ) : (
                                replies.map((reply) => (
                                    <div
                                        key={reply.id}
                                        className={clsx(
                                            "bg-white/5 border rounded-xl p-3",
                                            reply.is_accepted_answer
                                                ? "border-emerald-500/50 bg-emerald-500/10"
                                                : "border-white/10"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs font-medium text-white">
                                                    {reply.author_name}
                                                </span>
                                                <span className="text-[10px] text-slate-500">
                                                    {timeAgo(
                                                        reply.created_at
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {reply.is_accepted_answer && (
                                                    <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        Accepted
                                                    </span>
                                                )}
                                                {user &&
                                                    selectedThreadData &&
                                                    user.id ===
                                                        selectedThreadData.author_id &&
                                                    !reply.is_accepted_answer && (
                                                        <button
                                                            onClick={() =>
                                                                handleAccept(
                                                                    reply.id
                                                                )
                                                            }
                                                            className="text-[10px] text-slate-400 hover:text-emerald-400 transition-colors"
                                                            title="Accept as answer"
                                                        >
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            {reply.content}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>

                        {user && (
                            <div className="px-4 py-3 border-t border-white/10">
                                <div className="flex gap-2">
                                    <textarea
                                        value={replyContent}
                                        onChange={(e) =>
                                            setReplyContent(e.target.value)
                                        }
                                        placeholder="Write a reply..."
                                        rows={2}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                                    />
                                    <button
                                        onClick={handleReply}
                                        disabled={
                                            replying ||
                                            !replyContent.trim()
                                        }
                                        className={clsx(
                                            "self-end p-2 rounded-lg transition-all",
                                            replying ||
                                                !replyContent.trim()
                                                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                                                : "bg-primary/20 text-primary hover:bg-primary/30"
                                        )}
                                    >
                                        {replying ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="px-4 py-2 border-t border-white/10">
                            <Link
                                href={`/problems/${problemId}/discussion`}
                                className="text-xs text-primary hover:text-primary/80 transition-colors"
                            >
                                Open full discussion page →
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
