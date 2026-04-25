"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, CheckCircle2, AlertCircle, Upload } from "lucide-react";
import api from "@/lib/api";

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErrorMessage("Image size must be less than 5MB");
                setStatus("error");
                return;
            }
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setStatus("idle");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus("idle");

        try {
            const formData = new FormData();
            formData.append("email", email);
            formData.append("subject", subject);
            formData.append("message", message);
            if (image) {
                formData.append("image", image);
            }

            await api.post("/feedback", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setStatus("success");
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (err: any) {
            console.error(err);
            setStatus("error");
            setErrorMessage(err.response?.data?.detail || "Failed to submit feedback. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setEmail("");
        setSubject("");
        setMessage("");
        setImage(null);
        setImagePreview(null);
        setStatus("idle");
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-xl bg-white/[0.03] border border-white/10 rounded-[3rem] overflow-hidden backdrop-blur-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)]"
                    >
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                        
                        <div className="p-8 md:p-12">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Feedback</h2>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Help us improve Minicode</p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-3 rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {status === "success" ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center justify-center py-20 text-center"
                                >
                                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 border border-emerald-500/30">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Feedback Sent</h3>
                                    <p className="text-slate-400 mt-2 font-medium">Thanks! We received your message.</p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-4">Email Address</label>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary focus:bg-white/[0.05] transition-all placeholder:text-white/10 font-bold"
                                                placeholder="you@example.com"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-4">Subject</label>
                                            <input
                                                type="text"
                                                required
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary focus:bg-white/[0.05] transition-all placeholder:text-white/10 font-bold"
                                                placeholder="What is this about?"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-4">Message</label>
                                            <textarea
                                                required
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                rows={4}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary focus:bg-white/[0.05] transition-all placeholder:text-white/10 font-bold resize-none"
                                                placeholder="Tell us your feedback or describe the issue..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-4">Screenshot (Optional)</label>
                                            <div className="flex gap-4 items-start">
                                                <div 
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="flex-1 border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                                                >
                                                    <Upload className="w-8 h-8 text-slate-500 group-hover:text-primary transition-colors" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">Choose Image</span>
                                                    <span className="text-[9px] uppercase tracking-[0.25em] text-slate-600">Max size: 5MB</span>
                                                    <input 
                                                        type="file" 
                                                        ref={fileInputRef} 
                                                        onChange={handleImageChange} 
                                                        accept="image/*" 
                                                        className="hidden" 
                                                    />
                                                </div>
                                                {imagePreview && (
                                                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/20">
                                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setImage(null);
                                                                setImagePreview(null);
                                                            }}
                                                            className="absolute top-1 right-1 p-1 bg-black/60 rounded-lg text-white hover:bg-rose-500 transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {status === "error" && (
                                        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold uppercase tracking-wider">
                                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                            {errorMessage}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="group relative w-full h-16 bg-primary text-white rounded-2xl text-lg font-black uppercase tracking-tighter italic flex items-center justify-center gap-3 border border-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                                        {isSubmitting ? (
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                        ) : (
                                            <>
                                                <span className="relative z-10">Send Feedback</span>
                                                <Send className="w-5 h-5 relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
