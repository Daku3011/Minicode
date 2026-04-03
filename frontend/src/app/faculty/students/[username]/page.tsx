"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import StudentProfileView from "@/components/StudentProfileView";
import { ArrowLeft } from "lucide-react";

export default function FacultyStudentProfilePage() {
    const { username } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user && user.role !== "faculty" && user.role !== "admin") {
            router.push("/dashboard");
            return;
        }

        const fetchStudentData = async () => {
            setLoading(true);
            try {
                const [studentRes, problemsRes, leaderboardRes] = await Promise.all([
                    api.get(`/faculty/student/${username}`),
                    api.get("/problems"),
                    api.get("/leaderboard"),
                ]);

                const student = studentRes.data;
                const problems = problemsRes.data || [];
                const leaderboard = leaderboardRes.data || [];

                // Find rank in leaderboard
                const entry = leaderboard.find((e: any) => e.username === username);
                const rank = entry ? entry.rank : (student.stats?.rank || 0);

                setProfileData({
                    ...student,
                    stats: {
                        ...student.stats,
                        rank
                    },
                    problems,
                    leaderboard
                });
            } catch (err: any) {
                console.error("Failed to load student profile data", err);
                setError(err.response?.data?.detail || "Failed to load student profile");
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            fetchStudentData();
        }
    }, [username, user, router]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAF9] dark:bg-[#0f0a1e]">
                <LoadingSpinner />
                <p className="mt-4 text-slate-400 animate-pulse font-bold tracking-widest text-[10px] uppercase">Syncing student telemetry...</p>
            </div>
        );
    }

    if (error || !profileData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAF9] dark:bg-[#0f0a1e] p-8 text-center">
                <div className="bg-rose-500/10 p-6 rounded-2xl border border-rose-500/20 max-w-md">
                    <p className="text-rose-500 font-black uppercase tracking-widest text-xs mb-2">Access Error</p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{error || "The requested student identity does not exist in the MiniCode core."}</p>
                </div>
                <button 
                    onClick={() => router.back()}
                    className="mt-8 bg-white dark:bg-[#1a142e] text-slate-600 dark:text-slate-300 px-6 py-3 rounded-xl border border-slate-200 dark:border-primary/10 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
                >
                    <ArrowLeft className="w-4 h-4" /> Return to Command
                </button>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="fixed top-20 left-8 z-[60]">
                <button 
                    onClick={() => router.back()}
                    className="bg-white/80 dark:bg-[#1a142e]/80 backdrop-blur-md p-3 rounded-2xl border border-slate-200 dark:border-primary/10 shadow-2xl hover:scale-110 hover:shadow-primary/20 active:scale-95 transition-all text-slate-600 dark:text-slate-300 group"
                    title="Return to Leaderboard"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>
            </div>
            <StudentProfileView data={profileData} isFacultyView={true} />
        </div>
    );
}
