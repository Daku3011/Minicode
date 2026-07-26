"use client";

import { useState, useEffect } from "react";
import { clsx } from "clsx";
import {
    CheckCircle2,
    Circle,
    MessageSquare,
    ChevronDown,
    ChevronUp,
    ThumbsUp,
} from "lucide-react";
import { reviewApi } from "@/lib/review-api";
import { useAuth } from "@/contexts/AuthContext";

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
    reviewer_id: number;
    overall_score?: number;
    complexity_score?: number;
    readability_score?: number;
    status: string;
    created_at: string;
    comments?: ReviewComment[];
}

interface CodeReviewPanelProps {
    submissionId: number;
    onClose?: () => void;
}

export default function CodeReviewPanel({ submissionId, onClose }: CodeReviewPanelProps) {
    const { user } = useAuth();
    const [summary, setSummary] = useState<any>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [expandedReview, setExpandedReview] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!submissionId) return;
        setLoading(true);
        reviewApi.getSubmissionReviews(submissionId)
            .then((res: any) => {
                setSummary(res.data);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [submissionId]);

    const loadReviewDetails = async (reviewId: number) => {
        if (expandedReview === reviewId) {
            setExpandedReview(null);
            return;
        }
        try {
            const res: any = await reviewApi.getReview(reviewId);
            setReviews(prev =>
                prev.map(r => r.id === reviewId ? { ...r, comments: res.data.comments } : r)
            );
            setExpandedReview(reviewId);
        } catch {}
    };

    const handleResolve = async (commentId: number) => {
        try {
            await reviewApi.resolveComment(commentId);
            setReviews(prev =>
                prev.map(r => ({
                    ...r,
                    comments: r.comments?.map(c =>
                        c.id === commentId ? { ...c, resolved: true } : c
                    ),
                }))
            );
        } catch {}
    };

    if (loading) {
        return (
            <div className="p-4 text-sm text-slate-500 animate-pulse">
                Loading reviews...
            </div>
        );
    }

    if (!summary || summary.review_count === 0) {
        return (
            <div className="p-6 text-center text-slate-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No reviews yet for this submission</p>
            </div>
        );
    }

    return (
        <div className="border border-slate-200 rounded-xl bg-white">
            <div className="p-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900">Code Reviews</h3>
                {summary.average_overall_score != null && (
                    <p className="text-xs text-slate-500 mt-1">
                        Avg Score: {summary.average_overall_score.toFixed(1)} / 100
                    </p>
                )}
            </div>

            <div className="divide-y divide-slate-100">
                {(summary.reviews || []).map((review: Review) => (
                    <div key={review.id}>
                        <button
                            onClick={() => loadReviewDetails(review.id)}
                            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className={clsx(
                                    "w-2 h-2 rounded-full",
                                    review.status === "completed" ? "bg-emerald-500" : "bg-amber-500"
                                )} />
                                <div>
                                    <p className="text-sm font-medium text-slate-900">
                                        Review #{review.id}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {review.overall_score != null && (
                                    <span className="text-sm font-semibold text-blue-600">
                                        {review.overall_score}
                                    </span>
                                )}
                                {expandedReview === review.id ? (
                                    <ChevronUp className="w-4 h-4 text-slate-400" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                            </div>
                        </button>

                        {expandedReview === review.id && (
                            <div className="px-4 pb-4 space-y-3">
                                {(review.comments || []).length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                            Comments
                                        </p>
                                        {review.comments?.map((comment) => (
                                            <div
                                                key={comment.id}
                                                className={clsx(
                                                    "p-3 rounded-lg border text-sm",
                                                    comment.resolved
                                                        ? "bg-emerald-50 border-emerald-200"
                                                        : "bg-slate-50 border-slate-200"
                                                )}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        {comment.file_path && (
                                                            <p className="text-xs font-mono text-slate-400 mb-1">
                                                                {comment.file_path}:{comment.line_start}
                                                            </p>
                                                        )}
                                                        <p className="text-slate-700">{comment.comment}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleResolve(comment.id)}
                                                        className={clsx(
                                                            "p-1 rounded transition-colors",
                                                            comment.resolved
                                                                ? "text-emerald-500 cursor-default"
                                                                : "text-slate-400 hover:text-emerald-500"
                                                        )}
                                                        disabled={comment.resolved}
                                                    >
                                                        {comment.resolved ? (
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        ) : (
                                                            <Circle className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {review.complexity_score != null && (
                                    <div className="flex gap-4 text-xs">
                                        <div>
                                            <span className="text-slate-400">Complexity: </span>
                                            <span className="font-medium text-slate-700">{review.complexity_score}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Readability: </span>
                                            <span className="font-medium text-slate-700">{review.readability_score}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
