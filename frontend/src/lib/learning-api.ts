import api from "./api";

export const learningApi = {
    dashboard: () => api.get("/learning/dashboard"),
    recommendations: (limit?: number) =>
        api.get("/learning/recommendations", { params: { limit } }),
    weakAreas: () => api.get("/learning/weak-areas"),
    stats: () => api.get("/learning/stats"),
    path: () => api.get("/learning/path"),
    portfolio: (username: string) => api.get(`/learning/portfolio/${username}`),
    publicPortfolio: (username: string) =>
        api.get(`/learning/portfolio/${username}/public`),
};
