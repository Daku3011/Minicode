"use client";

import { Users, Code, Clock, ArrowUpRight } from "lucide-react";
import { clsx } from "clsx";

interface TeamCardProps {
    request: {
        id: number;
        title: string;
        description: string | null;
        desired_roles: string | null;
        required_skills: string | null;
        team_size: number;
        status: string;
        creator: {
            username: string;
            full_name: string | null;
            avatar_url: string | null;
        };
        application_count: number;
        created_at: string;
    };
    onApply?: (id: number) => void;
}

export default function TeamCard({ request, onApply }: TeamCardProps) {
    const skills = request.required_skills
        ? request.required_skills.split(",").map((s) => s.trim())
        : [];

    return (
        <div className="group relative flex flex-col bg-white rounded-xl border border-slate-200 hover:border-violet-300 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md">
            <div className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-violet-50 text-violet-700 border border-violet-200 text-xs font-semibold">
                        <Users className="w-3.5 h-3.5" />
                        {request.team_size} members
                    </div>
                    <span
                        className={clsx(
                            "px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize border",
                            request.status === "open"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                        )}
                    >
                        {request.status}
                    </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 group-hover:text-violet-700 transition-colors leading-tight mb-2">
                    {request.title}
                </h3>

                {request.description && (
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                        {request.description}
                    </p>
                )}

                {request.desired_roles && (
                    <div className="mb-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                            Looking for
                        </span>
                        <p className="text-sm text-slate-700 font-medium">
                            {request.desired_roles}
                        </p>
                    </div>
                )}

                {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {skills.map((skill) => (
                            <span
                                key={skill}
                                className="px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                )}

                <div className="mt-auto pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <Code className="w-3.5 h-3.5" />
                            <span>@{request.creator.username}</span>
                            <span className="text-slate-300">·</span>
                            <Clock className="w-3.5 h-3.5" />
                            <span>{getTimeAgo(request.created_at)}</span>
                        </div>

                        {onApply && request.status === "open" && (
                            <button
                                onClick={() => onApply(request.id)}
                                className="h-10 w-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-violet-600 group-hover:border-violet-600 transition-all"
                            >
                                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function getTimeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}
