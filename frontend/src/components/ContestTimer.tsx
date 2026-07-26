"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";

interface ContestTimerProps {
    startTime: string;
    endTime: string;
    onEnd?: () => void;
}

export default function ContestTimer({ startTime, endTime, onEnd }: ContestTimerProps) {
    const [timeStr, setTimeStr] = useState("");
    const [status, setStatus] = useState<"upcoming" | "active" | "ended">("upcoming");

    useEffect(() => {
        const tick = () => {
            const now = new Date().getTime();
            const start = new Date(startTime).getTime();
            const end = new Date(endTime).getTime();

            if (now < start) {
                setStatus("upcoming");
                const diff = start - now;
                setTimeStr(formatDuration(diff));
            } else if (now >= start && now < end) {
                setStatus("active");
                const diff = end - now;
                setTimeStr(formatDuration(diff));
                if (diff <= 0 && onEnd) onEnd();
            } else {
                setStatus("ended");
                setTimeStr("Ended");
            }
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [startTime, endTime, onEnd]);

    const colorClass =
        status === "active"
            ? "text-emerald-600"
            : status === "upcoming"
              ? "text-amber-600"
              : "text-red-600";

    const label =
        status === "upcoming" ? "Starts in" : status === "active" ? "Remaining" : "Contest";

    return (
        <div className="flex flex-col items-center">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                {label}
            </span>
            <span className={clsx("text-2xl md:text-3xl font-black font-mono tabular-nums", colorClass)}>
                {timeStr}
            </span>
        </div>
    );
}

function formatDuration(ms: number): string {
    if (ms <= 0) return "00:00:00";
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
