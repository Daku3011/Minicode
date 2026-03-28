"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Terminal, LayoutDashboard, Code2, Users, User, LogOut, Flame, Bell, Trophy } from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
    const { user, logout, loading } = useAuth();
    const pathname = usePathname();

    if (pathname === "/login" || pathname?.startsWith("/auth")) {
        return null;
    }

    const navItems = [
        { label: "Home", icon: LayoutDashboard, href: user?.role === 'admin' ? '/admin/users' : user?.role === 'faculty' ? '/faculty/dashboard' : '/problems' },
        { label: "Arena", icon: Code2, href: "/problems" },
        { label: "Rankings", icon: Trophy, href: "/leaderboard" },
        { label: "Community", icon: Users, href: "#" },
        { label: "Profile", icon: User, href: "/profile" },
    ];

    return (
        <>
            {/* Top Navbar (Desktop & Mobile) */}
            <header className="sticky top-0 z-50 glass no-border-separation px-4 md:px-8 py-4 transition-all duration-300">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="liquid-gradient p-2 rounded-xl light-emission transition-transform group-hover:scale-105">
                            <Terminal className="text-primary-foreground w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tighter font-mono group-hover:text-primary transition-colors">
                            MINICODE<span className="text-primary-foreground/30 font-sans">.io</span>
                        </h2>
                    </Link>

                    <div className="flex items-center gap-3 md:gap-8">
                        {user && (
                            <div className="flex items-center gap-6">
                                <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 level-2 rounded-full light-emission">
                                    <Flame className="text-primary w-4 h-4" />
                                    <span className="text-xs font-mono font-bold text-primary tabular-nums">12 STREAK</span>
                                </div>
                                
                                <button className="p-2 text-foreground/60 hover:text-primary transition-all relative group">
                                    <Bell className="w-5 h-5 group-hover:animate-pulse" />
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full light-emission" />
                                </button>

                                <div className="flex items-center gap-3 level-2 pr-4 rounded-full light-emission group cursor-pointer hover:bg-primary/5 transition-colors">
                                    <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-primary/20 group-hover:border-primary/50 transition-all">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full liquid-gradient flex items-center justify-center text-primary-foreground text-xs font-bold">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium hidden md:block">{user.username}</span>
                                </div>

                                <button 
                                    onClick={logout}
                                    className="hidden md:flex items-center gap-2 text-sm text-foreground/40 hover:text-destructive transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        {!user && !loading && (
                            <Link 
                                href="/login"
                                className="px-6 py-2.5 liquid-gradient text-primary-foreground text-sm font-bold rounded-xl light-emission hover:scale-105 active:scale-95 transition-all shadow-atmospheric"
                            >
                                START CODING
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Bottom Navbar (Mobile Only) */}
            <nav className="fixed bottom-6 left-6 right-6 z-50 md:hidden glass no-border-separation rounded-2xl px-8 py-4 shadow-glass">
                <div className="flex items-center justify-between max-w-md mx-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                        return (
                            <Link 
                                key={item.label}
                                href={item.href}
                                className={clsx(
                                    "flex flex-col items-center gap-1 transition-all duration-300",
                                    isActive ? "text-primary scale-110" : "text-foreground/40 hover:text-foreground"
                                )}
                            >
                                <div className={clsx(
                                    "p-2 rounded-xl transition-all",
                                    isActive && "bg-primary/10 light-emission"
                                )}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
