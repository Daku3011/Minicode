"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Github, ArrowRight, Loader2, Shield, UserCircle2, Eye, EyeOff, Globe, BookOpen, Heart } from "lucide-react";
import api from "@/lib/api";
import { clsx } from "clsx";
import LoginSymbolBackground from "@/components/LoginSymbolBackground";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
    const { user, loading, login } = useAuth();
    const router = useRouter();

    const [isStaffMode, setIsStaffMode] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            if (user.role === "admin") router.push("/admin/users");
            else if (user.role === "faculty") router.push("/faculty/profile");
            else router.push("/problems");
        }
    }, [user, loading, router]);

    const handleGithubLogin = () => {
        const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo,user,user:email`;
    };

    const handleGoogleLogin = () => {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        const redirectUri = typeof window !== "undefined" ? `${window.location.origin}/auth/google/callback` : "";
        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`;
    };

    const handleStaffLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            const formData = new URLSearchParams();
            formData.append("username", username);
            formData.append("password", password);

            const response = await api.post("/auth/login", formData, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            });

            await login(response.data.access_token);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Invalid login credentials.");
            setSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#05050a] text-white font-black overflow-hidden select-none">
            {/* Interactive Background */}
            <LoginSymbolBackground />

            {/* Background Aesthetics */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.03] mix-blend-overlay" />
                <div className="absolute top-1/4 -left-20 w-[60rem] h-[60rem] bg-primary/10 rounded-full blur-[180px] animate-pulse" />
                <div className="absolute bottom-1/4 -right-20 w-[60rem] h-[60rem] bg-secondary/10 rounded-full blur-[200px] animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5 opacity-50" />
            </div>

            <main className="w-full max-w-[90rem] z-10 flex flex-col min-h-screen pt-12 scale-[0.9] origin-top">
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    {/* Left Column: Branding */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-12">
                        <div className="flex flex-col items-center lg:items-start">
                            <div className="flex items-center gap-3 mb-8 group cursor-default">
                                <div className="h-px w-6 bg-primary group-hover:w-12 transition-all duration-500" />
                                <span className="text-[15px] text-primary uppercase font-black group-hover:tracking-[0.1em] transition-all duration-500">
                                    For the Students  &   From the Studetns
                                </span>
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-8xl md:text-[10rem] font-black text-white tracking-tighter leading-[0.81] drop-shadow-2xl">
                                    Coding <br className="hidden lg:block" />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-purple-400/40 italic pr-6">Club</span>
                                </h2>
                            </div>
                            <div className="flex items-center gap-1 mt-12 bg-white/[0.03] p-2 pr-6 rounded-xl border border-white/5 backdrop-blur-sm">
                                <div className="px-4 py-3 rounded-xl bg-primary shadow-lg shadow-primary/20">
                                    <span className="text-[9px] text-white uppercase tracking-[0.2em]">Co-Powered by</span>
                                </div>
                                <span className="text-xl font-black text-slate-300 uppercase tracking-tighter italic">
                                    SCET COMPUTER DEPT
                                </span>
                            </div>
                        </div>

                        {/* Team Credits */}
                        <div className="flex flex-col items-center lg:items-start p-10 lg:px-14 rounded-[3rem] bg-white/[0.03] border border-white/10 relative group cursor-default hover:bg-white/[0.05] transition-all duration-500 backdrop-blur-md">
                            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                                {/* <Shield className="w-6 h-6 text-primary" /> */}
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.8em] mb-4">Devloped by</span>
                            <span className="text-4xl font-black text-white tracking-tighter italic leading-none">
                                Dwarkesh Ramani <span className="text-primary">&</span> Jenil Gajera
                            </span>
                        </div>
                    </div>

                    {/* Right Column: Auth Card */}
                    <div className="flex flex-col items-center w-full max-w-xl mx-auto">
                        <div className="flex flex-col items-center gap-6 mb-12">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-primary/40 blur-3xl group-hover:blur-[60px] transition-all duration-700" />
                                <div className="relative bg-[#05050a]/50 backdrop-blur-sm p-4 rounded-[2.5rem] shadow-l border-10 border-white/20 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                                    <Logo className="w-16 h-16" variant="gradient" />
                                </div>
                            </div>
                            <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic mt-4">
                                Minicode
                            </h1>
                        </div>

                        <div className="w-full bg-white/[0.02] border border-white/10 rounded-[4.5rem] p-10 md:p-16 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden backdrop-blur-2xl">
                            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                            {!isStaffMode ? (
                                <div className="space-y-12">
                                    <div className="text-center space-y-4">
                                        <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">Get Started</h2>
                                        <p className="text-slate-500 text-sm font-black uppercase tracking-widest opacity-60">Continue with your account</p>
                                    </div>

                                    <div className="space-y-5">
                                        <button
                                            onClick={handleGithubLogin}
                                            className="group relative flex w-full items-center justify-center gap-6 rounded-[2rem] bg-white px-8 py-8 text-[#05050a] shadow-2xl shadow-white/5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                                        >
                                            <div className="absolute inset-0 bg-primary/10 rounded-[2rem] scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500" />
                                            <Github className="w-10 h-10 relative z-10" />
                                            <span className="text-2xl font-black uppercase tracking-tighter relative z-10">Authorize GitHub</span>
                                            <ArrowRight className="w-8 h-8 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
                                        </button>

                                        <div className="flex items-center gap-6 text-slate-800 py-6">
                                            <div className="h-[1px] flex-1 bg-white/10" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.6em] whitespace-nowrap">Access Protocols</span>
                                            <div className="h-[1px] flex-1 bg-white/10" />
                                        </div>

                                        <button
                                            onClick={() => setIsStaffMode(true)}
                                            className="w-full py-7 rounded-[2rem] bg-white/[0.03] border border-white/10 text-slate-500 font-black cursor-pointer hover:border-primary/50 hover:bg-primary/5 hover:text-white transition-all duration-500 text-[11px] uppercase tracking-[0.5em] italic"
                                        >
                                            Faculty Authentication
                                        </button>
                                    </div>

                                    <div className="pt-12 flex flex-col items-center gap-8 border-t border-white/10">
                                        <div className="flex items-center gap-6">
                                            <Link href="/terms" className="text-[10px] font-black text-white/40 overflow-hidden hover:text-white transition-colors tracking-[0.4em] uppercase hover:underline underline-offset-4 cursor-pointer">Terms</Link>
                                            <div className="w-1 h-1 rounded-full bg-white/20" />
                                            <Link href="/privacy" className="text-[10px] font-black text-white/40 overflow-hidden hover:text-white transition-colors tracking-[0.4em] uppercase hover:underline underline-offset-4 cursor-pointer">Privacy</Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleStaffLogin} className="space-y-10">
                                    <div className="text-center">
                                        <div className="inline-flex p-6 rounded-3xl bg-primary/20 text-primary mb-8 border border-primary/30 shadow-lg shadow-primary/20">
                                            <Shield className="w-10 h-10" />
                                        </div>
                                        <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Control Room</h2>
                                        {/* <p className="text-slate-500 mt-3 text-xs font-black uppercase tracking-[0.4em]">Elevated clearance required.</p> */}
                                    </div>
                                    
                                    <div className="space-y-4 mb-2 mt-4">
                                        <button
                                            type="button"
                                            onClick={handleGoogleLogin}
                                            className="group relative flex w-full items-center justify-center gap-6 rounded-[2rem] bg-white px-8 py-6 text-[#05050a] shadow-2xl shadow-white/5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                                        >
                                            <div className="absolute inset-0 bg-primary/10 rounded-[2rem] scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500" />
                                            {/* Minimal Google SVG Icon */}
                                            <svg className="w-8 h-8 relative z-10" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"/>
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor"/>
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"/>
                                            </svg>
                                            <span className="text-[1.2rem] font-black uppercase tracking-tighter relative z-10">Sign in with Google</span>
                                        </button>

                                        <div className="flex items-center gap-6 text-slate-800 py-4">
                                            <div className="h-[1px] flex-1 bg-white/10" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.6em] whitespace-nowrap">Or use credentials</span>
                                            <div className="h-[1px] flex-1 bg-white/10" />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] font-black text-center tracking-widest uppercase animate-shake">
                                            Unauthorized: {error}
                                        </div>
                                    )}

                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 ml-4">Identity Signature</label>
                                            <input
                                                type="text"
                                                required
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-6 text-white focus:outline-none focus:border-primary focus:bg-white/[0.05] transition-all placeholder:text-white/10 font-black tracking-tight text-xl"
                                                placeholder="Faculty ID"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 ml-4">Security Key</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-6 text-white focus:outline-none focus:border-primary focus:bg-white/[0.05] transition-all placeholder:text-white/10 font-black tracking-tight pr-20 text-xl"
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-6 top-1/2 -translate-y-1/2 p-3 text-white/20 hover:text-white transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-7 h-7 text-gray-400" /> : <Eye className="w-7 h-7 text-gray-400" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-3">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="group relative w-full h-24 bg-primary text-white rounded-[2.25rem] text-2xl font-black uppercase tracking-tighter italic flex items-center justify-center gap-4 border-2 border-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 overflow-hidden shadow-2xl shadow-primary/20"
                                        >
                                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                                            {submitting ? <Loader2 className="w-10 h-10 animate-spin" /> : (
                                                <>
                                                    <span className="relative z-10">Decrypt Access</span>
                                                    <ArrowRight className="w-9 h-9 relative z-10 group-hover:translate-x-2 transition-transform" />
                                                </>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setIsStaffMode(false)}
                                            className="w-full text-center text-[10px] font-black text-slate-600 hover:text-white transition-colors uppercase tracking-[0.6em] underline underline-offset-4"
                                        >
                                            Return to Origin
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* Global Footer Links */}
                {/* <footer className="mt-auto py-12 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-white/5 opacity-40 hover:opacity-100 transition-opacity duration-700">
                    <div className="flex items-center gap-8">
                        <a href="https://scet.ac.in" target="_blank" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] hover:text-primary transition-colors">
                            <Globe className="w-4 h-4" />
                            SCET Official
                        </a>
                        <a href="https://github.com/Daku3011/Minicode" target="_blank" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] hover:text-primary transition-colors">
                            <Github className="w-4 h-4" />
                            Repository
                        </a>
                        <a href="#" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] hover:text-primary transition-colors">
                            <BookOpen className="w-4 h-4" />
                            Docs
                        </a>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">
                        Crafted with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> by SCET Dev Team
                    </div>
                </footer> */}
            </main>
        </div>
    );
}

