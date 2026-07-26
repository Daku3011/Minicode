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
        text: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        dot: "bg-emerald-500"
    },
    Medium: {
        text: "text-amber-700",
        bg: "bg-amber-50",
        border: "border-amber-200",
        dot: "bg-amber-500"
    },
    Hard: {
        text: "text-rose-700",
        bg: "bg-rose-50",
        border: "border-rose-200",
        dot: "bg-rose-500"
    },
};

export default function ProblemCard({ problem, userUnlockedLevel = 1, isFaculty = false }: ProblemCardProps) {
    const style = difficultyStyles[problem.difficulty as keyof typeof difficultyStyles] || difficultyStyles.Medium;
    const xp = problem.xp_reward || (problem.difficulty === "Easy" ? 150 : problem.difficulty === "Medium" ? 300 : 500);
    
    const isLocked = !isFaculty && problem.level > userUnlockedLevel;

    return (
        <div className={clsx("w-full h-full group", isLocked && "cursor-not-allowed")}>
            <div className={clsx(
                "relative transition-all duration-200 rounded-xl p-6 h-full min-h-[360px] flex flex-col justify-between overflow-hidden border",
                isLocked 
                    ? "bg-slate-50 dark:bg-gray-800/50 border-blue-100 dark:border-gray-700 opacity-75" 
                    : "bg-white dark:bg-gray-800 border-blue-100 dark:border-gray-700 shadow-blue-sm dark:shadow-none hover:shadow-blue-md dark:hover:border-blue-500"
            )}>

                {isLocked && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/75 dark:bg-gray-900/75 rounded-xl">
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-white rounded-full border border-blue-100 shadow-sm">
                                <Lock className="w-8 h-8 text-blue-400" />
                            </div>
                            <p className="text-xs font-medium text-slate-500 tracking-wide">
                                Unlock at Level {problem.level}
                            </p>
                        </div>
                    </div>
                )}
                
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6 gap-3">
                        <div className={clsx(
                            "flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-semibold transition-all duration-200", 
                            isLocked ? "opacity-50" : "",
                            style.bg, style.text, style.border
                        )}>
                            <div className={clsx("w-2 h-2 rounded-full", style.dot)} />
                            {problem.difficulty}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {problem.subject && (
                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-gray-300 bg-slate-50 dark:bg-gray-700 px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-gray-600">
                                    <Cpu className="w-3.5 h-3.5 text-slate-400 dark:text-gray-400" />
                                    {problem.subject.replace("-", " ")}
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 px-2.5 py-1.5 rounded-md border border-blue-200 dark:border-blue-800">
                                Level {problem.level}
                            </div>
                        </div>
                    </div>

                    <div className={isLocked ? "filter blur-[2px]" : ""}>
                        <Link href={isLocked ? "#" : `/problems/${problem.id}`}>
                            <h4 className={clsx(
                                "mb-3 tracking-tight leading-tight line-clamp-2 transition-colors",
                                isLocked ? "text-slate-400 dark:text-gray-500" : "text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400"
                            )}>
                                {problem.title}
                            </h4>
                        </Link>
                        <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed mb-8 line-clamp-3 transition-opacity">
                            {problem.description || `Solve ${problem.title} with an efficient approach and clean implementation.`}
                        </p>
                    </div>
                </div>

                <div className={clsx("flex items-center justify-between pt-5 border-t border-blue-100 dark:border-gray-700 relative z-10 mt-auto", isLocked && "opacity-60")}>
                    <div className="flex items-center gap-4 py-1">
                        <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                            <Trophy className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-400 dark:text-gray-500 leading-none mb-1">Reward</p>
                            <p className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{xp} <span className="text-emerald-600 text-xs ml-0.5">XP</span></p>
                        </div>
                    </div>

                    <Link 
                        href={isLocked ? "#" : `/problems/${problem.id}`}
                        onClick={(e) => isLocked && e.preventDefault()}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border",
                            isLocked 
                                ? "bg-slate-100 dark:bg-gray-700 text-slate-400 dark:text-gray-500 border-slate-200 dark:border-gray-600 cursor-not-allowed" 
                                : "bg-white dark:bg-gray-800 hover:bg-blue-600 dark:hover:bg-blue-600 text-slate-700 dark:text-gray-200 hover:text-white border-blue-200 dark:border-gray-600 hover:border-blue-600"
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
