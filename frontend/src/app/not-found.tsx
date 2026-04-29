"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
    const router = useRouter();

    useEffect(() => {
        document.title = "404 - Page Not Found | MiniCode";
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-8 md:p-12 font-black">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white border border-blue-100 rounded-3xl shadow-sm p-12 text-center">
                    <div className="mb-6">
                        <h1 className="text-6xl md:text-8xl lg:text-[120px] leading-none font-black text-slate-900">404</h1>
                        <div className="w-20 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto rounded-full mt-4" />
                    </div>

                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide mb-2">Page Not Found</h2>
                    <p className="text-slate-500 text-base md:text-lg mb-8">
                        The page you are looking for doesn&apos;t exist or has been moved.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-100 hover:bg-slate-50 rounded-xl transition-all"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                            Go Back
                        </button>
                        <button
                            onClick={() => router.push("/")}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-all"
                        >
                            <Home className="w-5 h-5" />
                            Go Home
                        </button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <p className="text-slate-500 text-sm mb-4">Or explore popular pages:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <button
                                onClick={() => router.push("/problems")}
                                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm border border-slate-100"
                            >
                                Problems
                            </button>
                            <button
                                onClick={() => router.push("/leaderboard")}
                                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm border border-slate-100"
                            >
                                Leaderboard
                            </button>
                            <button
                                onClick={() => router.push("/cohorts")}
                                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm border border-slate-100"
                            >
                                Cohorts
                            </button>
                            <button
                                onClick={() => router.push("/alumni/profiles")}
                                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm border border-slate-100"
                            >
                                Alumni
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}