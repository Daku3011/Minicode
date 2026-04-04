"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import StudentProfileView from "@/components/StudentProfileView";
import { ChevronLeft, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import MagneticWrapper from "@/components/MagneticWrapper";

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
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0f]">
                <LoadingSpinner />
                <p className="mt-6 text-slate-500 font-black tracking-[0.3em] text-[10px] uppercase">Decrypting Student Telemetry...</p>
            </div>
        );
    }

    if (error || !profileData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0f] p-8 text-center">
                <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card border-rose-500/20 max-w-md p-12 space-y-6"
                >
                    <div className="size-20 rounded-[2.5rem] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto shadow-2xl shadow-rose-500/10">
                        <ShieldAlert className="w-10 h-10 text-rose-500" />
                    </div>
                    <div>
                        <p className="text-rose-500 font-black uppercase tracking-[0.3em] text-xs mb-3">Telemetry Error</p>
                        <p className="text-slate-400 font-medium leading-relaxed">{error || "The requested student identity does not exist in the MiniCode core."}</p>
                    </div>
                    <MagneticWrapper>
                        <button 
                            onClick={() => router.back()}
                            className="w-full premium-btn py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.3em]"
                        >
                            <ChevronLeft className="w-5 h-5" /> REBOOT CHANNEL
                        </button>
                    </MagneticWrapper>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="screen bg-[#0a0a0f] text-slate-100 font-display relative overflow-x-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[140px] opacity-30" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px] opacity-20" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/grid.svg')] opacity-5" />
            </div>

            {/* Back Navigation Overlay */}
            <div className="fixed top-8 left-8 z-[60] group">
                <MagneticWrapper>
                    <button 
                        onClick={() => router.back()}
                        className="bg-white/[0.03] backdrop-blur-3xl p-4 rounded-2xl border border-white/10 shadow-2xl hover:border-primary/40 hover:shadow-primary/20 transition-all text-white"
                        title="Return to Command"
                    >
                        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                </MagneticWrapper>
            </div>

            <div className="relative z-10 pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <StudentProfileView data={profileData} isFacultyView={true} />
            </div>
        </div>
    );
}
