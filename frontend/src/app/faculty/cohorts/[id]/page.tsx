"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Users, Library, PlusCircle, ArrowLeft, Trash2, Archive, X, FileText } from "lucide-react";
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
    
    // Lab Creation Modal State
    const [isLabModalOpen, setIsLabModalOpen] = useState(false);
    const [newLab, setNewLab] = useState({ name: "", description: "" });
    const [isCreatingLab, setIsCreatingLab] = useState(false);

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
    
    const handleRemoveStudent = async (studentId: number) => {
        if (!confirm("Are you sure you want to remove this student?")) return;
        try {
            await api.delete(`/cohorts/${id}/students/${studentId}`);
            fetchCohort();
        } catch (e: any) {
            alert(e.response?.data?.detail || "Failed to remove student");
        }
    };

    const handleArchiveCohort = async () => {
        if (!confirm("Are you sure you want to archive this cohort? Students will no longer see it.")) return;
        try {
            await api.patch(`/cohorts/${id}/status`, { status: "archived" });
            fetchCohort();
            alert("Cohort archived successfully");
        } catch (e: any) {
            alert(e.response?.data?.detail || "Failed to archive cohort");
        }
    };

    const handleDeleteCohort = async () => {
        if (!confirm("CRITICAL WARNING: This will permanently delete the cohort, all lab sessions within it, and all student enrollment records. This cannot be undone. Are you sure?")) return;
        try {
            await api.delete(`/cohorts/${id}`);
            router.push("/faculty/cohorts");
        } catch (e: any) {
            alert(e.response?.data?.detail || "Failed to delete cohort");
        }
    };

    const handleCreateLab = async () => {
        if (!newLab.name.trim()) return;
        setIsCreatingLab(true);
        try {
            await api.post(`/labs/cohorts/${id}`, {
                name: newLab.name,
                description: newLab.description
            });
            setIsLabModalOpen(false);
            setNewLab({ name: "", description: "" });
            fetchCohort();
        } catch (e: any) {
            alert(e.response?.data?.detail || "Failed to create lab");
        } finally {
            setIsCreatingLab(false);
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

            <header className="mb-12 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter">{cohort.name}</h1>
                        {cohort.status === "archived" && (
                            <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full text-[10px] tracking-widest uppercase">
                                Archived
                            </span>
                        )}
                    </div>
                    <p className="text-primary uppercase tracking-[0.2em] text-[10px] mt-2">ID: {cohort.id} • {cohort.student_count} Students Enrolled</p>
                    <p className="text-slate-400 mt-4 max-w-2xl font-normal text-sm leading-relaxed">{cohort.description}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Labs Section */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg uppercase tracking-widest flex items-center gap-3">
                                <Library className="w-5 h-5 text-emerald-500" />
                                Active Labs
                            </h2>
                            <button 
                                onClick={() => setIsLabModalOpen(true)}
                                className="px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-[10px] tracking-widest uppercase hover:bg-emerald-500/20 transition-all flex items-center gap-2"
                            >
                                <PlusCircle className="w-4 h-4" /> Create Lab Session
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                            {cohort.labs?.map((lab: any) => (
                                <div key={lab.id} className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold uppercase tracking-tight">{lab.name}</h3>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                                <FileText className="w-3 h-3 text-emerald-500" />
                                                {lab.problem_count} Problems
                                            </span>
                                        </div>
                                    </div>
                                    <button 
                                        className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs uppercase tracking-widest transition-all"
                                        onClick={() => router.push(`/faculty/cohorts/${id}/labs/${lab.id}`)}
                                    >
                                        Manage Content
                                    </button>
                                </div>
                            ))}
                            {cohort.labs?.length === 0 && (
                                <div className="bg-white/[0.02] border border-white/5 border-dashed p-12 rounded-3xl text-center">
                                    <p className="text-slate-500 uppercase tracking-widest text-xs">No lab sessions created yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Students Section */}
                    <div>
                        <h2 className="text-lg uppercase tracking-widest mb-6 flex items-center gap-3">
                            <Users className="w-5 h-5 text-primary" />
                            Roster
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cohort.students?.map((s: any) => (
                                <div key={s.id} className="bg-white/[0.02] border border-white/5 p-4 rounded-xl flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] text-primary">
                                            {s.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm">{s.full_name || s.username}</div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-widest">{s.username}</div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleRemoveStudent(s.id)}
                                        className="p-2 text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Remove Student"
                                    >
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
                        <p className="text-[10px] text-slate-500 mb-6 leading-relaxed uppercase">Manage the lifecycle of this cohort. These actions affect student visibility and data retention.</p>
                        
                        <div className="space-y-3">
                            {cohort.status !== "archived" && (
                                <button 
                                    onClick={handleArchiveCohort}
                                    className="w-full bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl py-3 text-[10px] uppercase tracking-widest hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <Archive className="w-4 h-4" /> Archive Cohort
                                </button>
                            )}
                            <button 
                                onClick={handleDeleteCohort}
                                className="w-full bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl py-3 text-[10px] uppercase tracking-widest hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" /> Permanently Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lab Creation Modal */}
            {isLabModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0a0a0f] border border-white/10 rounded-3xl p-8 max-w-lg w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl uppercase tracking-tighter">New Lab Session</h2>
                            <button onClick={() => setIsLabModalOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors rounded-xl hover:bg-white/5">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">Lab Title</label>
                                <input 
                                    type="text" 
                                    value={newLab.name}
                                    onChange={e => setNewLab({...newLab, name: e.target.value})}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500/50 focus:outline-none transition-colors"
                                    placeholder="e.g. Week 1: Data Structures"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    Notes / Instructions <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded text-[8px]">Markdown Supported</span>
                                </label>
                                <textarea 
                                    value={newLab.description}
                                    onChange={e => setNewLab({...newLab, description: e.target.value})}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500/50 focus:outline-none transition-colors h-32 font-mono"
                                    placeholder="Add links, resources, or general instructions for the lab..."
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    onClick={() => setIsLabModalOpen(false)}
                                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs uppercase tracking-widest transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleCreateLab}
                                    disabled={!newLab.name.trim() || isCreatingLab}
                                    className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                                >
                                    {isCreatingLab ? "Creating..." : "Initialize Lab"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
