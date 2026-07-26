"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { clsx } from "clsx";
import {
    ArrowLeft,
    CheckCircle2,
    Circle,
    MessageSquare,
    Star,
} from "lucide-react";
import { reviewApi } from "@/lib/review-api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface ReviewComment {
    id: number;
    file_path?: string;
    line_start?: number;
    line_end?: number;
    comment: string;
    comment_type: string;
    resolved: boolean;
    created_at: string;
}

interface Review {
    id: number;
    submission_id: number;
    reviewer_id: number;
    status: string;
    overall_score?: number;
    complexity_score?: number;
    readability_score?: number;
    comments_json?: string;
    created_at: string;
    updated_at?: string;
}

export default function ReviewDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [review, setReview] = useState<Review | null>(null);
    const [comments, setComments] = useState<ReviewComment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        reviewApi.getReview(Number(id))
            .then((res: any) => {
                setReview(res.data.review);
                setComments(res.data.comments || []);
            })
            .catch(() => router.push("/reviews"))
            .finally(() => setLoading(false));
    }, [id, router]);

    const handleResolve = async (commentId: number) => {
        try {
            await reviewApi.resolveComment(commentId);
            setComments(prev =>
                prev.map(c => c.id === commentId ? { ...c, resolved: true } : c)
            );
        } catch {}
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
                <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!review) return null;

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

                <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">
                                Review #{review.id}
                            </h1>
                            <p className="text-sm text-slate-400 mt-1">
                                Submission #{review.submission_id}
                            </p>
                        </div>
                        <span className={clsx(
                            "px-3 py-1 rounded-full text-xs font-medium",
                            review.status === "completed"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                        )}>
                            {review.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-50 rounded-lg p-4 text-center">
                            <p className="text-xs text-slate-400 mb-1">Overall</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {review.overall_score ?? "—"}
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 text-center">
                            <p className="text-xs text-slate-400 mb-1">Complexity</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {review.complexity_score ?? "—"}
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 text-center">
                            <p className="text-xs text-slate-400 mb-1">Readability</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {review.readability_score ?? "—"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Comments ({comments.length})
                    </h2>

                    {comments.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-8">No comments</p>
                    ) : (
                        <div className="space-y-3">
                            {comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className={clsx(
                                        "p-4 rounded-lg border",
                                        comment.resolved
                                            ? "bg-emerald-50 border-emerald-200"
                                            : "bg-slate-50 border-slate-200"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            {comment.file_path && (
                                                <p className="text-xs font-mono text-slate-400 mb-1">
                                                    {comment.file_path}:{comment.line_start}
                                                    {comment.line_end && comment.line_end !== comment.line_start
                                                        ? `-${comment.line_end}`
                                                        : ""}
                                                </p>
                                            )}
                                            <p className="text-sm text-slate-700">{comment.comment}</p>
                                            <p className="text-xs text-slate-400 mt-2">
                                                {new Date(comment.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleResolve(comment.id)}
                                            disabled={comment.resolved}
                                            className={clsx(
                                                "p-1.5 rounded transition-colors shrink-0",
                                                comment.resolved
                                                    ? "text-emerald-500 cursor-default"
                                                    : "text-slate-400 hover:text-emerald-500 hover:bg-emerald-50"
                                            )}
                                        >
                                            {comment.resolved ? (
                                                <CheckCircle2 className="w-5 h-5" />
                                            ) : (
                                                <Circle className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
