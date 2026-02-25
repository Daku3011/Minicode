"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

export default function GithubCallback() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { login } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const code = searchParams.get("code");
        if (!code) {
            setError("No authorization code provided.");
            return;
        }

        const authenticate = async () => {
            try {
                const response = await api.get(`/auth/github/callback?code=${code}`);
                const { access_token } = response.data;

                if (access_token) {
                    await login(access_token);
                    router.push("/problems");
                } else {
                    setError("Failed to obtain access token.");
                }
            } catch (err: any) {
                console.error("Github auth error:", err);
                setError(err.response?.data?.detail || "Authentication failed.");
            }
        };

        authenticate();
    }, [searchParams, login, router]);

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center p-4 text-center">
                <div>
                    <h2 className="text-2xl font-bold text-rose-500 mb-4">Authentication Error</h2>
                    <p className="text-muted-foreground">{error}</p>
                    <button
                        onClick={() => router.push("/login")}
                        className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all font-medium text-white"
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
            <h2 className="text-xl font-bold text-white">Authenticating with GitHub...</h2>
            <p className="text-muted-foreground">Please wait while we set up your session.</p>
        </div>
    );
}
