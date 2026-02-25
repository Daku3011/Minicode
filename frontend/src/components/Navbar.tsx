"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Terminal, Trophy, User, LogIn, LayoutDashboard, Shield, LogOut } from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
    { name: "Problems", href: "/problems", icon: Terminal, roles: ["student", "faculty", "admin"] },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy, roles: ["student", "faculty", "admin"] },
    { name: "Faculty", href: "/faculty/dashboard", icon: LayoutDashboard, roles: ["faculty", "admin"] },
    { name: "Admin", href: "/admin/users", icon: Shield, roles: ["admin"] },
    { name: "Profile", href: "/profile", icon: User, roles: ["student", "faculty", "admin"] },
];

export default function Navbar() {
    const { user, logout, loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const handleLogin = () => {
        router.push("/login");
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <Terminal className="text-white w-5 h-5" />
                    </div>
                    <span className="font-bold text-xl tracking-tight gradient-text">MiniCode</span>
                </Link>

                <div className="hidden md:flex items-center space-x-1">
                    {!loading && user && navItems.filter(item => item.roles.includes(user.role)).map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    "flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200",
                                    isActive
                                        ? "bg-white/10 text-white"
                                        : "text-muted-foreground hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-sm font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>

                <div className="flex items-center space-x-4">
                    {!loading && user ? (
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-white hidden sm:block">@{user.username}</span>
                            {user.avatar_url && (
                                <img src={user.avatar_url} alt="avatar" className="w-8 h-8 rounded-full border border-white/10" />
                            )}
                            <button
                                onClick={logout}
                                className="flex items-center space-x-2 px-3 py-1.5 bg-white/5 hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 text-sm font-medium rounded-md transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : !loading && !user ? (
                        <button
                            onClick={handleLogin}
                            className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-md transition-all"
                        >
                            <LogIn className="w-4 h-4" />
                            <span>Login</span>
                        </button>
                    ) : (
                        <div className="w-20 h-8 bg-white/5 animate-pulse rounded-md" />
                    )}
                </div>
            </div>
        </nav>
    );
}
