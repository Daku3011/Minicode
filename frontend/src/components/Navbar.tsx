"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Terminal, LogIn, LogOut, Code2, Calendar, Trophy, Bell, User } from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import api from "@/lib/api";

import MagneticWrapper from "@/components/MagneticWrapper";
import NewsPanel from "@/components/NewsPanel";

export default function Navbar() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    if (pathname === "/login") {
        return null;
    }

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
            { name: "Problem Registry", href: "/faculty/problems", icon: Code2 },
            { name: "Event Manager", href: "/faculty/events", icon: Calendar },
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

    return (
        <header className="sticky top-4 z-50 px-4 md:px-8">
            <div className="max-w-7xl mx-auto glass-card rounded-[2rem] h-20 flex items-center justify-between px-8 relative overflow-hidden group/nav">
                {/* Visual Accent: Top Reflective Highlight */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                
                {/* Logo Section */}
                <Link 
                    href={user ? (user.role === 'admin' ? '/admin/users' : user.role === 'faculty' ? '/faculty/profile' : '/problems') : "/"} 
                    className="flex items-center gap-4 group"
                >
                    <MagneticWrapper>
                        <motion.div 
                            whileHover={{ rotate: 15, scale: 1.1 }}
                            className="bg-primary p-2.5 rounded-2xl shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300 ring-1 ring-white/20"
                        >
                            <Terminal className="text-white w-6 h-6" />
                        </motion.div>
                    </MagneticWrapper>
                    <h2 className="text-2xl font-black tracking-tighter text-white hidden sm:block bg-clip-text text-transparent bg-gradient-to-br from-white via-white/90 to-white/60">
                        MINICODE
                    </h2>
                </Link>

                {/* Navigation Links */}
                {user && (
                    <nav className="hidden xl:flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5 mx-4">
                        {navItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link 
                                    key={item.name}
                                    href={item.href} 
                                    className={clsx(
                                        "relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300",
                                        isActive ? "text-white" : "text-slate-400 hover:text-white"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div 
                                            layoutId="nav-pill"
                                            className="absolute inset-0 bg-primary/20 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-primary/20"
                                            transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                                        />
                                    )}
                                    <item.icon className={clsx("w-4 h-4 transition-transform duration-300", isActive && "scale-110")} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                )}

                {/* Profile & Actions */}
                <div className="flex items-center gap-2 md:gap-4">
                    {!loading && user ? (
                        <>
                            <MagneticWrapper>
                                <button 
                                    onClick={() => setShowNews(true)}
                                    className="p-3 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-2xl transition-all relative group flex items-center justify-center border border-transparent hover:border-primary/20 bg-white/5"
                                    title="Notifications & Broadcasts"
                                >
                                    <Bell className="w-5.5 h-5.5 transition-transform group-hover:scale-110" />
                                    <AnimatePresence>
                                        {unreadCount > 0 && (
                                            <motion.span 
                                                initial={{ scale: 0, y: 5 }}
                                                animate={{ scale: 1, y: 0 }}
                                                exit={{ scale: 0, y: 5 }}
                                                className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#0a0a0f] shadow-lg shadow-rose-500/40 z-[20]"
                                            >
                                                {unreadCount > 9 ? "9+" : unreadCount}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </button>
                            </MagneticWrapper>

                            <div className="h-8 w-px bg-white/10 mx-1 hidden sm:block" />

                            <div className="flex items-center gap-2 md:gap-3">
                                <MagneticWrapper>
                                    <Link 
                                        href={user.role === "faculty" || user.role === "admin" ? "/faculty/profile" : "/profile"} 
                                        className="relative h-11 w-11 rounded-2xl border border-white/10 p-0.5 hover:border-primary/50 transition-all duration-300 group overflow-hidden bg-white/5 shadow-inner hidden sm:block"
                                    >
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt="Profile" className="h-full w-full object-cover rounded-2xl" />
                                        ) : (
                                            <div className="h-full w-full bg-slate-800 flex items-center justify-center text-white rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900">
                                                <User className="w-6 h-6" />
                                            </div>
                                        )}
                                        {/* Avatar Hover Overlay */}
                                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <User className="text-white w-4 h-4" />
                                        </div>
                                    </Link>
                                </MagneticWrapper>
                                
                                <MagneticWrapper>
                                    <motion.button 
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={logout}
                                        className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all border border-transparent hover:border-rose-500/20 shadow-sm bg-white/5 sm:bg-transparent"
                                        title="Logout"
                                    >
                                        <LogOut className="w-5.5 h-5.5" />
                                    </motion.button>
                                </MagneticWrapper>
                            </div>
                        </>
                    ) : !loading && !user ? (
                        // <MagneticWrapper>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => router.push("/login")}
                                className="premium-btn py-3 group"
                            >
                                <LogIn className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                                <span>Sign In</span>
                            </motion.button>
                        // </MagneticWrapper>
                    ) : (
                        <div className="w-11 h-11 bg-white/10 animate-pulse rounded-2xl border border-white/5" />
                    )}
                </div>
            </div>
            
            {/* Global News Panel */}
            <NewsPanel 
                isOpen={showNews} 
                onClose={() => setShowNews(false)} 
            />
        </header>
    );
}
