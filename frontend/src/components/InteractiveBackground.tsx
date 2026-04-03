"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";

export default function InteractiveBackground() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth out mouse movement
    const springConfig = { damping: 25, stiffness: 150 };
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Calculate position relative to viewport center (-0.5 to 0.5)
            mouseX.set(e.clientX / window.innerWidth - 0.5);
            mouseY.set(e.clientY / window.innerHeight - 0.5);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] bg-[#141420] w-full h-full">
            {/* Base Deep Space Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#141420] via-[#1a152a] to-[#141420]" />
            
            {/* Mouse Following Glow */}
            <motion.div 
                style={{
                    x: smoothX.get() * 100 + "%",
                    y: smoothY.get() * 100 + "%",
                }}
                className="absolute inset-x-0 inset-y-0 m-auto w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px] mix-blend-screen"
            />

            {/* Primary Nebula Glow (Deep Purple) - subtly influenced by mouse */}
            <motion.div 
                animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [0.15, 0.25, 0.15],
                }}
                style={{
                    x: smoothX.get() * -10 + "%",
                    y: smoothY.get() * -10 + "%",
                }}
                transition={{ 
                    duration: 30,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] rounded-full bg-primary/8 blur-[120px]"
            />

            {/* Secondary Pulse (Cyan Accent) */}
            <motion.div 
                animate={{ 
                    scale: [1, 1.08, 1],
                    opacity: [0.05, 0.1, 0.05],
                }}
                style={{
                    x: smoothX.get() * 10 + "%",
                    y: smoothY.get() * 10 + "%",
                }}
                transition={{ 
                    duration: 45,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
                className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-secondary/5 blur-[150px]"
            />

            {/* Central Soft Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(137,91,245,0.03)_0%,transparent_70%)]" />

            {/* Subtle Grain Texture for Premium Feel */}
            <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
}



