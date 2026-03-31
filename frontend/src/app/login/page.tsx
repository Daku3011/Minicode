"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Terminal, Github, ArrowRight, Loader2, Code2, Zap } from "lucide-react";
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
            else if (user.role === "faculty") router.push("/faculty/profile");
            else router.push("/problems");
        }
    }, [user, loading, router]);

    const handleGithubLogin = () => {
        const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo,user,user:email`;
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
        <div className="relative flex min-h-screen w-full flex-col lg:flex-row bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased overflow-hidden">
            {/* Left Side: Visual/Branding */}
            <div className="relative hidden lg:flex w-1/2 flex-col justify-between p-12 mesh-gradient overflow-hidden">
                {/* Abstract Mesh Visual (Decorative) */}
                <div 
                    className="absolute inset-0 opacity-30" 
                    style={{
                        backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBsVUwlEMkNKH5AFqHy3-hQsdxt0vQgawSc44X1zb4yxWyL-8Amz-i6qbVGnPF2HaslNrWvPpvlmAFCtXxbVi-1uZtvRd32wdFLNFrXCd1F4xfoT1-nw2UekKcWrBrTzsHBqoPVrlecP6bv-uZv8KFYGzfrxck3hnBPDIOe3kYcpZiZvqpWbDGAeXd59K3jqQreXIylldg8TtQGgaB5mMAlnU_azawKg61LyRtRSFJbhingmHoJpZmrxYuhk6XWCPWw7i7z5klk5knd')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
                
                <div className="relative z-10 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
                        <Terminal className="text-white w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">MiniCode</h2>
                </div>

                <div className="relative z-10 space-y-6">
                    <h1 className="text-6xl font-black leading-tight tracking-tighter text-white">
                        Master your skills.<br />
                        <span className="text-primary">Real repos.</span><br />
                        AI Feedback.
                    </h1>
                    <p className="max-w-md text-lg text-slate-400">
                        Step into a production-ready environment. Solve real engineering challenges with the guidance of advanced AI.
                    </p>

                    <div className="flex gap-8 pt-8 border-t border-slate-800">
                        <div>
                            <div className="text-2xl font-bold text-white">500+</div>
                            <div className="text-sm text-slate-500 uppercase tracking-widest">Active Repos</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">10k+</div>
                            <div className="text-sm text-slate-500 uppercase tracking-widest">Developers</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">99%</div>
                            <div className="text-sm text-slate-500 uppercase tracking-widest">AI Accuracy</div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-sm text-slate-500">
                    © 2026 MiniCode Labs. All rights reserved.
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex flex-1 items-center justify-center p-6 sm:p-12 lg:w-1/2 bg-background-light dark:bg-background-dark">
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile Header */}
                    <div className="lg:hidden flex flex-col items-center gap-4 mb-12">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
                            <Terminal className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">MiniCode</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">Master your skills. Real repos. AI Feedback.</p>
                        </div>
                    </div>

                    {/* Glassmorphic Card */}
                    <div className="glass-card rounded-2xl p-8 shadow-2xl dark:shadow-primary/5">
                        <div className="mb-8 text-center lg:text-left">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">
                                {isStaffMode ? "Sign in to your staff portal" : "Sign in to continue your journey"}
                            </p>
                        </div>

                        <div className="space-y-4">
                            {!isStaffMode ? (
                                <>
                                    <button 
                                        onClick={handleGithubLogin}
                                        className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-slate-900 dark:bg-white px-5 py-4 text-white dark:text-slate-900 transition-transform active:scale-95"
                                    >
                                        <Github className="w-6 h-6" />
                                        <span className="text-base font-bold">Continue with GitHub</span>
                                    </button>

                                    <div className="relative py-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="bg-background-light dark:bg-transparent px-2 text-slate-500">Staff Access</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => setIsStaffMode(true)}
                                        className="flex w-full cursor-pointer items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-4 text-slate-900 dark:text-white transition-all hover:bg-slate-100 dark:hover:bg-slate-800/50"
                                    >
                                        <span className="text-base font-semibold">Faculty / Admin Login</span>
                                    </button>
                                </>
                            ) : (
                                <form onSubmit={handleStaffLogin} className="space-y-4">
                                    {error && (
                                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold text-center">
                                            {error}
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">Username</label>
                                        <input
                                            type="text"
                                            required
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                            placeholder="admin"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full flex items-center justify-center space-x-2 bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(137,91,245,0.3)] disabled:opacity-50"
                                    >
                                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                            <>
                                                <span>Sign In</span>
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </button>

                                    <div className="pt-2 text-center">
                                        <button
                                            type="button"
                                            onClick={() => setIsStaffMode(false)}
                                            className="text-sm font-medium text-primary hover:underline underline-offset-4"
                                        >
                                            ← Back to Student Login
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {!isStaffMode && (
                            <div className="mt-10 flex flex-col gap-3">
                                <p className="text-center text-xs text-slate-500 px-6 leading-relaxed">
                                    By continuing, you agree to our <a className="underline" href="#">Terms of Service</a> and <a className="underline" href="#">Privacy Policy</a>.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer Features (Mobile only hint) */}
                    <div className="lg:hidden grid grid-cols-1 gap-4 mt-8">
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-100 dark:bg-slate-900/50">
                            <Code2 className="text-primary w-5 h-5 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-sm dark:text-white">Real Repositories</h3>
                                <p className="text-xs text-slate-500">Ship code to actual projects.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-100 dark:bg-slate-900/50">
                            <Zap className="text-primary w-5 h-5 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-sm dark:text-white">AI Mentorship</h3>
                                <p className="text-xs text-slate-500">Instant reviews and guidance.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
