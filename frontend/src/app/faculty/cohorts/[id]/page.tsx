"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Users, Library, PlusCircle, ArrowLeft, Trash2 } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function FacultyCohortDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [cohort, setCohort] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [newStudent, setNewStudent] = useState("");

    const fetchCohort = async () => {
        try {
            const res = await api.get(`/cohorts/${id}`);
            setCohort(res.data);
        } catch (e) {
            console.error("Failed to load cohort details", e);
            router.push("/faculty/cohorts");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchCohort();
    }, [id]);

    const handleAddStudent = async () => {
        if (!newStudent.trim()) return;
        try {
            await api.post(`/cohorts/${id}/students`, { username: newStudent });
            setNewStudent("");
            fetchCohort();
        } catch (e: any) {
            alert(e.response?.data?.detail || "Failed to add student");
        }
    };

    if (isLoading) return <div className="min-h-screen bg-[#05050a] flex items-center justify-center"><LoadingSpinner label="LOADING COHORT..." /></div>;
    if (!cohort) return null;

    return (
        <div className="min-h-screen bg-[#05050a] text-white p-8 md:p-12 font-black">
            <button 
                onClick={() => router.push("/faculty/cohorts")}
                className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 uppercase text-xs tracking-widest"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Cohorts
            </button>

            <header className="mb-12">
                <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter">{cohort.name}</h1>
                <p className="text-primary uppercase tracking-[0.2em] text-[10px] mt-2">ID: {cohort.id} • {cohort.student_count} Students Enrolled</p>
                <p className="text-slate-400 mt-4 max-w-2xl font-normal text-sm leading-relaxed">{cohort.description}</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Students Section */}
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <h2 className="text-lg uppercase tracking-widest mb-6 flex items-center gap-3">
                            <Users className="w-5 h-5 text-primary" />
                            Roster
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cohort.students?.map((s: any) => (
                                <div key={s.id} className="bg-white/[0.02] border border-white/5 p-4 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] text-primary">
                                            {s.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm">{s.full_name || s.username}</div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-widest">{s.username}</div>
                                        </div>
                                    </div>
                                    <button className="p-2 text-slate-600 hover:text-rose-500 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {cohort.students?.length === 0 && (
                                <div className="col-span-full py-12 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-2xl text-slate-600 uppercase text-xs tracking-widest">
                                    No students enrolled yet
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Labs Section (Placeholder) */}
                    <div>
                        <h2 className="text-lg uppercase tracking-widest mb-6 flex items-center gap-3">
                            <Library className="w-5 h-5 text-emerald-500" />
                            Active Labs
                        </h2>
                        <div className="bg-white/[0.02] border border-white/5 p-12 rounded-3xl text-center">
                            <p className="text-slate-500 uppercase tracking-widest text-xs">Lab content management coming soon</p>
                            <button className="mt-6 px-6 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-[10px] tracking-widest uppercase hover:bg-emerald-500/20 transition-all">
                                + Create Lab Session
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-6">
                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
                        <h3 className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-4">Add Student</h3>
                        <div className="space-y-3">
                            <div className="relative">
                                <PlusCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input 
                                    type="text" 
                                    value={newStudent}
                                    onChange={(e) => setNewStudent(e.target.value)}
                                    placeholder="Username"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:border-primary/50 focus:outline-none"
                                />
                            </div>
                            <button 
                                onClick={handleAddStudent}
                                className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-2 text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-primary/10"
                            >
                                Enroll Student
                            </button>
                        </div>
                    </div>

                    <div className="bg-rose-500/5 border border-rose-500/10 p-6 rounded-2xl">
                        <h3 className="text-xs uppercase tracking-[0.2em] text-rose-500 mb-2">Danger Zone</h3>
                        <p className="text-[10px] text-slate-500 mb-4 leading-relaxed uppercase">Permanently de-initialize this cohort and all student progress.</p>
                        <button className="w-full bg-rose-500 text-white rounded-xl py-2 text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all">
                            Archive Cohort
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
