"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Briefcase, MapPin, GraduationCap, Link2, Globe, MessageSquare, ArrowLeft } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function AlumniProfilesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [alumni, setAlumni] = useState<any[]>([]);
    const [selectedAlumni, setSelectedAlumni] = useState<any>(null);
    const [message, setMessage] = useState("");
    const [myRequests, setMyRequests] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            if (user.role === "student" || user.role === "alumni" || user.role === "faculty" || user.role === "admin") {
                fetchAlumni();
                if (user.role === "student") {
                    fetchMyRequests();
                }
            } else {
                router.push("/alumni");
            }
        }
    }, [user]);

    const fetchAlumni = async () => {
        try {
            const res = await api.get("/alumni/profiles");
            setAlumni(res.data);
        } catch (e) {
            console.error("Failed to load alumni", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewProfile = async (alumniId: number) => {
        try {
            const res = await api.get(`/alumni/profiles/${alumniId}`);
            setSelectedAlumni(res.data);
        } catch (e) {
            console.error("Failed to load profile", e);
        }
    };

    const handleSendRequest = async () => {
        if (!selectedAlumni) return;
        if (!message.trim()) {
            alert("Please enter a message");
            return;
        }
        try {
            await api.post("/alumni/contact-request", {
                recipient_id: selectedAlumni.user_id,
                message: message
            });
            alert("Request sent!");
            setMessage("");
            fetchMyRequests();
            setSelectedAlumni(null);
        } catch (e: any) {
            const errorMsg = e.response?.data?.detail || "Failed to send request";
            alert(errorMsg);
        }
    };

    const fetchMyRequests = async () => {
        try {
            const res = await api.get("/alumni/contact-requests");
            setMyRequests(res.data.sent || []);
        } catch (e) {
            console.error("Failed to load my requests", e);
        }
    };

    const getRequestStatus = (alumniId: number) => {
        const req = myRequests.find(r => r.recipient_id === alumniId);
        return req ? req.status : null;
    };

    const getRequestResponse = (alumniId: number) => {
        const req = myRequests.find(r => r.recipient_id === alumniId);
        return req ? req.response_message : null;
    };

    const handleSendRequestAgain = async (alumniId: number) => {
        if (!message.trim()) {
            alert("Please enter a message");
            return;
        }
        try {
            await api.post("/alumni/contact-request", {
                recipient_id: alumniId,
                message: message
            });
            alert("Request sent again!");
            setMessage("");
            fetchMyRequests();
            setSelectedAlumni(null);
        } catch (e: any) {
            const errorMsg = e.response?.data?.detail || "Failed to send request";
            alert(errorMsg);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <LoadingSpinner label="Loading Alumni..." />
        </div>;
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-8 md:p-12 font-black">
            <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 uppercase text-xs tracking-widest"
            >
                <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <header className="mb-12">
                <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter text-slate-900">Alumni Network</h1>
                <p className="text-slate-500 uppercase tracking-widest text-xs mt-2">Connect with successful graduates</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Alumni List */}
                <div className="lg:col-span-1 space-y-4">
                    {alumni.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-blue-100 border-dashed shadow-sm">
                            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-bold uppercase tracking-widest">No Alumni Found</p>
                        </div>
                    ) : (
                        alumni.map(a => {
                            const status = getRequestStatus(a.user_id);
                            return (
                                <div
                                    key={a.id}
                                    onClick={() => handleViewProfile(a.user_id)}
                                    className={`bg-white border p-6 rounded-2xl cursor-pointer transition-all shadow-sm ${
                                        selectedAlumni?.user_id === a.user_id
                                            ? "border-blue-500 ring-2 ring-blue-100"
                                            : "border-blue-100 hover:border-blue-300"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                {(a.full_name || a.username || "A")[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold uppercase">{a.full_name || a.username}</h3>
                                                <p className="text-[10px] text-slate-500 uppercase">{a.headline || "No headline"}</p>
                                            </div>
                                        </div>
                                        {status && (
                                            <span className={`text-xs px-2 py-1 rounded ${
                                                status === "pending" ? "bg-yellow-100 text-yellow-600" :
                                                status === "accepted" ? "bg-green-100 text-green-600" :
                                                "bg-red-100 text-red-600"
                                            }`}>
                                                {status}
                                            </span>
                                        )}
                                    </div>
                                    {a.company && (
                                        <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">
                                            <Briefcase className="w-4 h-4" />
                                            {a.company}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Profile Detail */}
                <div className="lg:col-span-2">
                    {selectedAlumni?.exists ? (
                        <div className="bg-white border border-blue-100 p-8 rounded-3xl shadow-sm">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                                    {(selectedAlumni.full_name || selectedAlumni.username || "A")[0].toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase">{selectedAlumni.full_name || selectedAlumni.username}</h2>
                                    <p className="text-primary">{selectedAlumni.headline}</p>
                                    {selectedAlumni.company && (
                                        <p className="text-slate-500 text-sm">{selectedAlumni.company}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {selectedAlumni.location && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        <span>{selectedAlumni.location}</span>
                                    </div>
                                )}
                                {selectedAlumni.graduation_year && (
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4 text-slate-400" />
                                        <span>Class of {selectedAlumni.graduation_year}</span>
                                    </div>
                                )}
                                {selectedAlumni.linkedin_url && (
                                    <div className="flex items-center gap-2">
                                        <Link2 className="w-4 h-4 text-slate-400" />
                                        <a href={selectedAlumni.linkedin_url} target="_blank" className="text-primary hover:underline">LinkedIn</a>
                                    </div>
                                )}
                                {selectedAlumni.github_url && (
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-slate-400" />
                                        <a href={selectedAlumni.github_url} target="_blank" className="text-primary hover:underline">GitHub</a>
                                    </div>
                                )}
                            </div>

                            {selectedAlumni.bio && (
                                <div className="mb-8">
                                    <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-2">About</h3>
                                    <p className="text-slate-700">{selectedAlumni.bio}</p>
                                </div>
                            )}

                            {selectedAlumni.skills && (
                                <div className="mb-8">
                                    <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-2">Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedAlumni.skills.split(",").map((skill: string) => (
                                            <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">
                                                {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-slate-100 pt-8">
                                {(() => {
                                    const status = selectedAlumni ? getRequestStatus(selectedAlumni.user_id) : null;
                                    const response = selectedAlumni ? getRequestResponse(selectedAlumni.user_id) : null;
                                    
                                    if (status) {
                                        return (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-xs uppercase tracking-widest text-slate-500">Your Request</h3>
                                                    <span className={`text-xs px-3 py-1 rounded-full ${
                                                        status === "pending" ? "bg-yellow-100 text-yellow-600" :
                                                        status === "accepted" ? "bg-green-100 text-green-600" :
                                                        "bg-red-100 text-red-600"
                                                    }`}>
                                                        {status}
                                                    </span>
                                                </div>
                                                {response && (
                                                    <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                                                        <p className="text-xs text-green-600 font-bold mb-1">Response from alumni:</p>
                                                        <p className="text-sm text-green-700">{response}</p>
                                                    </div>
                                                )}
                                                {status === "rejected" && (
                                                    <button
                                                        onClick={() => {
                                                            handleSendRequestAgain(selectedAlumni.user_id);
                                                        }}
                                                        className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm"
                                                    >
                                                        Try Again
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    }
                                    
                                    return (
                                        <div className="space-y-4">
                                            <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4">Request Mentorship</h3>
                                            <textarea
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                placeholder="Introduce yourself and explain why you'd like to connect..."
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm h-32"
                                            />
                                            <button
                                                onClick={handleSendRequest}
                                                disabled={!message.trim()}
                                                className="px-6 py-3 bg-amber-500 text-white rounded-xl text-xs uppercase tracking-widest disabled:opacity-50"
                                            >
                                                Send Request
                                            </button>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-blue-100 border-dashed shadow-sm">
                            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-bold uppercase tracking-widest">Select an alumni to view profile</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}