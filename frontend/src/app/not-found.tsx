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
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-8">
            <div className="max-w-lg w-full text-center">
                <div className="mb-8">
                    <h1 className="text-[150px] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-600 to-slate-800">
                        404
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto rounded-full" />
                </div>

                <h2 className="text-3xl font-bold uppercase tracking-wider mb-4">
                    Lost in Space
                </h2>
                <p className="text-slate-400 text-lg mb-8">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
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

                <div className="mt-12 pt-8 border-t border-slate-800">
                    <p className="text-slate-500 text-sm mb-4">Or explore our popular pages:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        <button
                            onClick={() => router.push("/problems")}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-all"
                        >
                            Problems
                        </button>
                        <button
                            onClick={() => router.push("/leaderboard")}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-all"
                        >
                            Leaderboard
                        </button>
                        <button
                            onClick={() => router.push("/cohorts")}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-all"
                        >
                            Cohorts
                        </button>
                        <button
                            onClick={() => router.push("/alumni/profiles")}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-all"
                        >
                            Alumni
                        </button>
                    </div>
                </div>

                <div className="mt-12 text-slate-600 text-sm">
                    <p>MiniCode v1.0 &bull; Code Your Way Up</p>
                </div>
            </div>
        </div>
    );
}