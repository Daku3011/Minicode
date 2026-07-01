import axios from "axios";
import { getCookie } from "cookies-next";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use(
    (config) => {
        const token = getCookie("minicode_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear token and redirect to login
            document.cookie = 'minicode_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const userApi = {
    me: () => api.get("/user/me"),
    byUsername: (username: string) => api.get(`/user/by/${username}`),
    questClaims: () => api.get("/user/quests/claims"),
    claimQuestReward: (questId: string) => api.post("/user/quests/claim", { quest_id: questId }),
    settings: (data: { faculty_report_email?: string }) => api.put("/user/me/settings", data),
    sendVerificationEmail: (email: string) => api.post("/user/send-verification-email", { email }),
    verifyEmail: (email: string, otp: string) => api.post("/user/verify-email", { email, otp }),
    profileEmail: () => api.get("/user/profile/email"),
};

export default api;
