"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function PageLoader() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleStart = () => {
            setLoading(true);
            setProgress(10);
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + 5;
                });
            }, 100);
            return interval;
        };

        const handleComplete = () => {
            setProgress(100);
            setTimeout(() => {
                setLoading(false);
                setProgress(0);
            }, 200);
        };

        // Since Next.js App Router doesn't have native route events in client components easily,
        // we trigger on pathname/searchParams changes as a fallback for internal navigation feedback.
        const intervalId = handleStart();
        handleComplete();

        return () => clearInterval(intervalId);
    }, [pathname, searchParams]);

    if (!loading) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
            <div 
                className="h-[2px] bg-primary transition-all duration-300 ease-out shadow-[0_0_10px_rgba(14,113,219,0.5)]"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
