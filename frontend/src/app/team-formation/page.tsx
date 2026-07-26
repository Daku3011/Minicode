"use client";

import { useEffect, useState } from "react";
import {
    Users,
    Search,
    Plus,
    X,
    Loader2,
    UserPlus,
    Check,
    Code,
    Clock,
    ArrowUpRight,
    Settings,
} from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import TeamCard from "@/components/TeamCard";

interface TeamRequest {
    id: number;
    title: string;
    description: string | null;
    desired_roles: string | null;
    required_skills: string | null;
    team_size: number;
    status: string;
    creator: {
        username: string;
        full_name: string | null;
        avatar_url: string | null;
    };
    application_count: number;
    created_at: string;
}

export default function TeamFormationPage() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<TeamRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("open");
    const [searchQuery, setSearchQuery] = useState("");

    // Create modal
    const [showCreate, setShowCreate] = useState(false);
    const [createData, setCreateData] = useState({
        title: "",
        description: "",
        desired_roles: "",
        required_skills: "",
        team_size: 4,
    });
    const [creating, setCreating] = useState(false);

    // Profile modal
    const [showProfile, setShowProfile] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [profileData, setProfileData] = useState({
        roles: "",
        skills: "",
        availability: "",
        bio: "",
        preferred_team_size: "",
    });
    const [savingProfile, setSavingProfile] = useState(false);

    useEffect(() => {
        fetchRequests();
        fetchProfile();
    }, []);

    const fetchRequests = async (status?: string) => {
        try {
            const res = await api.get("/team-formation/requests", {
                params: { status: status || activeTab },
            });
            setRequests(res.data);
        } catch (error) {
            console.error("Failed to fetch requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfile = async () => {
        try {
            const res = await api.get("/team-formation/profile");
            if (res.data) {
                setProfile(res.data);
                setProfileData({
                    roles: res.data.roles || "",
                    skills: res.data.skills || "",
                    availability: res.data.availability || "",
                    bio: res.data.bio || "",
                    preferred_team_size: res.data.preferred_team_size || "",
                });
            }
        } catch {
            // silent
        }
    };

    const handleCreate = async () => {
        if (!createData.title.trim()) return;
        setCreating(true);
        try {
            await api.post("/team-formation/requests", createData);
            setShowCreate(false);
            setCreateData({
                title: "",
                description: "",
                desired_roles: "",
                required_skills: "",
                team_size: 4,
            });
            fetchRequests();
        } catch (err: any) {
            alert(err.response?.data?.detail || "Failed to create request");
        } finally {
            setCreating(false);
        }
    };

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        try {
            await api.post("/team-formation/profile", profileData);
            setShowProfile(false);
            fetchProfile();
        } catch (err: any) {
            alert(err.response?.data?.detail || "Failed to save profile");
        } finally {
            setSavingProfile(false);
        }
    };

    const handleApply = async (requestId: number) => {
        try {
            await api.post(`/team-formation/requests/${requestId}/apply`, {
                message: "",
            });
            alert("Application submitted!");
            fetchRequests();
        } catch (err: any) {
            alert(err.response?.data?.detail || "Failed to apply");
        }
    };

    const filtered = requests.filter((r) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            r.title.toLowerCase().includes(q) ||
            (r.description || "").toLowerCase().includes(q) ||
            (r.desired_roles || "").toLowerCase().includes(q)
        );
    });

    return (
        <div className="min-h-screen pt-15 pb-24 px-4 md:px-8 bg-white relative overflow-hidden">
            <div className="max-w-[1600px] mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-6">
                        Team{" "}
                        <span className="bg-gradient-to-r from-violet-700 via-violet-500 to-blue-500 bg-clip-text text-transparent">
                            Formation
                        </span>
                    </h1>
                    <p className="text-slate-600 text-lg max-w-2xl mx-auto font-medium">
                        Find teammates for projects, hackathons, and contests. Set your profile and
                        match with others.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-between mb-10 gap-6">
                    <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                        {["open", "closed"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab);
                                    fetchRequests(tab);
                                }}
                                className={clsx(
                                    "px-4 py-2.5 rounded-lg text-sm font-medium transition-all capitalize",
                                    activeTab === tab
                                        ? "bg-violet-100 text-violet-700 border border-violet-200"
                                        : "text-slate-600 hover:text-slate-900"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search requests..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-violet-200"
                            />
                        </div>
                        <button
                            onClick={() => setShowProfile(true)}
                            className="h-12 w-12 rounded-xl bg-white border border-slate-200 hover:border-violet-300 flex items-center justify-center transition-all"
                        >
                            <Settings className="w-5 h-5 text-slate-500" />
                        </button>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="h-12 px-5 rounded-xl bg-primary text-white font-bold text-sm flex items-center gap-2 transition-all hover:bg-violet-700"
                        >
                            <Plus className="w-4 h-4" />
                            Create Request
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-slate-500 font-medium text-sm">
                            Loading requests...
                        </span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-24 rounded-2xl border border-dashed border-slate-300">
                        <Users className="w-14 h-14 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            No team requests found
                        </h3>
                        <p className="text-slate-500 text-sm">
                            Create a request to start forming your team.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((req) => (
                            <TeamCard
                                key={req.id}
                                request={req}
                                onApply={handleApply}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                                Create Request
                            </h3>
                            <button
                                onClick={() => setShowCreate(false)}
                                className="text-slate-400 hover:text-slate-900 p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={createData.title}
                                    onChange={(e) =>
                                        setCreateData({ ...createData, title: e.target.value })
                                    }
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="e.g., Looking for teammates for Hackathon"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                                    Description
                                </label>
                                <textarea
                                    value={createData.description}
                                    onChange={(e) =>
                                        setCreateData({ ...createData, description: e.target.value })
                                    }
                                    rows={3}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                    placeholder="Describe your project and what you're looking for"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                                    Desired Roles
                                </label>
                                <input
                                    type="text"
                                    value={createData.desired_roles}
                                    onChange={(e) =>
                                        setCreateData({ ...createData, desired_roles: e.target.value })
                                    }
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="e.g., Frontend, Backend, Designer"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                                    Required Skills
                                </label>
                                <input
                                    type="text"
                                    value={createData.required_skills}
                                    onChange={(e) =>
                                        setCreateData({ ...createData, required_skills: e.target.value })
                                    }
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="e.g., React, Python, UI/UX"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                                    Team Size
                                </label>
                                <input
                                    type="number"
                                    value={createData.team_size}
                                    onChange={(e) =>
                                        setCreateData({ ...createData, team_size: parseInt(e.target.value) || 4 })
                                    }
                                    min={2}
                                    max={10}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <button
                                onClick={handleCreate}
                                disabled={creating || !createData.title.trim()}
                                className="w-full py-4 rounded-xl bg-primary hover:bg-violet-700 disabled:opacity-50 text-white font-black uppercase text-xs tracking-widest transition-all"
                            >
                                {creating ? "Creating..." : "Create Request"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Modal */}
            {showProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                                Team Profile
                            </h3>
                            <button
                                onClick={() => setShowProfile(false)}
                                className="text-slate-400 hover:text-slate-900 p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                                    Roles
                                </label>
                                <input
                                    type="text"
                                    value={profileData.roles}
                                    onChange={(e) =>
                                        setProfileData({ ...profileData, roles: e.target.value })
                                    }
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="e.g., Developer, Designer, PM"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                                    Skills
                                </label>
                                <input
                                    type="text"
                                    value={profileData.skills}
                                    onChange={(e) =>
                                        setProfileData({ ...profileData, skills: e.target.value })
                                    }
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="e.g., Python, React, ML"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                                    Availability
                                </label>
                                <input
                                    type="text"
                                    value={profileData.availability}
                                    onChange={(e) =>
                                        setProfileData({ ...profileData, availability: e.target.value })
                                    }
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="e.g., Weekends, Evenings, Full-time"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                                    Bio
                                </label>
                                <textarea
                                    value={profileData.bio}
                                    onChange={(e) =>
                                        setProfileData({ ...profileData, bio: e.target.value })
                                    }
                                    rows={3}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                    placeholder="Tell potential teammates about yourself"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                                    Preferred Team Size
                                </label>
                                <input
                                    type="text"
                                    value={profileData.preferred_team_size}
                                    onChange={(e) =>
                                        setProfileData({ ...profileData, preferred_team_size: e.target.value })
                                    }
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="e.g., 2-4, 5-8"
                                />
                            </div>
                            <button
                                onClick={handleSaveProfile}
                                disabled={savingProfile}
                                className="w-full py-4 rounded-xl bg-primary hover:bg-violet-700 disabled:opacity-50 text-white font-black uppercase text-xs tracking-widest transition-all"
                            >
                                {savingProfile ? "Saving..." : "Save Profile"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
