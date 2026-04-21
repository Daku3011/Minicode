"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
// import { Terminal, Github, ArrowRight, Loader2, Shield, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";
import { Github, ArrowRight, Loader2, Shield, UserCircle2, Eye, EyeOff, Globe, BookOpen, Heart, Terminal, MessageSquare } from "lucide-react";
import { clsx } from "clsx";
import LoginSymbolBackground from "@/components/LoginSymbolBackground";
import { Logo } from "@/components/Logo";
import FeedbackModal from "@/components/FeedbackModal";
import { motion } from "framer-motion";

export default function LoginPage() {
    const { user, loading, login } = useAuth();
    const router = useRouter();

    const [isStaffMode, setIsStaffMode] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

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
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-white text-gray-900 overflow-hidden select-none">
            {/* Subtle Background Decoration */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-30%] right-[-10%] w-[700px] h-[700px] bg-violet-100 rounded-full blur-[120px] opacity-60" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-50 rounded-full blur-[100px] opacity-50" />
            </div>

            <main className="w-full max-w-[1400px] z-10 flex flex-col min-h-screen px-10 py-16">
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left Column: Branding */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-10">
                        <div className="flex flex-col items-center lg:items-start">
                            <div className="flex items-center gap-3 mb-8 group cursor-default">
                                <div className="h-px w-6 bg-primary group-hover:w-12 transition-all duration-500" />
                                <span className="text-[15px] text-transparent uppercase  bg-clip-text font-black group-hover:tracking-[0.1em] transition-all duration-500 bg-gradient-to-r from-white via-red-400/80 to-white">
                                    From the Students  &   For the Students
                                </span>
                            </div>

                            {/* Main Heading */}
                            <div className="space-y-3">
                                <h2 className="text-7xl md:text-[8rem] font-extrabold tracking-tighter leading-[0.85]">
                                    <span className="text-gray-900">Coding</span>
                                    <br className="hidden lg:block" />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-500 to-blue-500">
                                        Club
                                    </span>
                                </h2>
                            </div>

                            {/* Tagline */}
                            <p className="text-xl md:text-2xl text-gray-400 italic font-light mt-6 tracking-tight">
                                Every line you write, writes you.
                            </p>

                            {/* Co-Powered Badge */}
                            <div className="flex items-center gap-2 mt-10 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200">
                                <div className="px-3 py-1.5 rounded-lg bg-violet-600">
                                    <span className="text-[10px] text-white font-semibold tracking-wider uppercase">Co-Powered by</span>
                                </div>
                                <span className="text-base font-bold text-gray-700 tracking-tight">
                                    SCET Computer Dept
                                </span>
                            </div>
                        </div>

                        {/* Team Credits */}
                        <div className="flex flex-col items-center lg:items-start px-8 py-7 rounded-2xl bg-gray-50 border border-gray-200 relative group cursor-default hover:bg-gray-100 transition-all duration-300">
                            <span className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-2">Developed by</span>
                            <span className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight leading-snug">
                                Dwarkesh Ramani <span className="text-violet-600">&</span> Jenil Gajera
                            </span>
                        </div>

                        {/* Feedback Link */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsFeedbackOpen(true)}
                            className="mt-10 flex items-center gap-2 px-7 py-3 rounded-2xl bg-green-800/60 border border-primary/20 text-primary hover:bg-primary/20 transition-all group cursor-pointer"
                        >
                            <MessageSquare className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Have Feedback? Share it here</span>
                        </motion.button>
                    </div>

                    {/* Right Column: Auth Card */}
                    <div className="flex flex-col items-center w-full max-w-md mx-auto">
                        {/* Logo */}
                        <div className="flex flex-col items-center gap-4 mb-10">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-primary/40 blur-3xl group-hover:blur-[60px] transition-all duration-700" />
                                <div className="relative bg-[#05050a]/50 backdrop-blur-sm p-4 rounded-[2.5rem] shadow-l border-10 border-white/20 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                                    <Logo className="w-16 h-16" variant="gradient" />
                                </div>
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                                MiniCode
                            </h1>
                        </div>

                        {/* Auth Card */}
                        <div className="w-full bg-white border border-gray-200 rounded-2xl p-10 md:p-14 shadow-xl shadow-gray-100/80 relative overflow-hidden">
                            {/* Top accent line */}
                            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-violet-500 via-purple-500 to-blue-500" />

                            {!isStaffMode ? (
                                <div className="space-y-10">
                                    <div className="text-center space-y-2">
                                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Get Started</h2>
                                        <p className="text-gray-500 text-sm font-medium">Continue with your account</p>
                                    </div>

                                    <div className="space-y-4">
                                        {/* GitHub Button */}
                                        <button
                                            onClick={handleGithubLogin}
                                            className="group relative flex w-full items-center justify-center gap-6 rounded-[2rem] bg-white px-8 py-8 text-[#05050a] shadow-2xl shadow-white/5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300  cursor-pointer"
                                        >
                                            <Github className="w-5 h-5" />
                                            <span className="text-base font-semibold">Continue with GitHub</span>
                                            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                        </button>

                                        {/* Divider */}
                                        <div className="flex items-center gap-4 py-2">
                                            <div className="h-px flex-1 bg-gray-200" />
                                            <span className="text-xs font-medium text-gray-400">or</span>
                                            <div className="h-px flex-1 bg-gray-200" />
                                        </div>

                                        {/* Staff Login Button */}
                                        <button
                                            onClick={() => setIsStaffMode(true)}
                                            className="w-full py-7 rounded-[2rem] bg-white/[0.03] border border-white/10 text-slate-500 font-black cursor-pointer hover:border-primary/50 hover:bg-primary/5 hover:text-white transition-all duration-500 text-[11px] uppercase tracking-[0.5em] italic hover:border hover:border-white hover:underline underline-offset-4"
                                        >
                                            <Shield className="w-4 h-4" />
                                            Staff Login
                                        </button>
                                    </div>

                                    {/* Footer Links */}
                                    <div className="pt-6 flex flex-col items-center gap-4 border-t border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <Link href="/terms" className="text-xs text-gray-400 hover:text-violet-600 transition-colors hover:underline underline-offset-4">Terms of Service</Link>
                                            <div className="w-1 h-1 rounded-full bg-gray-300" />
                                            <Link href="/privacy" className="text-xs text-gray-400 hover:text-violet-600 transition-colors hover:underline underline-offset-4">Privacy Policy</Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleStaffLogin} className="space-y-7">
                                    <div className="text-center">
                                        <div className="inline-flex p-4 rounded-xl bg-violet-50 text-violet-600 mb-5 border border-violet-100">
                                            <Shield className="w-7 h-7" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Staff Login</h2>
                                        <p className="text-gray-500 mt-1.5 text-sm font-medium">Sign in with your credentials</p>
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
                                        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium text-center">
                                            {error}
                                        </div>
                                    )}

                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 ml-1">Username</label>
                                            <input
                                                type="text"
                                                required
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:bg-white transition-all placeholder:text-gray-400 text-sm font-medium"
                                                placeholder="Enter your username"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:bg-white transition-all placeholder:text-gray-400 pr-12 text-sm font-medium"
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="cursor-pointer absolute right-6 top-1/2 -translate-y-1/2 p-3 text-white/20 hover:text-white transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-1">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full py-3.5 bg-violet-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-violet-700 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 shadow-md shadow-violet-200"
                                        >
                                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                                <>
                                                    <span>Sign In</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setIsStaffMode(false)}
                                            className="w-full text-center text-sm text-gray-500 hover:text-violet-600 transition-colors font-medium hover:underline underline-offset-4"
                                        >
                                            ← Back to main login
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Footer copyright */}
                        <p className="text-xs text-gray-400 mt-6 text-center">
                            © {new Date().getFullYear()} Coding Club, SCET Computer Dept
                        </p>
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
                <FeedbackModal 
                    isOpen={isFeedbackOpen} 
                    onClose={() => setIsFeedbackOpen(false)} 
                />
            </main>
        </div>
    );
}
