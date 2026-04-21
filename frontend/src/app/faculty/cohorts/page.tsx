"use client";

import { useState, useEffect } from "react";
import { Users, Library, PlusCircle, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function CohortsPage() {
    const [cohorts, setCohorts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newCohortName, setNewCohortName] = useState("");
    const { user } = useAuth();
    const router = useRouter();
    
    useEffect(() => {
        const fetchCohorts = async () => {
            try {
                const res = await api.get("/cohorts");
                setCohorts(res.data);
            } catch (e) {
                console.error("Failed to load cohorts", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCohorts();
    }, []);

    const handleCreateCohort = async () => {
        if (!newCohortName.trim()) return;
        setIsCreating(true);
        try {
            const res = await api.post("/cohorts", { name: newCohortName, description: "Official Lab Group" });
            setCohorts([...cohorts, { ...res.data, student_count: 0 }]);
            setNewCohortName("");
        } catch (e) {
            console.error(e);
        } finally {
            setIsCreating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-8">
                <LoadingSpinner size="lg" label="LOADING COHORTS..." />
            </div>
        );
    }

    if (!user || (user.role !== "faculty" && user.role !== "admin")) {
        return <div className="p-8 text-center text-slate-900">ACCESS DENIED. FACULTY ONLY.</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-8 md:p-12">
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-100 blur-[120px] opacity-40 pointer-events-none" />
            
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-[10px] font-black uppercase tracking-wider">Faculty Portal</span>
                </div>
                <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter text-slate-900">Cohort Control</h1>
                <p className="text-slate-500 uppercase tracking-widest text-xs mt-2">Manage Student Groups &amp; Labs</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Panel */}
                <div className="bg-white border border-blue-100 p-8 rounded-3xl h-fit shadow-sm">
                    <h2 className="text-lg uppercase tracking-widest mb-6 flex items-center gap-3 text-slate-900 font-black">
                        <PlusCircle className="w-5 h-5 text-blue-600" />
                        New Cohort
                    </h2>
                    <div className="space-y-4">
                        <input 
                            type="text" 
                            className="w-full bg-slate-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors placeholder:text-slate-400"
                            placeholder="e.g. CS-101 Fall 2026"
                            value={newCohortName}
                            onChange={(e) => setNewCohortName(e.target.value)}
                        />
                        <button 
                            onClick={handleCreateCohort}
                            disabled={isCreating}
                            className="bg-blue-600 hover:bg-blue-700 text-white w-full rounded-xl py-3 text-xs uppercase tracking-widest font-black transition-colors disabled:opacity-50 shadow-sm shadow-blue-200"
                        >
                            {isCreating ? "Deploying..." : "Initialize Group"}
                        </button>
                    </div>
                </div>

                {/* Cohorts List */}
                <div className="lg:col-span-2 space-y-4">
                    {cohorts.length === 0 ? (
                        <div className="text-center py-20 bg-blue-50/50 rounded-3xl border border-dashed border-blue-200">
                            <Users className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                            <p className="text-slate-500 uppercase tracking-widest font-bold">No Cohorts Found</p>
                        </div>
                    ) : (
                        cohorts.map(c => (
                            <div key={c.id} className="bg-white border border-blue-100 p-6 rounded-2xl flex items-center justify-between hover:border-blue-300 hover:shadow-sm transition-all">
                                <div>
                                    <h3 className="text-xl uppercase tracking-tighter font-black text-slate-900">{c.name}</h3>
                                    <div className="flex items-center gap-6 mt-2 text-slate-400 text-[10px] tracking-widest uppercase">
                                        <span className="flex items-center gap-1.5"><Users className="w-3 h-3 text-blue-500" /> {c.student_count} Students</span>
                                        <span className="flex items-center gap-1.5"><Library className="w-3 h-3 text-emerald-500" /> Labs Active</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => router.push(`/faculty/cohorts/${c.id}`)}
                                    className="p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group border border-blue-100"
                                >
                                    <ChevronRight className="w-5 h-5 text-blue-400 group-hover:text-blue-600 transition-colors" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
