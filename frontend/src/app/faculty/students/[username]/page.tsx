"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import StudentProfileView from "@/components/StudentProfileView";
import { ChevronLeft, ShieldAlert } from "lucide-react";

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
                // Endpoints may return wrapped payloads ({items: [...]}) — normalize to arrays.
                const problems = Array.isArray(problemsRes.data)
                    ? problemsRes.data
                    : problemsRes.data?.items || [];
                const leaderboard = Array.isArray(leaderboardRes.data)
                    ? leaderboardRes.data
                    : leaderboardRes.data?.items || [];

                // Find rank in leaderboard
                const entry = Array.isArray(leaderboard)
                    ? leaderboard.find((e: any) => e.username === username)
                    : undefined;
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
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0f]">
                <LoadingSpinner />
                <p className="mt-6 text-slate-500 font-black tracking-[0.3em] text-[10px] uppercase">Decrypting Student Telemetry...</p>
            </div>
        );
    }

    if (error || !profileData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0f] p-8 text-center">
                <div className="glass-card border-rose-500/20 max-w-md p-12 space-y-6">
                    <div className="size-20 rounded-[2.5rem] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto shadow-2xl shadow-rose-500/10">
                        <ShieldAlert className="w-10 h-10 text-rose-500" />
                    </div>
                    <div>
                        <p className="text-rose-500 font-black uppercase tracking-[0.3em] text-xs mb-3">Telemetry Error</p>
                        <p className="text-slate-400 font-medium leading-relaxed">{error || "The requested student identity does not exist in the MiniCode core."}</p>
                    </div>
                        <button 
                            onClick={() => router.back()}
                            className="w-full premium-btn py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.3em]"
                        >
                            <ChevronLeft className="w-5 h-5" /> REBOOT CHANNEL
                        </button>
                </div>
            </div>
        );
    }

    return (
        <div className="screen bg-[#0a0a0f] text-slate-100 font-display relative overflow-x-hidden">

            {/* Back Navigation Overlay */}
            <div className="fixed top-8 left-8 z-[60] group">
                <button 
                    onClick={() => router.back()}
                    className="bg-blue-500/50 backdrop-blur-3xl p-4 rounded-2xl border border-white/10 shadow-2xl hover:border-primary/40 hover:shadow-primary/20 transition-all text-white"
                    title="Return to Command"
                >
                    <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="relative z-10">
                <StudentProfileView data={profileData} isFacultyView={true} />
            </div>
        </div>
    );
}
