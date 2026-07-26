import api from "./api";

interface ContestData {
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  [key: string]: unknown;
}

export const contestApi = {
    list: (status?: string) =>
        api.get("/contests", { params: { status } }).then((r) => r.data),

    get: (id: number) =>
        api.get(`/contests/${id}`).then((r) => r.data),

    create: (data: ContestData) =>
        api.post("/contests", data).then((r) => r.data),

    update: (id: number, data: Partial<ContestData>) =>
        api.put(`/contests/${id}`, data).then((r) => r.data),

    register: (id: number) =>
        api.post(`/contests/${id}/register`).then((r) => r.data),

    start: (id: number) =>
        api.post(`/contests/${id}/start`).then((r) => r.data),

    submit: (id: number, problemIndex: string, code: string, language?: string) =>
        api
            .post(`/contests/${id}/submit`, {
                problem_index: problemIndex,
                code,
                language: language || "python",
            })
            .then((r) => r.data),

    standings: (id: number) =>
        api.get(`/contests/${id}/standings`).then((r) => r.data),

    end: (id: number) =>
        api.post(`/contests/${id}/end`).then((r) => r.data),
};
