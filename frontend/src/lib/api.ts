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

export const userApi = {
    me: () => api.get("/user/me"),
    settings: (data: { faculty_report_email?: string }) => api.put("/user/me/settings", data),
    sendVerificationEmail: (email: string) => api.post("/user/send-verification-email", { email }),
    verifyEmail: (email: string, otp: string) => api.post("/user/verify-email", { email, otp }),
    profileEmail: () => api.get("/user/profile/email"),
};

export default api;
