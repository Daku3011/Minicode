"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import axios from "axios";
import { getSafeRedirectTarget } from "@/lib/auth-utils";

function GithubCallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { login } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const hasRun = useRef(false);
    const code = searchParams.get("code");

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        if (!code) {
            return;
        }

        const authenticate = async () => {
            try {
                const response = await api.get(`/auth/github/callback?code=${code}`);
                const { access_token } = response.data;

                if (access_token) {
                    await login(access_token);

                    // Check for saved redirect target first
                    const savedRedirect = getSafeRedirectTarget();
                    if (savedRedirect) {
                        router.push(savedRedirect);
                        return;
                    }

                    // Fetch user profile to determine role-based redirect
                    const userResponse = await api.get("/user/me");
                    const user = userResponse.data;

                    if (user?.role === "admin") {
                        router.push("/admin");
                    } else if (user?.role === "faculty") {
                        router.push("/faculty/dashboard");
                    } else {
                        router.push("/problems");
                    }
                } else {
                    setError("Failed to obtain access token.");
                }
            } catch (err: unknown) {
                console.error("Github auth error:", err);
                const detail = axios.isAxiosError(err)
                    ? (err.response?.data as { detail?: string } | undefined)?.detail
                    : undefined;
                setError(detail || "Authentication failed.");
            }
        };

        authenticate();
    }, [code, login, router]);

    if (!code || error) {
        return (
            <div className="flex h-screen items-center justify-center p-4 text-center">
                <div>
                    <h2 className="text-2xl font-bold text-rose-500 mb-4 text-black">Authentication Error</h2>
                    <p className="text-muted-foreground text-black mb-4">{error || "No authorization code provided."}</p>
                    <button
                        onClick={() => router.push("/login")}
                        className="mt-6 px-6 py-2 bg-blue-300/50 hover:bg-blue-400 rounded-xl transition-all font-medium text-black hover:underline hover:underline-offset-4"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <h2 className="text-xl font-bold text-black">Authenticating with GitHub...</h2>
            <p className="text-muted-foreground text-black">Please wait while we set up your session.</p>
        </div>
    );
}

export default function GithubCallback() {
    return (
        <Suspense fallback={
            <div className="flex h-screen flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <h2 className="text-xl font-bold text-black">Loading...</h2>
            </div>
        }>
            <GithubCallbackContent />
        </Suspense>
    );
}
