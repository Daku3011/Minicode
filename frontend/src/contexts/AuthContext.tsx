"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import api, { userApi } from "../lib/api";

export interface User {
    id: number;
    username: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    role: "student" | "admin" | "faculty";
    github_id: number | null;
    created_at: string;
    unlocked_level?: number;
    stats?: {
        solved: number;
        rank: number;
        xp: number;
        level: number;
        level_name: string;
        streak: number;
    };
    contribution_data?: Record<string, number>;
    recentSubmissions?: {
        id: number;
        problem: string;
        status: string;
        time: string;
    }[];
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => { },
    logout: () => { },
    refreshUser: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const token = getCookie("minicode_token");
            if (!token) {
                setLoading(false);
                return;
            }
            const response = await userApi.me();
            setUser(response.data);
        } catch (error) {
            console.error("Failed to fetch user:", error);
            deleteCookie("minicode_token");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = async (token: string) => {
        setCookie("minicode_token", token, { maxAge: 60 * 60 * 24 * 7 }); // 1 week
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        await fetchUser();
    };

    const logout = () => {
        deleteCookie("minicode_token");
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
        window.location.href = "/login";
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser: fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
