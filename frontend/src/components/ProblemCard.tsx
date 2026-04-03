"use client";

import Link from "next/link";
import { ChevronRight, Code2, Zap, Trophy, ArrowUpRight, Cpu } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { clsx } from "clsx";
import { useRef } from "react";

interface Problem {
    id: number;
    title: string;
    difficulty: string;
    description?: string;
    xp_reward?: number;
    subject?: string | null;
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

export default function ProblemCard({ problem }: { problem: Problem }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [3, -3]), { damping: 20, stiffness: 300 });
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-3, 3]), { damping: 20, stiffness: 300 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseXVal = e.clientX - rect.left;
        const mouseYVal = e.clientY - rect.top;

        x.set(mouseXVal / width - 0.5);
        y.set(mouseYVal / height - 0.5);

        mouseX.set(mouseXVal);
        mouseY.set(mouseYVal);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const style = difficultyStyles[problem.difficulty as keyof typeof difficultyStyles] || difficultyStyles.Medium;
    const xp = problem.xp_reward || (problem.difficulty === "Easy" ? 150 : problem.difficulty === "Medium" ? 300 : 500);

    return (
        <div 
            className="perspective-1000 w-full"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            ref={cardRef}
        >
            <motion.div 
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="group relative h-full w-full"
            >
                {/* 3D Depth Card Shadow */}
                <div className="absolute -inset-1 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                {/* Main Glass Card */}
                <div className="relative glass-card rounded-[2.5rem] p-10 h-full flex flex-col justify-between overflow-hidden border border-white/10 group-hover:border-white/20 transition-all duration-700">
                    
                    {/* Reflective Surface Mirror (Mouse Follow) */}
                    <motion.div 
                        className="absolute inset-0 z-0 opacity-0 group-hover:opacity-10 pointer-events-none"
                        style={{
                            background: useTransform(
                                [mouseX, mouseY],
                                ([mx, my]) => `radial-gradient(600px circle at ${mx}px ${my}px, rgba(255,255,255,0.4), transparent 40%)`
                            )
                        }}
                    />

                    {/* Glowing Accent Particles */}
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-[40px] group-hover:bg-primary/10 transition-all duration-700" />
                    
                    <div className="relative z-10">
                        {/* Header: Difficulty & Aura */}
                        <div className="flex items-center justify-between mb-8">
                            <div className={clsx(
                                "flex items-center gap-2.5 px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] shadow-lg transition-all duration-500", 
                                style.bg, style.text, style.border, style.glow
                            )}>
                                <div className={clsx("w-2 h-2 rounded-full", style.dot)} />
                                {problem.difficulty}
                            </div>
                            
                            {problem.subject && (
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 backdrop-blur-sm">
                                    <Cpu className="w-3.5 h-3.5" />
                                    {problem.subject.replace("-", " ")}
                                </div>
                            )}
                        </div>

                        {/* Title Section (3D Pop) */}
                        <Link href={`/problems/${problem.id}`}>
                            <h4 className="text-3xl font-black text-white mb-4 tracking-tighter leading-tight group-hover:text-primary transition-colors line-clamp-2" style={{ transform: "translateZ(30px)" }}>
                                {problem.title}
                            </h4>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed mb-10 line-clamp-3 font-medium opacity-80 group-hover:opacity-100 transition-opacity" style={{ transform: "translateZ(20px)" }}>
                            {problem.description || `Architect a high-performance solution for ${problem.title}. Optimize for quantum consistency and real-world scalability.`}
                        </p>
                    </div>

                    {/* Footer: XP & Weightless Button */}
                    <div className="flex items-center justify-between pt-8 border-t border-white/5 relative z-10 mt-auto">
                        <div className="flex items-center gap-4 py-1" style={{ transform: "translateZ(25px)" }}>
                            <div className="p-3 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl ring-1 ring-white/5 shadow-inner">
                                <Trophy className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none mb-1.5">Bounty</p>
                                <p className="text-lg font-black text-white tracking-tight">{xp} <span className="text-primary text-xs ml-0.5">XP</span></p>
                            </div>
                        </div>

                        <Link 
                            href={`/problems/${problem.id}`}
                            style={{ transform: "translateZ(40px)" }}
                            className={clsx(
                                "flex items-center gap-2 px-8 py-3.5 bg-white/5 hover:bg-primary text-white rounded-2xl text-sm font-black transition-all group/btn",
                                "ring-1 ring-white/10 hover:ring-primary/40 shadow-xl group-hover:shadow-primary/20"
                            )}
                        >
                            <span className="uppercase tracking-[0.1em]">Solve Matrix</span>
                            <ArrowUpRight className="w-4.5 h-4.5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-300" />
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

