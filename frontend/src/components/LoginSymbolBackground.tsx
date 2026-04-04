"use client";

import { useEffect, useRef } from "react";

type Vec2 = {
    x: number;
    y: number;
};

type SymbolDot = {
    x: number;
    y: number;
    radius: number;
    vx: number;
    vy: number;
};

const SYMBOL_COUNT = 50;

const clampLength = (v: Vec2, targetLength: number): Vec2 => {
    const len = Math.hypot(v.x, v.y);
    if (len === 0) {
        return { x: 0, y: 0 };
    }

    const scale = targetLength / len;
    return { x: v.x * scale, y: v.y * scale };
};

export default function LoginSymbolBackground() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return;
        }

        let width = 0;
        let height = 0;
        let dpr = 1;
        let rafId = 0;

        const symbols: SymbolDot[] = [];
        let vector: Vec2 = { x: 0, y: 0 };
        let mouseVector: Vec2 = { x: 0, y: 0 };

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
            dpr = window.devicePixelRatio || 1;

            canvas.width = Math.max(1, Math.floor(width * dpr));
            canvas.height = Math.max(1, Math.floor(height * dpr));
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            if (symbols.length === 0) {
                for (let i = 0; i < SYMBOL_COUNT; i++) {
                    const scale = i / SYMBOL_COUNT + 0.001;
                    const radius = 5 * scale;
                    const angle = Math.random() * Math.PI * 2;
                    const length = (i / SYMBOL_COUNT) * Math.random() / 5;

                    symbols.push({
                        x: Math.random() * width,
                        y: Math.random() * height,
                        radius,
                        vx: Math.cos(angle) * length,
                        vy: Math.sin(angle) * length,
                    });
                }
            }
        };

        const onMouseMove = (event: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const px = event.clientX - rect.left;
            const py = event.clientY - rect.top;

            mouseVector = {
                x: width / 2 - px,
                y: height / 2 - py,
            };
        };

        const keepInView = (dot: SymbolDot) => {
            if (dot.x > width + 5) {
                dot.x = -dot.radius * 2;
            }
            if (dot.x < -dot.radius * 2 - 5) {
                dot.x = width;
            }
            if (dot.y > height + 5) {
                dot.y = -dot.radius * 2;
            }
            if (dot.y < -dot.radius * 2 - 5) {
                dot.y = height;
            }
        };

        const draw = () => {
            vector = {
                x: vector.x + (mouseVector.x - vector.x) / 30,
                y: vector.y + (mouseVector.y - vector.y) / 30,
            };

            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < symbols.length; i++) {
                const dot = symbols[i];
                const sizeWidth = dot.radius * 2;
                const vectorLength = Math.hypot(vector.x, vector.y);
                const moveLength = (vectorLength / 10) * (sizeWidth / 10);
                const flow = clampLength(vector, moveLength);

                dot.x += flow.x + dot.vx;
                dot.y += flow.y + dot.vy;
                keepInView(dot);

                ctx.beginPath();
                ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255,255,255,0.95)";
                ctx.fill();
                ctx.lineWidth = 1;
                ctx.strokeStyle = "rgba(0,0,0,0.9)";
                ctx.stroke();
            }

            rafId = window.requestAnimationFrame(draw);
        };

        resize();
        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", onMouseMove);
        rafId = window.requestAnimationFrame(draw);

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", onMouseMove);
            window.cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full opacity-20 pointer-events-none"
            aria-hidden="true"
        />
    );
}
