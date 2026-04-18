"use client";

import { useState, useEffect } from "react";
import { Users, Library, PlusCircle, UserPlus, ChevronRight } from "lucide-react";
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
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#05050a] p-8">
                <LoadingSpinner size="lg" label="LOADING COHORTS..." />
            </div>
        );
    }

    if (!user || (user.role !== "faculty" && user.role !== "admin")) {
        return <div className="p-8 text-center text-white">ACCESS DENIED. FACULTY ONLY.</div>;
    }

    return (
        <div className="min-h-screen bg-[#05050a] text-white p-8 md:p-12 font-black">
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] pointer-events-none" />
            
            <header className="mb-12">
                <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter">Cohort Control</h1>
                <p className="text-slate-500 uppercase tracking-widest text-xs mt-2">Manage Student Groups & Labs</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Panel */}
                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl h-fit">
                    <h2 className="text-lg uppercase tracking-widest mb-6 flex items-center gap-3">
                        <PlusCircle className="w-5 h-5 text-primary" />
                        New Cohort
                    </h2>
                    <div className="space-y-4">
                        <input 
                            type="text" 
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:outline-none transition-colors"
                            placeholder="e.g. CS-101 Fall 2026"
                            value={newCohortName}
                            onChange={(e) => setNewCohortName(e.target.value)}
                        />
                        <button 
                            onClick={handleCreateCohort}
                            disabled={isCreating}
                            className="bg-primary hover:bg-primary/90 text-white w-full rounded-xl py-3 text-xs uppercase tracking-widest transition-colors disabled:opacity-50"
                        >
                            {isCreating ? "Deploying..." : "Initialize Group"}
                        </button>
                    </div>
                </div>

                {/* Cohorts List */}
                <div className="lg:col-span-2 space-y-4">
                    {cohorts.length === 0 ? (
                        <div className="text-center py-20 bg-white/[0.01] rounded-3xl border border-white/5 border-dashed">
                            <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-500 uppercase tracking-widest">No Cohorts Found</p>
                        </div>
                    ) : (
                        cohorts.map(c => (
                            <div key={c.id} className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex items-center justify-between hover:border-white/10 transition-colors">
                                <div>
                                    <h3 className="text-xl uppercase tracking-tighter">{c.name}</h3>
                                    <div className="flex items-center gap-6 mt-2 text-slate-500 text-[10px] tracking-widest uppercase">
                                        <span className="flex items-center gap-1.5"><Users className="w-3 h-3 text-primary" /> {c.student_count} Students</span>
                                        <span className="flex items-center gap-1.5"><Library className="w-3 h-3 text-emerald-500" /> Labs Active</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => router.push(`/faculty/cohorts/${c.id}`)}
                                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group"
                                >
                                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
