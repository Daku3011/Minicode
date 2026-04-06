"use client";

import React from "react";
import { Trophy } from "lucide-react";

export default function ProblemsLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#05050a] font-black text-white overflow-hidden relative p-8">
      {/* Background Accents */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 blur-[150px] -z-10" />
      
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
              <Trophy className="w-4 h-4 text-slate-500" />
            </div>
            <div className="h-3 w-32 bg-white/5 rounded-full" />
          </div>
          <div className="h-14 w-96 bg-white/[0.02] border border-white/5 rounded-[2rem]" />
        </div>
        <div className="h-14 w-56 bg-white/[0.02] border border-white/10 rounded-2xl shadow-2xl" />
      </div>

      {/* Grid Skeleton - Static, high-performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="bg-white/[0.01] rounded-[3rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden h-[360px]"
          >
            <div className="space-y-8">
              <div className="flex justify-between items-start">
                <div className="h-4 w-24 bg-white/5 rounded-full" />
                <div className="size-14 rounded-2xl bg-white/5 border border-white/5" />
              </div>
              <div className="h-10 w-full bg-white/[0.02] border border-white/5 rounded-2xl" />
              <div className="space-y-3">
                <div className="h-3 w-full bg-white/5 rounded-full" />
                <div className="h-3 w-2/3 bg-white/5 rounded-full" />
              </div>
              <div className="pt-8 border-t border-white/5 flex gap-5">
                <div className="h-4 w-20 bg-white/5 rounded-full" />
                <div className="h-4 w-20 bg-white/5 rounded-full" />
              </div>
              <div className="h-14 w-full bg-white/10 rounded-[1.5rem]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
