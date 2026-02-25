"use client";

import Link from "next/link";
import { ChevronRight, Code2 } from "lucide-react";
import { clsx } from "clsx";

interface Problem {
    id: number;
    title: string;
    difficulty: string;
    status?: "solved" | "attempted" | "todo";
}

const difficultyColors = {
    Easy: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    Medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    Hard: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

export default function ProblemCard({ problem }: { problem: Problem }) {
    return (
        <Link
            href={`/problems/${problem.id}`}
            className="group relative flex items-center justify-between p-5 rounded-xl transition-all duration-300 glass hover:bg-white/10"
        >
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Code2 className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-primary-foreground transition-colors">
                        {problem.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                        <span
                            className={clsx(
                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                                difficultyColors[problem.difficulty as keyof typeof difficultyColors]
                            )}
                        >
                            {problem.difficulty}
                        </span>
                        <span className="text-xs text-muted-foreground">Solved by 152 students</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <div className="hidden sm:flex flex-col items-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-medium text-primary">View Problem</span>
                    <span className="text-[10px] text-muted-foreground">Click to enter sandbox</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>

            {/* Hover background effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
    );
}
