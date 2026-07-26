"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { MessageSquare, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { reviewApi } from "@/lib/review-api";
import { useAuth } from "@/contexts/AuthContext";

interface ReviewItem {
    id: number;
    submission_id: number;
    reviewer_id: number;
    status: string;
    overall_score?: number;
    created_at: string;
}

interface RequestItem {
    id: number;
    submission_id: number;
    requester_id: number;
    status: string;
    created_at: string;
}

export default function ReviewsPage() {
    const { user } = useAuth();
    const [tab, setTab] = useState<"pending" | "my-requests">("pending");
    const [pendingReviews, setPendingReviews] = useState<ReviewItem[]>([]);
    const [myRequests, setMyRequests] = useState<RequestItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        if (tab === "pending") {
            reviewApi.getPendingReviews()
                .then((res: any) => setPendingReviews(res.data))
                .catch(() => {})
                .finally(() => setLoading(false));
        } else {
            reviewApi.getMyReviewRequests()
                .then((res: any) => setMyRequests(res.data))
                .catch(() => {})
                .finally(() => setLoading(false));
        }
    }, [tab]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            <div className="max-w-4xl mx-auto px-4 py-10">
                <div className="flex items-center gap-3 mb-8">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                    <h1 className="text-2xl font-bold text-slate-900">Code Reviews</h1>
                </div>

                <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-6 w-fit">
                    <button
                        onClick={() => setTab("pending")}
                        className={clsx(
                            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                            tab === "pending" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Pending Reviews
                    </button>
                    <button
                        onClick={() => setTab("my-requests")}
                        className={clsx(
                            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                            tab === "my-requests" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        My Requests
                    </button>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-20 bg-white rounded-xl border border-slate-200 animate-pulse" />
                        ))}
                    </div>
                ) : tab === "pending" ? (
                    pendingReviews.length === 0 ? (
                        <div className="text-center py-16 text-slate-400">
                            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No pending reviews assigned to you</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pendingReviews.map((review) => (
                                <Link
                                    key={review.id}
                                    href={`/reviews/${review.id}`}
                                    className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-200 hover:shadow-sm transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className="w-5 h-5 text-amber-500" />
                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    Review #{review.id}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    Submission #{review.submission_id}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )
                ) : (
                    myRequests.length === 0 ? (
                        <div className="text-center py-16 text-slate-400">
                            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">You haven&apos;t requested any reviews</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {myRequests.map((req) => (
                                <div
                                    key={req.id}
                                    className="bg-white border border-slate-200 rounded-xl p-5"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={clsx(
                                                "w-2 h-2 rounded-full",
                                                req.status === "completed" ? "bg-emerald-500" : "bg-amber-500"
                                            )} />
                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    Request #{req.id}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    Submission #{req.submission_id} &middot; {req.status}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
