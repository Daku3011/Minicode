"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Megaphone, Code, Calendar, Link as LinkIcon, X, Plus, Trash2, Bell, Check, CheckCheck } from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface NewsItem {
    id: number;
    title: string;
    content: string;
    news_type: string;
    link: string | null;
    priority: number;
    created_at: string;
    expires_at: string | null;
}

interface Notification {
    id: number;
    title: string;
    message: string;
    notification_type: string;
    is_read: boolean;
    related_url: string | null;
    created_at: string;
    expires_at: string | null;
}

interface NewsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const typeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
    announcement: {
        icon: <Megaphone className="w-4 h-4" />,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        label: "Announcement",
    },
    problem: {
        icon: <Code className="w-4 h-4" />,
        color: "text-indigo-500",
        bg: "bg-indigo-500/10",
        label: "New Problem",
    },
    event: {
        icon: <Calendar className="w-4 h-4" />,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        label: "Event",
    },
    link: {
        icon: <LinkIcon className="w-4 h-4" />,
        color: "text-sky-500",
        bg: "bg-sky-500/10",
        label: "Useful Link",
    },
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

export default function NewsPanel({ isOpen, onClose }: NewsPanelProps) {
    const { user } = useAuth();
    const [news, setNews] = useState<NewsItem[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [showNotificationsTab, setShowNotificationsTab] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [newType, setNewType] = useState("announcement");
    const [newLink, setNewLink] = useState("");
    const [creating, setCreating] = useState(false);

    const isFaculty = user?.role === "faculty" || user?.role === "admin";

    useEffect(() => {
        if (!isOpen) return;
        const fetchData = async () => {
            try {
                const [newsRes, notifRes] = await Promise.all([
                    api.get("/news"),
                    api.get("/notifications")
                ]);
                setNews(newsRes.data);
                setNotifications(notifRes.data);
                
                if (user) {
                    await api.post("/notifications/mark-all-read");
                    await api.post("/notifications/mark-news-read");
                    window.dispatchEvent(new CustomEvent('minicode:notificationsRead'));
                }
            } catch (err) {
                console.error("Failed to fetch data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isOpen, user?.role]);

    const handleCreate = async () => {
        if (!newTitle.trim() || !newContent.trim()) return;
        setCreating(true);
        try {
            const res = await api.post("/news", {
                title: newTitle,
                content: newContent,
                news_type: newType,
                link: newLink || null,
                priority: newType === "event" ? 2 : newType === "problem" ? 1 : 0,
            });
            const newItem: NewsItem = {
                id: res.data.id,
                title: newTitle,
                content: newContent,
                news_type: newType,
                link: newLink || null,
                priority: newType === "event" ? 2 : newType === "problem" ? 1 : 0,
                created_at: new Date().toISOString(),
                expires_at: null,
            };
            setNews((prev) => [newItem, ...prev]);
            setNewTitle("");
            setNewContent("");
            setNewType("announcement");
            setNewLink("");
            setShowCreate(false);
        } catch (err) {
            console.error("Failed to create news:", err);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/news/${id}`);
            setNews((prev) => prev.filter((n) => n.id !== id));
        } catch (err) {
            console.error("Failed to delete news:", err);
        }
    };

    const handleDeleteNotification = async (id: number) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch (err) {
            console.error("Failed to delete notification:", err);
        }
    };

    const handleMarkRead = async (id: number) => {
        try {
            await api.put(`/notifications/${id}`, { is_read: true });
            setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
        }
    };

    return (
        <div 
            className={clsx(
                "fixed inset-0 z-[100] transition-all duration-200 ease-in-out",
                isOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
            )}
        >
            {/* Backdrop Overlay - Pure CSS transition */}
            <div 
                onClick={onClose}
                className={clsx(
                    "fixed inset-0 bg-black/60",
                    isOpen ? "opacity-100 backdrop-blur-sm" : "opacity-0"
                )}
            />

            {/* Sidebar Panel - Pure CSS slide */}
            <div 
                className={clsx(
                    "fixed top-0 right-0 w-80 md:w-96 h-full border-l border-white/10 bg-[#0a0a14] flex flex-col z-[101] shadow-2xl transition-transform duration-75 ease-out",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-white flex items-center gap-2">
                            {showNotificationsTab ? <Bell className="w-4 h-4 text-primary" /> : <Megaphone className="w-4 h-4 text-primary" />}
                            {showNotificationsTab ? "Notifications" : "News & Updates"}
                        </h2>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className={clsx(
                            "text-[10px] px-2 py-1 rounded-full font-bold",
                            isFaculty ? "bg-green-500/30 text-green-400" : "bg-slate-700 text-slate-400"
                        )}>
                            {isFaculty ? "FACULTY" : "STUDENT"}
                        </span>
                        {isFaculty && !showNotificationsTab && (
                            <button
                                onClick={() => setShowCreate(!showCreate)}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                title="Add news item"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={() => setShowNotificationsTab(!showNotificationsTab)}
                            className={clsx(
                                "p-1.5 rounded-lg transition-colors",
                                showNotificationsTab ? "bg-primary text-white" : "text-slate-400 hover:text-white hover:bg-white/10"
                            )}
                            title="Notifications"
                        >
                            <Bell className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Create Form */}
                {showCreate && isFaculty && (
                    <div className="px-4 py-3 border-b border-white/10 space-y-3 bg-white/5">
                        <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Title"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                        <textarea
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            placeholder="Content"
                            rows={2}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                        />
                        <div className="flex gap-2">
                            <select
                                value={newType}
                                onChange={(e) => setNewType(e.target.value)}
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                            >
                                <option value="announcement" className="bg-slate-800">Announcement</option>
                                <option value="link" className="bg-slate-800">Useful Link</option>
                                <option value="event" className="bg-slate-800">Event</option>
                            </select>
                            <input
                                type="text"
                                value={newLink}
                                onChange={(e) => setNewLink(e.target.value)}
                                placeholder="Link (optional)"
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary/50"
                            />
                        </div>
                        <button
                            onClick={handleCreate}
                            disabled={creating || !newTitle.trim() || !newContent.trim()}
                            className={clsx(
                                "w-full py-2 rounded-lg text-sm font-semibold transition-all",
                                creating || !newTitle.trim() || !newContent.trim()
                                    ? "bg-gray-500/50 text-slate-300 cursor-not-allowed"
                                    : "bg-blue-500/50 text-white cursor-pointer hover:bg-blue-600/70"
                            )}
                        >
                            {creating ? "Posting..." : "Post News"}
                        </button>
                    </div>
                )}

                {/* News or Notifications List */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-hide">
                    {loading ? (
                        [1, 2, 3].map((i) => (
                            <div key={i} className="h-24 bg-white/5 rounded-xl border border-white/5" />
                        ))
                    ) : showNotificationsTab ? (
                        notifications.length === 0 ? (
                            <div className="text-center py-10">
                                <Bell className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                                <p className="text-xs text-slate-500">No notifications</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div key={notif.id} 
                                    className={clsx(
                                        "group relative bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 hover:border-white/20 cursor-pointer transition-colors duration-75",
                                        !notif.is_read && "border-l-2 border-l-primary"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <div className="flex items-center gap-1.5">
                                            {!notif.is_read && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            )}
                                            <span className="text-[10px] text-slate-500">{timeAgo(notif.created_at)}</span>
                                        </div>
                                        {isFaculty && (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleDeleteNotification(notif.id);
                                                }}
                                                className="p-1.5 rounded-md bg-rose-500/80 text-white hover:bg-rose-600 transition-all z-10 shadow-lg"
                                                title="Delete notification"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    <h3 className="text-sm font-bold text-white mb-1 line-clamp-1">{notif.title}</h3>
                                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{notif.message}</p>
                                    {notif.related_url && (
                                        <div className="mt-2 flex items-center gap-1 text-[10px] text-white font-medium">
                                            <ExternalLink className="w-3 h-3" />
                                            Open link
                                        </div>
                                    )}
                                </div>
                            ))
                        )
                    ) : news.length === 0 ? (
                        <div className="text-center py-10">
                            <Megaphone className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                            <p className="text-xs text-slate-500">No news yet</p>
                            {isFaculty && (
                                <p className="text-[10px] text-slate-600 mt-1">Click + to add one</p>
                            )}
                        </div>
                    ) : (
                        news.map((item) => {
                            const config = typeConfig[item.news_type] || typeConfig.announcement;
                            const content = (
                                <div className="group/item bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 hover:border-white/20 cursor-pointer transition-colors duration-75">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className={clsx(
                                            "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                                            config.bg, config.color
                                        )}>
                                            {config.icon}
                                            {config.label}
                                        </div>
                                        <span className="text-[10px] text-slate-500 shrink-0">{timeAgo(item.created_at)}</span>
                                    </div>
                                    <h3 className="text-sm font-bold text-white mb-1 line-clamp-2">{item.title}</h3>
                                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{item.content}</p>
                                    {item.link && (
                                        <div className="mt-2 flex items-center gap-1 text-[10px] text-white font-medium">
                                            <ExternalLink className="w-3 h-3" />
                                            Open link
                                        </div>
                                    )}
                                </div>
                            );

                            return (
                                <div key={item.id} className="relative">
                                    {item.link ? (
                                        <Link href={item.link} target="_blank" rel="noopener noreferrer">
                                            {content}
                                        </Link>
                                    ) : (
                                        content
                                    )}
                                    {isFaculty ? (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleDelete(item.id);
                                            }}
                                            className="absolute top-2 right-2 p-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-all z-50 shadow-xl"
                                            title="Delete news item"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    ) : null}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
