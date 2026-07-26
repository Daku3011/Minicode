"use client";

import { useState, useRef, useEffect } from "react";
import { clsx } from "clsx";
import {
    MessageCircle,
    X,
    Minimize2,
    Maximize2,
    Send,
    Loader2,
    Bot,
    User,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { assistantApi } from "@/lib/assistant-api";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function ChatAssistant() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Hi! I'm your AI Teaching Assistant. Ask me anything about programming, algorithms, or the problems you're working on.",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading || !user) return;

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setLoading(true);

        try {
            const res = await assistantApi.chat(userMessage);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: res.data.response },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Sorry, I couldn't process your request. Please try again.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!user) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[200]">
            {isOpen && (
                <div
                    className={clsx(
                        "absolute bottom-16 right-0 w-80 sm:w-96 bg-[#0a0a14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-200",
                        isMinimized
                            ? "h-14"
                            : "h-[500px] max-h-[80vh]"
                    )}
                >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
                        <div className="flex items-center gap-2">
                            <Bot className="w-5 h-5 text-primary" />
                            <span className="text-sm font-bold text-white">
                                AI Assistant
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            >
                                {isMinimized ? (
                                    <Maximize2 className="w-4 h-4" />
                                ) : (
                                    <Minimize2 className="w-4 h-4" />
                                )}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 h-[calc(100%-110px)]">
                                {messages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={clsx(
                                            "flex gap-2",
                                            msg.role === "user"
                                                ? "justify-end"
                                                : "justify-start"
                                        )}
                                    >
                                        {msg.role === "assistant" && (
                                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                                                <Bot className="w-3.5 h-3.5 text-primary" />
                                            </div>
                                        )}
                                        <div
                                            className={clsx(
                                                "max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed",
                                                msg.role === "user"
                                                    ? "bg-primary/20 text-primary-foreground rounded-br-sm"
                                                    : "bg-white/10 text-slate-200 rounded-bl-sm"
                                            )}
                                        >
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    code: ({
                                                        children,
                                                        ...props
                                                    }) => (
                                                        <code
                                                            className="bg-white/10 px-1 py-0.5 rounded text-[10px] font-mono"
                                                            {...props}
                                                        >
                                                            {children}
                                                        </code>
                                                    ),
                                                    pre: ({
                                                        children,
                                                        ...props
                                                    }) => (
                                                        <pre
                                                            className="bg-black/40 p-2 rounded-lg my-1 overflow-x-auto text-[10px]"
                                                            {...props}
                                                        >
                                                            {children}
                                                        </pre>
                                                    ),
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                        {msg.role === "user" && (
                                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-1">
                                                <User className="w-3.5 h-3.5 text-blue-400" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex gap-2 justify-start">
                                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                            <Bot className="w-3.5 h-3.5 text-primary" />
                                        </div>
                                        <div className="bg-white/10 rounded-xl rounded-bl-sm px-3 py-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="px-4 py-3 border-t border-white/10">
                                <div className="flex gap-2">
                                    <textarea
                                        value={input}
                                        onChange={(e) =>
                                            setInput(e.target.value)
                                        }
                                        onKeyDown={handleKeyDown}
                                        placeholder="Ask anything..."
                                        rows={1}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={loading || !input.trim()}
                                        className={clsx(
                                            "self-end p-2 rounded-lg transition-all",
                                            loading || !input.trim()
                                                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                                                : "bg-primary/20 text-primary hover:bg-primary/30"
                                        )}
                                    >
                                        {loading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all",
                    isOpen
                        ? "bg-rose-500 hover:bg-rose-600"
                        : "bg-primary hover:bg-primary/80"
                )}
            >
                {isOpen ? (
                    <X className="w-5 h-5 text-white" />
                ) : (
                    <MessageCircle className="w-5 h-5 text-white" />
                )}
            </button>
        </div>
    );
}
