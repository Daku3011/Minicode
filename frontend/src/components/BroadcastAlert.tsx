"use client";

import { Bell } from "lucide-react";
import MagneticWrapper from "./MagneticWrapper";
import { motion } from "framer-motion";

export default function BroadcastAlert() {
    return (
        // <MagneticWrapper>
            <button
                onClick={() => window.dispatchEvent(new CustomEvent('minicode:openNews'))}
                className="glass-card py-5 px-8 rounded-2xl group transition-all border-white/10 hover:border-primary/50 text-slate-400 hover:text-white flex items-center gap-3"
            >
                <Bell className="w-5 h-5 group-hover:scale-110 group-hover:text-primary transition-all" />
                <span className="font-bold uppercase tracking-wider text-[11px]">Issue Announcement</span>
            </button>
        // </MagneticWrapper>
    );
}
