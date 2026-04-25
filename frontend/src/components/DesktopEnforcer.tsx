"use client";

import { useState, useEffect } from "react";

export default function DesktopEnforcer({ children }: { children: React.ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkResolution = () => {
      // Threshold for desktop display (typically 1024px)
      if (window.innerWidth < 1024) {
        setIsDesktop(false);
      } else {
        setIsDesktop(true);
      }
    };

    checkResolution();
    window.addEventListener("resize", checkResolution);
    return () => window.removeEventListener("resize", checkResolution);
  }, []);

  // During SSR, just render the children. Hydration will fix up.
  if (!isMounted) return <>{children}</>;

  if (!isDesktop) {
    return (
      <div 
        className="fixed inset-0 z-[99999] flex flex-col items-center justify-center p-6 text-center select-none"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        {/* Ambient Mesh Glows */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[hsl(213,94%,48%)]/10 blur-[160px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-[hsl(196,100%,42%)]/10 blur-[160px] pointer-events-none"></div>

        {/* Premium Warning Card */}
        <div className="glass-card relative max-w-md w-full flex flex-col items-center gap-6 p-8 md:p-10">
          
          {/* Pulsing Desktop Icon */}
          <div 
            className="w-16 h-16 flex items-center justify-center rounded-2xl animate-pulse shadow-sm"
            style={{ backgroundColor: "var(--color-accent)", color: "var(--color-primary)" }}
          >
            <span className="material-symbols-outlined text-4xl">desktop_windows</span>
          </div>

          {/* Text Content */}
          <div className="space-y-3">
            <h2 
              className="text-2xl font-extrabold tracking-tight sm:text-3xl"
              style={{ color: "var(--color-foreground)" }}
            >
              Desktop Access Required
            </h2>
            <p 
              className="text-base leading-relaxed"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              MiniCode's high-performance execution engine and analytical views require an expansive display context to operate securely.
            </p>
          </div>

          {/* Sleek Divider */}
          <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-[hsl(213,94%,48%)] to-transparent rounded-full"></div>

          <p 
            className="text-sm font-bold px-6 py-3 rounded-full shadow-sm"
            style={{ 
              backgroundColor: "var(--color-accent)", 
              color: "var(--color-accent-foreground)",
              border: "1px solid hsla(213, 60%, 88%, 0.8)"
            }}
          >
            Expand your browser or switch to desktop.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
