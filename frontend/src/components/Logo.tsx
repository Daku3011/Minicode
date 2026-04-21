import React from 'react';

interface LogoProps {
    className?: string;
    variant?: "gradient" | "solid";
}

export function Logo({ className = "", variant = "gradient" }: LogoProps) {
    if (variant === "solid") {
        return (
            <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
                <g transform="translate(-13.5, 12)">
                    <circle cx="26" cy="57" r="10" />
                    <path d="M 20 30 L 48.28 30 L 68.28 50 A 10 10 0 0 1 54.14 64.14 Z" />
                    <line x1="74" y1="30" x2="101.07" y2="57.07" stroke="currentColor" strokeWidth="20" strokeLinecap="round" />
                    <path d="M 51 9 Q 51 18 60 18 Q 51 18 51 27 Q 51 18 42 18 Q 51 18 51 9 Z" />
                </g>
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <defs>
                <linearGradient id="logoCircleGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <linearGradient id="logoCyanGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#00f2fe" />
                    <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <linearGradient id="logoPinkGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <linearGradient id="logoStarGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
            </defs>

            <g transform="translate(-13.5, 12)">
                <circle cx="26" cy="57" r="10" fill="url(#logoCircleGrad)" />
                <path d="M 20 30 L 48.28 30 L 68.28 50 A 10 10 0 0 1 54.14 64.14 Z" fill="url(#logoCyanGrad)" />
                <line x1="74" y1="30" x2="101.07" y2="57.07" stroke="url(#logoPinkGrad)" strokeWidth="20" strokeLinecap="round" />
                <path d="M 51 9 Q 51 18 60 18 Q 51 18 51 27 Q 51 18 42 18 Q 51 18 51 9 Z" fill="url(#logoStarGrad)" />
            </g>
        </svg>
    );
}

export default Logo;
