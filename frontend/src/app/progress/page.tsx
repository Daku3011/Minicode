"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Bell,
    BookOpen,
    CheckCircle2,
    Circle,
    Code2,
    Flame,
    Lock,
    Rocket,
    Shield,
    Sparkles,
    Star,
    Target,
    Trophy,
    UserCheck,
    Zap,
    Award,
    Play,
    LogIn,
    Crown,
    Swords,
    type LucideIcon,
} from "lucide-react";
import { clsx } from "clsx";
import { useAuth, type User } from "@/contexts/AuthContext";
import { userApi } from "@/lib/api";

interface QuestView {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    xp: number;
    status: "locked" | "in_progress" | "completed" | "rewarded";
    progress: number;
    metricLabel: string;
    currentValue: number;
    targetValue: number;
    tips: string[];
}

interface QuestDefinition {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    xp: number;
    target: number;
    metricLabel: string;
    tips: string[];
    requires?: string[];
    evaluate: (profile: User) => number;
}

interface ToastNotice {
    id: string;
    title: string;
    message: string;
}

const questDefinitions: QuestDefinition[] = [
    {
        id: "identity-sync",
        title: "Identity Sync",
        description: "Authenticate your account and unlock your command dashboard.",
        icon: UserCheck,
        xp: 10,
        target: 1,
        metricLabel: "Connected account",
        tips: [
            "GitHub login unlocks student workflows faster.",
            "Staff can continue using faculty credentials.",
        ],
        evaluate: () => 1,
    },
    {
        id: "first-submission",
        title: "First Transmission",
        description: "Submit your first solution to activate AI judging.",
        icon: Rocket,
        xp: 25,
        target: 1,
        metricLabel: "Submission",
        requires: ["identity-sync"],
        tips: [
            "Use Start Problem to generate your private repo quickly.",
            "Even a pending submission counts toward this milestone.",
        ],
        evaluate: (profile) => profile.recentSubmissions?.length || 0,
    },
    {
        id: "first-accepted",
        title: "Green Check Unlocked",
        description: "Get your first accepted problem and earn mastery XP.",
        icon: Code2,
        xp: 35,
        target: 1,
        metricLabel: "Solved problem",
        requires: ["first-submission"],
        tips: [
            "Public tests help you catch edge cases before submit.",
            "Feedback quality often predicts acceptance quality.",
        ],
        evaluate: (profile) => profile.stats?.solved || 0,
    },
    {
        id: "streak-starter",
        title: "Momentum Engine",
        description: "Build a two-day coding streak to enter flow mode.",
        icon: Flame,
        xp: 25,
        target: 2,
        metricLabel: "Day streak",
        requires: ["first-accepted"],
        tips: [
            "One short daily solve is enough to keep momentum alive.",
            "Consistency beats intensity in ranking growth.",
        ],
        evaluate: (profile) => profile.stats?.streak || 0,
    },
    {
        id: "xp-200",
        title: "Power Reserve",
        description: "Reach 200 total XP and unlock stronger problem sets.",
        icon: Zap,
        xp: 40,
        target: 200,
        metricLabel: "Total XP",
        requires: ["first-accepted"],
        tips: [
            "Harder problems accelerate XP growth.",
            "Event participation can add bonus points.",
        ],
        evaluate: (profile) => profile.stats?.xp || 0,
    },
    {
        id: "triple-solver",
        title: "Triple Solver",
        description: "Solve three problems to stabilize your rank climb.",
        icon: Swords,
        xp: 60,
        target: 3,
        metricLabel: "Solved problems",
        requires: ["first-accepted"],
        tips: [
            "Pick one easy and two medium tasks for a balanced run.",
            "Review mentor feedback after each accepted solution.",
        ],
        evaluate: (profile) => profile.stats?.solved || 0,
    }
];

const levels = [
    { name: "Explorer", xpRange: [0, 150], icon: Sparkles, color: "from-blue-500 to-cyan-500" },
    { name: "Adventurer", xpRange: [151, 400], icon: Shield, color: "from-indigo-500 to-blue-700" },
    { name: "Master", xpRange: [401, 9999], icon: Crown, color: "from-amber-500 to-orange-500" }
];

export default function ProgressPage() {
    const { user, loading, refreshUser } = useAuth();
    const [profile, setProfile] = useState<User | null>(null);
    const [claimedQuestIds, setClaimedQuestIds] = useState<string[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);
    const [notices, setNotices] = useState<ToastNotice[]>([]);

    const addNotice = (title: string, message: string) => {
        const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        setNotices((prev) => [...prev, { id, title, message }]);
        setTimeout(() => {
            setNotices((prev) => prev.filter((n) => n.id !== id));
        }, 5200);
    };

    const loadDynamicProgress = useCallback(async () => {
        if (!user) {
            setProfile(null);
            setClaimedQuestIds([]);
            return;
        }

        setIsFetching(true);
        try {
            const [profileResponse, claimResponse] = await Promise.all([
                userApi.me(),
                userApi.questClaims(),
            ]);

            setProfile(profileResponse.data);
            setClaimedQuestIds(claimResponse.data?.claimed_ids || []);
        } catch (error) {
            console.error("Failed to load dynamic progress data", error);
        } finally {
            setIsFetching(false);
        }
    }, [user]);

    useEffect(() => {
        loadDynamicProgress();
    }, [loadDynamicProgress]);

    const completedByLogic = useMemo(() => {
        if (!profile) return new Set<string>();

        const completed = new Set<string>();
        questDefinitions.forEach((quest) => {
            const unlocked = !quest.requires || quest.requires.every((req) => completed.has(req));
            if (!unlocked) return;
            const current = quest.evaluate(profile);
            if (current >= quest.target) {
                completed.add(quest.id);
            }
        });
        return completed;
    }, [profile]);

    const quests = useMemo<QuestView[]>(() => {
        if (!profile) {
            return questDefinitions.map((quest, idx) => ({
                id: quest.id,
                title: quest.title,
                description: quest.description,
                icon: quest.icon,
                xp: quest.xp,
                status: idx === 0 ? "in_progress" : "locked",
                progress: 0,
                metricLabel: quest.metricLabel,
                currentValue: 0,
                targetValue: quest.target,
                tips: quest.tips,
            }));
        }

        const completeSet = new Set<string>();
        return questDefinitions.map((quest) => {
            const unlocked = !quest.requires || quest.requires.every((req) => completeSet.has(req));
            const currentValue = quest.evaluate(profile);
            const progress = Math.max(0, Math.min(100, (currentValue / quest.target) * 100));
            const completed = unlocked && currentValue >= quest.target;
            if (completed) completeSet.add(quest.id);

            const claimed = claimedQuestIds.includes(quest.id);
            const status: QuestView["status"] = !unlocked
                ? "locked"
                : completed
                    ? claimed
                        ? "rewarded"
                        : "completed"
                    : "in_progress";

            return {
                id: quest.id,
                title: quest.title,
                description: quest.description,
                icon: quest.icon,
                xp: quest.xp,
                status,
                progress,
                metricLabel: quest.metricLabel,
                currentValue,
                targetValue: quest.target,
                tips: quest.tips,
            };
        });
    }, [profile, claimedQuestIds]);

    useEffect(() => {
        if (!user || !profile || isClaiming || isFetching) return;

        const claimable = quests.filter(
            (quest) => quest.status === "completed" && completedByLogic.has(quest.id)
        );
        if (claimable.length === 0) return;

        let cancelled = false;
        const claimAll = async () => {
            setIsClaiming(true);
            try {
                for (const quest of claimable) {
                    if (cancelled) break;
                    const response = await userApi.claimQuestReward(quest.id);
                    if (response.data?.status === "claimed") {
                        addNotice(
                            "Quest Completed",
                            `${quest.title} completed. +${response.data.xp_awarded} XP added to your account.`
                        );
                    }
                }

                if (!cancelled) {
                    await Promise.all([refreshUser(), loadDynamicProgress()]);
                }
            } catch (error) {
                console.error("Failed to claim quest reward", error);
            } finally {
                if (!cancelled) setIsClaiming(false);
            }
        };

        claimAll();

        return () => {
            cancelled = true;
        };
    }, [user, profile, quests, completedByLogic, isClaiming, isFetching, refreshUser, loadDynamicProgress]);

    const totalXP = profile?.stats?.xp || 0;
    const streak = profile?.stats?.streak || 0;
    const solved = profile?.stats?.solved || 0;
    const completedQuests = quests.filter((q) => q.status === "rewarded").length;
    const pendingRewards = quests.filter((q) => q.status === "completed").length;
    const totalQuestBonus = questDefinitions
        .filter((q) => claimedQuestIds.includes(q.id))
        .reduce((acc, q) => acc + q.xp, 0);

    const currentLevel = useMemo(() => {
        return levels.find(level => 
            totalXP >= level.xpRange[0] && totalXP <= level.xpRange[1]
        ) || levels[0];
    }, [totalXP]);

    const nextLevel = useMemo(() => {
        const currentIndex = levels.findIndex(l => l.name === currentLevel.name);
        return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
    }, [currentLevel]);

    const progressToNextLevel = useMemo(() => {
        if (!nextLevel) return 100;
        const range = nextLevel.xpRange[0] - currentLevel.xpRange[0];
        const current = totalXP - currentLevel.xpRange[0];
        return Math.min((current / range) * 100, 100);
    }, [totalXP, currentLevel, nextLevel]);

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,#e0f2fe_0%,#f8fafc_35%,#eef2ff_100%)] text-slate-900 overflow-x-hidden relative">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-[5%] top-[8%] h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
                <div className="absolute right-[10%] top-[20%] h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />
                <div className="absolute left-[32%] bottom-[15%] h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl" />
            </div>

            <div className="fixed top-24 right-4 z-50 space-y-3">
                {notices.map((notice) => (
                    <motion.div
                        key={notice.id}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 24 }}
                        className="w-80 rounded-2xl border border-emerald-200 bg-white/95 backdrop-blur px-4 py-3 shadow-lg"
                    >
                        <p className="text-xs font-black uppercase tracking-wider text-emerald-600">{notice.title}</p>
                        <p className="text-sm text-slate-700 mt-1">{notice.message}</p>
                    </motion.div>
                ))}
            </div>

            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-blue-100 shadow-sm">
                <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Adventure Progress</h1>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">MiniCode Learning Odyssey</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-wide">
                                Live sync active
                            </div>
                        ) : (
                            <Link href="/login" className="px-6 py-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 transition-all flex items-center gap-2">
                                <Play className="w-4 h-4" />
                                Login to Sync
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Stats */}
            <section className="relative py-16 px-6">
                <div className="max-w-[1800px] mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[3rem] border border-blue-100 p-12 shadow-xl shadow-blue-100/30 relative overflow-hidden"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            <div className="lg:col-span-4 flex flex-col items-center text-center">
                                <div className="relative mb-8">
                                    <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-2xl shadow-blue-500/40 border-4 border-white">
                                        <div className="text-center">
                                            <p className="text-4xl font-black text-white">{totalXP}</p>
                                            <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">XP</p>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-white border-2 border-blue-200 shadow-lg">
                                        <div className="flex items-center gap-2">
                                            <currentLevel.icon className="w-5 h-5 text-blue-600" />
                                            <span className="text-sm font-black text-slate-900 uppercase">{currentLevel.name}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full max-w-xs space-y-3">
                                    <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
                                        <span>Progress to {nextLevel?.name || "MAX"}</span>
                                        <span>{Math.round(progressToNextLevel)}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressToNextLevel}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                                {[
                                    { label: "Quests Rewarded", value: `${completedQuests}/${quests.length}`, icon: Target, color: "blue" },
                                    { label: "Current Streak", value: `${streak} days`, icon: Star, color: "orange" },
                                    { label: "Problems Solved", value: `${solved}`, icon: Code2, color: "green" },
                                    { label: "Quest Bonus XP", value: `${totalQuestBonus}`, icon: Award, color: "purple" }
                                ].map((stat, i) => (
                                    <motion.div 
                                        key={stat.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group"
                                    >
                                        <div className={clsx(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center mb-4",
                                            stat.color === "blue" && "bg-blue-100 text-blue-600",
                                            stat.color === "orange" && "bg-orange-100 text-orange-600",
                                            stat.color === "green" && "bg-green-100 text-green-600",
                                            stat.color === "purple" && "bg-purple-100 text-purple-600"
                                        )}>
                                            <stat.icon className="w-6 h-6" />
                                        </div>
                                        <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{stat.label}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {!user && !loading && (
                <section className="px-6 pb-10">
                    <div className="max-w-[1800px] mx-auto rounded-[2.5rem] border border-blue-200 bg-white/80 backdrop-blur p-8 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign in to unlock auto-tracking</h2>
                            <p className="text-slate-600 mt-2">After login, quests complete automatically from real submissions, streaks, and XP milestones.</p>
                        </div>
                        <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-wider hover:bg-blue-700 transition-colors">
                            <LogIn className="w-4 h-4" />
                            Continue to Login
                        </Link>
                    </div>
                </section>
            )}

            {/* Quests */}
            <section className="py-16 px-6">
                <div className="max-w-[1800px] mx-auto">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="h-1.5 w-12 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full" />
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Quest Pulse</h2>
                        {(isFetching || isClaiming) && (
                            <div className="ml-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wide">
                                <Bell className="w-3 h-3" />
                                Syncing
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {quests.map((quest, i) => (
                            <motion.div
                                key={quest.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.15 }}
                                className={clsx(
                                    "rounded-[2.5rem] border overflow-hidden transition-all duration-500",
                                    quest.status === "locked" && "bg-slate-50 border-slate-200 opacity-60",
                                    quest.status === "in_progress" && "bg-white border-blue-200 shadow-lg shadow-blue-100/30",
                                    quest.status === "completed" && "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200",
                                    quest.status === "rewarded" && "bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-200"
                                )}
                            >
                                <div className="p-8 border-b border-slate-100">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-5">
                                            <div className={clsx(
                                                "w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg",
                                                quest.status === "locked" && "bg-slate-200",
                                                quest.status === "in_progress" && "bg-gradient-to-br from-blue-500 to-blue-700 shadow-blue-500/40",
                                                quest.status === "completed" && "bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-500/40",
                                                quest.status === "rewarded" && "bg-gradient-to-br from-indigo-500 to-blue-700 shadow-indigo-500/40"
                                            )}>
                                                {quest.status === "locked" ? (
                                                    <Lock className="w-8 h-8 text-slate-400" />
                                                ) : quest.status === "completed" || quest.status === "rewarded" ? (
                                                    <CheckCircle2 className="w-10 h-10 text-white" />
                                                ) : (
                                                    <quest.icon className="w-10 h-10 text-white" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{quest.title}</h3>
                                                <p className="text-sm text-slate-500 font-medium mt-1">{quest.description}</p>
                                            </div>
                                        </div>
                                        <div className="px-5 py-2 rounded-2xl bg-blue-50 border border-blue-200">
                                            <p className="text-lg font-black text-blue-600">+{quest.xp} XP</p>
                                        </div>
                                    </div>

                                    {quest.status !== "locked" && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-500">
                                                <span>{quest.metricLabel}</span>
                                                <span>{Math.min(quest.currentValue, quest.targetValue)} / {quest.targetValue}</span>
                                            </div>
                                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                                <div
                                                    className={clsx(
                                                        "h-full rounded-full transition-all duration-500",
                                                        quest.status === "rewarded" ? "bg-gradient-to-r from-indigo-500 to-blue-600" : "bg-gradient-to-r from-emerald-500 to-teal-500"
                                                    )}
                                                    style={{ width: `${quest.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-8 pt-6 space-y-3 bg-white/60">
                                    {quest.tips.map((tip, tipIndex) => (
                                        <div key={`${quest.id}-tip-${tipIndex}`} className="flex items-start gap-3">
                                            {quest.status === "rewarded" ? (
                                                <CheckCircle2 className="w-4 h-4 text-indigo-600 mt-0.5" />
                                            ) : (
                                                <Circle className="w-4 h-4 text-slate-400 mt-0.5" />
                                            )}
                                            <p className="text-sm text-slate-600">{tip}</p>
                                        </div>
                                    ))}

                                    <div className="pt-2">
                                        <span
                                            className={clsx(
                                                "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                                                quest.status === "locked" && "bg-slate-100 text-slate-500 border-slate-200",
                                                quest.status === "in_progress" && "bg-blue-50 text-blue-700 border-blue-200",
                                                quest.status === "completed" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                                                quest.status === "rewarded" && "bg-indigo-50 text-indigo-700 border-indigo-200"
                                            )}
                                        >
                                            {quest.status === "locked" && "Locked"}
                                            {quest.status === "in_progress" && "In Progress"}
                                            {quest.status === "completed" && "Reward Pending"}
                                            {quest.status === "rewarded" && "XP Claimed"}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-6 pb-14">
                <div className="max-w-[1800px] mx-auto rounded-[2.5rem] border border-slate-200 bg-white/90 p-8 lg:p-10 shadow-sm">
                    <div className="flex items-start gap-4">
                        <BookOpen className="w-6 h-6 text-blue-600 mt-1" />
                        <div>
                            <h3 className="text-2xl font-black text-slate-900">How Dynamic Tracking Works</h3>
                            <p className="text-slate-600 mt-2">Your quests sync from real activity: submissions, accepted solutions, streak, and XP. When a quest is completed, quest XP is claimed automatically once and reflected in your account stats.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
                        {[
                            { label: "Completed & Claimed", value: completedQuests, icon: Trophy },
                            { label: "Pending Rewards", value: pendingRewards, icon: Bell },
                            { label: "Quest Definitions", value: questDefinitions.length, icon: Sparkles },
                        ].map((item) => (
                            <div key={item.label} className="rounded-2xl border border-slate-200 p-5 bg-slate-50">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">{item.label}</p>
                                    <item.icon className="w-4 h-4 text-blue-600" />
                                </div>
                                <p className="text-3xl font-black text-slate-900 mt-3">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-blue-100">
                <div className="max-w-[1800px] mx-auto text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Every master was once a beginner • Your adventure starts now
                    </p>
                </div>
            </footer>
        </div>
    );
}