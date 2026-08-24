"use client";

import { useEffect, useState } from "react";

const DESKTOP_MIN_WIDTH = 1024;

/**
 * SSR-safe viewport check. Returns `false` during SSR and first paint,
 * then tracks the actual viewport after hydration.
 */
export function useIsMobile(): boolean {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(`(max-width: ${DESKTOP_MIN_WIDTH - 1}px)`);
        const update = () => setIsMobile(media.matches);
        update();
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
    }, []);

    return isMobile;
}
