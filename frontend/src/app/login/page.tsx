"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Terminal, Github, ArrowRight, Loader2, Code2, Zap, Users } from "lucide-react";
import api from "@/lib/api";

export default function LoginPage() {
    const { user, loading, login } = useAuth();
    const router = useRouter();

    const [isStaffMode, setIsStaffMode] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            if (user.role === "admin") router.push("/admin/users");
            else if (user.role === "faculty") router.push("/faculty/dashboard");
            else router.push("/problems");
        }
    }, [user, loading, router]);

    const handleGithubLogin = () => {
        const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
        const redirectUri = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI || `${window.location.origin}/auth/github/callback`;
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo,user,user:email&redirect_uri=${encodeURIComponent(redirectUri)}`;
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
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center level-0 text-foreground antialiased overflow-hidden selection:bg-primary/30">
            {/* Cinematic Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[160px] rounded-full pointer-events-none animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent/5 blur-[160px] rounded-full pointer-events-none animate-pulse" />

            <div className="relative z-10 w-full max-w-2xl px-6 py-12 flex flex-col items-center">
                {/* Branding: Technical Switch */}
                <div className="flex items-center gap-4 mb-20 animate-in fade-in slide-in-from-top-8 duration-1000">
                    <div className="liquid-gradient p-3 rounded-2xl light-emission">
                        <Terminal className="text-primary-foreground w-7 h-7" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tighter font-mono italic">
                        MINICODE<span className="text-primary/40 font-sans">.io</span>
                    </h2>
                </div>

                {/* Hero: Editorial Scale */}
                <div className="text-center space-y-6 mb-20 animate-in fade-in slide-in-from-top-12 duration-1000 delay-200">
                    <h1 className="text-6xl md:text-8xl font-black tracking-tightest leading-[0.85] uppercase">
                        Master the <br />
                        <span className="text-primary italic">Logic.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-foreground/40 font-medium tracking-tight font-mono uppercase">
                        High-Fidelity Code Execution & AI Feedback
                    </p>
                </div>

                {/* Login Card: Glassmorphism & Tonal Layering */}
                <div className="w-full max-w-sm glass rounded-[2.5rem] p-10 shadow-glass animate-in fade-in zoom-in-95 duration-1000 delay-300">
                    <div className="space-y-8">
                        {!isStaffMode ? (
                            <>
                                <button 
                                    onClick={handleGithubLogin}
                                    className="liquid-gradient w-full flex items-center justify-center gap-4 rounded-2xl px-6 py-5 text-primary-foreground font-bold text-lg light-emission hover:scale-[1.02] active:scale-95 transition-all shadow-atmospheric group"
                                >
                                    <Github className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                                    <span>Continue with GitHub</span>
                                </button>

                                <div className="relative flex items-center justify-center py-2">
                                    <div className="w-full h-px bg-white/5" />
                                    <span className="absolute bg-muted/50 px-4 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider text-foreground/30">
                                        System Protocol
                                    </span>
                                </div>

                                <button 
                                    onClick={() => setIsStaffMode(true)}
                                    className="level-2 w-full flex items-center justify-center gap-3 rounded-2xl px-6 py-4 text-foreground/80 font-bold hover:bg-primary/5 hover:text-primary transition-all group"
                                >
                                    <Users className="w-5 h-5 text-primary/60 group-hover:text-primary" />
                                    <span>Staff & Admin Portal</span>
                                </button>

                                {/* Active Pulse */}
                                <div className="pt-4 flex flex-col items-center gap-4">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="h-10 w-10 md:h-12 md:w-12 rounded-full ring-4 ring-background level-2 overflow-hidden">
                                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="" />
                                            </div>
                                        ))}
                                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full ring-4 ring-background liquid-gradient flex items-center justify-center text-[10px] md:text-xs font-bold text-primary-foreground">
                                            +2K
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.3em]">
                                        Pulse: Stable Execution
                                    </p>
                                </div>
                            </>
                        ) : (
                            <form onSubmit={handleStaffLogin} className="space-y-6">
                                <div className="text-center mb-4">
                                    <h2 className="text-xl font-bold font-mono">STAFF_ACCESS</h2>
                                    <p className="text-xs text-foreground/40 uppercase tracking-widest font-medium">Verify Identity</p>
                                </div>
                                {error && (
                                    <div className="p-4 rounded-xl level-2 border-l-4 border-destructive text-destructive text-[10px] font-bold uppercase tracking-wider animate-in fade-in bounce-in duration-300">
                                        Error: {error}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-foreground/20 ml-2">Username</label>
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full level-1 rounded-2xl px-6 py-4 text-foreground placeholder:text-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                                        placeholder="admin_id"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-foreground/20 ml-2">Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full level-1 rounded-2xl px-6 py-4 text-foreground placeholder:text-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="liquid-gradient w-full flex items-center justify-center space-x-2 py-5 rounded-2xl text-primary-foreground font-bold light-emission hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <>
                                            <span className="uppercase tracking-widest">Execute Login</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                                <div className="text-center pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsStaffMode(false)}
                                        className="text-[10px] font-mono font-bold text-foreground/30 hover:text-primary transition-colors uppercase tracking-[0.2em]"
                                    >
                                        ← Protocol: Student
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Footer Legal */}
                <div className="mt-20 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                    <div className="flex items-center justify-center gap-6 mb-8 text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-foreground/20">
                        <a href="#" className="hover:text-primary transition-colors">Legal</a>
                        <span className="w-1 h-1 bg-white/10 rounded-full" />
                        <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                        <span className="w-1 h-1 bg-white/10 rounded-full" />
                        <a href="#" className="hover:text-primary transition-colors">Security</a>
                    </div>
                    <div className="inline-flex items-center gap-3 px-4 py-2 level-1 rounded-full text-[10px] font-mono font-bold text-foreground/40 uppercase tracking-widest shadow-atmospheric">
                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        Minicode Core v4.5.1_ALCHEMIST
                    </div>
                </div>
            </div>
        </div>
    );
}
