"use client";

import Link from "next/link";
import { Lock, Trophy, ArrowUpRight, Cpu } from "lucide-react";
import { clsx } from "clsx";

interface Problem {
    id: number;
    title: string;
    difficulty: string;
    description?: string;
    xp_reward?: number;
    subject?: string | null;
    level: number;
}

interface ProblemCardProps {
    problem: Problem;
    userUnlockedLevel?: number;
    isFaculty?: boolean;
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

export default function ProblemCard({ problem, userUnlockedLevel = 1, isFaculty = false }: ProblemCardProps) {
    const style = difficultyStyles[problem.difficulty as keyof typeof difficultyStyles] || difficultyStyles.Medium;
    const xp = problem.xp_reward || (problem.difficulty === "Easy" ? 150 : problem.difficulty === "Medium" ? 300 : 500);
    
    const isLocked = !isFaculty && problem.level > userUnlockedLevel;

    return (
        <div className={clsx("w-full h-full group", isLocked && "cursor-not-allowed")}>
            {/* Main Glass Card */}
            <div className={clsx(
                "relative transition-all duration-300 rounded-[2.5rem] p-10 h-full min-h-[420px] flex flex-col justify-between overflow-hidden shadow-2xl",
                isLocked 
                    ? "bg-white/[0.01] border border-white/5 opacity-60" 
                    : "bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-primary/30 hover:shadow-primary/5"
            )}>
                
                {/* Visual Flair */}
                <div className={clsx(
                    "absolute -top-12 -right-12 w-48 h-48 rounded-full blur-[40px] transition-opacity",
                    isLocked ? "bg-slate-500/5 opacity-10" : "bg-primary/5 opacity-20 group-hover:opacity-40"
                )} />
                
                {/* Lock Overlay */}
                {isLocked && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-[1px] rounded-[2.5rem]">
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-6 bg-white/10 rounded-full border border-white/20">
                                <Lock className="w-12 h-12 text-slate-400" />
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                                Unlock at Level {problem.level}
                            </p>
                        </div>
                    </div>
                )}
                
                <div className="relative z-10">
                    {/* Header: Difficulty & Level */}
                    <div className="flex items-center justify-between mb-8">
                        <div className={clsx(
                            "flex items-center gap-2.5 px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300", 
                            isLocked ? "opacity-50" : "",
                            style.bg, style.text, style.border
                        )}>
                            <div className={clsx("w-2 h-2 rounded-full", style.dot)} />
                            {problem.difficulty}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {problem.subject && (
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                                    <Cpu className="w-3.5 h-3.5" />
                                    {problem.subject.replace("-", " ")}
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-[10px] text-white font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                                Lv.{problem.level}
                            </div>
                        </div>
                    </div>

                    {/* Title Section */}
                    <div className={isLocked ? "filter blur-[2px]" : ""}>
                        <Link href={isLocked ? "#" : `/problems/${problem.id}`}>
                            <h4 className={clsx(
                                "mb-4 tracking-tighter leading-tight line-clamp-2 uppercase transition-colors",
                                isLocked ? "text-slate-500" : "text-3xl font-black text-white group-hover:text-primary"
                            )}>
                                {problem.title}
                            </h4>
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed mb-10 line-clamp-3 font-bold uppercase tracking-tight opacity-70 group-hover:opacity-100 transition-opacity">
                            {problem.description || `Architect a high-performance solution for ${problem.title}. Optimize for quantum consistency and real-world scalability.`}
                        </p>
                    </div>
                </div>

                {/* Footer: XP & Button */}
                <div className={clsx("flex items-center justify-between pt-8 border-t border-white/5 relative z-10 mt-auto", isLocked && "opacity-50")}>
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
                        href={isLocked ? "#" : `/problems/${problem.id}`}
                        onClick={(e) => isLocked && e.preventDefault()}
                        className={clsx(
                            "flex items-center gap-2 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                            isLocked 
                                ? "bg-white/5 text-slate-600 border-white/5 cursor-not-allowed" 
                                : "bg-white/5 hover:bg-primary text-white border-white/5 hover:border-primary"
                        )}
                    >
                        <span>{isLocked ? "Locked" : "Solve"}</span>
                        {isLocked ? (
                            <Lock className="w-4 h-4" />
                        ) : (
                            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        )}
                    </Link>
                </div>
            </div>
        </div>
    );
}
