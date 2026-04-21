"use client";

export default function InteractiveBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] bg-white w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50" />
            <div className="absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-100/60 blur-3xl" />
            <div className="absolute top-1/3 -left-20 h-[280px] w-[280px] rounded-full bg-cyan-100/50 blur-3xl" />
            <div className="absolute bottom-16 -right-16 h-[320px] w-[320px] rounded-full bg-indigo-100/50 blur-3xl" />
        </div>
    );
}
