import api from "./api";

export interface Thread {
    id: number;
    title: string;
    content: string;
    author_id: number;
    author_name: string;
    is_pinned: boolean;
    is_resolved: boolean;
    reply_count: number;
    vote_score: number;
    view_count: number;
    created_at: string;
    updated_at: string | null;
}

export interface Reply {
    id: number;
    parent_id: number | null;
    content: string;
    author_id: number;
    author_name: string;
    is_accepted_answer: boolean;
    vote_score: number;
    created_at: string;
    updated_at: string | null;
}

export interface ThreadListResponse {
    threads: Thread[];
    total: number;
    page: number;
    per_page: number;
}

export interface ReplyListResponse {
    replies: Reply[];
    total: number;
    page: number;
    per_page: number;
}

export const discussionApi = {
    listThreads: (problemId: number, page = 1, perPage = 20, sort = "latest") =>
        api.get<ThreadListResponse>(`/problems/${problemId}/discussions`, {
            params: { page, per_page: perPage, sort },
        }),

    getThread: (problemId: number, threadId: number) =>
        api.get<Thread>(`/problems/${problemId}/discussions/${threadId}`),

    createThread: (problemId: number, title: string, content: string) =>
        api.post(`/problems/${problemId}/discussions`, { title, content }),

    updateThread: (
        problemId: number,
        threadId: number,
        data: { title?: string; content?: string; is_resolved?: boolean }
    ) => api.put(`/problems/${problemId}/discussions/${threadId}`, data),

    deleteThread: (problemId: number, threadId: number) =>
        api.delete(`/problems/${problemId}/discussions/${threadId}`),

    listReplies: (problemId: number, threadId: number, page = 1, perPage = 20) =>
        api.get<ReplyListResponse>(
            `/problems/${problemId}/discussions/${threadId}/replies`,
            { params: { page, per_page: perPage } }
        ),

    createReply: (
        problemId: number,
        threadId: number,
        content: string,
        parentId?: number
    ) =>
        api.post(`/problems/${problemId}/discussions/${threadId}/replies`, {
            content,
            parent_id: parentId,
        }),

    updateReply: (
        problemId: number,
        threadId: number,
        replyId: number,
        content: string
    ) =>
        api.put(
            `/problems/${problemId}/discussions/${threadId}/replies/${replyId}`,
            { content }
        ),

    deleteReply: (problemId: number, threadId: number, replyId: number) =>
        api.delete(
            `/problems/${problemId}/discussions/${threadId}/replies/${replyId}`
        ),

    acceptReply: (problemId: number, threadId: number, replyId: number) =>
        api.post(
            `/problems/${problemId}/discussions/${threadId}/replies/${replyId}/accept`
        ),

    voteThread: (problemId: number, threadId: number, voteType = 1) =>
        api.post(`/problems/${problemId}/discussions/${threadId}/vote`, {
            vote_type: voteType,
        }),

    voteReply: (
        problemId: number,
        threadId: number,
        replyId: number,
        voteType = 1
    ) =>
        api.post(
            `/problems/${problemId}/discussions/${threadId}/replies/${replyId}/vote`,
            { vote_type: voteType }
        ),
};
