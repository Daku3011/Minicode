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
                setStudents(response.data);
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
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0f]">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="mt-6 text-slate-500 font-black tracking-[0.3em] text-[10px] uppercase">Loading Student Telemetry...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-slate-100 font-display relative">
            {/* Grid Background */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
                <div className="absolute inset-0 bg-[url('/grid.svg')]" />
            </div>

            <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-10 relative z-10">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-wider">Faculty Portal</span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tight leading-none uppercase">Student Roster</h1>
                        <p className="text-slate-500 text-lg font-medium">{students.length} candidates enrolled in the system</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/faculty/profile" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">
                            Back to Profile
                        </Link>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative max-w-md">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search candidates by ID, email, or name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white font-medium text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-slate-600"
                        />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-primary/10">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Candidates</p>
                                <p className="text-3xl font-black text-white tracking-tight">{students.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-amber-500/10">
                                <Trophy className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Top XP</p>
                                <p className="text-3xl font-black text-white tracking-tight">{students[0]?.xp || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-emerald-500/10">
                                <BarChart3 className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Avg XP</p>
                                <p className="text-3xl font-black text-white tracking-tight">
                                    {students.length > 0 ? Math.round(students.reduce((acc, s) => acc + s.xp, 0) / students.length) : 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Students Table */}
                <div className="bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/[0.02] border-b border-white/5">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Candidate</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Experience Points</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Last Active</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Enrolled</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredStudents.length > 0 ? filteredStudents.map((student, index) => (
                                    <tr key={student.username} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    {student.avatar_url ? (
                                                        <img src={student.avatar_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-blue-600/30 flex items-center justify-center font-black text-primary text-lg">
                                                            {student.username.slice(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0a0a0f] flex items-center justify-center">
                                                        <span className="text-[8px] font-black text-white">#{index + 1}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-200 uppercase tracking-tight">{student.username}</p>
                                                    <p className="text-xs text-slate-500">{student.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <Trophy className="w-4 h-4 text-amber-500" />
                                                <span className="font-black text-amber-400">{student.xp.toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-slate-400">
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
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-primary text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
                                            >
                                                View Profile <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-16 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <Users className="w-12 h-12 text-slate-600" />
                                                <p className="text-slate-500 font-black uppercase tracking-widest text-sm">
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
