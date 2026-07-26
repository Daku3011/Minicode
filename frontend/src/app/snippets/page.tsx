"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { Search, Plus, Code2, TrendingUp, Filter } from "lucide-react";
import { snippetApi } from "@/lib/snippet-api";
import SnippetCard, { SnippetSummary } from "@/components/SnippetCard";
import { useAuth } from "@/contexts/AuthContext";

const LANGUAGES = [
    "python", "javascript", "typescript", "java", "cpp", "c", "go", "rust",
];

export default function SnippetsPage() {
    const { user } = useAuth();
    const [snippets, setSnippets] = useState<SnippetSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [language, setLanguage] = useState("");
    const [tag, setTag] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [showTrending, setShowTrending] = useState(false);
    const [trending, setTrending] = useState<SnippetSummary[]>([]);

    const fetchSnippets = useCallback(async () => {
        setLoading(true);
        try {
            if (showTrending) {
                const res: any = await snippetApi.trending();
                setTrending(res.data);
            } else {
                const res: any = await snippetApi.list({
                    search: search || undefined,
                    language: language || undefined,
                    tag: tag || undefined,
                    page,
                    per_page: 20,
                });
                setSnippets(res.data.snippets);
                setTotal(res.data.total);
            }
        } catch {}
        setLoading(false);
    }, [search, language, tag, page, showTrending]);

    useEffect(() => {
        fetchSnippets();
    }, [fetchSnippets]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchSnippets();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            <div className="max-w-6xl mx-auto px-4 py-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Code2 className="w-6 h-6 text-blue-600" />
                        <h1 className="text-2xl font-bold text-slate-900">Snippets</h1>
                    </div>
                    <Link
                        href="/snippets/create"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New Snippet
                    </Link>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
                    <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search snippets..."
                                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Language</label>
                            <select
                                value={language}
                                onChange={(e) => { setLanguage(e.target.value); setPage(1); }}
                                className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                                <option value="">All Languages</option>
                                {LANGUAGES.map((l) => (
                                    <option key={l} value={l}>{l}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Tag</label>
                            <input
                                type="text"
                                value={tag}
                                onChange={(e) => { setTag(e.target.value); setPage(1); }}
                                placeholder="Filter by tag..."
                                className="px-3 py-2 border border-slate-200 rounded-lg text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => { setShowTrending(!showTrending); setPage(1); }}
                            className={clsx(
                                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors",
                                showTrending
                                    ? "bg-orange-50 text-orange-700 border-orange-200"
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            )}
                        >
                            <TrendingUp className="w-4 h-4" />
                            Trending
                        </button>
                    </form>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-44 bg-white rounded-xl border border-slate-200 animate-pulse" />
                        ))}
                    </div>
                ) : showTrending ? (
                    trending.length === 0 ? (
                        <div className="text-center py-16 text-slate-400">
                            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No trending snippets</p>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">Trending</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {trending.map((s) => (
                                    <SnippetCard key={s.id} snippet={s} />
                                ))}
                            </div>
                        </>
                    )
                ) : snippets.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <Code2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No snippets found</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {snippets.map((s) => (
                                <SnippetCard key={s.id} snippet={s} />
                            ))}
                        </div>
                        {total > 20 && (
                            <div className="flex justify-center gap-2 mt-8">
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 text-sm border border-slate-200 rounded-lg disabled:opacity-50 bg-white hover:bg-slate-50"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 text-sm text-slate-500">
                                    Page {page}
                                </span>
                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={page * 20 >= total}
                                    className="px-4 py-2 text-sm border border-slate-200 rounded-lg disabled:opacity-50 bg-white hover:bg-slate-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
