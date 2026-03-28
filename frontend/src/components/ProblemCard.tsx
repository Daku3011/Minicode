import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ChevronRight, CloudIcon, Zap, Target, Star } from "lucide-react";

interface Problem {
    id: number;
    title: string;
    difficulty: string;
    description?: string;
    points?: number;
}

const difficultyVariants = {
    Easy: "success",
    Medium: "warning",
    Hard: "destructive",
} as const;

export default function ProblemCard({ problem }: { problem: Problem }) {
    const points = problem.points || (problem.difficulty === "Easy" ? 150 : problem.difficulty === "Medium" ? 300 : 500);

    return (
        <div className="group relative glass rounded-[2.5rem] p-8 md:p-10 transition-all hover:scale-[1.01] hover:shadow-atmospheric no-border-separation">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4">
                        <Badge 
                            variant="secondary"
                            className="bg-primary/10 text-primary border-none font-mono text-[10px] uppercase tracking-widest px-3 py-1"
                        >
                            {problem.difficulty}
                        </Badge>
                        <div className="flex items-center gap-2 text-foreground/40 text-[10px] font-mono font-bold uppercase tracking-[0.2em]">
                            <Target className="w-3.5 h-3.5 text-primary" />
                            <span className="tabular-nums">{points} XP</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Link href={`/problems/${problem.id}`}>
                            <h4 className="text-2xl md:text-3xl font-bold text-foreground group-hover:text-primary transition-colors cursor-pointer tracking-tightest leading-tight">
                                {problem.title}
                            </h4>
                        </Link>
                        <p className="text-foreground/50 text-base leading-relaxed max-w-2xl font-medium">
                            {problem.description || `Engage with advanced engineering systems. Implement complex logic and receive high-fidelity AI mentoring in real-time.`}
                        </p>
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                        <div className="flex items-center gap-2 text-foreground/30 text-[10px] font-mono font-bold uppercase tracking-widest">
                            <CloudIcon className="w-4 h-4" />
                            <span>V4 ENGINE PROVISIONED</span>
                        </div>
                        <div className="w-1.5 h-1.5 bg-white/5 rounded-full" />
                        <div className="flex items-center gap-2 text-foreground/30 text-[10px] font-mono font-bold uppercase tracking-widest">
                            <Star className="w-4 h-4 text-primary/40" />
                            <span className="tabular-nums">4.9 RATIO</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 md:self-center">
                    <button className="level-2 flex items-center gap-3 px-8 py-5 text-foreground/80 rounded-2xl text-sm font-bold transition-all hover:bg-primary/5 hover:text-primary hover:scale-105 active:scale-95 group/btn">
                        <Zap className="w-4 h-4 text-primary group-hover:animate-pulse" />
                        <span className="uppercase tracking-widest">Provision</span>
                    </button>
                    <Link href={`/problems/${problem.id}`}>
                        <button className="flex items-center justify-center w-16 h-16 liquid-gradient text-primary-foreground rounded-2xl hover:scale-110 transition-all shadow-atmospheric light-emission">
                            <ChevronRight className="w-8 h-8" />
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
