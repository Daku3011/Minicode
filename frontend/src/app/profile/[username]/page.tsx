"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { userApi } from "@/lib/api";
import dynamic from "next/dynamic";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ArrowLeft } from "lucide-react";

const StudentProfileView = dynamic(() => import("@/components/StudentProfileView"), {
    loading: () => <div className="flex flex-col items-center justify-center min-h-screen text-slate-400">Rendering Neural Profile...</div>
});

export default function UsernameProfilePage() {
    const params = useParams();
    const username = params.username as string;
    const { user: currentUser } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!username) return;
            setLoading(true);
            setError(null);
            try {
                const res = await userApi.byUsername(username);
                setProfileData(res.data);
            } catch (err: any) {
                console.error("Failed to load profile", err);
                setError(err.response?.data?.detail || "Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [username]);

    if (loading) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <LoadingSpinner label="Loading Profile..." />
        </div>;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8">
                <button
                    onClick={() => router.back()}
                    className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <h1 className="text-3xl font-bold text-white mb-4">Profile Not Found</h1>
                <p className="text-slate-400">{error}</p>
            </div>
        );
    }

    if (!profileData) return null;

    const isOwnProfile = currentUser?.username === username;

    return (
        <div className="min-h-screen bg-slate-900">
            <button
                onClick={() => router.back()}
                className="fixed top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors z-50"
            >
                <ArrowLeft className="w-5 h-5" /> Back
            </button>
            {profileData && (
                <StudentProfileView data={profileData} />
            )}
        </div>
    );
}