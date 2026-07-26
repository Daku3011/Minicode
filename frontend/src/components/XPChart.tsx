"use client";

import { useMemo } from "react";
import { clsx } from "clsx";

interface XPChartProps {
    data: { month: string; xp_earned: number }[];
    className?: string;
}

export default function XPChart({ data, className }: XPChartProps) {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return null;

        const points = data.map((d) => ({
            label: d.month,
            value: d.xp_earned,
        }));

        const values = points.map((p) => p.value);
        const max = Math.max(...values, 1);
        const min = Math.min(...values, 0);
        const range = max - min || 1;

        const WIDTH = 400;
        const HEIGHT = 160;
        const PADDING = { top: 16, right: 16, bottom: 32, left: 8 };
        const chartW = WIDTH - PADDING.left - PADDING.right;
        const chartH = HEIGHT - PADDING.top - PADDING.bottom;

        const xStep = chartW / (points.length - 1 || 1);

        const linePath = points
            .map((p, i) => {
                const x = PADDING.left + i * xStep;
                const y = PADDING.top + chartH - ((p.value - min) / range) * chartH;
                return `${i === 0 ? "M" : "L"}${x},${y}`;
            })
            .join(" ");

        const areaPath = `${linePath} L${PADDING.left + (points.length - 1) * xStep},${PADDING.top + chartH} L${PADDING.left},${PADDING.top + chartH} Z`;

        const ticks = points.filter((_, i) => {
            if (points.length <= 6) return true;
            return i % Math.ceil(points.length / 6) === 0 || i === points.length - 1;
        });

        return { points, linePath, areaPath, ticks, max, chartW, chartH, PADDING, WIDTH, HEIGHT };
    }, [data]);

    if (!chartData) {
        return (
            <div className={clsx("text-center py-8 text-slate-400 text-sm", className)}>
                No XP history yet.
            </div>
        );
    }

    return (
        <div className={clsx("overflow-x-auto", className)}>
            <svg
                viewBox={`0 0 ${chartData.WIDTH} ${chartData.HEIGHT}`}
                className="w-full max-w-full"
                style={{ minWidth: Math.max(200, chartData.points.length * 40) }}
            >
                <defs>
                    <linearGradient id="xp-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.02" />
                    </linearGradient>
                </defs>

                <path d={chartData.areaPath} fill="url(#xp-gradient)" />
                <path d={chartData.linePath} fill="none" stroke="rgb(59, 130, 246)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                {chartData.points.map((p, i) => {
                    const x = chartData.PADDING.left + i * chartData.chartW / (chartData.points.length - 1 || 1);
                    const y = chartData.PADDING.top + chartData.chartH - ((p.value - Math.min(...chartData.points.map((pt) => pt.value), 0)) / (chartData.max - Math.min(...chartData.points.map((pt) => pt.value), 0) || 1)) * chartData.chartH;
                    return (
                        <circle key={i} cx={x} cy={y} r="3" fill="rgb(59, 130, 246)" className="hover:r-5 transition-all">
                            <title>{`${p.label}: ${p.value} XP`}</title>
                        </circle>
                    );
                })}

                {chartData.ticks.map((tick, i) => {
                    const idx = chartData.points.indexOf(tick);
                    const x = chartData.PADDING.left + idx * chartData.chartW / (chartData.points.length - 1 || 1);
                    return (
                        <text
                            key={i}
                            x={x}
                            y={chartData.HEIGHT - 4}
                            textAnchor="middle"
                            className="text-[10px] fill-slate-400"
                        >
                            {tick.label}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
}
