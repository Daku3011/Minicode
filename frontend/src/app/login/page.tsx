"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Terminal, Github, ArrowRight, ShieldCheck, Zap, Code2, Loader2 } from "lucide-react";
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
        const redirectUri = `${window.location.origin}/auth/github/callback`;
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user,user:email`;
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

            await login(response.data.access_token); // Automatically redirects due to useEffect
        } catch (err: any) {
            setError(err.response?.data?.detail || "Invalid login credentials.");
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Left Side: Branding & Features */}
                <div className="space-y-8">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <Terminal className="text-white w-7 h-7" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">MiniCode</h1>
                    </div>

                    <h2 className="text-5xl font-extrabold text-white leading-tight">
                        Level up your <br />
                        <span className="gradient-text">coding game.</span>
                    </h2>

                    <div className="space-y-4">
                        {[
                            { icon: Code2, title: "Curated DSA Problems", desc: "Hand-picked challenges from Top MNCs." },
                            { icon: Zap, title: "GitHub Integrated", desc: "Your code stays in your repo, synced instantly." },
                            { icon: ShieldCheck, title: "AI Mentorship", desc: "Get real-time qualitative feedback on every solution." }
                        ].map((f, i) => (
                            <div key={i} className="flex items-start space-x-4 group">
                                <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-primary transition-colors">
                                    <f.icon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wide">{f.title}</h4>
                                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Login Card */}
                <div className="glass rounded-[2.5rem] p-10 space-y-8 border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

                    <div className="text-center relative z-10">
                        <h3 className="text-2xl font-bold text-white">Welcome back</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                            {isStaffMode ? "Sign in to your staff portal" : "Sign in to sync your progress"}
                        </p>
                    </div>

                    <div className="space-y-4 relative z-10">
                        {!isStaffMode ? (
                            <>
                                <button
                                    onClick={handleGithubLogin}
                                    className="w-full flex items-center justify-center space-x-3 bg-white text-black py-4 rounded-2xl font-bold hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Github className="w-5 h-5" />
                                    <span>Continue with GitHub</span>
                                </button>

                                <div className="pt-4 text-center">
                                    <button
                                        onClick={() => setIsStaffMode(true)}
                                        className="text-xs text-muted-foreground hover:text-white transition-colors underline decoration-white/20 underline-offset-4 font-medium"
                                    >
                                        Are you Faculty/Admin? Log in here.
                                    </button>
                                </div>
                            </>
                        ) : (
                            <form onSubmit={handleStaffLogin} className="space-y-4">
                                {error && (
                                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold text-center">
                                        {error}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Username</label>
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                        placeholder="admin"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full flex items-center justify-center space-x-2 bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-50"
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
                                        className="text-xs text-muted-foreground hover:text-white transition-colors font-medium"
                                    >
                                        ← Back to Student Login
                                    </button>
                                </div>
                            </form>
                        )}

                        {!isStaffMode && (
                            <p className="text-[10px] text-center text-muted-foreground mt-4">
                                By continuing, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
