"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, PlusCircle, Search, PlayCircle, Library } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";

export default function FacultyLabDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const labId = params?.labId as string;

    const [lab, setLab] = useState<any>(null);
    const [allProblems, setAllProblems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchLabAndProblems = async () => {
        try {
            const [labRes, probRes] = await Promise.all([
                api.get(`/labs/${labId}`),
                api.get("/problems")
            ]);
            setLab(labRes.data);
            setAllProblems(probRes.data);
        } catch (e) {
            console.error(e);
            alert("Failed to load data.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (labId) fetchLabAndProblems();
    }, [labId]);

    const handleAddProblem = async (problemId: number) => {
        try {
            await api.post(`/labs/${labId}/problems`, { problem_id: problemId });
            fetchLabAndProblems();
        } catch (e: any) {
            alert(e.response?.data?.detail || "Failed to add problem");
        }
    };

    const handleRemoveProblem = async (problemId: number) => {
        try {
            await api.delete(`/labs/${labId}/problems/${problemId}`);
            fetchLabAndProblems();
        } catch (e: any) {
            alert(e.response?.data?.detail || "Failed to remove problem");
        }
    };

    if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><LoadingSpinner label="LOADING LAB..." /></div>;
    if (!lab) return null;

    // Filter problems that are NOT already in the lab
    const availableProblems = allProblems.filter(
        p => !lab.problems.some((lp: any) => lp.id === p.id)
    ).filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-8 md:p-12 font-black">
            <button
                onClick={() => router.push(`/faculty/cohorts/${id}`)}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 uppercase text-xs tracking-widest"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Cohort
            </button>

            <header className="mb-12">
                <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter">{lab.name}</h1>
                <p className="text-primary uppercase tracking-[0.2em] text-[10px] mt-2">LAB ID: {lab.id}</p>

                {lab.description && (
                    <div className="mt-6 p-6 bg-white border border-blue-100 rounded-2xl shadow-sm">
                        <h3 className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                            <Library className="w-4 h-4" /> Instructor Notes
                        </h3>
                        <div className="text-sm font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
                            {lab.description}
                        </div>
                    </div>
                )}
            </header>

            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg uppercase tracking-widest flex items-center gap-3">
                    <PlayCircle className="w-5 h-5 text-emerald-500" />
                    Assigned Problems
                </h2>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-[10px] tracking-widest uppercase hover:bg-emerald-100 transition-all flex items-center gap-2"
                >
                    <PlusCircle className="w-4 h-4" /> Add Problem
                </button>
            </div>

            <div className="space-y-4">
                {lab.problems.length === 0 ? (
                    <div className="py-20 text-center border border-blue-100 border-dashed rounded-3xl bg-white shadow-sm">
                        <p className="text-slate-500 uppercase tracking-widest text-[10px]">No problems added to this lab yet</p>
                    </div>
                ) : (
                    lab.problems.map((prob: any) => (
                        <div key={prob.id} className="bg-white border border-blue-100 p-6 rounded-2xl flex items-center justify-between shadow-sm">
                            <div>
                                <h3 className="text-xl uppercase tracking-tight flex items-center gap-3">
                                    {prob.title}
                                    {prob.visibility === "private" && (
                                        <span className="bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded text-[8px] tracking-widest">
                                            CLASSIFIED
                                        </span>
                                    )}
                                </h3>
                                <div className="flex gap-4 mt-2 text-[10px] uppercase tracking-widest font-bold">
                                    <span className={prob.difficulty === "Hard" ? "text-rose-500" : prob.difficulty === "Medium" ? "text-amber-500" : "text-emerald-500"}>
                                        {prob.difficulty}
                                    </span>
                                    <span className="text-slate-500">LVL {prob.level}</span>
                                    <span className="text-slate-500">{prob.xp_reward} XP</span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleRemoveProblem(prob.id)}
                                className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                title="Remove from lab"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Add Problem Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] flex flex-col shadow-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl uppercase tracking-tighter text-slate-900">Select Problem</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-900 uppercase text-xs tracking-widest">
                                Close
                            </button>
                        </div>

                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by title or subject..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none transition-colors"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                            {availableProblems.map(p => (
                                <div key={p.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm uppercase tracking-wider text-slate-900">{p.title}</div>
                                            {p.visibility === "private" && (
                                                <span className="bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded text-[8px] tracking-widest">
                                                        PVT
                                                    </span>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                                            {p.subject} • {p.difficulty}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAddProblem(p.id)}
                                        className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg text-[10px] uppercase tracking-widest transition-all border border-emerald-200"
                                    >
                                        Add
                                    </button>
                                </div>
                            ))}
                            {availableProblems.length === 0 && (
                                <div className="text-center py-8 text-slate-500 uppercase tracking-widest text-[10px]">
                                    No problems found
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
