"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function AccountStatus() {
  const { error, loading, refreshUser } = useAuth();
  if (!error) return null;
  return (
    <div
      role="alert"
      className="mx-auto my-3 flex max-w-6xl flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
    >
      <p>{error}</p>
      <button
        disabled={loading}
        onClick={() => void refreshUser()}
        className="rounded-lg border border-amber-400 px-4 py-2 font-semibold disabled:opacity-50"
      >
        {loading ? "Connecting…" : "Retry connection"}
      </button>
    </div>
  );
}
