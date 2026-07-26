"use client";

import Link from "next/link";
import { ThumbsUp, ThumbsDown, Code2, Clock } from "lucide-react";
import { clsx } from "clsx";

export interface SnippetSummary {
    id: number;
    title: string;
    description?: string;
    language: string;
    tags: string[];
    upvotes: number;
    downvotes: number;
    user_id: number;
    created_at: string;
}

interface SnippetCardProps {
    snippet: SnippetSummary;
}

const languageColors: Record<string, string> = {
    python: "bg-blue-100 text-blue-700 border-blue-200",
    javascript: "bg-amber-100 text-amber-700 border-amber-200",
    typescript: "bg-indigo-100 text-indigo-700 border-indigo-200",
    java: "bg-orange-100 text-orange-700 border-orange-200",
    cpp: "bg-rose-100 text-rose-700 border-rose-200",
    c: "bg-slate-100 text-slate-700 border-slate-200",
    go: "bg-cyan-100 text-cyan-700 border-cyan-200",
    rust: "bg-purple-100 text-purple-700 border-purple-200",
};

function timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

export default function SnippetCard({ snippet }: SnippetCardProps) {
    const langStyle = languageColors[snippet.language] || "bg-gray-100 text-gray-700 border-gray-200";
    const score = snippet.upvotes - snippet.downvotes;

    return (
        <Link href={`/snippets/${snippet.id}`}>
            <div className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-200 hover:shadow-sm transition-all duration-200 h-full">
                <div className="flex items-start justify-between mb-3 gap-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {snippet.title}
                        </h3>
                        {snippet.description && (
                            <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                                {snippet.description}
                            </p>
                        )}
                    </div>
                    <span className={clsx("shrink-0 text-xs font-medium px-2.5 py-1 rounded-md border", langStyle)}>
                        {snippet.language}
                    </span>
                </div>

                {snippet.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {snippet.tags.slice(0, 4).map((tag) => (
                            <span
                                key={tag}
                                className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200"
                            >
                                {tag}
                            </span>
                        ))}
                        {snippet.tags.length > 4 && (
                            <span className="text-xs text-slate-400">+{snippet.tags.length - 4}</span>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            {snippet.upvotes}
                        </span>
                        <span className="flex items-center gap-1">
                            <ThumbsDown className="w-3.5 h-3.5" />
                            {snippet.downvotes}
                        </span>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        {timeAgo(snippet.created_at)}
                    </span>
                </div>
            </div>
        </Link>
    );
}
