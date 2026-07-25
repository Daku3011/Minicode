"use client";

import Link from "next/link";
import { Lock, Trophy, CheckCircle2, BookOpen, Award } from "lucide-react";
import { clsx } from "clsx";

interface Problem {
    id: number;
    title: string;
    difficulty: string;
    description?: string;
    xp_reward?: number;
    subject?: string | null;
    level: number;
    status?: "Completed" | "Scholar" | "Master" | "In Progress" | string;
}

interface ProblemListItemProps {
    problem: Problem;
    userUnlockedLevel?: number;
    isFaculty?: boolean;
}

export default function ProblemListItem({ problem, userUnlockedLevel = 1, isFaculty = false }: ProblemListItemProps) {
    const xp = problem.xp_reward || (problem.difficulty === "Easy" ? 150 : problem.difficulty === "Medium" ? 300 : 500);
    const isLocked = !isFaculty && problem.level > userUnlockedLevel;

    // Status badge configuration matching photo 2 design
    const getStatusBadge = () => {
        const status = problem.status || (problem.level === 1 ? "Completed" : problem.level <= 3 ? "Scholar" : "Master");

        if (status === "Completed") {
            return (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Completed</span>
                </div>
            );
        }

        if (status === "Scholar") {
            return (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200/60 shadow-sm">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                    <span>Scholar</span>
                </div>
            );
        }

        if (status === "Master") {
            return (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50/80 text-amber-700/80 text-xs font-medium border border-amber-200/40 opacity-70">
                    <Award className="w-3.5 h-3.5 text-amber-500/70" />
                    <span>Master</span>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-600 text-xs font-medium border border-slate-200">
                <span>Level {problem.level}</span>
            </div>
        );
    };

    const categoryText = (problem.subject || (problem.level % 2 === 0 ? "DATA STRUCTURES" : "ALGORITHMS")).toUpperCase().replace("-", " ");

    return (
        <div className={clsx("w-full group transition-all duration-200", isLocked && "opacity-60 cursor-not-allowed")}>
            <div className={clsx(
                "bg-white rounded-2xl px-6 md:px-8 py-5 border border-slate-100/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6",
                isLocked ? "bg-slate-50/70" : "hover:border-blue-200/70"
            )}>
                {/* Left Section: Status & Details */}
                <div className="flex items-start md:items-center gap-4 md:gap-6 flex-1 min-w-0">
                    {/* Status Badge */}
                    <div className="shrink-0 pt-1 md:pt-0">
                        {isLocked ? (
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold border border-slate-200">
                                <Lock className="w-3.5 h-3.5 text-slate-400" />
                                <span>Locked</span>
                            </div>
                        ) : (
                            getStatusBadge()
                        )}
                    </div>

                    {/* Title & Description */}
                    <div className="flex-1 min-w-0">
                        <Link 
                            href={isLocked ? "#" : `/problems/${problem.id}`}
                            onClick={(e) => isLocked && e.preventDefault()}
                            className="block group/link"
                        >
                            <h3 className={clsx(
                                "text-base md:text-lg font-bold tracking-tight transition-colors line-clamp-1",
                                isLocked ? "text-slate-400" : "text-slate-900 group-hover/link:text-blue-600"
                            )}>
                                {problem.title}
                            </h3>
                        </Link>
                        <p className="text-xs md:text-sm text-slate-500 line-clamp-1 mt-0.5 font-normal">
                            {problem.description || `Solve ${problem.title} with an efficient approach.`}
                        </p>
                    </div>
                </div>

                {/* Right Section: Category Tag, Level Pill & XP Reward */}
                <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    {/* Category */}
                    <span className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-slate-400">
                        {categoryText}
                    </span>

                    {/* Level */}
                    <span className="px-3 py-1 bg-slate-100/80 text-slate-600 text-xs font-bold rounded-md">
                        Level {problem.level}
                    </span>

                    {/* XP */}
                    <span className="text-xs md:text-sm font-bold text-amber-600/90 whitespace-nowrap min-w-[60px] text-right">
                        {xp} XP
                    </span>
                </div>
            </div>
        </div>
    );
}
