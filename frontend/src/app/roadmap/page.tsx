"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, Brain, Code, BarChart3, ArrowRight, Rocket, Swords, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";

interface Stream {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon: string;
    color: string;
    milestone_count: number;
}

const iconMap: Record<string, React.ElementType> = {
    shield: Shield,
    brain: Brain,
    code: Code,
    chart: BarChart3,
    rocket: Rocket,
    swords: Swords,
    sparkles: Sparkles,
};

export default function RoadmapPage() {
    const [streams, setStreams] = useState<Stream[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStreams();
    }, []);

    const fetchStreams = async () => {
        try {
            setError(null);
            const response = await api.get("/roadmap/streams");
            setStreams(response.data);
        } catch (error: any) {
            console.error("Failed to fetch streams:", error);
            setError(error.response?.data?.detail || error.message || "Failed to load streams");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#faf8ff] pt-24 pb-24 px-4 md:px-8 overflow-x-hidden relative">
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-100 blur-3xl opacity-70" />
                <div className="absolute top-60 right-0 h-[320px] w-[320px] rounded-full bg-cyan-100 blur-3xl opacity-50" />
            </div>

            <div className="max-w-[1400px] mx-auto relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 border border-violet-200 text-violet-700 text-xs font-bold uppercase tracking-wider mb-6">
                        <Rocket className="w-3.5 h-3.5" />
                        Learning Paths
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-4">
                        Choose Your <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-500 bg-clip-text text-transparent">Stream</span>
                    </h1>
                    <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto font-medium">
                        Follow a structured roadmap with milestones, earn XP, and track your progress as you master new skills.
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {streams.map((stream) => {
                            const Icon = iconMap[stream.icon] || Rocket;
                            return (
                                <Link
                                    key={stream.id}
                                    href={`/roadmap/${stream.id}`}
                                    className="group bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-lg hover:border-violet-200 transition-all"
                                >
                                    <div className="flex items-start gap-6">
                                        <div
                                            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: `${stream.color}15`, color: stream.color }}
                                        >
                                            <Icon className="w-8 h-8" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-2xl font-bold text-slate-900 mb-2">{stream.name}</h3>
                                            <p className="text-slate-500 text-sm mb-4 line-clamp-2">{stream.description}</p>
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="px-3 py-1 rounded-full bg-violet-50 text-violet-700 font-semibold text-xs">
                                                    {stream.milestone_count} milestones
                                                </span>
                                                <span className="text-violet-600 font-semibold text-xs group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                                    View Roadmap <ArrowRight className="w-3 h-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {!loading && streams.length === 0 && (
                    <div className="text-center py-20">
                        {error ? (
                            <>
                                <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
                                    <Rocket className="w-8 h-8 text-red-400" />
                                </div>
                                <p className="text-slate-600 text-lg font-semibold mb-2">Failed to load streams</p>
                                <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">{error}</p>
                                <button
                                    onClick={() => { setLoading(true); fetchStreams(); }}
                                    className="px-5 py-2.5 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 transition-colors"
                                >
                                    Retry
                                </button>
                            </>
                        ) : (
                            <>
                                <Rocket className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-600 text-lg font-semibold">No streams available yet</p>
                                <p className="text-slate-400 text-sm mt-1">Check back later for new learning paths.</p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
