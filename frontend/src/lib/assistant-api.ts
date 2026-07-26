import api from "./api";

export const assistantApi = {
    chat: (query: string) =>
        api.post<{ response: string }>("/assistant/chat", { query }),

    hint: (problemId: number) =>
        api.post<{ hint: string }>(`/assistant/hint/${problemId}`),

    explain: (submissionId: number) =>
        api.post<{ explanation: string }>(`/assistant/explain/${submissionId}`),
};
