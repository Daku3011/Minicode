"use client";

import { useState, useEffect } from "react";
import { Shield, Users, Activity, Monitor, ChevronRight, TrendingUp, Zap, Layers, MoreHorizontal, Plus, Settings, MoreVertical } from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";

interface User {
    id: number;
    username: string;
    email: string;
    role: "student" | "faculty" | "admin";
    joined: string;
}

export default function AdminDashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, statsRes] = await Promise.all([
                    api.get("/admin/users"),
                    api.get("/admin/stats")
                ]);
                setUsers(usersRes.data);
                setStats(statsRes.data);
            } catch (error) {
                console.error("Fetch data error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleRoleUpdate = async (userId: number, role: string) => {
        try {
            await api.put(`/admin/users/${userId}/role?role=${role}`);
            setUsers(users.map(u => u.id === userId ? { ...u, role: role as any } : u));
        } catch (error) {
            console.error("Update role error:", error);
        }
    };

    return (
        <div className="flex min-h-screen level-0 text-foreground font-display selection:bg-primary/30">
            {/* Sidebar Navigation: The Command Backbone */}
            <aside className="w-80 level-1 hidden xl:flex flex-col sticky top-0 h-screen p-10 shadow-atmospheric no-border-separation z-50">
                <div className="flex items-center gap-4 mb-16 px-2">
                    <div className="p-3 glass rounded-2xl text-primary shadow-atmospheric light-emission">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div className="space-y-0.5">
                        <h2 className="text-xl font-bold italic tracking-tightest uppercase">Protocol</h2>
                        <p className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.4em]">ADMIN_OS_V4</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-4">
                    {[
                        { id: "overview", label: "TERMINAL", icon: Monitor },
                        { id: "users", label: "OPERATIVES", icon: Users },
                        { id: "health", label: "NODE_LOAD", icon: Activity },
                    ].map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveTab(item.id)} 
                            className={clsx(
                                "w-full flex items-center justify-between px-8 py-5 rounded-[2rem] font-bold transition-all text-xs group relative overflow-hidden",
                                activeTab === item.id 
                                    ? "glass text-primary shadow-glass light-emission" 
                                    : "text-foreground/30 hover:bg-primary/[0.02] hover:text-foreground/60"
                            )}
                        >
                            <div className="flex items-center gap-5 relative z-10 font-mono tracking-widest">
                                <item.icon className={clsx("w-5 h-5", activeTab === item.id ? "light-emission" : "opacity-40")} />
                                <span>{item.label}</span>
                            </div>
                            {activeTab === item.id && (
                                <div className="absolute right-0 top-0 h-full w-1 bg-primary light-emission" />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-8 rounded-[3rem] level-2 shadow-atmospheric">
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.5em]">UPTIME</p>
                        <Settings className="w-4 h-4 text-foreground/20 hover:text-primary transition-colors cursor-pointer" />
                    </div>
                    <p className="text-xs text-foreground/40 leading-relaxed font-medium italic font-mono">
                        Maintenance_Cycle: <span className="text-primary font-bold">SUN_0200_UTC</span>. 
                    </p>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-8 md:p-16 max-w-7xl mx-auto space-y-20 relative">
                {/* Background Glows */}
                <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

                <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div className="space-y-4">
                        <p className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.6em] italic">COMMAND_CENTER // STATUS_PULSE</p>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tightest italic uppercase">OPERATIONS</h1>
                    </div>
                    <div className="flex items-center gap-4 px-8 py-4 glass rounded-2xl shadow-glass light-emission">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-atmospheric" />
                        <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-[0.5em]">SYSTEM_STABLE</span>
                    </div>
                </header>

                {/* Primary Stats: The Depth Grid */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-top-12 duration-1000 delay-100">
                    <div className="lg:col-span-2 glass rounded-[4rem] p-12 shadow-glass relative overflow-hidden group no-border-separation">
                        <div className="relative z-10 space-y-10">
                            <p className="text-[10px] font-mono font-bold text-foreground/30 uppercase tracking-[0.6em]">ACTIVE_PILOTS</p>
                            <div className="space-y-2">
                                <div className="flex items-baseline gap-6">
                                    <h3 className="text-7xl md:text-9xl font-bold tracking-tightest italic leading-none tabular-nums">12,482</h3>
                                    <TrendingUp className="w-10 h-10 text-primary group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-1000 light-emission" />
                                </div>
                                <div className="flex items-center gap-3 px-6 py-2 level-1 rounded-full w-fit shadow-atmospheric">
                                    <Activity className="w-4 h-4 text-primary light-emission" />
                                    <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">+14.2%_DELTA</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/[0.03] to-transparent pointer-events-none" />
                    </div>

                    <div className="flex flex-col gap-10">
                        <div className="flex-1 level-1 rounded-[3rem] p-10 flex flex-col justify-between group shadow-atmospheric no-border-separation hover:bg-primary/[0.02] transition-colors">
                            <p className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.5em]">ARENA_PROTOCOL</p>
                            <div className="flex items-center gap-6">
                                <div className="p-4 glass rounded-[2rem] shadow-glass light-emission">
                                    <Zap className="w-8 h-8 text-amber-500/80 fill-current" />
                                </div>
                                <h4 className="text-3xl font-bold italic tracking-tightest uppercase text-amber-500/80">Optimal</h4>
                            </div>
                        </div>
                        <div className="flex-1 level-1 rounded-[3rem] p-10 flex flex-col justify-between group shadow-atmospheric no-border-separation hover:bg-primary/[0.02] transition-colors">
                            <p className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.5em]">BUFFER_LOAD</p>
                            <div className="flex items-center gap-6">
                                <div className="p-4 glass rounded-[2rem] shadow-glass light-emission">
                                    <Layers className="w-8 h-8 text-blue-500/80" />
                                </div>
                                <h4 className="text-5xl font-bold italic tracking-tightest font-mono tabular-nums">24</h4>
                            </div>
                        </div>
                    </div>
                </section>

                {/* System Load Section: Visual Telemetry */}
                <section className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                    <div className="flex items-center justify-between px-4">
                        <div className="space-y-1">
                            <h3 className="text-3xl font-bold tracking-tightest italic uppercase">Node_Telemetry</h3>
                            <p className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.4em]">Infrastructure Load Balancer</p>
                        </div>
                        <div className="px-6 py-2 level-2 rounded-xl text-[10px] font-mono font-bold text-primary uppercase tracking-[0.4em] italic shadow-atmospheric">Live_Stream</div>
                    </div>

                    <div className="glass rounded-[4rem] p-12 md:p-16 shadow-glass no-border-separation relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(186,158,255,0.01)_1px,transparent_1px)] bg-[length:100%_8px] pointer-events-none" />
                        
                        <div className="flex flex-end gap-3 md:gap-6 h-64 md:h-80 mb-16 items-end relative z-10">
                            {[20, 45, 30, 80, 50, 40, 35, 75, 90].map((h, i) => (
                                <div key={i} className="flex-1 group/bar relative">
                                    <div className={clsx("w-full transition-all duration-1500 ease-out rounded-t-3xl", i === 3 ? "bg-primary/40 shadow-glass light-emission" : "bg-foreground/5 group-hover/bar:bg-primary/10")} style={{ height: `${h}%` }} />
                                    {i === 3 && <div className="absolute top-[-4px] w-full h-1.5 bg-primary rounded-full blur-[3px] light-emission" />}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-20 pt-16 border-t border-foreground/5 relative z-10">
                            <div className="space-y-3">
                                <p className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.8em]">CPU_PULSE</p>
                                <h4 className="text-5xl font-bold italic tracking-tightest font-mono tabular-nums">42.8%</h4>
                            </div>
                            <div className="space-y-3">
                                <p className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.8em]">MEMORY_ALLOC</p>
                                <h4 className="text-5xl font-bold italic tracking-tightest font-mono tabular-nums text-primary">1.2GB</h4>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Recent Pilotes: The Operative Grid */}
                <section className="space-y-12 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
                    <div className="flex items-center justify-between px-4">
                        <div className="space-y-1">
                            <h3 className="text-3xl font-bold tracking-tightest italic uppercase">Active_Operatives</h3>
                            <p className="text-[10px] font-mono font-bold text-foreground/20 uppercase tracking-[0.4em]">Node Access Permissions</p>
                        </div>
                        <button className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.5em] italic hover:tracking-[0.7em] transition-all">View_All_Directory</button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {loading ? (
                            [1, 2, 3].map(i => <div key={i} className="h-28 level-1 animate-pulse rounded-[3rem] shadow-atmospheric" />)
                        ) : users.slice(0, 3).map((user) => (
                            <div key={user.id} className="group level-1 rounded-[3.5rem] p-8 pr-12 flex items-center justify-between hover:bg-primary/[0.02] transition-all shadow-atmospheric no-border-separation hover:scale-[1.01]">
                                <div className="flex items-center gap-10">
                                    <div className="relative">
                                        <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                        <img src={`https://ui-avatars.com/api/?name=${user.username}&background=random`} alt="Pilot" className="relative w-20 h-20 rounded-[2.5rem] border border-foreground/10 group-hover:border-primary/40 transition-colors" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-3xl font-bold italic tracking-tightest uppercase">{user.username}</h4>
                                        <p className="text-[10px] font-mono font-bold text-foreground/30 uppercase tracking-widest">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-12">
                                    <div className="hidden md:flex flex-col items-end gap-3">
                                        <div className={clsx(
                                            "px-5 py-2 rounded-full text-[8px] font-mono font-bold uppercase tracking-[0.4em] level-2 shadow-atmospheric",
                                            user.role === 'admin' ? "text-rose-500/60" : "text-emerald-500/60"
                                        )}>
                                            {user.role}
                                        </div>
                                        <span className="text-[8px] font-mono font-bold text-primary/40 uppercase tracking-[0.5em] italic">SESSION_ACTIVE</span>
                                    </div>
                                    <button className="p-5 level-2 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all shadow-atmospheric group/btn">
                                        <MoreHorizontal className="w-6 h-6 opacity-30 group-hover/btn:opacity-100" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="flex justify-center pt-8 pb-12 relative z-20">
                    <button className="w-24 h-24 liquid-gradient text-primary-foreground rounded-full flex items-center justify-center shadow-atmospheric light-emission hover:scale-110 active:scale-95 transition-all group">
                        <Plus className="w-10 h-10 group-hover:rotate-90 transition-transform duration-500" />
                    </button>
                </div>
            </main>
        </div>
    );
}
