"use client";

import { Terminal, FileCode, ShieldCheck } from "lucide-react";

const LANGUAGE_FILES = [
    { name: "Python", file: "solution.py" },
    { name: "C++", file: "solution.cpp" },
    { name: "C", file: "solution.c" },
    { name: "Java", file: "solution.java" },
    { name: "JavaScript", file: "solution.js" },
    { name: "Go", file: "solution.go" },
    { name: "Rust", file: "solution.rs" },
];

const WORKFLOW_STEPS = [
    { label: "Deploy Workspace", detail: "Creates your private GitHub repository with a base solution.py file." },
    { label: "Clone your repo", detail: "git clone <your-repo-url>" },
    { label: "Write your solution", detail: "Edit the base file — rename its extension to match your language." },
    { label: "Commit & push", detail: "git add . && git commit -m \"solve\" && git push origin main" },
    { label: "Evaluate Logic", detail: "Return here and run the judge on your latest push." },
];

export default function SubmissionGuide() {
    return (
        <section className="bg-white rounded-3xl p-8 border border-blue-100 space-y-8 shadow-sm" aria-label="Submission guidelines">
            <div className="flex items-center gap-3 text-blue-600">
                <Terminal className="w-5 h-5" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">Submission Guidelines</h2>
            </div>

            {/* Language / extension mapping */}
            <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                    <FileCode className="w-4 h-4 text-blue-600" />
                    All Languages Accepted — Rename the Base File
                </h3>
                <p className="text-[13px] font-medium leading-relaxed text-slate-500">
                    Every workspace starts with a base file named{" "}
                    <code className="rounded-md bg-slate-900 px-1.5 py-0.5 font-mono text-xs text-slate-100">solution.py</code>.
                    You may solve in any supported language — just change the file extension so the judge finds your code:
                </p>
                <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {LANGUAGE_FILES.map((lang) => (
                        <li key={lang.name} className="flex items-center justify-between rounded-xl border border-blue-50 bg-slate-50 px-4 py-2">
                            <span className="text-xs font-bold text-slate-600">{lang.name}</span>
                            <code className="font-mono text-xs font-semibold text-primary">{lang.file}</code>
                        </li>
                    ))}
                </ul>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Keep exactly one <span className="text-slate-600">solution.*</span> file in the repo root.
                </p>
            </div>

            {/* Workflow */}
            <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                    <Terminal className="w-4 h-4 text-blue-600" />
                    Command Notes
                </h3>
                <ol role="list" className="space-y-3">
                    {WORKFLOW_STEPS.map((step, i) => (
                        <li key={step.label} className="flex gap-4">
                            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-black text-primary">
                                {i + 1}
                            </span>
                            <div className="min-w-0 space-y-0.5">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-700">{step.label}</p>
                                <p className="break-words font-mono text-[11px] leading-relaxed text-slate-400">{step.detail}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>

            {/* Rules */}
            <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
                <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-amber-700">
                    <ShieldCheck className="w-4 h-4" />
                    Fair Play Rules
                </h3>
                <ul role="list" className="list-disc space-y-1.5 pl-5 text-[13px] font-medium leading-relaxed text-slate-600 marker:text-amber-500">
                    <li>Use AI minimally — treat it like a hint, not a solver.</li>
                    <li>Every submission is screened; flagged work goes to faculty review.</li>
                    <li>Your commit history is part of the evaluation, so commit as you work.</li>
                </ul>
            </div>
        </section>
    );
}
