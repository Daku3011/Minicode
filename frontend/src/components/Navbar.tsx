"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Code2, Calendar, Trophy, Bell, User } from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import NewsPanel from "@/components/NewsPanel";
import { Logo } from "@/components/Logo";

export default function Navbar() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const [unreadCount, setUnreadCount] = useState(0);
    const [showNews, setShowNews] = useState(false);

    const fetchUnreadCount = async () => {
        if (!user) return;
        try {
            const res = await api.get("/notifications/unread-count");
            setUnreadCount(res.data.unread_count);
        } catch (err) {
            console.error("Failed to fetch unread count:", err);
        }
    };

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('showNews') === 'true') {
            setShowNews(true);
        }
    }, []);

    useEffect(() => {
        if (!user) return;
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 60000);

        const handleClearNots = () => setUnreadCount(0);
        window.addEventListener('minicode:notificationsRead', handleClearNots);

        return () => {
            clearInterval(interval);
            window.removeEventListener('minicode:notificationsRead', handleClearNots);
        };
    }, [user]);

    const navItems = user?.role === 'faculty' || user?.role === 'admin'
        ? [
            { name: "Problems", href: "/faculty/problems", icon: Code2 },
            { name: "Events", href: "/faculty/events", icon: Calendar },
            { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
        ]
        : [
            { name: "Problems", href: "/problems", icon: Code2 },
            { name: "Events", href: "/events", icon: Calendar },
            { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
        ];

    useEffect(() => {
        const handleOpenNews = () => setShowNews(true);
        window.addEventListener('minicode:openNews', handleOpenNews);
        return () => window.removeEventListener('minicode:openNews', handleOpenNews);
    }, []);

    if (pathname === "/login") return null;

    return (
        <header className="sticky top-0 z-50 px-4 md:px-8 py-4">
            <div className="max-w-[1600px] mx-auto glass-card rounded-2xl h-16 flex items-center justify-between px-6 relative border-white/5">
                {/* Logo Section */}
                <Link 
                    href={user ? (user.role === 'admin' ? '/admin/users' : user.role === 'faculty' ? '/faculty/profile' : '/problems') : "/"} 
                    className="flex items-center gap-3 transition-opacity hover:opacity-80"
                >
                    <div className="bg-primary/5 p-1 rounded-xl shadow-lg shadow-primary/5 border border-white/5">
                        <Logo className="w-7 h-7" variant="gradient" />
                    </div>
                    <h2 className="text-xl font-black tracking-tighter text-white hidden sm:block uppercase">
                        MINICODE
                    </h2>
                </Link>

                {/* Navigation Links */}
                {user && (
                    <nav className="hidden xl:flex items-center gap-1 bg-white/[0.02] p-1 rounded-xl border border-white/5">
                        {navItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link 
                                    key={item.name}
                                    href={item.href} 
                                    className={clsx(
                                        "relative flex items-center gap-2 px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                        isActive 
                                            ? "text-white bg-white/10" 
                                            : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]"
                                    )}
                                >
                                    <item.icon className="w-3.5 h-3.5" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                )}

                {/* Profile & Actions */}
                <div className="flex items-center gap-3">
                    {!loading && user ? (
                        <>
                            <button 
                                onClick={() => setShowNews(true)}
                                className="p-2.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all relative border border-transparent hover:border-white/10"
                                title="Notifications"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-[#0a0a0f]">
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                            </button>

                            <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />

                            <Link 
                                href={user.role === "faculty" || user.role === "admin" ? "/faculty/profile" : "/profile"} 
                                className="h-10 w-10 rounded-xl border border-white/10 p-0.5 hover:border-primary/50 transition-all bg-white/5 hidden sm:block overflow-hidden"
                            >
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt="Profile" className="h-full w-full object-cover rounded-[0.6rem]" />
                                ) : (
                                    <div className="h-full w-full bg-slate-800 flex items-center justify-center text-white rounded-[0.6rem]">
                                        <User className="w-5 h-5" />
                                    </div>
                                )}
                            </Link>
                            
                            <button 
                                onClick={logout}
                                className="p-2.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </>
                    ) : !loading && !user ? (
                        <Link
                            href="/login"
                            className="bg-primary text-white hover:bg-primary/90 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20"
                        >
                            Log In
                        </Link>
                    ) : (
                        <div className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl" />
                    )}
                </div>
            </div>
            
            <NewsPanel 
                isOpen={showNews} 
                onClose={() => setShowNews(false)} 
            />
        </header>
    );
}
