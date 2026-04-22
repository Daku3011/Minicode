"use client";

import { useState, useEffect } from "react";
import { Users, Presentation, PlusCircle, Search, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function StudentCohortsPage() {
    const [cohorts, setCohorts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(false);
    const [inviteCode, setInviteCode] = useState("");
    const { user } = useAuth();
    const router = useRouter();
    
    useEffect(() => {
        fetchCohorts();
    }, []);

    const fetchCohorts = async () => {
        try {
            const res = await api.get("/cohorts/my");
            setCohorts(res.data);
        } catch (e) {
            console.error("Failed to load your cohorts", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinCohort = async () => {
        if (!inviteCode.trim()) return;
        setIsJoining(true);
        try {
            const cid = parseInt(inviteCode);
            if (isNaN(cid)) {
                alert("Please enter a valid numeric ID.");
                setIsJoining(false);
                return;
            }
            const res = await api.post("/cohorts/join", { cohort_id: cid });
            alert(res.data.message);
            setInviteCode("");
            fetchCohorts(); // Refresh list
        } catch (e: any) {
            console.error(e);
            let errorMessage = "Failed to join cohort. Check invite code.";
            if (e.response?.data?.detail) {
                errorMessage = typeof e.response.data.detail === 'string' 
                    ? e.response.data.detail 
                    : JSON.stringify(e.response.data.detail);
            }
            alert(errorMessage);
        } finally {
            setIsJoining(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-8 text-slate-900">
                <LoadingSpinner size="lg" label="SYNCING CLASSROOM..." />
            </div>
        );
    }

    if (!user) {
        return <div className="p-8 text-center text-slate-900">Please login first.</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-8 md:p-12 font-display">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-50 blur-[120px] pointer-events-none" />
            
            <header className="mb-12">
                <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tight text-slate-900">My Cohorts</h1>
                <p className="text-slate-500 uppercase tracking-widest text-xs mt-2 font-bold">Active Classes & Lab Sessions</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Join Panel */}
                <div className="bg-white border border-blue-100 p-8 rounded-3xl h-fit shadow-sm">
                    <h2 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-3 text-slate-900">
                        <Presentation className="w-5 h-5 text-primary" />
                        Join Class
                    </h2>
                    <div className="space-y-4">
                        <input 
                            type="text" 
                            className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-slate-900 placeholder:text-slate-400 font-bold shadow-sm"
                            placeholder="Enter Invite Code (ID)"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                        />
                        <button 
                            onClick={handleJoinCohort}
                            disabled={isJoining || !inviteCode.trim()}
                            className="bg-gray-500/90 hover:bg-blue-600 text-white font-black w-full rounded-xl py-3 text-xs uppercase tracking-widest transition-all disabled:opacity-50 shadow-sm cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isJoining ? "Scanning..." : "Enroll Now"}
                        </button>
                        <p className="text-[10px] text-slate-500 font-bold text-center tracking-widest mt-4">Obtain your classroom ID from your Faculty instructor.</p>
                    </div>
                </div>

                {/* Cohorts List */}
                <div className="lg:col-span-2 space-y-4">
                    {cohorts.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-blue-100 border-dashed shadow-sm">
                            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-bold uppercase tracking-widest">You have not joined any cohorts</p>
                        </div>
                    ) : (
                        cohorts.map(c => (
                            <div key={c.id} className="bg-white border border-blue-100 p-6 rounded-2xl flex items-center justify-between hover:border-blue-200 transition-all shadow-sm">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{c.name}</h3>
                                    <div className="flex items-center gap-6 mt-2 text-slate-500 text-[10px] tracking-widest font-bold uppercase">
                                        <span className="flex items-center gap-1.5"><Users className="w-3 h-3 text-primary" /> Prof: {c.faculty_name}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => router.push(`/cohorts/${c.id}`)}
                                    className="p-3 bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-xl transition-all group"
                                >
                                    <ChevronRight className="w-5 h-5 text-primary transition-colors" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
