"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { clsx } from "clsx";

interface MagneticWrapperProps {
    children: React.ReactNode;
    className?: string;
    intensity?: number;
}

export default function MagneticWrapper({ children, className, intensity = 0.3 }: MagneticWrapperProps) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springConfig = { damping: 15, stiffness: 150 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        const distance = { x: e.clientX - center.x, y: e.clientY - center.y };
        x.set(distance.x * intensity);
        y.set(distance.y * intensity);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: springX, y: springY }}
            className={clsx("relative", className)}
        >
            {children}
        </motion.div>
    );
}
