"use client";

import { useState, useEffect } from "react";
import { Shield, Users, Database, BarChart3, Settings, Search, MoreVertical, Filter, Activity, Server, AlertTriangle, Monitor } from "lucide-react";
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
    const [activeTab, setActiveTab] = useState("users");

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
        // optionally set up polling
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
        <div className="flex h-[calc(100vh-64px)] bg-[#f6f5f8] dark:bg-[#151022] font-display text-slate-900 dark:text-slate-100 overflow-hidden">
            {/* Sidebar Navigation */}
            <aside className="w-64 flex-shrink-0 border-r border-primary/10 bg-white/50 dark:bg-[#151022]/80 backdrop-blur-md flex flex-col z-10 hidden md:flex">
                <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-4">Command Center</p>
                    <button onClick={() => setActiveTab("users")} className={clsx("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all border shadow-sm", activeTab === "users" ? "bg-primary/10 text-primary border-primary/20" : "border-transparent text-slate-400 hover:bg-primary/5 hover:text-slate-200")}>
                        <Users className="w-5 h-5" /> User Management
                    </button>
                    <button onClick={() => setActiveTab("health")} className={clsx("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all border", activeTab === "health" ? "bg-primary/10 text-primary border-primary/20" : "border-transparent text-slate-400 hover:bg-primary/5 hover:text-slate-200")}>
                        <Monitor className="w-5 h-5" /> System Health
                    </button>
                    <button onClick={() => setActiveTab("api")} className={clsx("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all border", activeTab === "api" ? "bg-primary/10 text-primary border-primary/20" : "border-transparent text-slate-400 hover:bg-primary/5 hover:text-slate-200")}>
                        <Activity className="w-5 h-5" /> API Traffic Logs
                    </button>
                    <button onClick={() => setActiveTab("settings")} className={clsx("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all border", activeTab === "settings" ? "bg-primary/10 text-primary border-primary/20" : "border-transparent text-slate-400 hover:bg-primary/5 hover:text-slate-200")}>
                        <Settings className="w-5 h-5" /> System Settings
                    </button>
                </nav>
                <div className="p-4 border-t border-primary/10 space-y-4 m-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Maintenance</span>
                            <span className="text-sm font-medium text-slate-300">Service Mode</span>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-700 hover:bg-slate-600 transition-colors">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-slate-400 translate-x-1"></span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 relative z-10 custom-scrollbar">
                    {/* Hero Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white/90">System Overview</h1>
                            <p className="text-slate-400 font-medium mt-1">Real-time health monitoring and global access control.</p>
                        </div>
                        <div className={`flex items-center gap-2 text-sm font-bold ${stats?.system_alerts > 0 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'} px-4 py-2 rounded-xl border`}>
                            <span className="relative flex h-2.5 w-2.5 mr-1">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${stats?.system_alerts > 0 ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`}></span>
                                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${stats?.system_alerts > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                            </span>
                            {stats?.system_alerts > 0 ? `${stats.system_alerts} Active Alerts` : "All Systems Operational"}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-6 bg-white/5 dark:bg-primary/5 border border-primary/10 rounded-2xl shadow-lg backdrop-blur-sm group hover:border-primary/30 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <span className="text-emerald-400 text-xs font-bold px-2 py-1 bg-emerald-400/10 rounded">Live</span>
                            </div>
                            <p className="text-sm font-medium text-slate-400">Total API Traffic</p>
                            <h3 className="text-3xl font-black mt-1 text-white">{stats?.api_usage?.toLocaleString() || "..."}</h3>
                            <div className="mt-4 w-full bg-primary/10 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(137,91,245,0.6)]" style={{ width: '45%' }}></div>
                            </div>
                        </div>
                        
                        <div className="p-6 bg-white/5 dark:bg-primary/5 border border-primary/10 rounded-2xl shadow-lg backdrop-blur-sm group hover:border-blue-500/30 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500 group-hover:scale-110 transition-transform">
                                    <Users className="w-6 h-6" />
                                </div>
                                <span className="text-emerald-400 text-xs font-bold px-2 py-1 bg-emerald-400/10 rounded">Live</span>
                            </div>
                            <p className="text-sm font-medium text-slate-400">Total Users</p>
                            <h3 className="text-3xl font-black mt-1 text-white">{stats?.total_users || users.length || "..."}</h3>
                            <p className="text-xs text-slate-500 mt-2 font-mono">Peak: {stats?.peak_concurrent || "..."} concurrent</p>
                        </div>
                        
                        <div className="p-6 bg-white/5 dark:bg-primary/5 border border-primary/10 rounded-2xl shadow-lg backdrop-blur-sm group hover:border-amber-500/30 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500 group-hover:scale-110 transition-transform">
                                    <Database className="w-6 h-6" />
                                </div>
                                <span className="text-slate-400 text-xs font-bold px-2 py-1 bg-slate-800 rounded">Live</span>
                            </div>
                            <p className="text-sm font-medium text-slate-400">DB Health</p>
                            <h3 className="text-3xl font-black mt-1 text-white">{stats?.db_health || "..."}</h3>
                            <p className="text-xs text-emerald-400 mt-2 font-mono">Synced OK</p>
                        </div>

                        <div className="p-6 bg-white/5 dark:bg-primary/5 border border-primary/10 rounded-2xl shadow-lg backdrop-blur-sm group hover:border-red-500/30 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-red-500/10 rounded-xl text-red-500 group-hover:scale-110 transition-transform">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <span className={clsx("text-xs font-bold px-2 py-1 rounded", stats?.system_alerts > 0 ? "text-red-400 bg-red-500/10" : "text-emerald-400 bg-emerald-500/10")}>
                                    Live
                                </span>
                            </div>
                            <p className="text-sm font-medium text-slate-400">System Alerts</p>
                            <h3 className="text-3xl font-black mt-1 text-white">{stats?.system_alerts ?? "..."}</h3>
                            <p className={clsx("text-xs mt-2 font-mono", stats?.system_alerts > 0 ? "text-red-400" : "text-emerald-400")}>
                                {stats?.system_alerts > 0 ? "Requires review" : "No critical incidents"}
                            </p>
                        </div>
                    </div>

                    {/* Main Grid Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                        {/* User Management Table */}
                        {activeTab === "users" && (
                            <div className="lg:col-span-2 bg-primary/5 border border-primary/10 rounded-2xl shadow-xl overflow-hidden flex flex-col backdrop-blur-md">
                                <div className="p-6 border-b border-primary/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-primary" /> User Management
                                        </h3>
                                        <p className="text-sm text-slate-400 mt-1">Filter and manage platform accounts</p>
                                    </div>
                                    <div className="flex gap-3 w-full sm:w-auto">
                                        <div className="relative flex-1 sm:w-64">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                className="w-full bg-slate-900/50 border border-primary/20 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-white"
                                                placeholder="Search users..."
                                            />
                                        </div>
                                        <button className="p-2 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-colors shrink-0">
                                            <Filter className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-[#151022]/80 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-primary/10">
                                            <tr>
                                                <th className="px-6 py-4">User</th>
                                                <th className="px-6 py-4">Role</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Joined</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-primary/5 text-sm">
                                            {users.length > 0 ? users.map((user) => (
                                                <tr key={user.id} className="hover:bg-primary/5 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-background-dark", 
                                                                user.role === 'admin' ? "bg-rose-500/20 text-rose-400" :
                                                                user.role === 'faculty' ? "bg-primary/20 text-primary" :
                                                                "bg-emerald-500/20 text-emerald-400"
                                                            )}>
                                                                {user.username.slice(0, 2).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-200">{user.username}</p>
                                                                <p className="text-xs text-slate-500">{user.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <select
                                                            value={user.role}
                                                            onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                                                            className={clsx(
                                                                "bg-slate-900 border border-primary/20 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-sm",
                                                                user.role === 'admin' ? "text-rose-400" : user.role === 'faculty' ? "text-primary" : "text-emerald-400"
                                                            )}
                                                        >
                                                            <option value="student">Student</option>
                                                            <option value="faculty">Faculty</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.8)]"></span> एक्टिव
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-400">{new Date(user.joined).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No users found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-4 border-t border-primary/10 flex items-center justify-between text-xs text-slate-500 font-medium bg-[#151022]/40">
                                    <span>Showing {users.length} users</span>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1.5 bg-slate-800 rounded-lg font-bold hover:bg-slate-700 transition-colors">Prev</button>
                                        <button className="px-3 py-1.5 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors">Next</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "health" && (
                            <div className="lg:col-span-2 bg-primary/5 border border-primary/10 rounded-2xl shadow-xl overflow-hidden flex items-center justify-center p-12 backdrop-blur-md">
                                <div className="text-center space-y-4">
                                    <Monitor className="w-12 h-12 text-primary mx-auto opacity-50" />
                                    <h3 className="text-xl font-bold text-white">System Health Active</h3>
                                    <p className="text-slate-400 text-sm max-w-sm">
                                        Database {stats?.db_health} synced. Background workers responsive. No latency anomalies detected in the last hour.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === "api" && (
                            <div className="lg:col-span-2 bg-primary/5 border border-primary/10 rounded-2xl shadow-xl overflow-hidden flex items-center justify-center p-12 backdrop-blur-md">
                                <div className="text-center space-y-4">
                                    <Activity className="w-12 h-12 text-primary mx-auto opacity-50" />
                                    <h3 className="text-xl font-bold text-white">API Traffic Logs Running</h3>
                                    <p className="text-slate-400 text-sm max-w-sm">
                                        Streaming {stats?.api_usage} recent requests. Rate limits normal.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === "settings" && (
                            <div className="lg:col-span-2 bg-primary/5 border border-primary/10 rounded-2xl shadow-xl overflow-hidden flex items-center justify-center p-12 backdrop-blur-md">
                                <div className="text-center space-y-4">
                                    <Settings className="w-12 h-12 text-primary mx-auto opacity-50" />
                                    <h3 className="text-xl font-bold text-white">System Settings Managed</h3>
                                    <p className="text-slate-400 text-sm max-w-sm">
                                        Configuration changes globally synchronized.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Side Widgets */}
                        <div className="space-y-6">
                            {/* System Alerts */}
                            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 shadow-xl backdrop-blur-md">
                                <h3 className="font-bold border-b border-primary/10 pb-4 mb-4 text-slate-200 flex items-center gap-2">
                                    <Server className="w-4 h-4 text-slate-400" /> Infrastructure Events
                                </h3>
                                <div className="space-y-4">
                                    {stats?.system_alerts > 0 ? (
                                        <div className="flex gap-4 items-start p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                            <div className="p-1.5 bg-red-500/20 rounded-lg text-red-400 shrink-0">
                                                <AlertTriangle className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-red-400">Submission Evaluation Error</p>
                                                <p className="text-xs text-slate-400 mt-1">Detected runtime/system errors from submissions.</p>
                                                <p className="text-[10px] font-bold mt-2 text-slate-500">ACTIVE</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-4 items-start p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                            <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400 shrink-0">
                                                <Activity className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-emerald-400">No Active Alerts</p>
                                                <p className="text-xs text-slate-400 mt-1">All subsystems operating nominally.</p>
                                                <p className="text-[10px] font-bold mt-2 text-slate-500">LIVE</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button className="w-full mt-6 py-2.5 rounded-lg border border-primary/20 text-xs font-bold text-primary hover:bg-primary/10 transition-colors">
                                    View Full Logs
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
