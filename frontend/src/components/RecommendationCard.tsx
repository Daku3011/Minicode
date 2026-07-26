"use client";

import Link from "next/link";
import { ArrowUpRight, Trophy, Cpu } from "lucide-react";
import { clsx } from "clsx";

interface Recommendation {
    id: number;
    title: string;
    difficulty: string;
    subject: string | null;
    xp_reward: number;
    level: number;
}

interface RecommendationCardProps {
    recommendation: Recommendation;
}

const difficultyStyles: Record<string, { text: string; bg: string; border: string; dot: string }> = {
    Easy: { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500" },
    Medium: { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500" },
    Hard: { text: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", dot: "bg-rose-500" },
};

export default function RecommendationCard({ recommendation }: RecommendationCardProps) {
    const style = difficultyStyles[recommendation.difficulty] || difficultyStyles.Medium;

    return (
        <Link
            href={`/problems/${recommendation.id}`}
            className="block group"
        >
            <div className="flex items-center gap-4 p-4 rounded-xl border border-blue-100 bg-white hover:border-blue-300 hover:shadow-sm transition-all">
                <div className={clsx("flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border", style.bg, style.border)}>
                    <div className={clsx("w-2 h-2 rounded-full", style.dot)} />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                        {recommendation.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                        <span className={clsx("text-xs font-medium", style.text)}>
                            {recommendation.difficulty}
                        </span>
                        {recommendation.subject && (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                <Cpu className="w-3 h-3" />
                                {recommendation.subject.replace(/-/g, " ")}
                            </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-emerald-600">
                            <Trophy className="w-3 h-3" />
                            {recommendation.xp_reward} XP
                        </span>
                    </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors flex-shrink-0" />
            </div>
        </Link>
    );
}
