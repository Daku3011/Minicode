import api from "./api";

export const reviewApi = {
    requestReview: (submissionId: number, requiredReviewers = 1) =>
        api.post("/reviews/request", { submission_id: submissionId, required_reviewers: requiredReviewers }),

    getPendingReviews: () => api.get("/reviews/pending"),

    getMyReviewRequests: () => api.get("/reviews/my-requests"),

    submitReview: (reviewId: number, data: {
        submission_id: number;
        overall_score?: number;
        complexity_score?: number;
        readability_score?: number;
        comments?: Array<{
            file_path?: string;
            line_start?: number;
            line_end?: number;
            comment: string;
            comment_type?: string;
        }>;
    }) => api.post(`/reviews/${reviewId}/submit`, data),

    getReview: (reviewId: number) => api.get(`/reviews/${reviewId}`),

    resolveComment: (commentId: number) => api.post(`/reviews/comments/${commentId}/resolve`),

    getSubmissionReviews: (submissionId: number) => api.get(`/reviews/submission/${submissionId}`),
};
