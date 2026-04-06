"use client";

import Link from "next/link";
import { ChevronRight, Code2, Zap, Trophy, ArrowUpRight, Cpu } from "lucide-react";
import { clsx } from "clsx";

interface Problem {
    id: number;
    title: string;
    difficulty: string;
    description?: string;
    xp_reward?: number;
    subject?: string | null;
}

const difficultyStyles = {
    Easy: {
        text: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        dot: "bg-emerald-500",
        glow: "shadow-emerald-500/20"
    },
    Medium: {
        text: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        dot: "bg-amber-500",
        glow: "shadow-amber-500/20"
    },
    Hard: {
        text: "text-rose-400",
        bg: "bg-rose-500/10",
        border: "border-rose-500/20",
        dot: "bg-rose-500",
        glow: "shadow-rose-500/20"
    },
};

export default function ProblemCard({ problem }: { problem: Problem }) {
    const style = difficultyStyles[problem.difficulty as keyof typeof difficultyStyles] || difficultyStyles.Medium;
    const xp = problem.xp_reward || (problem.difficulty === "Easy" ? 150 : problem.difficulty === "Medium" ? 300 : 500);

    return (
        <div className="w-full h-full group">
            {/* Main Glass Card - Static & High Performance */}
            <div className="relative bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 rounded-[2.5rem] p-10 h-full min-h-[420px] flex flex-col justify-between overflow-hidden border border-white/5 hover:border-primary/30 shadow-2xl hover:shadow-primary/5">
                
                {/* Visual Flair - Static Gradient */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity" />
                
                <div className="relative z-10">
                    {/* Header: Difficulty */}
                    <div className="flex items-center justify-between mb-8">
                        <div className={clsx(
                            "flex items-center gap-2.5 px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300", 
                            style.bg, style.text, style.border
                        )}>
                            <div className={clsx("w-2 h-2 rounded-full", style.dot)} />
                            {problem.difficulty}
                        </div>
                        
                        {problem.subject && (
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                                <Cpu className="w-3.5 h-3.5" />
                                {problem.subject.replace("-", " ")}
                            </div>
                        )}
                    </div>

                    {/* Title Section */}
                    <Link href={`/problems/${problem.id}`}>
                        <h4 className="text-3xl font-black text-white mb-4 tracking-tighter leading-tight group-hover:text-primary transition-colors line-clamp-2 uppercase">
                            {problem.title}
                        </h4>
                    </Link>
                    <p className="text-slate-500 text-sm leading-relaxed mb-10 line-clamp-3 font-bold uppercase tracking-tight opacity-70 group-hover:opacity-100 transition-opacity">
                        {problem.description || `Architect a high-performance solution for ${problem.title}. Optimize for quantum consistency and real-world scalability.`}
                    </p>
                </div>

                {/* Footer: XP & Button */}
                <div className="flex items-center justify-between pt-8 border-t border-white/5 relative z-10 mt-auto">
                    <div className="flex items-center gap-4 py-1">
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                            <Trophy className="w-5 h-5 text-primary text-green-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] leading-none mb-1.5">Bounty</p>
                            <p className="text-lg font-black text-white tracking-tight">{xp} <span className="text-primary text-xs ml-0.5">XP</span></p>
                        </div>
                    </div>

                    <Link 
                        href={`/problems/${problem.id}`}
                        className="flex items-center gap-2 px-8 py-3.5 bg-white/5 hover:bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
                    >
                        <span>Solve</span>
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
