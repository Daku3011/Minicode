"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const STORAGE_KEY = "minicode_welcome_shown_v1";

export default function WelcomeModal() {
  const [open, setOpen] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    // If user is on the login page, always show the modal
    if (pathname && pathname.includes("/login")) {
      setOpen(true);
      return;
    }

    try {
      const shown = localStorage.getItem(STORAGE_KEY);
      if (!shown) {
        // small timeout so modal appears after initial paint
        const t = setTimeout(() => setOpen(true), 300);
        return () => clearTimeout(t);
      }
    } catch (err) {
      // ignore localStorage errors (e.g., SSR or blocked storage)
      setOpen(false);
    }
  }, [pathname]);

  const handleClose = (persist = true) => {
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {}
    }
    setOpen(false);
  };

  const router = useRouter();

  const handleStudent = () => {
    // open GitHub repo in a new tab
    try {
      window.open("https://github.com/Daku3011/Minicode", "_blank", "noopener,noreferrer");
    } catch {}
    handleClose(true);
  };

  const handleFaculty = () => {
    try {
      router.push("/faculty");
    } catch {}
    handleClose(true);
  };

  const handleTour = () => {
    try {
      router.push("/problems");
    } catch {}
    handleClose(true);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => handleClose(true)}
      />

      <div className="relative max-w-xl mx-4 w-full bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 ring-1 ring-slate-900/5">
        <h2 className="text-2xl font-semibold mb-2 text-white">Welcome to MiniCode</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          MiniCode is a learning and competition platform for students — solve problems, participate in
          hackathons, and earn XP to level up. Here are a few places to get started:
        </p>

        <ul className="list-disc list-inside text-sm space-y-2 mb-4 text-slate-700 dark:text-slate-200">
          <li><strong>Problems</strong>: Browse and attempt challenges in the Problems section.</li>
          <li><strong>Leaderboard</strong>: See how you compare with peers.</li>
          <li><strong>Profile</strong>: Track your progress and XP badges.</li>
          <strong className="text-blue-500">If Student?</strong> Click on <b>Github</b> Login button
        </ul>

        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            {/* <div className="flex-1">
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Are you a student or faculty?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleStudent}
                  className="px-3 py-1.5 rounded-md bg-sky-600 text-white text-sm hover:bg-sky-700"
                >
                  I'm a student — View on GitHub
                </button>
                <button
                  onClick={handleFaculty}
                  className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700"
                >
                  I'm faculty — Go to Faculty
                </button>
              </div>
            </div> */}

            <div className="flex-shrink-0 flex gap-1">
              {/* <button
                onClick={handleTour}
                className="px-3 py-1.5 rounded-md bg-transparent text-sm text-slate-700 hover:bg-slate-100"
              >
                Quick tour
              </button> */}
              <button
                onClick={() => handleClose(true)}
                className="px-3 py-1.5 rounded-md bg-blue-500/10 text-white text-sm hover:bg-white hover:text-black transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
