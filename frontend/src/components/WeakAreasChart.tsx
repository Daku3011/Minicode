"use client";

import { clsx } from "clsx";

interface WeakArea {
    subject: string;
    total_attempts: number;
    accepted: number;
    pass_rate: number;
    weakness_score: number;
}

interface WeakAreasChartProps {
    data: WeakArea[];
    className?: string;
}

const SUBJECT_COLORS: Record<string, string> = {
    "data-structures": "bg-blue-500",
    algorithms: "bg-violet-500",
    dp: "bg-rose-500",
    graphs: "bg-amber-500",
    strings: "bg-emerald-500",
    math: "bg-cyan-500",
    "number-theory": "bg-indigo-500",
    combinatorics: "bg-pink-500",
    geometry: "bg-teal-500",
    "game-theory": "bg-orange-500",
    blockchain: "bg-purple-500",
};

function getBarColor(subject: string) {
    return SUBJECT_COLORS[subject] || "bg-slate-400";
}

function getSubjectLabel(subject: string) {
    return subject
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function WeakAreasChart({ data, className }: WeakAreasChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className={clsx("text-center py-8 text-slate-400 text-sm", className)}>
                No submission data yet. Start solving problems to see your weak areas.
            </div>
        );
    }

    const maxWeakness = Math.max(...data.map((d) => d.weakness_score), 1);

    return (
        <div className={clsx("space-y-3", className)}>
            {data.slice(0, 8).map((item) => (
                <div key={item.subject} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700 truncate">
                            {getSubjectLabel(item.subject)}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 ml-2 whitespace-nowrap">
                            {item.accepted}/{item.total_attempts} · {item.pass_rate}%
                        </span>
                    </div>
                    <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={clsx(
                                "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                                getBarColor(item.subject)
                            )}
                            style={{
                                width: `${(item.weakness_score / maxWeakness) * 100}%`,
                                opacity: item.weakness_score > 50 ? 0.85 : 0.5,
                            }}
                        />
                        {item.weakness_score > 50 && (
                            <div
                                className="absolute inset-y-0 left-0 rounded-full bg-red-400/20"
                                style={{
                                    width: `${(item.weakness_score / maxWeakness) * 100}%`,
                                }}
                            />
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
