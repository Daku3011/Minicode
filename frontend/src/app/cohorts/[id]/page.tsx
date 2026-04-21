"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Users, Library, ArrowLeft, Lock, PlayCircle } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";

export default function StudentCohortDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [cohort, setCohort] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCohort = async () => {
            try {
                const res = await api.get(`/cohorts/${id}`);
                setCohort(res.data);
            } catch (e) {
                console.error("Failed to load cohort details", e);
                router.push("/cohorts");
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchCohort();
    }, [id]);

    if (isLoading) return <div className="min-h-screen bg-[#05050a] flex items-center justify-center"><LoadingSpinner label="SYNCING CLASSROOM..." /></div>;
    if (!cohort) return null;

    return (
        <div className="min-h-screen bg-[#05050a] text-white p-8 md:p-12 font-black">
            <button 
                onClick={() => router.push("/cohorts")}
                className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 uppercase text-xs tracking-widest"
            >
                <ArrowLeft className="w-4 h-4" /> My Cohorts
            </button>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter">{cohort.name}</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <span className="text-primary uppercase tracking-[0.2em] text-[10px]">Prof. {cohort.faculty_name}</span>
                        <div className="h-3 w-px bg-white/10" />
                        <span className="text-slate-500 uppercase tracking-[0.2em] text-[10px]">{cohort.student_count} Peers</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Labs Timeline */}
                <div className="lg:col-span-3 space-y-6">
                    <h2 className="text-sm uppercase tracking-[0.3em] text-slate-500 flex items-center gap-3 mb-8">
                        <Library className="w-4 h-4" />
                        Lab Timeline
                    </h2>

                    <div className="space-y-4">
                        {/* Placeholder Labs */}
                        <div className="bg-white/[0.02] border border-white/5 p-8 rounded-2xl flex items-center justify-between opacity-50 grayscale">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                                    <Lock className="w-5 h-5 text-slate-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl uppercase tracking-tighter">Coming Soon</h3>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Wait for Faculty to unlock labs</p>
                                </div>
                            </div>
                        </div>

                        <div className="py-20 text-center border border-dashed border-white/5 rounded-3xl">
                            <PlayCircle className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                            <p className="text-slate-600 uppercase tracking-widest text-[10px]">No active lab sessions found</p>
                        </div>
                    </div>
                </div>

                {/* Info Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
                        <h3 className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-4">Classroom ID</h3>
                        <div className="text-2xl font-mono text-primary bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                            {cohort.id}
                        </div>
                        <p className="text-[9px] text-slate-500 mt-4 leading-relaxed uppercase text-center">Share this ID with peers to join this classroom.</p>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
                        <h3 className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                             <Users className="w-3.5 h-3.5" /> Recent Peers
                        </h3>
                        <div className="flex -space-x-2">
                            {cohort.students?.slice(0, 5).map((s: any) => (
                                <div key={s.id} className="w-8 h-8 rounded-lg border-2 border-[#05050a] bg-slate-800 flex items-center justify-center text-[10px] uppercase font-black" title={s.username}>
                                    {s.username[0]}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
