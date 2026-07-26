import api from "./api";

export const snippetApi = {
    create: (data: {
        title: string;
        description?: string;
        language: string;
        code_content: string;
        tags?: string[];
        is_public?: boolean;
    }) => api.post("/snippets", data),

    list: (params?: {
        search?: string;
        language?: string;
        tag?: string;
        page?: number;
        per_page?: number;
    }) => api.get("/snippets", { params }),

    get: (id: number) => api.get(`/snippets/${id}`),

    update: (id: number, data: {
        title?: string;
        description?: string;
        language?: string;
        code_content?: string;
        tags?: string[];
        is_public?: boolean;
    }) => api.put(`/snippets/${id}`, data),

    delete: (id: number) => api.delete(`/snippets/${id}`),

    vote: (id: number, voteType: "upvote" | "downvote") =>
        api.post(`/snippets/${id}/vote`, { vote_type: voteType }),

    trending: () => api.get("/snippets/trending"),

    my: () => api.get("/snippets/my"),
};
