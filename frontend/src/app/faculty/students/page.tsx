"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { Users, Search, ChevronRight, Trophy, Clock, Loader2, BarChart3 } from "lucide-react";

interface Student {
    username: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    xp: number;
    created_at: string;
    last_login: string | null;
}

export default function FacultyStudentsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (user && user.role !== "faculty" && user.role !== "admin") {
            router.push("/dashboard");
            return;
        }

        const fetchStudents = async () => {
            try {
                const response = await api.get("/faculty/students");
                setStudents(response.data.items || response.data || []);
            } catch (error) {
                console.error("Failed to fetch students:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [user, router]);

    const filteredStudents = students.filter((s) =>
        s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.full_name && s.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="mt-6 text-slate-400 font-black tracking-[0.3em] text-[10px] uppercase">Loading Student Telemetry...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-display relative">
            {/* Subtle background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-100 blur-[120px] opacity-40 rounded-full" />
            </div>

            <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-10 relative z-10">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-[10px] font-black uppercase tracking-wider">Faculty Portal</span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none uppercase">Student Roster</h1>
                        <p className="text-slate-500 text-lg font-medium">{students.length} candidates enrolled in the system</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/faculty/profile" className=" border border-blue-200 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors px-4 py-2 rounded-xl hover:border-blue-600">
                            Back to Profile
                        </Link>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative max-w-md">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search candidates by ID, email, or name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-blue-200 rounded-2xl pl-14 pr-6 py-4 text-slate-900 font-medium text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 shadow-sm"
                        />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white border border-blue-100 p-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Candidates</p>
                                <p className="text-3xl font-black text-slate-900 tracking-tight">{students.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-blue-100 p-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                                <Trophy className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top XP</p>
                                <p className="text-3xl font-black text-slate-900 tracking-tight">{students[0]?.xp || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-blue-100 p-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                                <BarChart3 className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg XP</p>
                                <p className="text-3xl font-black text-slate-900 tracking-tight">
                                    {students.length > 0 ? Math.round(students.reduce((acc, s) => acc + s.xp, 0) / students.length) : 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Students Table */}
                <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-blue-50 border-b border-blue-100">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Candidate</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Experience Points</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Last Active</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Enrolled</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-50">
                                {filteredStudents.length > 0 ? filteredStudents.map((student, index) => (
                                    <tr key={student.username} className="hover:bg-blue-50/40 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    {student.avatar_url ? (
                                                        <img src={student.avatar_url} alt="" className="w-12 h-12 rounded-xl object-cover border border-blue-100" />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center font-black text-blue-600 text-lg border border-blue-200">
                                                            {student.username.slice(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                                                        <span className="text-[8px] font-black text-white">#{index + 1}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 uppercase tracking-tight">{student.username}</p>
                                                    <p className="text-xs text-slate-400">{student.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <Trophy className="w-4 h-4 text-amber-500" />
                                                <span className="font-black text-amber-600">{student.xp.toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-sm font-medium">
                                                    {student.last_login
                                                        ? new Date(student.last_login).toLocaleDateString()
                                                        : "Never"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm text-slate-400">
                                            {new Date(student.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <Link
                                                href={`/faculty/students/${student.username}`}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all border border-blue-200 hover:border-blue-600"
                                            >
                                                View Profile <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-16 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <Users className="w-12 h-12 text-blue-300" />
                                                <p className="text-slate-400 font-black uppercase tracking-widest text-sm">
                                                    {searchQuery ? "No candidates match your search" : "No candidates enrolled yet"}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
