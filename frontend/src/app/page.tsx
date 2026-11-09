"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Code2,
  Map,
  Trophy,
  Users,
  FileCode,
  Search,
  Mic,
  GitPullRequest,
  Calendar,
  BarChart3,
  GraduationCap,
  Settings,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const tools = [
  {
    name: "Practice problems",
    description: "Build fluency, one challenge at a time.",
    href: "/problems",
    icon: Code2,
    group: "Learn",
  },
  {
    name: "Learning paths",
    description: "Follow a roadmap from fundamentals to projects.",
    href: "/roadmap",
    icon: Map,
    group: "Learn",
  },
  {
    name: "Learning dashboard",
    description: "Find your weak areas and your next challenge.",
    href: "/dashboard",
    icon: BarChart3,
    group: "Learn",
  },
  {
    name: "Interview practice",
    description: "Prepare for technical interviews with timed sessions.",
    href: "/interviews",
    icon: Mic,
    group: "Learn",
  },
  {
    name: "Contests",
    description: "Put your skills to the test against the clock.",
    href: "/contests",
    icon: Trophy,
    group: "Compete",
  },
  {
    name: "Events",
    description: "Join coding events with your community.",
    href: "/events",
    icon: Calendar,
    group: "Compete",
  },
  {
    name: "Hackathons",
    description: "Discover opportunities to build something new.",
    href: "/hackathons",
    icon: Sparkles,
    group: "Compete",
  },
  {
    name: "Leaderboard",
    description: "See your community’s progress and achievements.",
    href: "/leaderboard",
    icon: BarChart3,
    group: "Compete",
  },
  {
    name: "Find a team",
    description: "Meet coding partners for your next project.",
    href: "/team-formation",
    icon: Users,
    group: "Collaborate",
  },
  {
    name: "Code reviews",
    description: "Exchange feedback and learn from other developers.",
    href: "/reviews",
    icon: GitPullRequest,
    group: "Collaborate",
  },
  {
    name: "Code snippets",
    description: "Discover and share reusable solutions.",
    href: "/snippets",
    icon: FileCode,
    group: "Collaborate",
  },
  {
    name: "Cohorts & labs",
    description: "Stay connected to your class and assignments.",
    href: "/cohorts",
    icon: GraduationCap,
    group: "Collaborate",
  },
  {
    name: "Alumni network",
    description: "Explore profiles from your college community.",
    href: "/alumni/profiles",
    icon: Users,
    group: "Collaborate",
  },
  {
    name: "Integrations",
    description: "Connect your external coding profiles.",
    href: "/settings/integrations",
    icon: Settings,
    group: "Collaborate",
  },
];

export default function Home() {
  const { user, loading } = useAuth();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All tools");
  const isFaculty = user?.role === "faculty" || user?.role === "admin";
  const availableTools = isFaculty
    ? [
        {
          name: "Faculty dashboard",
          description: "Track student activity and manage your classroom.",
          href: "/faculty/dashboard",
          icon: GraduationCap,
          group: "Teach",
        },
        {
          name: "Manage problems",
          description: "Create challenges and organize learning material.",
          href: "/faculty/problems",
          icon: Code2,
          group: "Teach",
        },
        {
          name: "Manage cohorts",
          description: "Organize your students, labs and assignments.",
          href: "/faculty/cohorts",
          icon: Users,
          group: "Teach",
        },
        {
          name: "Manage events",
          description: "Create and oversee your community’s coding events.",
          href: "/faculty/events",
          icon: Calendar,
          group: "Teach",
        },
        ...(user?.role === "admin"
          ? [
              {
                name: "User administration",
                description: "Manage accounts and platform roles.",
                href: "/admin/users",
                icon: Settings,
                group: "Teach",
              },
            ]
          : []),
        ...tools,
      ]
    : tools;
  const filtered = availableTools.filter(
    (tool) =>
      (category === "All tools" || tool.group === category) &&
      `${tool.name} ${tool.description}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <div className="mx-auto max-w-7xl px-5 pb-16 pt-7 sm:px-8">
      <div className="mb-7 flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <span className="font-semibold tracking-wide">
          YOUR CODING WORKSPACE
        </span>
        <Link href="/faq" className="hover:text-primary">
          Need a hand? ↗
        </Link>
      </div>
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-7 text-white sm:p-12">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"
        />
        <div className="relative grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-center">
          <div>
            <p className="mb-4 text-sm font-medium text-blue-300">
              {user
                ? `Welcome back, ${user.full_name?.split(" ")[0] || user.username}`
                : "Small steps. Real progress."}
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {isFaculty ? (
                "Help the next generation build."
              ) : (
                <>
                  Make today a<br />
                  <span className="text-blue-300">building day.</span>
                </>
              )}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
              {isFaculty
                ? "Bring your problems, classrooms and community together in one workspace."
                : "Practice a new concept, ship a solution, or find your next team. Your next step starts here."}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={
                  user
                    ? isFaculty
                      ? "/faculty/dashboard"
                      : "/problems"
                    : "/login"
                }
                className="inline-flex items-center gap-3 rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white transition hover:bg-blue-400"
              >
                {loading
                  ? "Open workspace"
                  : user
                    ? isFaculty
                      ? "Open classroom"
                      : "Start practicing"
                    : "Get started"}
                <ArrowRight size={18} />
              </Link>
              <a
                href="#workspace-tools"
                className="rounded-xl border border-white/20 px-5 py-3 font-medium hover:bg-white/10"
              >
                Explore the workspace
              </a>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-5 flex items-center gap-2 text-sm font-medium text-blue-200">
              <Code2 size={18} /> The MiniCode loop
            </div>
            {[
              [
                "01",
                "Pick your challenge",
                "Choose a problem or follow a learning path.",
              ],
              [
                "02",
                "Build with GitHub",
                "Write your solution and commit your progress.",
              ],
              [
                "03",
                "Learn from feedback",
                "Review your result, improve, and try again.",
              ],
            ].map(([number, title, detail]) => (
              <div
                key={number}
                className="flex gap-4 border-t border-white/10 py-4 last:pb-0"
              >
                <span className="font-mono text-sm text-blue-300">
                  {number}
                </span>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {user && (
        <section
          aria-label="Your progress"
          className="my-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {[
            ["Total XP", user.stats?.xp],
            ["Problems solved", user.stats?.solved],
            ["Current level", user.stats?.level ?? user.unlocked_level],
            ["Day streak", user.stats?.streak],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <p className="text-xs font-medium text-muted-foreground">
                {label}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">
                {value ?? "—"}
              </p>
            </div>
          ))}
        </section>
      )}
      <section id="workspace-tools" className="scroll-mt-28 pt-9">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              A place for every next step
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              All your tools, without the tab overload.
            </p>
          </div>
          <label className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
            <Search size={17} className="text-muted-foreground" />
            <input
              aria-label="Find a tool"
              placeholder="Find a tool…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm outline-none sm:w-48"
            />
          </label>
        </div>
        <div className="my-6 flex flex-wrap gap-2" aria-label="Tool categories">
          {[
            "All tools",
            ...(isFaculty ? ["Teach"] : []),
            "Learn",
            "Compete",
            "Collaborate",
          ].map((group) => (
            <button
              key={group}
              aria-pressed={category === group}
              onClick={() => setCategory(group)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${category === group ? "bg-primary text-white" : "border border-border bg-card text-muted-foreground hover:text-foreground"}`}
            >
              {group}
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tool) => (
            <Link
              key={tool.href}
              href={user ? tool.href : "/login"}
              className="group rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/5"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="rounded-xl bg-accent p-3 text-primary">
                  <tool.icon size={21} />
                </span>
                <ArrowUpRight
                  size={18}
                  className="text-muted-foreground transition group-hover:text-primary"
                />
              </div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                {tool.group}
              </p>
              <h3 className="font-semibold">{tool.name}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && (
          <div
            role="status"
            className="rounded-2xl border border-dashed border-border p-12 text-center"
          >
            <p>No tools match your search.</p>
            <button
              onClick={() => {
                setQuery("");
                setCategory("All tools");
              }}
              className="mt-4 text-primary underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
      <footer className="mt-12 flex flex-wrap justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
        <span>MiniCode · Code. Compete. Evolve.</span>
        <div className="flex gap-5">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/faq">Help</Link>
        </div>
      </footer>
    </div>
  );
}
