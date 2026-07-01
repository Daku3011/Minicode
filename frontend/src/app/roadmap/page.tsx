"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Shield, Brain, Code, BarChart3, ArrowRight, Rocket, Swords, Sparkles,
  Cloud, Smartphone, Layers, Server, GitBranch, Flame, Star, Zap, TrendingUp,
  Users, Trophy, Lock, ChevronRight, Globe, Cpu
} from "lucide-react";
import api from "@/lib/api";
import { iconMap } from "@/constants/icons";

interface Stream {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  milestone_count: number;
}

// Metadata enrichment for each stream (tags, difficulty, trending status)
const streamMeta: Record<string, {
  tags: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  trending?: boolean;
  isNew?: boolean;
  popular?: boolean;
  totalXP?: number;
  enrolled?: string;
  category: string;
}> = {
  "cybersecurity": {
    tags: ["Ethical Hacking", "Network Security", "CTF"],
    difficulty: "Advanced",
    popular: true,
    totalXP: 900,
    enrolled: "2.1k",
    category: "Security",
  },
  "aiml": {
    tags: ["Machine Learning", "Deep Learning", "LLMs"],
    difficulty: "Advanced",
    trending: true,
    totalXP: 950,
    enrolled: "3.4k",
    category: "AI/ML",
  },
  "web-dev": {
    tags: ["React", "Next.js", "Node.js"],
    difficulty: "Beginner",
    popular: true,
    totalXP: 900,
    enrolled: "5.2k",
    category: "Development",
  },
  "data-science": {
    tags: ["Python", "Statistics", "SQL"],
    difficulty: "Intermediate",
    totalXP: 850,
    enrolled: "2.8k",
    category: "Data",
  },
  "cloud-devops": {
    tags: ["Docker", "Kubernetes", "Terraform"],
    difficulty: "Advanced",
    trending: true,
    isNew: true,
    totalXP: 850,
    enrolled: "1.2k",
    category: "Infrastructure",
  },
  "mobile-dev": {
    tags: ["Flutter", "iOS", "Android"],
    difficulty: "Intermediate",
    isNew: true,
    totalXP: 870,
    enrolled: "980",
    category: "Development",
  },
  "blockchain-web3": {
    tags: ["Solidity", "DeFi", "NFTs"],
    difficulty: "Advanced",
    trending: true,
    isNew: true,
    totalXP: 1050,
    enrolled: "750",
    category: "Web3",
  },
  "system-design": {
    tags: ["Scalability", "Microservices", "Kafka"],
    difficulty: "Advanced",
    isNew: true,
    totalXP: 1000,
    enrolled: "1.6k",
    category: "Architecture",
  },
  "open-source": {
    tags: ["Git", "GitHub", "Collaboration"],
    difficulty: "Beginner",
    isNew: true,
    totalXP: 970,
    enrolled: "1.1k",
    category: "Community",
  },
};

const difficultyColor: Record<string, string> = {
  Beginner: "text-emerald-600 bg-emerald-50 border-emerald-200",
  Intermediate: "text-amber-600 bg-amber-50 border-amber-200",
  Advanced: "text-rose-600 bg-rose-50 border-rose-200",
};

const categories = ["All", "Development", "Security", "AI/ML", "Data", "Infrastructure", "Web3", "Architecture", "Community"];

export default function RoadmapPage() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      setError(null);
      const response = await api.get("/roadmap/streams");
      let data: Stream[] = response.data;

      const hasAttemptedSeed = typeof window !== "undefined" && localStorage.getItem("roadmap_seeded");
      if (data.length <= 4 && !hasAttemptedSeed && !seeding) {
        setSeeding(true);
        try {
          await api.get("/roadmap/seed-additional");
          const refreshed = await api.get("/roadmap/streams");
          data = refreshed.data;
          if (typeof window !== "undefined") {
            localStorage.setItem("roadmap_seeded", "true");
          }
        } catch (err: unknown) {
          if (typeof window !== "undefined") {
            const axiosErr = err as { response?: { status?: number } };
            if (axiosErr.response?.status !== 403) {
              console.warn("Seed attempt failed:", err);
            }
          }
          localStorage.setItem("roadmap_seeded", "true");
        } finally {
          setSeeding(false);
        }
      }

      setStreams(data);
    } catch (error: unknown) {
      console.error("Failed to fetch streams:", error);
      const axiosError = error as { response?: { data?: { detail?: string } }; message?: string };
      setError(axiosError.response?.data?.detail || axiosError.message || "Failed to load streams");
    } finally {
      setLoading(false);
    }
  };

  const filteredStreams = activeFilter === "All"
    ? streams
    : streams.filter(s => streamMeta[s.slug]?.category === activeFilter);

  const trendingStreams = streams.filter(s => streamMeta[s.slug]?.trending);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-violet-50/30 to-white pt-24 pb-32 px-4 md:px-8 overflow-x-hidden relative">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet-100 blur-3xl opacity-60" />
        <div className="absolute top-80 right-[-5%] h-[350px] w-[350px] rounded-full bg-cyan-100 blur-3xl opacity-40" />
        <div className="absolute bottom-40 left-[-5%] h-[300px] w-[300px] rounded-full bg-pink-100 blur-3xl opacity-30" />
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10">

        {/* ── Hero Header ── */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 border border-violet-200 text-violet-700 text-xs font-bold uppercase tracking-wider mb-6">
            <Rocket className="w-3.5 h-3.5" />
            Learning Paths
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight mb-5">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
              Stream
            </span>
          </h1>
          <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto font-medium mb-8">
            Follow a structured roadmap with milestones, earn XP, and track your progress as you master new skills in today's most in-demand fields.
          </p>

          {/* Stats bar */}
          <div className="inline-flex flex-wrap justify-center gap-6 px-8 py-4 rounded-2xl bg-white/80 backdrop-blur border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
                <Rocket className="w-4 h-4 text-violet-600" />
              </div>
              <span className="font-semibold text-slate-700">{streams.length} Streams</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-amber-600" />
              </div>
              <span className="font-semibold text-slate-700">
                {streams.reduce((acc, s) => acc + s.milestone_count, 0)}+ Milestones
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-xl bg-cyan-100 flex items-center justify-center">
                <Zap className="w-4 h-4 text-cyan-600" />
              </div>
              <span className="font-semibold text-slate-700">AI-Powered Evaluation</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="font-semibold text-slate-700">Active Community</span>
            </div>
          </div>
        </div>

        {/* ── Trending Spotlight ── */}
        {!loading && trendingStreams.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold text-slate-800">Trending Now</h2>
              <span className="text-xs text-slate-400 font-medium">— most popular this week</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {trendingStreams.map((stream) => {
                const Icon = iconMap[stream.icon] || Rocket;
                const meta = streamMeta[stream.slug];
                return (
                  <Link
                    key={stream.id}
                    href={`/roadmap/${stream.id}`}
                    className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all group"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${stream.color}18`, color: stream.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800 group-hover:text-violet-700 transition-colors">{stream.name}</p>
                      <p className="text-xs text-slate-400">{meta?.enrolled ?? "—"} enrolled</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2 px-2 py-0.5 bg-orange-50 rounded-full border border-orange-200">
                      <Flame className="w-3 h-3 text-orange-500" />
                      <span className="text-xs font-bold text-orange-600">Hot</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Category Filter ── */}
        {!loading && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
                    activeFilter === cat
                      ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-200"
                      : "bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600"
                  }`}
                >
                  {cat}
                  {cat !== "All" && (
                    <span className="ml-1.5 opacity-60">
                      ({streams.filter(s => streamMeta[s.slug]?.category === cat).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Stream Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-white rounded-3xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {filteredStreams.length === 0 ? (
              <div className="text-center py-20">
                <Rocket className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-semibold">No streams in this category yet</p>
                <button
                  onClick={() => setActiveFilter("All")}
                  className="mt-3 text-violet-600 text-sm font-semibold hover:underline"
                >
                  View all streams →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStreams.map((stream, idx) => {
                  const Icon = iconMap[stream.icon] || Rocket;
                  const meta = streamMeta[stream.slug];
                  return (
                    <StreamCard
                      key={stream.id}
                      stream={stream}
                      Icon={Icon}
                      meta={meta}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── Error state ── */}
        {!loading && streams.length === 0 && error && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-slate-700 text-lg font-semibold mb-2">Failed to load streams</p>
            <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => { setLoading(true); fetchStreams(); }}
              className="px-5 py-2.5 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Newly Added Banner ── */}
        {/* {!loading && newStreams.length > 0 && (
          <div className="mt-16 rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-cyan-600 p-px">
            <div className="rounded-3xl bg-white/95 backdrop-blur p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center">
                  <Star className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Newly Added Streams</h2>
                  <p className="text-sm text-slate-500">Fresh learning paths just launched on MiniCode</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {newStreams.map((stream) => {
                  const Icon = iconMap[stream.icon] || Rocket;
                  return (
                    <Link
                      key={stream.id}
                      href={`/roadmap/${stream.id}`}
                      className="group flex flex-col items-center text-center p-4 rounded-2xl hover:bg-violet-50 border border-transparent hover:border-violet-200 transition-all"
                    >
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                        style={{ backgroundColor: `${stream.color}20`, color: stream.color }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-sm text-slate-800 group-hover:text-violet-700 transition-colors leading-tight">
                        {stream.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{stream.milestone_count} milestones</p>
                      <div className="mt-2 px-2 py-0.5 bg-violet-100 rounded-full">
                        <span className="text-xs font-bold text-violet-700">NEW</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )} */}

        {/* ── Bottom CTA ── */}
        <div className="mt-16 text-center">
          <p className="text-slate-400 text-sm mb-2">Can't decide where to start?</p>
          <p className="text-slate-600 font-semibold text-lg mb-4">
            Most students begin with
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            {streams.filter(s => ["web-dev", "aiml"].includes(s.slug)).map(s => {
              const Icon = iconMap[s.icon] || Rocket;
              return (
                <Link
                  key={s.id}
                  href={`/roadmap/${s.id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white transition-all hover:scale-105 shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}cc)` }}
                >
                  <Icon className="w-4 h-4" />
                  {s.name}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StreamCardProps {
  stream: Stream;
  Icon: React.ElementType;
  meta?: typeof streamMeta[string];
}

function StreamCard({ stream, Icon, meta }: StreamCardProps) {
  return (
    <Link
      href={`/roadmap/${stream.id}`}
      className="group relative bg-white rounded-3xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Subtle gradient glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
        style={{
          background: `radial-gradient(circle at top left, ${stream.color}08 0%, transparent 60%)`,
        }}
      />

      {/* Badges row */}
      <div className="flex items-center gap-2 mb-5 relative z-10">
        {meta?.trending && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold">
            <Flame className="w-3 h-3" />
            Trending
          </span>
        )}
        {meta?.isNew && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-600 text-xs font-bold">
            <Sparkles className="w-3 h-3" />
            New
          </span>
        )}
        {meta?.popular && !meta?.trending && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-xs font-bold">
            <Star className="w-3 h-3" />
            Popular
          </span>
        )}
        {meta?.category && (
          <span className="ml-auto text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
            {meta.category}
          </span>
        )}
      </div>

      {/* Icon + Title */}
      <div className="flex items-start gap-4 mb-4 relative z-10">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-300"
          style={{ backgroundColor: `${stream.color}18`, color: stream.color }}
        >
          <Icon className="w-7 h-7" />
        </div>
        <div className="min-w-0">
          <h3 className="text-xl font-black text-slate-900 leading-tight mb-1 group-hover:text-violet-700 transition-colors">
            {stream.name}
          </h3>
          {meta?.difficulty && (
            <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${difficultyColor[meta.difficulty]}`}>
              {meta.difficulty}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-500 text-sm leading-relaxed mb-5 line-clamp-2 relative z-10">
        {stream.description}
      </p>

      {/* Tags */}
      {meta?.tags && (
        <div className="flex flex-wrap gap-1.5 mb-5 relative z-10">
          {meta.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium px-2.5 py-0.5 rounded-full text-slate-600 bg-slate-100 border border-slate-200"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer stats */}
      <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 relative z-10">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-semibold">
            <div className="w-5 h-5 rounded-lg bg-violet-50 flex items-center justify-center">
              <Trophy className="w-3 h-3 text-violet-500" />
            </div>
            {stream.milestone_count} milestones
          </span>
          {meta?.totalXP && (
            <span className="flex items-center gap-1.5 font-semibold">
              <div className="w-5 h-5 rounded-lg bg-amber-50 flex items-center justify-center">
                <Zap className="w-3 h-3 text-amber-500" />
              </div>
              {meta.totalXP}+ XP
            </span>
          )}
        </div>
        <span className="flex items-center gap-1 text-violet-600 font-bold text-xs group-hover:gap-2 transition-all">
          Start Learning
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
