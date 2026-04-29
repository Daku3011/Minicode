"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Zap, ArrowLeft } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function AlumniStudentsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [students, setStudents] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            if (user.role === "alumni" || user.role === "faculty" || user.role === "admin") {
                fetchStudents();
            } else {
                router.push("/alumni");
            }
        }
    }, [user]);

    const fetchStudents = async () => {
        try {
            const res = await api.get("/alumni/students");
            setStudents(res.data || []);
        } catch (e) {
            console.error("Failed to load students", e);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <LoadingSpinner label="Loading Students..." />
        </div>;
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-8 md:p-12 font-black">
            <button
                onClick={() => router.push("/alumni")}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 uppercase text-xs tracking-widest"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>

            <header className="mb-12">
                <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter text-slate-900">Students</h1>
                <p className="text-slate-500 uppercase tracking-widest text-xs mt-2">Browse active learners</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-blue-100 border-dashed shadow-sm">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest">No Students Found</p>
                    </div>
                ) : (
                    students.map((student: any) => (
                        <div
                            key={student.id}
                            onClick={() => router.push(`/profile/${student.username}`)}
                            className="bg-white border border-blue-100 p-6 rounded-2xl cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                    {(student.full_name || student.username || "S")[0].toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold uppercase">{student.full_name || student.username}</h3>
                                    <p className="text-[10px] text-slate-500 lowercase">@{student.username}</p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                                <div className="flex items-center gap-1">
                                    <Zap className="w-4 h-4 text-amber-500" />
                                    <span>{student.xp || 0} XP</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span>Level {student.current_level || 1}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}