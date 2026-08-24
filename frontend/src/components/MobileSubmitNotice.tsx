"use client";

import { Monitor } from "lucide-react";

interface MobileSubmitNoticeProps {
    title?: string;
    description?: string;
}

/**
 * Shown in place of submission controls on viewports below 1024px.
 * MiniCode allows browsing problems, events, hackathons and profiles on
 * mobile — but submissions (GitHub workspace provisioning, contest code,
 * event work) are restricted to desktop sessions.
 */
export default function MobileSubmitNotice({
    title = "Submission available on desktop",
    description = "Open MiniCode on a desktop browser to provision your workspace and submit your solution.",
}: MobileSubmitNoticeProps) {
    return (
        <div
            role="status"
            className="flex flex-col items-center gap-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-8 text-center"
        >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                <Monitor className="h-6 w-6 text-primary" aria-hidden />
            </div>
            <div className="space-y-1.5">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">
                    {title}
                </h3>
                <p className="text-xs font-medium leading-relaxed text-slate-500">
                    {description}
                </p>
            </div>
        </div>
    );
}
