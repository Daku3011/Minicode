"use client";

import { Mail, Github, Calendar, Activity, CheckCircle2, Award, Clock, Trophy, Star } from "lucide-react";
import { clsx } from "clsx";
import { useAuth, User } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import api from "@/lib/api";

interface ProfileStats {
    solved: number;
    rank: number;
    xp: number;
    streak: number;
}

interface RecentSubmission {
    id: number;
    problem: string;
    status: string;
    time: string;
}

interface UserProfileData {
    stats: ProfileStats;
    recentSubmissions: RecentSubmission[];
}

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const [profileData, setProfileData] = useState<UserProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (user) {
                    const response = await api.get("/auth/me");
                    setProfileData({
                        stats: response.data.stats,
                        recentSubmissions: response.data.recentSubmissions,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch profile stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    if (authLoading || loading) {
        return <div className="max-w-6xl mx-auto px-4 py-12 text-center text-white">Loading profile...</div>;
    }

    if (!user || !profileData) {
        return <div className="max-w-6xl mx-auto px-4 py-12 text-center text-rose-500">Failed to load profile. Please log in.</div>;
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: User Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass rounded-3xl p-8 flex flex-col items-center text-center">
                        <div className="relative mb-6">
                            <div className="w-32 h-32 rounded-3xl bg-primary flex items-center justify-center text-4xl font-black text-white relative z-10 rotate-3 overflow-hidden">
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    user.username?.slice(0, 2).toUpperCase()
                                )}
                            </div>
                            <div className="absolute -inset-2 bg-primary/20 blur-xl rounded-full" />
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-1">{user.full_name || user.username}</h2>
                        <p className="text-muted-foreground text-sm mb-4">@{user.username}</p>

                        <div className="bg-white/5 border border-white/10 rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-primary mb-6">
                            {user.role}
                        </div>

                        <div className="w-full space-y-3">
                            <div className="flex items-center space-x-3 text-sm text-muted-foreground p-3 rounded-xl bg-white/5 border border-white/5">
                                <Mail className="w-4 h-4" />
                                <span>{user.email}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm text-muted-foreground p-3 rounded-xl bg-white/5 border border-white/5 text-left">
                                <Github className="w-4 h-4" />
                                <span className="truncate">github.com/{user.username}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm text-muted-foreground p-3 rounded-xl bg-white/5 border border-white/5">
                                <Calendar className="w-4 h-4" />
                                <span>Joined {user.created_at}</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass rounded-3xl p-8 bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20">
                        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Badges</h3>
                        <div className="grid grid-cols-3 gap-3 text-center">
                            {[1, 2, 3].map((b) => (
                                <div key={b} className="flex flex-col items-center">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-1 group hover:bg-yellow-500/20 transition-all cursor-pointer">
                                        <Award className="w-6 h-6 text-muted-foreground group-hover:text-yellow-500" />
                                    </div>
                                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter">Level {b}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Stats & Activity */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: "Solved", value: profileData.stats.solved, icon: CheckCircle2, color: "text-emerald-400" },
                            { label: "Global Rank", value: `#${profileData.stats.rank}`, icon: Trophy, color: "text-yellow-400" },
                            { label: "Total XP", value: profileData.stats.xp, icon: Star, color: "text-indigo-400" },
                            { label: "Streak", value: `${profileData.stats.streak}d`, icon: Activity, color: "text-rose-400" }
                        ].map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                                <div key={i} className="glass rounded-2xl p-6 flex flex-col items-center justify-center space-y-2 group hover:translate-y-[-4px] transition-all">
                                    <div className={clsx("p-2 rounded-lg bg-white/5", stat.color)}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-2xl font-black text-white">{stat.value}</span>
                                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{stat.label}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="glass rounded-3xl p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-white">Recent Activity</h3>
                            <button className="text-xs font-bold text-primary hover:underline">View All</button>
                        </div>

                        <div className="space-y-4">
                            {profileData.recentSubmissions.map((sub) => (
                                <div key={sub.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-all group">
                                    <div className="flex items-center space-x-4">
                                        <div className={clsx(
                                            "w-10 h-10 rounded-lg flex items-center justify-center",
                                            sub.status === "accepted" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                                        )}>
                                            {sub.status === "accepted" ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">{sub.problem}</h4>
                                            <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                                                <Clock className="w-3 h-3" />
                                                <span>{sub.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={clsx(
                                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                        sub.status === "accepted" ? "text-emerald-400 bg-emerald-400/5" : "text-rose-400 bg-rose-400/5"
                                    )}>
                                        {sub.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Activity Heatmap Mockup */}
                    <div className="glass rounded-3xl p-8">
                        <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest">Yearly Activity</h3>
                        <div className="flex flex-wrap gap-1">
                            {Array.from({ length: 52 }).map((_, i) => (
                                <div key={i} className="w-3 h-3 rounded-sm bg-white/5 hover:bg-primary transition-colors cursor-pointer" />
                            ))}
                            {Array.from({ length: 50 }).map((_, i) => (
                                <div key={i} className="w-3 h-3 rounded-sm bg-primary/20" />
                            ))}
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div key={i} className="w-3 h-3 rounded-sm bg-primary/50" />
                            ))}
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="w-3 h-3 rounded-sm bg-primary" />
                            ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-4 italic text-right">Commit consistency is key to mastery.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function XCircle(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
        </svg>
    );
}
