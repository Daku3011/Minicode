import api from "./api";

export const interviewApi = {
    list: () => api.get("/interviews"),
    get: (id: number) => api.get(`/interviews/${id}`),
    create: (data: {
        candidate_emails: string[];
        problem_ids: number[];
        duration_minutes: number;
        scheduled_at?: string;
    }) => api.post("/interviews", data),
    createSession: (interviewId: number, candidateId: number) =>
        api.post(`/interviews/${interviewId}/sessions`, {
            candidate_id: candidateId,
        }),
    startSession: (sessionId: number) =>
        api.post(`/interviews/sessions/${sessionId}/start`),
    submitCode: (sessionId: number, problemIndex: number, code: string) =>
        api.post(`/interviews/sessions/${sessionId}/code`, {
            problem_index: problemIndex,
            code,
        }),
    getSession: (sessionId: number) =>
        api.get(`/interviews/sessions/${sessionId}`),
    endSession: (sessionId: number) =>
        api.post(`/interviews/sessions/${sessionId}/end`),
    evaluate: (interviewId: number) =>
        api.post(`/interviews/${interviewId}/evaluate`),
};
