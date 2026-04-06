"use client";

export default function InteractiveBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] bg-[#0a0a0f] w-full h-full">
            {/* Base Deep Space Gradient - Static & Minimalist */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0d0d14] to-[#0a0a0f]" />

            {/* More Vibrant, Pulsing Accents */}
            <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[140px] animate-[pulse_8s_infinite]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary/10 blur-[180px] animate-[pulse_12s_infinite]" />
            <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] rounded-full bg-indigo-500/5 blur-[100px] animate-[pulse_10s_infinite]" />

            {/* Subtle Grain Texture for Premium Feel */}
            <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
}
