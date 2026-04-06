"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import dynamic from "next/dynamic";
import LoadingSpinner from "@/components/LoadingSpinner";

const StudentProfileView = dynamic(() => import("@/components/StudentProfileView"), {
    loading: () => <div className="flex flex-col items-center justify-center min-h-screen text-slate-400">Rendering Neural Profile...</div>
});

export default function ProfilePage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [meRes, problemsRes, leaderboardRes] = await Promise.all([
                    api.get("/auth/me"),
                    api.get("/problems"),
                    api.get("/leaderboard"),
                ]);

                const me = meRes.data;
                const problems = problemsRes.data || [];
                const leaderboard = leaderboardRes.data || [];

                // Find rank if not in stats
                const myEntry = leaderboard.find((e: any) => e.username === me.username);
                const rank = myEntry ? myEntry.rank : (me.stats?.rank || 0);

                setProfileData({
                    ...me,
                    stats: {
                        ...me.stats,
                        rank
                    },
                    problems,
                    leaderboard
                });
            } catch (err) {
                console.error("Failed to load profile data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAF9] dark:bg-[#0f0a1e]">
                <LoadingSpinner />
                <p className="mt-4 text-slate-400">Syncing profile with MiniCode core...</p>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAF9] dark:bg-[#0f0a1e]">
                <p className="text-slate-400">Failed to load profile data.</p>
            </div>
        );
    }

    return <StudentProfileView data={profileData} />;
}