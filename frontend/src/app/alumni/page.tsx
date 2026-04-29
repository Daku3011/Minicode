"use client";

import { useState, useEffect } from "react";
import { Users, Briefcase, MapPin, GraduationCap, Link2, Globe, MessageSquare, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function AlumniDashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [contactRequests, setContactRequests] = useState<any>({ received: [], sent: [] });
    const [isEditing, setIsEditing] = useState(false);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyMessage, setReplyMessage] = useState("");
    const [students, setStudents] = useState<any[]>([]);
    
    // Form state
    const [formData, setFormData] = useState({
        headline: "",
        company: "",
        location: "",
        graduation_year: "",
        linkedin_url: "",
        github_url: "",
        skills: "",
        bio: "",
        degree: ""
    });
    const [savedData, setSavedData] = useState<any>(null);

    useEffect(() => {
        if (user) {
            if (user.role !== "alumni" && user.role !== "faculty" && user.role !== "admin") {
                router.push("/");
            } else {
                fetchData();
            }
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const [profileRes, requestsRes, studentsRes] = await Promise.all([
                api.get("/alumni/profile/me"),
                api.get("/alumni/contact-requests"),
                api.get("/alumni/students")
            ]);
            setProfile(profileRes.data);
            setSavedData(profileRes.data);
            setStudents(studentsRes.data || []);
            if (profileRes.data.exists) {
                setFormData({
                    headline: profileRes.data.headline || "",
                    company: profileRes.data.company || "",
                    location: profileRes.data.location || "",
                    graduation_year: profileRes.data.graduation_year?.toString() || "",
                    linkedin_url: profileRes.data.linkedin_url || "",
                    github_url: profileRes.data.github_url || "",
                    skills: profileRes.data.skills || "",
                    bio: profileRes.data.bio || "",
                    degree: profileRes.data.degree || ""
                });
            }
            setContactRequests(requestsRes.data);
        } catch (e) {
            console.error("Failed to load data", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!savedData?.exists) {
            alert("Please fill in your profile first");
            return;
        }
        try {
            const data = {
                headline: formData.headline || undefined,
                company: formData.company || undefined,
                location: formData.location || undefined,
                graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : undefined,
                linkedin_url: formData.linkedin_url || undefined,
                github_url: formData.github_url || undefined,
                skills: formData.skills || undefined,
                bio: formData.bio || undefined,
                degree: formData.degree || undefined
            };
            await api.put("/alumni/profile/me", data);
            setIsEditing(false);
            fetchData();
            alert("Profile updated!");
        } catch (e) {
            alert("Failed to update profile");
        }
    };

    const toggleEdit = () => {
        if (isEditing && savedData?.exists) {
            setFormData({
                headline: savedData.headline || "",
                company: savedData.company || "",
                location: savedData.location || "",
                graduation_year: savedData.graduation_year?.toString() || "",
                linkedin_url: savedData.linkedin_url || "",
                github_url: savedData.github_url || "",
                skills: savedData.skills || "",
                bio: savedData.bio || "",
                degree: savedData.degree || ""
            });
        }
        setIsEditing(!isEditing);
    };

    const handleRespondRequest = async (requestId: number, accept: boolean) => {
        const responseMessage = accept ? prompt("Optional message to send with your response:") : prompt("Reason for rejection (optional):");
        try {
            await api.post(`/alumni/contact-request/${requestId}/respond`, {
                accept,
                response_message: responseMessage || undefined
            });
            fetchData();
        } catch (e) {
            alert("Failed to respond");
        }
    };

    const handleReplyRequest = async (requestId: number) => {
        if (!replyMessage.trim()) {
            alert("Please enter a reply message");
            return;
        }
        try {
            await api.post(`/alumni/contact-request/${requestId}/reply`, {
                message: replyMessage
            });
            setReplyingTo(null);
            setReplyMessage("");
            fetchData();
            alert("Reply sent!");
        } catch (e: any) {
            alert(e.response?.data?.detail || "Failed to send reply");
        }
    };

    const handleCreateNotification = async () => {
        const title = prompt("Notification title:");
        if (!title) return;
        const message = prompt("Notification message:");
        if (!message) return;
        
        try {
            await api.post("/alumni/notifications", { title, message, notification_type: "info" });
            alert("Notification sent to all students!");
        } catch (e) {
            alert("Failed to send notification");
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (isLoading) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <LoadingSpinner label="Loading..." />
        </div>;
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-8 md:p-12 font-black">
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-[10px] font-black uppercase tracking-wider">Alumni Portal</span>
                </div>
                <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter text-slate-900">Alumni Dashboard</h1>
                <p className="text-slate-500 uppercase tracking-widest text-xs mt-2">Manage your profile &amp; connect with students</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-blue-100 p-8 rounded-3xl shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg uppercase tracking-widest flex items-center gap-3 text-slate-900">
                                <Users className="w-5 h-5 text-amber-500" />
                                My Profile
                            </h2>
                            <button
                                onClick={toggleEdit}
                                className="px-4 py-2 bg-blue-500 text-white rounded-xl text-xs uppercase tracking-widest"
                            >
                                {isEditing ? "Cancel" : savedData?.exists ? "Edit Profile" : "Create Profile"}
                            </button>
                            {isEditing && savedData?.exists && (
                                <button
                                    onClick={handleUpdateProfile}
                                    className="px-4 py-2 bg-green-500 text-white rounded-xl text-xs uppercase tracking-widest ml-2"
                                >
                                    Update
                                </button>
                            )}
                            {isEditing && !savedData?.exists && (
                                <button
                                    onClick={handleUpdateProfile}
                                    className="px-4 py-2 bg-green-500 text-white rounded-xl text-xs uppercase tracking-widest ml-2"
                                >
                                    Save
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Headline *</label>
                                    <input
                                        type="text"
                                        value={formData.headline}
                                        onChange={(e) => handleInputChange("headline", e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm disabled:opacity-50"
                                        placeholder="e.g. Software Engineer at Google"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Company</label>
                                    <input
                                        type="text"
                                        value={formData.company}
                                        onChange={(e) => handleInputChange("company", e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm disabled:opacity-50"
                                        placeholder="Company name"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => handleInputChange("location", e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm disabled:opacity-50"
                                        placeholder="City, Country"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Degree</label>
                                    <input
                                        type="text"
                                        value={formData.degree}
                                        onChange={(e) => handleInputChange("degree", e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm disabled:opacity-50"
                                        placeholder="B.Tech, M.Tech, etc."
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Graduation Year</label>
                                    <input
                                        type="number"
                                        value={formData.graduation_year}
                                        onChange={(e) => handleInputChange("graduation_year", e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm disabled:opacity-50"
                                        placeholder="2020"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">LinkedIn URL</label>
                                    <input
                                        type="url"
                                        value={formData.linkedin_url}
                                        onChange={(e) => handleInputChange("linkedin_url", e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm disabled:opacity-50"
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">GitHub URL</label>
                                    <input
                                        type="url"
                                        value={formData.github_url}
                                        onChange={(e) => handleInputChange("github_url", e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm disabled:opacity-50"
                                        placeholder="https://github.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Skills</label>
                                    <textarea
                                        value={formData.skills}
                                        onChange={(e) => handleInputChange("skills", e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm disabled:opacity-50 h-24"
                                        placeholder="Python, JavaScript, Machine Learning..."
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Bio</label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => handleInputChange("bio", e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm disabled:opacity-50 h-24"
                                        placeholder="Tell students about yourself..."
                                    />
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <button
                                onClick={handleUpdateProfile}
                                className="mt-6 px-6 py-3 bg-amber-500 text-white rounded-xl text-xs uppercase tracking-widest hover:bg-amber-600"
                            >
                                Save Profile
                            </button>
                        )}
                    </div>

                    {/* Contact Requests */}
                    {(user.role === "alumni" || user.role === "faculty" || user.role === "admin") && (
                        <div className="bg-white border border-blue-100 p-8 rounded-3xl shadow-sm">
                            <h2 className="text-lg uppercase tracking-widest flex items-center gap-3 mb-6 text-slate-900">
                                <MessageSquare className="w-5 h-5 text-amber-500" />
                                Contact Requests
                            </h2>

                            {contactRequests.received?.length > 0 ? (
                                <div className="space-y-4">
                                    {contactRequests.received.map((req: any) => (
                                        <div key={req.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <button
                                                        onClick={() => router.push(`/profile/${req.requester_username}`)}
                                                        className="font-bold text-blue-600 hover:underline"
                                                    >
                                                        {req.requester_name}
                                                    </button>
                                                    <p className="text-sm text-slate-500">{req.message}</p>
                                                    {req.response_message && (
                                                        <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-lg">
                                                            <p className="text-xs text-blue-600 font-bold">Your response:</p>
                                                            <p className="text-sm text-blue-700">{req.response_message}</p>
                                                        </div>
                                                    )}
                                                    <p className="text-[10px] text-slate-400 mt-1">
                                                        {new Date(req.requested_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                {req.status === "pending" && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleRespondRequest(req.id, true)}
                                                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRespondRequest(req.id, false)}
                                                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                                <span className={`text-xs px-2 py-1 rounded ${
                                                    req.status === "pending" ? "bg-yellow-100 text-yellow-600" :
                                                    req.status === "accepted" ? "bg-green-100 text-green-600" :
                                                    "bg-red-100 text-red-600"
                                                }`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                            {req.status === "accepted" && (
                                                <div className="mt-3 pt-3 border-t border-slate-200">
                                                    {replyingTo === req.id ? (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={replyMessage}
                                                                onChange={(e) => setReplyMessage(e.target.value)}
                                                                placeholder="Type a message to the student..."
                                                                className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                                            />
                                                            <button
                                                                onClick={() => handleReplyRequest(req.id)}
                                                                className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm"
                                                            >
                                                                Send
                                                            </button>
                                                            <button
                                                                onClick={() => setReplyingTo(null)}
                                                                className="px-3 py-2 bg-slate-200 text-slate-600 rounded-lg text-sm"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setReplyingTo(req.id)}
                                                            className="text-sm text-blue-500 hover:underline"
                                                        >
                                                            + Reply to student
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500">No pending requests.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {(user.role === "alumni" || user.role === "faculty" || user.role === "admin") && (
                        <div className="bg-white border border-blue-100 p-6 rounded-2xl shadow-sm">
                            <h3 className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={handleCreateNotification}
                                    className="w-full px-4 py-3 bg-blue-500 text-white rounded-xl text-xs uppercase tracking-widest hover:bg-blue-600 transition-all"
                                >
                                    Send Notification
                                </button>
                                <button
                                    onClick={() => router.push("/alumni/profiles")}
                                    className="w-full px-4 py-3 bg-slate-100 text-slate-700 rounded-xl text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                    View All Alumni
                                </button>
                                <button
                                    onClick={() => router.push("/alumni/students")}
                                    className="w-full px-4 py-3 bg-slate-100 text-slate-700 rounded-xl text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                    Browse Students ({students.length})
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="bg-white border border-blue-100 p-6 rounded-2xl shadow-sm">
                        <h3 className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-4">Your Stats</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Profile Status</span>
                                <span className={profile?.exists ? "text-green-600" : "text-red-500"}>
                                    {profile?.exists ? "Complete" : "Incomplete"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Requests Received</span>
                                <span>{contactRequests.received?.length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Requests Sent</span>
                                <span>{contactRequests.sent?.length || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}