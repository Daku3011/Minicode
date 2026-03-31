"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Terminal, Search, Flame, LogIn, LogOut, Medal, Code2, Calendar, Trophy } from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    if (pathname === "/login") {
        return null;
    }

    const handleLogin = () => {
        router.push("/login");
    };

    return (
        <header className="sticky top-0 z-50 glass-card border-b border-white/10 px-4 md:px-8 py-3 bg-background-dark/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link href={user ? (user.role === 'admin' ? '/admin/users' : user.role === 'faculty' ? '/faculty/dashboard' : '/problems') : "/"} className="flex items-center gap-3">
                    <div className="bg-primary p-2 rounded-lg">
                        <Terminal className="text-white w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-extrabold tracking-tight text-white hidden sm:block">MiniCode</h2>
                </Link>

                {user && (
                    <nav className="hidden md:flex items-center gap-1 ml-8">
                        <Link 
                            href="/problems" 
                            className={clsx(
                                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                pathname.startsWith("/problems") 
                                    ? "bg-primary/20 text-primary" 
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Code2 className="w-4 h-4" />
                            <span>Problems</span>
                        </Link>
                        <Link 
                            href="/events" 
                            className={clsx(
                                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                pathname.startsWith("/events") 
                                    ? "bg-primary/20 text-primary" 
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Calendar className="w-4 h-4" />
                            <span>Events</span>
                        </Link>
                        <Link 
                            href="/leaderboard" 
                            className={clsx(
                                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                pathname === "/leaderboard" 
                                    ? "bg-primary/20 text-primary" 
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Trophy className="w-4 h-4" />
                            <span>Leaderboard</span>
                        </Link>
                    </nav>
                )}

                <div className="flex items-center gap-4">
                    {!loading && user ? (
                        <>
                            {user.role === "student" && (
                                <>
                                    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-primary/20 border border-primary/30 rounded-full">
                                        <Medal className="text-primary w-4 h-4" />
                                        <span className="text-xs font-bold text-primary uppercase tracking-wider">Level 3: Code Ninja</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full">
                                        <Flame className="text-orange-500 w-4 h-4" />
                                        <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">3 Days</span>
                                    </div>
                                </>
                            )}
                            <div className="flex items-center gap-3 ml-2">
                                <Link 
                                    href={user.role === "faculty" || user.role === "admin" ? "/faculty/profile" : "/profile"} 
                                    className="h-10 w-10 rounded-full border-2 border-primary overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer"
                                >
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full bg-slate-800 flex items-center justify-center text-white font-bold">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </Link>
                                <button 
                                    onClick={logout}
                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </>
                    ) : !loading && !user ? (
                        <button
                            onClick={handleLogin}
                            className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-xl transition-all"
                        >
                            <LogIn className="w-4 h-4" />
                            <span>Login</span>
                        </button>
                    ) : (
                        <div className="w-32 h-10 bg-white/5 animate-pulse rounded-xl" />
                    )}
                </div>
            </div>
        </header>
    );
}
