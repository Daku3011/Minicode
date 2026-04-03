"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Terminal, Github, ArrowRight, Loader2, Code2, Shield, Sparkles, UserCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { clsx } from "clsx";
import MagneticWrapper from "@/components/MagneticWrapper";

const containerVars = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
} as const;

const itemVars = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 }
    },
} as const;


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
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 overflow-hidden">
            {/* Ambient Background Depth */}
            <div className="absolute top-1/4 -left-20 w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[160px] animate-pulse pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-[40rem] h-[40rem] bg-secondary/10 rounded-full blur-[160px] animate-pulse pointer-events-none" style={{ animationDelay: "1s" }} />

            <main className="w-full max-w-7xl z-10">
                <motion.div
                    variants={containerVars}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center"
                >
                    {/* Left Column: Platform Origin & Credits */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-12 order-1">
                        {/* Elite Partnership Badge */}
                        <div className="flex flex-col items-center lg:items-start group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-px w-3 bg-primary/30" />
                                <span className="text-[13px] text-purple-400 text-primary uppercase tracking-[0.5em]">Powered by</span>
                                <div className="h-px w-12 bg-primary/30 hidden lg:block" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase leading-[0.85] group-hover:tracking-tight transition-all duration-400">
                                    CODING <br className="hidden lg:block"/> CLUB
                                </h2>
                            </div>
                            <div className="flex flex-col lg:flex-row items-center lg:items-center gap-4 mt-8">
                                <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                                    <span className="text-[10px] text-purple-400 text-secondary uppercase tracking-[0.4em]">In Collaboration with</span>
                                </div>
                                <a 
                                    href="https://scet.ac.in/department/computer-engineering" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-lg font-black text-slate-300 uppercase tracking-widest lg:border-l border-white/10 lg:pl-6 pl-0 py-1 underline underline-offset-4"
                                >
                                    SCET COMPUTER DEPT.
                                </a>
                            </div>
                        </div>

                        {/* Signature Credits */}
                        <div className="flex flex-col items-center lg:items-start mt-1 py-8 lg:py-7 lg:px-14 px-12 rounded-[2rem] bg-white/[0.04] border border-white/10 backdrop-blur-xl relative overflow-hidden group/team shadow-2xl">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover/team:opacity-100 transition-opacity duration-1000" />
                            <div className="flex items-center gap-2 mb-3 relative z-10">
                                {/* <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" /> */}
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">Architected & Developed by</span>
                            </div>
                            <span className="relative text-3xl font-black text-white tracking-tight italic relative z-10 drop-shadow-sm"><a href="https://github.com/Daku3011" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Dwarkesh Ramani </a>& <a href="https://github.com/jenilgajera18" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Jenil Gajera</a></span>
                            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover/team:bg-primary/20 transition-colors" />
                        </div>

                        {/* Visual Connector for Desktop */}
                        {/* <div className="hidden lg:block relative mt-16 ml-2">
                            <div className="w-40 h-px bg-gradient-to-r from-primary/40 via-white/10 to-transparent" />
                            <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
                        </div> */}
                    </div>

                    {/* Right Column: Branding & Authentication Card */}
                    <div className="flex flex-col items-center space-y-12 order-2">
                        {/* Auth-Linked Branding */}
                        <motion.div variants={itemVars} className="flex flex-col items-center gap-4 mb-4">
                            <MagneticWrapper>
                                <motion.div
                                    whileHover={{ rotate: 10, scale: 1.15 }}
                                    className="bg-primary p-4 rounded-2xl shadow-2xl shadow-primary/20 ring-1 ring-white/10"
                                >
                                    <Terminal className="text-white w-10 h-10" />
                                </motion.div>
                            </MagneticWrapper>
                            <div className="text-center">
                                <h1 className="text-3xl font-black tracking-tighter text-white">
                                    MINICODE
                                </h1>
                                <p className="text-slate-500 font-black mt-1 tracking-[0.4em] uppercase text-[9px] opacity-60">
                                    The Elite Coding Arena
                                </p>
                            </div>
                        </motion.div>

                    {/* Main Content Card (Weightless Glass) */}
                    <motion.div
                        variants={itemVars}
                        className={clsx(
                            "glass-card rounded-[3rem] p-10 md:p-14 shadow-antigravity border border-white/10 relative overflow-hidden group",
                            "hover:border-primary/20 transition-all duration-700"
                        )}
                    >
                        {/* Reflective Highlight Overlay */}
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                        <AnimatePresence mode="wait">
                            {!isStaffMode ? (
                                <motion.div
                                    key="student"
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 30 }}
                                    transition={{ duration: 0.5, ease: "anticipate" }}
                                    className="space-y-10 relative z-10"
                                >
                                    <div className="text-center space-y-3">
                                        <h2 className="text-3xl font-black text-white tracking-tight text-center">Level Up Your Code</h2>
                                        <p className="text-slate-400 font-medium">Join the next generation of engineers solving high-stakes challenges.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <MagneticWrapper>
                                            <button
                                                onClick={handleGithubLogin}
                                                className="flex w-full items-center justify-center gap-4 rounded-2xl bg-white px-6 py-6 text-slate-950"
                                            >
                                                <Github className="w-7 h-7" />
                                                <span className="text-xl font-black uppercase tracking-tight">Authorize via GitHub</span>
                                            </button>
                                        </MagneticWrapper>

                                        <div className="flex items-center gap-4 text-slate-500 py-2">
                                            <div className="h-px flex-1 bg-white/5" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Proprietary Access</span>
                                            <div className="h-px flex-1 bg-white/5" />
                                        </div>

                                        <button
                                            onClick={() => setIsStaffMode(true)}
                                            className="w-full py-5 rounded-2xl border border-white/5 text-slate-400 font-black hover:bg-white/5 hover:text-secondary transition-all text-xs uppercase tracking-[0.2em] group"
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <Shield className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                                <span>Staff Authentication</span>
                                            </div>
                                        </button>
                                    </div>

                                    <div className="pt-8 flex flex-col items-center gap-6 border-t border-white/5">
                                        {/* <div className="flex items-center gap-6 text-slate-400">
                                            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/10 border border-white/5 group hover:border-primary/30 transition-colors">
                                                <Code2 className="w-4 h-4 text-primary" />
                                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Matrix Problems</span>
                                            </div>
                                            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/10 border border-white/5 group hover:border-secondary/30 transition-colors">
                                                <Sparkles className="w-4 h-4 text-secondary" />
                                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Quantum Learning</span>
                                            </div>
                                        </div> */}
                                        <p className="text-center text-[10px] text-slate-600 px-8 uppercase tracking-[0.2em] font-bold leading-relaxed">
                                            By connecting, you consent to our <Link className="text-primary underline text-gray-200" href="/terms">Terms of Engagement</Link> & <Link className="text-primary underline text-gray-200" href="/privacy">Encryption Privacy</Link>.
                                        </p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.form
                                    key="staff"
                                    onSubmit={handleStaffLogin}
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    transition={{ duration: 0.5, ease: "anticipate" }}
                                    className="space-y-8 relative z-10"
                                >
                                    <div className="text-center mb-10">
                                        <div className="inline-flex p-4 rounded-2xl bg-secondary/10 text-secondary mb-6 border border-secondary/20 shadow-lg shadow-secondary/5">
                                            <UserCircle2 className="w-8 h-8" />
                                        </div>
                                        <h2 className="text-3xl font-black text-white tracking-tight">Command Center</h2>
                                        <p className="text-slate-400 mt-2 font-medium">Elevated authorization required for this sector.</p>
                                    </div>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black text-center tracking-wide"
                                        >
                                            ACCESS DENIED: {error}
                                        </motion.div>
                                    )}

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Identity Signature</label>
                                            <input
                                                type="text"
                                                required
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-secondary/40 placeholder:text-slate-700 transition-all font-bold tracking-tight"
                                                placeholder="User identity"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Security Key</label>
                                            <input
                                                type="password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-secondary/40 placeholder:text-slate-700 transition-all font-bold tracking-tight"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <MagneticWrapper>
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="premium-btn w-full py-6 rounded-2xl justify-center shadow-xl shadow-secondary/10 disabled:opacity-50 group grow"
                                            >
                                                {submitting ? <Loader2 className="w-7 h-7 animate-spin" /> : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xl">Decrypt Access</span>
                                                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                )}
                                            </button>
                                        </MagneticWrapper>

                                        <button
                                            type="button"
                                            onClick={() => setIsStaffMode(false)}
                                            className="w-full text-center text-xs font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
                                        >
                                            Return to Core Arena
                                        </button>
                                    </div>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </motion.div>

                        {/* Subtle Security Indicator */}
                        {/* <motion.div 
                            variants={itemVars}
                            className="mt-12 text-center"
                        >
                            <div className="flex items-center justify-center gap-3 opacity-20 hover:opacity-40 transition-opacity cursor-default group">
                                <Shield className="w-3.5 h-3.5 text-slate-500 group-hover:text-primary transition-colors" />
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.5em] leading-relaxed">
                                    Secure Quantum Environment
                                </span>
                            </div>
                        </motion.div> */}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
