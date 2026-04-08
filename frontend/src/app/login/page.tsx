"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Terminal, Github, ArrowRight, Loader2, Shield, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";

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
                            {/* Label */}
                            <div className="flex items-center gap-2.5 mb-6">
                                <div className="h-px w-5 bg-violet-400" />
                                <span className="text-sm text-violet-600 font-medium tracking-wide">
                                    Coding Club • SCET Computer Dept
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
                    </div>

                    {/* Right Column: Auth Card */}
                    <div className="flex flex-col items-center w-full max-w-md mx-auto">
                        {/* Logo */}
                        <div className="flex flex-col items-center gap-4 mb-10">
                            <div className="relative group">
                                <div className="relative bg-violet-600 p-5 rounded-2xl shadow-lg shadow-violet-200 transform group-hover:scale-105 transition-all duration-300">
                                    <Terminal className="text-white w-8 h-8" />
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
                                            className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-gray-900 px-8 py-5 text-white shadow-md hover:bg-gray-800 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
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
                                            className="w-full py-4 rounded-xl bg-white border border-gray-200 text-gray-600 font-medium cursor-pointer hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition-all duration-200 text-sm flex items-center justify-center gap-2"
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
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
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
            </main>
        </div>
    );
}
