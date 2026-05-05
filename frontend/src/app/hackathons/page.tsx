"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
    Calendar, Clock, Search, Trophy, ArrowUpRight,
    MessageSquare, Send, Sparkles, ExternalLink, Bot, User
} from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";
import ReactMarkdown from "react-markdown";

interface Hackathon {
    id: number;
    title: string;
    description: string | null;
    url: string;
    platform: string;
    status: string;
    cover_image: string | null;
    start_date: string | null;
    end_date: string | null;
    registration_url: string | null;
}

interface ChatMessage {
    sender: "user" | "ai";
    text: string;
}

export default function HackathonsPage() {
    const [hackathons, setHackathons] = useState<Hackathon[]>([]);
    const [loading, setLoading] = useState(true);
    const [activePlatform, setActivePlatform] = useState<string>("all");
    const [activeStatus, setActiveStatus] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    // AI Chatbot States
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { sender: "ai", text: "Hello! I am your AI Hackathon Assistant. Ask me anything about ongoing competitions, preparation, or registration steps!" }
    ]);
    const [chatInput, setChatInput] = useState("");
    const [sendingChat, setSendingChat] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Scalable Chatbot Box Resizing State
    const [dimensions, setDimensions] = useState({ width: 400, height: 520 });
    const [isResizing, setIsResizing] = useState<"top" | "left" | "top-left" | null>(null);
    const resizerRef = useRef({ startX: 0, startY: 0, startWidth: 0, startHeight: 0 });

    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            const { startX, startY, startWidth, startHeight } = resizerRef.current;
            let newWidth = startWidth;
            let newHeight = startHeight;

            if (isResizing === "top" || isResizing === "top-left") {
                const deltaY = startY - e.clientY;
                newHeight = Math.max(400, Math.min(window.innerHeight * 0.9, startHeight + deltaY));
            }

            if (isResizing === "left" || isResizing === "top-left") {
                const deltaX = startX - e.clientX;
                newWidth = Math.max(320, Math.min(window.innerWidth * 0.9, startWidth + deltaX));
            }

            setDimensions({ width: newWidth, height: newHeight });
        };

        const handleMouseUp = () => {
            setIsResizing(null);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isResizing]);

    useEffect(() => {
        fetchHackathons();
    }, []);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatMessages]);

    const fetchHackathons = async () => {
        try {
            const response = await api.get("/hackathons");
            setHackathons(response.data);
        } catch (error) {
            console.error("Failed to fetch hackathons:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || sendingChat) return;

        const userQuery = chatInput.trim();
        setChatMessages(prev => [...prev, { sender: "user", text: userQuery }]);
        setChatInput("");
        setSendingChat(true);

        try {
            const response = await api.post("/hackathons/chat", { query: userQuery });
            setChatMessages(prev => [...prev, { sender: "ai", text: response.data.response }]);
        } catch (error) {
            console.error("Chat failed:", error);
            setChatMessages(prev => [...prev, { sender: "ai", text: "Sorry, I encountered an error fetching response. Please try again later." }]);
        } finally {
            setSendingChat(false);
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "TBD";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    const getDaysLeft = (endDateStr: string | null) => {
        if (!endDateStr) return null;
        const end = new Date(endDateStr);
        const now = new Date();
        const diff = end.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? `${days} days left` : "Ended";
    };

    const filteredHackathons = hackathons.filter((h) => {
        const matchesPlatform = activePlatform === "all" || h.platform.toLowerCase() === activePlatform.toLowerCase();
        const matchesStatus = activeStatus === "all" || h.status.toUpperCase() === activeStatus.toUpperCase();
        const matchesSearch = h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (h.description && h.description.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesPlatform && matchesStatus && matchesSearch;
    });

    const platformColors: Record<string, string> = {
        hackerearth: "text-blue-700 bg-blue-50 border-blue-200",
        hack2skill: "text-orange-700 bg-orange-50 border-orange-200"
    };

    const statusColors: Record<string, string> = {
        ongoing: "bg-emerald-50 text-emerald-700 border-emerald-200",
        upcoming: "bg-cyan-50 text-cyan-700 border-cyan-200",
        ended: "bg-slate-100 text-slate-600 border-slate-200"
    };

    return (
        <div className="min-h-screen pt-24 pb-24 px-4 md:px-8 bg-background relative overflow-hidden">
            {/* Mesh glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] mesh-glow pointer-events-none -z-10" />

            <div className="max-w-[1400px] mx-auto relative z-10">
                {/* Hero Header */}
                <div className="text-center mb-16 relative">
                    <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight mb-6 leading-tight">
                        Explore Global <span className="text-neon glow-cyan">Hackathons</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                        Aggregate trending and upcoming hackathons across leading tech ecosystems. Level up your coding skills and showcase your innovation.
                    </p>
                </div>

                {/* Search and Filter Dashboard */}
                <div className="flex flex-col lg:flex-row gap-6 items-center justify-between mb-12 p-6 glass-effect rounded-2xl border border-border">
                    {/* Platform Toggle */}
                    <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-xl">
                        {[
                            { id: "all", label: "All Platforms" },
                            { id: "hackerearth", label: "HackerEarth" },
                            { id: "hack2skill", label: "Hack2Skill" }
                        ].map(platform => (
                            <button
                                key={platform.id}
                                onClick={() => setActivePlatform(platform.id)}
                                className={clsx(
                                    "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                    activePlatform === platform.id
                                        ? "bg-pink-600 text-white shadow-sm"
                                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-300"
                                )}
                            >
                                {platform.label}
                            </button>
                        ))}
                    </div>

                    {/* Status Toggle */}
                    <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-xl">
                        {[
                            { id: "all", label: "All Statuses" },
                            { id: "ongoing", label: "Ongoing" },
                            { id: "upcoming", label: "Upcoming" }
                        ].map(status => (
                            <button
                                key={status.id}
                                onClick={() => setActiveStatus(status.id)}
                                className={clsx(
                                    "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                    activeStatus === status.id
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-300"
                                )}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full lg:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search hackathons..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-muted/30 border border-border rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium text-foreground placeholder-muted-foreground focus:outline-none transition-all focus:border-blue-400"
                        />
                    </div>
                </div>

                {/* Hackathons Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-6">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin glow-blue" />
                        <span className="text-muted-foreground font-bold text-sm animate-pulse">Scraping trending events...</span>
                    </div>
                ) : filteredHackathons.length === 0 ? (
                    <div className="text-center py-24 rounded-3xl border border-dashed border-border bg-card/50">
                        <Trophy className="w-16 h-16 text-muted-foreground/40 mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-foreground mb-2">No hackathons found</h3>
                        <p className="text-muted-foreground text-sm max-w-xs mx-auto">Try adjusting your filters or search terms.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredHackathons.map((hackathon) => (
                            <div
                                key={hackathon.id}
                                className="glass-card flex flex-col h-full hover:border-primary/30 group"
                            >
                                {/* Badge Row */}
                                <div className="flex items-center justify-between mb-4">
                                    <span className={clsx(
                                        "px-3 py-1 rounded-md text-xs font-bold border",
                                        platformColors[hackathon.platform.toLowerCase()] || "bg-muted text-muted-foreground border-border"
                                    )}>
                                        {hackathon.platform}
                                    </span>
                                    <span className={clsx(
                                        "px-3 py-1 rounded-md text-xs font-bold border capitalize",
                                        statusColors[hackathon.status.toLowerCase()] || statusColors.ended
                                    )}>
                                        {hackathon.status}
                                    </span>
                                </div>

                                {/* Title & Description */}
                                <h3 className="text-xl font-black text-foreground mb-3 tracking-tight leading-tight group-hover:text-primary transition-colors min-h-[3.5rem] line-clamp-2">
                                    {hackathon.title}
                                </h3>

                                <p className="text-sm text-muted-foreground font-medium line-clamp-3 mb-6 flex-grow leading-relaxed">
                                    {hackathon.description || "Join this hackathon to challenge your limits, collaborate with peers, and build modern solutions."}
                                </p>

                                {/* Date & Timeline */}
                                <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                                    <div className="flex flex-col gap-1 text-xs font-semibold text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-primary" />
                                            <span>{formatDate(hackathon.start_date)}</span>
                                        </div>
                                        {hackathon.end_date && (
                                            <div className="flex items-center gap-2 text-accent-foreground/80">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{getDaysLeft(hackathon.end_date)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Registration Action */}
                                    <a
                                        href={hackathon.registration_url || hackathon.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="h-10 px-4 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground border border-border hover:border-primary text-foreground text-xs font-bold flex items-center gap-2 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02]"
                                    >
                                        View & Register
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* AI Help Center Sticky Launcher / Panel */}
            <div className="fixed bottom-8 right-8 z-50">
                {chatOpen ? (
                    <div
                        style={{ width: dimensions.width, height: dimensions.height }}
                        className={clsx(
                            "glass-effect rounded-2xl border border-border shadow-antigravity flex flex-col overflow-hidden scale-100 animate-in slide-in-from-bottom-8 relative",
                            !isResizing && "transition-all duration-300"
                        )}
                    >
                        {/* Edge Drag Resize Handles */}
                        <div
                            onMouseDown={(e) => {
                                e.preventDefault();
                                resizerRef.current = { startX: e.clientX, startY: e.clientY, startWidth: dimensions.width, startHeight: dimensions.height };
                                setIsResizing("top");
                            }}
                            className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize z-50 hover:bg-primary/20 transition-colors"
                            title="Drag to resize"
                        />
                        <div
                            onMouseDown={(e) => {
                                e.preventDefault();
                                resizerRef.current = { startX: e.clientX, startY: e.clientY, startWidth: dimensions.width, startHeight: dimensions.height };
                                setIsResizing("left");
                            }}
                            className="absolute top-0 bottom-0 left-0 w-2 cursor-ew-resize z-50 hover:bg-primary/20 transition-colors"
                            title="Drag to resize"
                        />
                        <div
                            onMouseDown={(e) => {
                                e.preventDefault();
                                resizerRef.current = { startX: e.clientX, startY: e.clientY, startWidth: dimensions.width, startHeight: dimensions.height };
                                setIsResizing("top-left");
                            }}
                            className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize z-50 hover:bg-primary/30 transition-colors"
                            title="Drag to resize"
                        />
                        {/* Header */}
                        <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-sm">
                                <Sparkles className="w-4 h-4 animate-pulse" />
                                AI Hackathon Assistant
                            </div>
                            <button
                                onClick={() => setChatOpen(false)}
                                className="text-primary-foreground/80 hover:text-primary-foreground text-xs font-bold"
                            >
                                Close
                            </button>
                        </div>

                        {/* Messages Container */}
                        <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-4 scrollbar-hide">
                            {chatMessages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={clsx(
                                        "flex gap-3 max-w-[85%] rounded-xl p-3 text-sm font-medium leading-relaxed shadow-sm break-words min-w-0",
                                        msg.sender === "user"
                                            ? "bg-blue-600 text-white self-end ml-auto"
                                            : "bg-slate-100 text-slate-900 border border-slate-200 self-start"
                                    )}
                                >
                                    <div className="mt-0.5 flex-shrink-0">
                                        {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
                                    </div>
                                    <div className={clsx(
                                        "prose prose-sm max-w-none flex-grow min-w-0 break-words",
                                        msg.sender === "user" ? "text-white prose-invert" : "text-slate-900"
                                    )}>
                                        <ReactMarkdown
                                            components={{
                                                p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-slate-900">{children}</p>,
                                                ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1 text-slate-900">{children}</ul>,
                                                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1 text-slate-900">{children}</ol>,
                                                li: ({ children }) => <li className="leading-relaxed text-slate-900">{children}</li>,
                                                strong: ({ children }) => <strong className="font-extrabold text-slate-900">{children}</strong>,
                                                em: ({ children }) => <em className="italic text-slate-800">{children}</em>,
                                                h1: ({ children }) => <h1 className="text-lg font-extrabold mb-2 text-slate-900 mt-4 first:mt-0">{children}</h1>,
                                                h2: ({ children }) => <h2 className="text-base font-bold mb-1 text-slate-900 mt-3 first:mt-0">{children}</h2>,
                                                h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-slate-900 mt-2 first:mt-0">{children}</h3>,
                                                code: ({ node, inline, className, children, ...props }: any) => {
                                                    if (inline) {
                                                        return <code className="bg-muted/80 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded text-xs font-semibold font-mono border border-border/50" {...props}>{children}</code>;
                                                    }
                                                    return (
                                                        <pre className="bg-slate-900 text-slate-100 p-3 rounded-xl my-2 overflow-x-auto text-xs font-mono border border-slate-800 shadow-md max-w-full">
                                                            <code {...props}>{children}</code>
                                                        </pre>
                                                    );
                                                },
                                                a: ({ href, children }) => (
                                                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-bold inline-flex items-center gap-0.5">
                                                        {children}
                                                        <ExternalLink className="w-3 h-3 inline" />
                                                    </a>
                                                )
                                            }}
                                        >
                                            {msg.text}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                            {sendingChat && (
                                <div className="bg-muted text-muted-foreground self-start rounded-xl p-3 text-sm font-medium flex items-center gap-2 shadow-sm border border-border border-blue-300">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Form */}
                        <form onSubmit={handleSendChat} className="p-3 border-t border-border bg-muted/30 flex gap-2 items-center">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Ask about prep, registration..."
                                className="flex-grow bg-card border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={sendingChat || !chatInput.trim()}
                                className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-weightless transition-all hover:scale-105"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                ) : (
                    <button
                        onClick={() => setChatOpen(true)}
                        className="premium-btn flex items-center gap-3 group glow-cyan hover:scale-105 duration-300"
                    >
                        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-all" />
                        <span>AI Help Center</span>
                    </button>
                )}
            </div>
        </div>
    );
}
