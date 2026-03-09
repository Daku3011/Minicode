"use client";

import { useEffect, useState } from "react";
import { PlayCircle, BarChart3, Trophy } from "lucide-react";
import ProblemCard from "@/components/ProblemCard";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Problem {
    id: number;
    title: string;
    difficulty: string;
}

export default function ProblemsPage() {
    const { user } = useAuth();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const response = await api.get("/problems");
                setProblems(response.data);
            } catch (error) {
                console.error("Failed to fetch problems:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProblems();
    }, []);

    return (
        <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 relative">
            {/* Background Mesh Gradient */}
            <div className="absolute inset-0 pointer-events-none opacity-40 mesh-gradient z-0"></div>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 relative z-10">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                        Coding Arena
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl">
                        Welcome to the arena. Select a challenge below to provision a GitHub repository and begin solving.
                    </p>
                </div>
            </div>

            {/* Main Full Width Grid */}
            <div className="relative z-10 w-full space-y-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-white">All Challenges</h3>
                </div>

                <div className="space-y-4 max-w-4xl">
                    {loading ? (
                        [1, 2, 3].map((i) => (
                            <div key={i} className="h-32 w-full bg-white/5 animate-pulse rounded-2xl border border-white/5" />
                        ))
                    ) : problems.length > 0 ? (
                        problems.map((problem) => (
                            <ProblemCard key={problem.id} problem={problem} />
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-500 glass-card rounded-2xl">
                            No challenges available right now.
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
