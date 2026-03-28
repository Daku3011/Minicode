"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, Terminal, Plus, Trash2, Layout, Database, Zap } from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";

export default function CreateProblemPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [difficulty, setDifficulty] = useState("Easy");
    const [isSaving, setIsSaving] = useState(false);

    const handleCreate = async () => {
        setIsSaving(true);
        try {
            await api.post("/problems", { title, description, difficulty });
            router.push("/faculty/dashboard");
        } catch (error) {
            console.error("Failed to create problem", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main className="min-h-screen level-0 text-foreground pb-24 relative overflow-hidden">
            {/* Infrastructure Glow */}
            <div className="fixed top-[-10%] left-[-5%] w-[50%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="max-w-4xl mx-auto px-4 py-20 relative z-10">
                {/* Tactical Header */}
                <div className="space-y-12 mb-20 animate-in fade-in slide-in-from-top-8 duration-1000">
                    <div className="space-y-6">
                        <button 
                            onClick={() => router.back()}
                            className="group flex items-center gap-3 text-[10px] font-mono font-bold text-foreground/20 hover:text-primary transition-all uppercase tracking-[0.4em]"
                        >
                            <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> 
                            ABORT_SEQUENCE
                        </button>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tightest italic uppercase leading-none">
                            Provision_<span className="text-primary italic">NODE</span>
                        </h1>
                        <div className="flex items-center gap-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary light-emission shadow-atmospheric" />
                            <p className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.5em] italic">
                                INITIALIZING_LOGIC_DOMAIN // OPERATIONS_OVERRIDE
                            </p>
                        </div>
                    </div>
                </div>

                {/* Construction Matrix */}
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                    <div className="glass rounded-[3rem] p-12 space-y-12 shadow-glass no-border-separation relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-10 text-primary/5">
                            <Zap className="w-32 h-32" />
                        </div>

                        {/* Node Identity */}
                        <div className="space-y-8 relative z-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.4em] ml-2">NODE_LABEL</label>
                                <input 
                                    type="text" 
                                    placeholder="ENTER_TITLE..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full text-4xl font-bold italic tracking-tightest uppercase bg-transparent border-none focus:outline-none focus:text-primary transition-colors placeholder:text-foreground/5"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {["Easy", "Medium", "Hard"].map((lvl) => (
                                    <button
                                        key={lvl}
                                        onClick={() => setDifficulty(lvl)}
                                        className={clsx(
                                            "p-6 rounded-2xl border transition-all text-[10px] font-mono font-bold uppercase tracking-widest text-center",
                                            difficulty === lvl 
                                                ? "level-2 border-primary/40 text-primary light-emission shadow-atmospheric" 
                                                : "level-1 border-foreground/5 text-foreground/20 hover:border-foreground/10"
                                        )}
                                    >
                                        {lvl}_PRIORITY
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="w-full h-px bg-white/5" />

                        {/* Logic Definition */}
                        <div className="space-y-8 relative z-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.4em] ml-2">SYSTEM_REQUIREMENTS</label>
                                <textarea 
                                    rows={8}
                                    placeholder="DEFINE_LOGIC_PARAMETERS..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full level-1 rounded-3xl p-8 text-sm font-medium leading-relaxed focus:outline-none focus:bg-primary/[0.02] transition-all shadow-inner border-none placeholder:text-foreground/5"
                                />
                            </div>
                        </div>

                        {/* Execute Action */}
                        <div className="pt-6 relative z-10">
                            <button 
                                onClick={handleCreate}
                                disabled={isSaving || !title || !description}
                                className="w-full liquid-gradient py-8 rounded-[2rem] flex items-center justify-center gap-4 text-primary-foreground font-bold shadow-atmospheric light-emission hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
                            >
                                {isSaving ? (
                                    <div className="flex items-center gap-4">
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        <span className="uppercase tracking-[0.3em]">PROCESSING_DATA...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Save className="w-6 h-6" />
                                        <span className="uppercase tracking-[0.3em]">COMMIT_TO_ACTIVE_NODES</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Footer Intelligence */}
                    <div className="flex items-center justify-between px-10">
                        <div className="flex items-center gap-4 text-[10px] font-mono font-bold text-foreground/10 uppercase tracking-widest">
                            <Database className="w-4 h-4" />
                            <span>V4_ENGINE_COMPLIANT</span>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-mono font-bold text-foreground/10 uppercase tracking-widest">
                            <Layout className="w-4 h-4" />
                            <span>HI-FI_OPERATIONS_PROTO</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
