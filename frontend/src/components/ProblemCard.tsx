"use client";

import Link from "next/link";
import { ChevronRight, CloudIcon, CloudLightning } from "lucide-react";

interface Problem {
    id: number;
    title: string;
    difficulty: string;
    description?: string;
    points?: number;
}

const difficultyStyles = {
    Easy: "bg-green-500/10 text-green-500 border border-green-500/20",
    Medium: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
    Hard: "bg-rose-500/10 text-rose-500 border border-rose-500/20",
};

export default function ProblemCard({ problem }: { problem: Problem }) {
    const points = problem.points || (problem.difficulty === "Easy" ? 150 : problem.difficulty === "Medium" ? 300 : 500);

    return (
        <div className="glass-card rounded-2xl p-6 hover:border-primary/50 transition-colors group mb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest ${difficultyStyles[problem.difficulty as keyof typeof difficultyStyles]}`}>
                            {problem.difficulty}
                        </span>
                        <span className="text-slate-500 text-xs">• {points} Points</span>
                    </div>
                    <Link href={`/problems/${problem.id}`}>
                        <h4 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors cursor-pointer">
                            {problem.title}
                        </h4>
                    </Link>
                    <p className="text-slate-400 text-sm line-clamp-2">
                        {problem.description || `Build a highly optimized solution for ${problem.title}. Connect your GitHub repo to get real-time AI mentoring and validation.`}
                    </p>
                </div>
                
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold border border-white/5 transition-colors">
                        <CloudLightning className="w-4 h-4" />
                        Provision Repo
                    </button>
                    <Link href={`/problems/${problem.id}`}>
                        <button className="p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
