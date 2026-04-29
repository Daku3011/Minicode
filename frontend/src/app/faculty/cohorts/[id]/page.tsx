"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Users, Library, PlusCircle, ArrowLeft, Trash2, Archive, X, FileText } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function FacultyCohortDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [cohort, setCohort] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [newStudent, setNewStudent] = useState("");
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);

    // Lab Creation Modal State
    const [isLabModalOpen, setIsLabModalOpen] = useState(false);
    const [newLab, setNewLab] = useState({ name: "", description: "" });
    const [isCreatingLab, setIsCreatingLab] = useState(false);

    // Notes State
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [tempNotes, setTempNotes] = useState("");
    const [isSavingNotes, setIsSavingNotes] = useState(false);

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

    const fetchPendingRequests = async () => {
        try {
            const res = await api.get(`/cohorts/${id}/requests`);
            setPendingRequests(res.data);
        } catch (e) {
            console.error("Failed to load pending requests", e);
        }
    };

    useEffect(() => {
        if (id) {
            fetchCohort();
            fetchPendingRequests();
        }
    }, [id]);

    const handleUpdateNotes = async () => {
        setIsSavingNotes(true);
        try {
            await api.patch(`/cohorts/${id}`, { notes: tempNotes });
            setCohort({ ...cohort, notes: tempNotes });
            setIsEditingNotes(false);
        } catch (e: any) {
            alert(e.response?.data?.detail || "Failed to update notes");
        } finally {
            setIsSavingNotes(false);
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

    const handleApproveRequest = async (requestId: number) => {
        if (!confirm("Approve this student's join request?")) return;
        try {
            await api.post(`/cohorts/${id}/requests/${requestId}/approve`);
            alert("Student approved and added to cohort");
            fetchPendingRequests();
            fetchCohort();
        } catch (e: any) {
            alert(e.response?.data?.detail || "Failed to approve request");
        }
    };

    const handleRejectRequest = async (requestId: number) => {
        const note = prompt("Reason for rejection (optional):");
        if (!confirm("Reject this student's join request?")) return;
        try {
            await api.post(`/cohorts/${id}/requests/${requestId}/reject`, { faculty_note: note });
            alert("Join request rejected");
            fetchPendingRequests();
        } catch (e: any) {
            alert(e.response?.data?.detail || "Failed to reject request");
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

    if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><LoadingSpinner label="LOADING COHORT..." /></div>;
    if (!cohort) return null;

    return (
        <>
            <div className="min-h-screen bg-slate-50 text-slate-900 p-8 md:p-12 font-black">
            <button
                onClick={() => router.push("/faculty/cohorts")}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 uppercase text-xs tracking-widest"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Cohorts
            </button>

            <header className="mb-12 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter">{cohort.name}</h1>
                        {cohort.status === "archived" && (
                            <span className="bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1 rounded-full text-[10px] tracking-widest uppercase">
                                Archived
                            </span>
                        )}
                    </div>
                    <p className="text-primary uppercase tracking-[0.2em] text-[10px] mt-2">ID: {cohort.id} • {cohort.student_count} Students Enrolled</p>
                    <p className="text-slate-500 mt-4 max-w-2xl font-normal text-sm leading-relaxed">{cohort.description}</p>
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
                                className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-[10px] tracking-widest uppercase hover:bg-emerald-100 transition-all flex items-center gap-2"
                            >
                                <PlusCircle className="w-4 h-4" /> Create Lab Session
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {cohort.labs?.map((lab: any) => (
                                <div key={lab.id} className="bg-white border border-blue-100 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
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
                                        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs uppercase tracking-widest transition-all shadow-sm"
                                        onClick={() => router.push(`/faculty/cohorts/${id}/labs/${lab.id}`)}
                                    >
                                        Manage Content
                                    </button>
                                </div>
                            ))}
                            {cohort.labs?.length === 0 && (
                                <div className="bg-white border border-blue-100 border-dashed p-12 rounded-3xl text-center shadow-sm">
                                    <p className="text-slate-500 uppercase tracking-widest text-xs">No lab sessions created yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Resources & Notes Section */}
                    <div className="bg-white border border-blue-100 p-8 rounded-[2.5rem] relative group shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg uppercase tracking-widest flex items-center gap-3">
                                <PlusCircle className="w-5 h-5 text-blue-500" />
                                Resources & Notes
                            </h2>
                            <button
                                onClick={() => {
                                    setTempNotes(cohort.notes || "");
                                    setIsEditingNotes(true);
                                }}
                                className="text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                Edit Notes
                            </button>
                        </div>

                        {cohort.notes ? (
                            <div className="prose prose-sm max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {cohort.notes}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
                                <p className="text-slate-500 uppercase tracking-widest text-xs">No resources or notes added yet</p>
                                <button
                                    onClick={() => {
                                        setTempNotes("");
                                        setIsEditingNotes(true);
                                    }}
                                    className="text-primary text-[10px] uppercase tracking-widest mt-4 hover:underline"
                                >
                                    + Add Markdown Notes
                                </button>
                            </div>
                        )}
                    </div>
                    {/* Pending Join Requests Section */}
                    {pendingRequests.length > 0 && (
                        <div>
                            <h2 className="text-lg uppercase tracking-widest mb-6 flex items-center gap-3">
                                <Users className="w-5 h-5 text-amber-500" />
                                Pending Join Requests
                                <span className="bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full text-[8px]">
                                    {pendingRequests.length}
                                </span>
                            </h2>
                            <div className="grid grid-cols-1 gap-4 mb-8">
                                {pendingRequests.map((req: any) => (
                                    <div key={req.id} className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-[10px] text-amber-600">
                                                {(req.student_full_name || req.student_username || "U")[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-sm">{req.student_full_name || req.student_username}</div>
                                                <div className="text-[10px] text-slate-500 uppercase tracking-widest">{req.student_username}</div>
                                                <div className="text-[10px] text-amber-600 mt-1">
                                                    Requested: {new Date(req.requested_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleApproveRequest(req.id)}
                                                className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleRejectRequest(req.id)}
                                                className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-all"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h2 className="text-lg uppercase tracking-widest mb-6 flex items-center gap-3">
                            <Users className="w-5 h-5 text-primary" />
                            Roster
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cohort.students?.map((s: any) => (
                                <div key={s.id} className="bg-white border border-blue-100 p-4 rounded-xl flex items-center justify-between group shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[10px] text-blue-600">
                                            {s.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm">{s.full_name || s.username}</div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-widest">{s.username}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveStudent(s.id)}
                                        className="p-2 text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Remove Student"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {cohort.students?.length === 0 && (
                                <div className="col-span-full py-12 text-center bg-white border border-blue-100 border-dashed rounded-2xl text-slate-500 uppercase text-xs tracking-widest shadow-sm">
                                    No students enrolled yet
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-6">
                    <div className="bg-white border border-blue-100 p-6 rounded-2xl shadow-sm">
                        <h3 className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-4">Add Student</h3>
                        <div className="space-y-3">
                            <div className="relative">
                                <PlusCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={newStudent}
                                    onChange={(e) => setNewStudent(e.target.value)}
                                    placeholder="Username"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                                />
                            </div>
                            <button
                                onClick={handleAddStudent}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-2 text-[10px] uppercase tracking-widest transition-all shadow-sm"
                            >
                                Enroll Student
                            </button>
                        </div>
                    </div>

                    <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl">
                        <h3 className="text-xs uppercase tracking-[0.2em] text-rose-600 mb-2">Danger Zone</h3>
                        <p className="text-[10px] text-slate-500 mb-6 leading-relaxed uppercase">Manage the lifecycle of this cohort. These actions affect student visibility and data retention.</p>

                        <div className="space-y-3">
                            {cohort.status !== "archived" && (
                                <button
                                    onClick={handleArchiveCohort}
                                    className="w-full bg-amber-50 text-amber-600 border border-amber-200 rounded-xl py-3 text-[10px] uppercase tracking-widest hover:bg-amber-100 transition-all flex items-center justify-center gap-2"
                                >
                                    <Archive className="w-4 h-4" /> Archive Cohort
                                </button>
                            )}
                            <button
                                onClick={handleDeleteCohort}
                                className="w-full bg-rose-50 text-rose-600 border border-rose-200 rounded-xl py-3 text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" /> Permanently Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lab Creation Modal */}
            {isLabModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-lg w-full shadow-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl uppercase tracking-tighter text-slate-900">New Lab Session</h2>
                            <button onClick={() => setIsLabModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-100">
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
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none transition-colors"
                                    placeholder="e.g. Week 1: Data Structures"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    Notes / Instructions <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[8px]">Markdown Supported</span>
                                </label>
                                <textarea
                                    value={newLab.description}
                                    onChange={e => setNewLab({...newLab, description: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none transition-colors h-32 font-mono"
                                    placeholder="Add links, resources, or general instructions for the lab..."
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={() => setIsLabModalOpen(false)}
                                    className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs uppercase tracking-widest transition-all text-slate-700"
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
            {/* Notes Edit Modal */}
            {isEditingNotes && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-4xl w-full shadow-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl uppercase tracking-tighter text-slate-900">Edit Cohort Notes</h2>
                            <button onClick={() => setIsEditingNotes(false)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    Editor <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[8px]">Markdown Supported</span>
                                </label>
                                <textarea
                                    value={tempNotes}
                                    onChange={e => setTempNotes(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none transition-colors h-[400px] font-mono resize-none"
                                    placeholder="Add links, resources, or general instructions for the cohort..."
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">Preview</label>
                                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-6 h-[400px] overflow-y-auto prose prose-sm max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {tempNotes || "*Preview will appear here...*"}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 flex gap-3 justify-end">
                            <button
                                onClick={() => setIsEditingNotes(false)}
                                className="px-8 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs uppercase tracking-widest transition-all text-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateNotes}
                                disabled={isSavingNotes}
                                className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                            >
                                {isSavingNotes ? "Saving..." : "Update Notes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </>
    );
}
