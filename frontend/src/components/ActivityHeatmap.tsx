"use client";

import { clsx } from "clsx";
import { useMemo } from "react";

interface ActivityHeatmapProps {
    dates: Record<string, number>;
    className?: string;
}

function getIntensity(count: number, max: number): string {
    if (count === 0) return "bg-slate-100";
    const ratio = count / max;
    if (ratio > 0.75) return "bg-emerald-500";
    if (ratio > 0.5) return "bg-emerald-400";
    if (ratio > 0.25) return "bg-emerald-300";
    return "bg-emerald-200";
}

export default function ActivityHeatmap({ dates, className }: ActivityHeatmapProps) {
    const cells = useMemo(() => {
        const today = new Date();
        const result: { date: string; count: number; day: number }[] = [];
        const maxCount = Math.max(...Object.values(dates), 1);

        for (let i = 51; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i * 7);
            for (let day = 0; day < 7; day++) {
                const date = new Date(d);
                date.setDate(d.getDate() + day);
                if (date > today) continue;
                const key = date.toISOString().split("T")[0];
                result.push({
                    date: key,
                    count: dates[key] || 0,
                    day: date.getDay(),
                });
            }
        }
        return { cells: result, maxCount };
    }, [dates]);

    const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

    return (
        <div className={clsx("overflow-x-auto", className)}>
            <div className="inline-flex gap-1">
                <div className="flex flex-col gap-1 pr-2 pt-6">
                    {dayLabels.map((label, i) => (
                        <div key={i} className="h-3 text-[10px] text-slate-400 leading-3">
                            {label}
                        </div>
                    ))}
                </div>
                <div className="flex gap-1">
                    {Array.from({ length: 52 }, (_, week) => (
                        <div key={week} className="flex flex-col gap-1">
                            {Array.from({ length: 7 }, (_, day) => {
                                const idx = week * 7 + day;
                                const cell = cells.cells[idx];
                                if (!cell) return <div key={day} className="w-3 h-3" />;
                                return (
                                    <div
                                        key={day}
                                        className={clsx(
                                            "w-3 h-3 rounded-sm transition-colors",
                                            getIntensity(cell.count, cells.maxCount)
                                        )}
                                        title={`${cell.date}: ${cell.count} submissions`}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-slate-100" />
                <div className="w-3 h-3 rounded-sm bg-emerald-200" />
                <div className="w-3 h-3 rounded-sm bg-emerald-300" />
                <div className="w-3 h-3 rounded-sm bg-emerald-400" />
                <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                <span>More</span>
            </div>
        </div>
    );
}
