"use client";

import { Bell } from "lucide-react";

export default function BroadcastAlert() {
    return (
        <button
            onClick={() => window.dispatchEvent(new CustomEvent('minicode:openNews'))}
            className="bg-white border border-blue-200 py-2.5 px-5 rounded-xl group transition-all hover:border-blue-400 hover:bg-blue-50 text-slate-600 hover:text-blue-700 flex items-center gap-3 shadow-sm"
        >
            <Bell className="w-4 h-4 group-hover:scale-110 group-hover:text-blue-600 transition-all" />
            <span className="font-bold uppercase tracking-wider text-[11px]">Issue Announcement</span>
        </button>
    );
}
