"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Code2, Calendar, Trophy, Bell, User, HelpCircle, Sparkles } from "lucide-react";
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
            { name: "Cohorts", href: "/faculty/cohorts", icon: User },
            { name: "Problems", href: "/faculty/problems", icon: Code2 },
            { name: "Events", href: "/faculty/events", icon: Calendar },
            { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
            { name: "Hackathons", href: "/hackathons", icon: Sparkles },
        ]
        : user?.role === 'alumni'
        ? [
            { name: "Alumni", href: "/alumni", icon: User },
            { name: "Cohorts", href: "/cohorts", icon: User },
            { name: "Problems", href: "/problems", icon: Code2 },
            { name: "Events", href: "/events", icon: Calendar },
            { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
            { name: "Hackathons", href: "/hackathons", icon: Sparkles },
        ]
        : [
            { name: "Cohorts", href: "/cohorts", icon: User },
            { name: "Problems", href: "/problems", icon: Code2 },
            { name: "Events", href: "/events", icon: Calendar },
            { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
            { name: "Hackathons", href: "/hackathons", icon: Sparkles },
            { name: "Alumni", href: "/alumni/profiles", icon: User },
        ];


    useEffect(() => {
        const handleOpenNews = () => setShowNews(true);
        window.addEventListener('minicode:openNews', handleOpenNews);
        return () => window.removeEventListener('minicode:openNews', handleOpenNews);
    }, []);

    if (pathname === "/login" || pathname === "/faq") return null;

    return (
        <header className="sticky top-0 z-50 px-4 md:px-8 py-3">
            <div className="max-w-[1600px] mx-auto bg-white rounded-2xl h-16 flex items-center justify-between px-6 relative border border-gray-200 shadow-sm">
                {/* Logo Section */}
                <Link 
                    href={user ? (user.role === 'admin' ? '/admin/users' : user.role === 'faculty' ? '/faculty/profile' : '/problems') : "/"} 
                    className="flex items-center gap-3 transition-opacity hover:opacity-80"
                >
                    <div className="bg-primary/5 p-1 rounded-xl shadow-lg shadow-primary/5 border border-white/5">
                        <Logo className="w-7 h-7" variant="gradient" />
                    </div>
                    <h2 className="text-xl font-extrabold tracking-tight text-gray-900 hidden sm:block">
                        MiniCode
                    </h2>
                </Link>

                {/* Navigation Links */}
                {user && (
                    <nav className="hidden lg:flex items-center gap-1 bg-white/[0.02] p-1 rounded-xl border border-white/5">
                        {navItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link 
                                    key={item.name}
                                    href={item.href} 
                                    className={clsx(
                                        "relative flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all",
                                        isActive 
                                            ? "text-white bg-blue-600 shadow-sm" 
                                            : "text-slate-500 hover:text-slate-900 hover:bg-blue-50"
                                    )}
                                >
                                    <item.icon className="w-4 h-4" />
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
                                className="p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all relative"
                                title="Notifications"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                            </button>

                            <Link 
                                href="/faq"
                                className="p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                                title="Help"
                            >
                                <HelpCircle className="w-5 h-5" />
                            </Link>

                            <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block" />

                            <Link 
                                href={user.role === "faculty" || user.role === "admin" ? "/faculty/profile" : "/profile"} 
                                className="h-10 w-10 rounded-xl border border-gray-200 p-0.5 hover:border-blue-400 transition-all bg-gray-50 hidden sm:block overflow-hidden"
                            >
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt="Profile" className="h-full w-full object-cover rounded-[0.6rem]" referrerPolicy="no-referrer" />
                                ) : (
                                    <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-500 rounded-[0.6rem]">
                                        <User className="w-5 h-5" />
                                    </div>
                                )}
                            </Link>
                            
                            <button 
                                onClick={logout}
                                className="p-2.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </>
                    ) : !loading && !user ? (
                        <>
                            <Link
                                href="/faq"
                                className="p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                                title="Help"
                            >
                                <HelpCircle className="w-5 h-5" />
                            </Link>
                            <Link
                                href="/login"
                                className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-200"
                            >
                                Log In
                            </Link>
                        </>
                    ) : (
                        <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-xl" />
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
