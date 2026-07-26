"use client";

import { clsx } from "clsx";
import { Share2, Award } from "lucide-react";

interface PortfolioHeaderProps {
    username: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    level_info: {
        level: number;
        level_name: string;
        xp: number;
        progress_pct: number;
    };
    badges: { id: string; name: string; icon: string; description: string }[];
    member_since: string;
}

export default function PortfolioHeader({
    username,
    full_name,
    avatar_url,
    bio,
    level_info,
    badges,
    member_since,
}: PortfolioHeaderProps) {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `${full_name} - MiniCode Portfolio`,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-blue-500 to-violet-500" />
            <div className="px-6 pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
                    <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-slate-100 flex-shrink-0">
                        {avatar_url ? (
                            <img src={avatar_url} alt={username} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-400 bg-slate-100">
                                {full_name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0 pt-2 sm:pt-0">
                        <h1 className="text-2xl font-bold text-slate-900 truncate">{full_name}</h1>
                        <p className="text-sm text-slate-500">@{username}</p>
                        {bio && <p className="text-sm text-slate-600 mt-1">{bio}</p>}
                    </div>
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
                    >
                        <Share2 className="w-4 h-4" />
                        Share
                    </button>
                </div>

                <div className="flex flex-wrap gap-6 mt-6">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-slate-900">{level_info.level}</p>
                        <p className="text-xs text-slate-500">{level_info.level_name}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-slate-900">{level_info.xp.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">Total XP</p>
                    </div>
                    <div className="flex-1 min-w-[120px]">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Level Progress</span>
                            <span>{level_info.progress_pct}%</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all"
                                style={{ width: `${level_info.progress_pct}%` }}
                            />
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-slate-500">Member since</p>
                        <p className="font-medium text-slate-700 text-sm">
                            {new Date(member_since).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                        </p>
                    </div>
                </div>

                {badges.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                            <Award className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-semibold text-slate-700">Badges ({badges.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {badges.map((badge) => (
                                <div
                                    key={badge.id}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-sm"
                                    title={badge.description}
                                >
                                    <span>{badge.icon}</span>
                                    <span className="text-xs font-medium text-amber-800">{badge.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
