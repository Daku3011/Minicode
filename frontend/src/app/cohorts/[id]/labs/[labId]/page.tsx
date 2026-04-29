"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Library, PlayCircle, Lock } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";

export default function StudentLabDetailPage() {
    const params = useParams();
    const router = useRouter();
    const cohortId = params?.id as string;
    const labId = params?.labId as string;

    const [lab, setLab] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLab = async () => {
            try {
                const res = await api.get(`/labs/${labId}`);
                setLab(res.data);
            } catch (e) {
                console.error("Failed to load lab", e);
                router.push(`/cohorts/${cohortId}`);
            } finally {
                setIsLoading(false);
            }
        };
        if (labId) fetchLab();
    }, [labId]);

    if (isLoading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <LoadingSpinner label="LOADING LAB..." />
        </div>
    );
    if (!lab) return null;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-8 md:p-12 font-black">
            <button
                onClick={() => router.push(`/cohorts/${cohortId}`)}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 uppercase text-xs tracking-widest"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Cohort
            </button>

            <header className="mb-12">
                <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter">{lab.name}</h1>
                <p className="text-primary uppercase tracking-[0.2em] text-[10px] mt-2">
                    {lab.problems?.length} Problems Available
                </p>

                {lab.description && (
                    <div className="mt-6 p-6 bg-white border border-blue-100 rounded-2xl shadow-sm">
                        <h3 className="text-xs uppercase tracking-[0.2em] text-emerald-500 mb-4 flex items-center gap-2">
                            <Library className="w-4 h-4" /> Instructor Notes
                        </h3>
                        <div className="text-sm font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
                            {lab.description}
                        </div>
                    </div>
                )}
            </header>

            <h2 className="text-lg uppercase tracking-widest mb-6 flex items-center gap-3">
                <PlayCircle className="w-5 h-5 text-primary" />
                Problems
            </h2>

            <div className="space-y-4">
                {lab.problems && lab.problems.length > 0 ? (
                    lab.problems.map((prob: any) => (
                        <div
                            key={prob.id}
                            className="bg-white border border-blue-100 p-6 rounded-2xl flex items-center justify-between hover:border-blue-200 transition-all shadow-sm group"
                        >
                            <div>
                                <h3 className="text-xl uppercase tracking-tight flex items-center gap-3">
                                    {prob.title}
                                    <span className={`text-[10px] px-2 py-0.5 rounded border tracking-widest font-bold ${
                                        prob.difficulty === "Hard"
                                            ? "bg-rose-50 text-rose-500 border-rose-200"
                                            : prob.difficulty === "Medium"
                                            ? "bg-amber-50 text-amber-500 border-amber-200"
                                            : "bg-emerald-50 text-emerald-500 border-emerald-200"
                                    }`}>
                                        {prob.difficulty}
                                    </span>
                                </h3>
                                <div className="flex gap-4 mt-2 text-[10px] uppercase tracking-widest text-slate-500">
                                    <span>LVL {prob.level}</span>
                                    <span className="text-primary">{prob.xp_reward} XP</span>
                                </div>
                            </div>
                            <button
                                onClick={() => router.push(`/problems/${prob.id}`)}
                                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs uppercase tracking-widest transition-all shadow-sm"
                            >
                                Solve →
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center border border-blue-100 border-dashed rounded-3xl bg-white shadow-sm">
                        <Lock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 uppercase tracking-widest text-[10px]">No problems assigned to this lab yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
