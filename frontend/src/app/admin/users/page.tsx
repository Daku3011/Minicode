"use client";

import { useState, useEffect } from "react";
import { Shield, Users, Database, BarChart3, Settings, Search, MoreVertical, UserPlus, ShieldCheck, ShieldAlert, Mail } from "lucide-react";
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get("/admin/users");
                setUsers(response.data);
            } catch (error) {
                console.error("Fetch users error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
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
        <div className="flex h-screen bg-[#020617]">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-white/[0.02] flex flex-col">
                <div className="p-8">
                    <div className="flex items-center space-x-3 group cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white ring-4 ring-rose-500/20 rotate-3 group-hover:rotate-0 transition-transform duration-300">
                            <Shield className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-black text-white tracking-tight">MiniCode <span className="text-rose-500 text-xs ml-1 bg-rose-500/10 px-2 py-0.5 rounded-full uppercase">Admin</span></span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {[
                        { id: "users", icon: Users, label: "User Management" },
                        { id: "problems", icon: Database, label: "System Problems" },
                        { id: "analytics", icon: BarChart3, label: "System Stats" },
                        { id: "settings", icon: Settings, label: "System Settings" },
                    ].map((item) => (
                        <button
                            key={item.id}
                            className={clsx(
                                "w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                                item.id === "users"
                                    ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-12">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2">System Administration</h1>
                        <p className="text-muted-foreground">Global user management and role assignment.</p>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[
                        { label: "Total Users", value: "1,452", icon: Users, color: "text-indigo-400" },
                        { label: "Active Faculty", value: "42", icon: ShieldCheck, color: "text-emerald-400" },
                        { label: "Storage Used", value: "85%", icon: Database, color: "text-amber-400" },
                    ].map((stat, i) => (
                        <div key={i} className="glass rounded-3xl p-8 border-white/5">
                            <stat.icon className={clsx("w-6 h-6 mb-4", stat.color)} />
                            <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Users Table */}
                <div className="glass rounded-3xl overflow-hidden border-white/5">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white">Platform Users</h3>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/50 text-white w-64"
                                placeholder="Search by username or email..."
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    <th className="px-8 py-5">User</th>
                                    <th className="px-8 py-5">Role</th>
                                    <th className="px-8 py-5">Joined Date</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.02]">
                                {users.map((user) => (
                                    <tr key={user.id} className="group hover:bg-white/[0.01] transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-white text-xs">
                                                    {user.username.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white">{user.username}</span>
                                                    <span className="text-[10px] text-muted-foreground flex items-center">
                                                        <Mail className="w-2 h-2 mr-1" />
                                                        {user.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <select
                                                value={user.role}
                                                className={clsx(
                                                    "bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-rose-500/20",
                                                    user.role === 'admin' ? "text-rose-400" : user.role === 'faculty' ? "text-primary" : "text-emerald-400"
                                                )}
                                                onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                                            >
                                                <option value="student">Student</option>
                                                <option value="faculty">Faculty</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-8 py-6 text-sm text-muted-foreground">{user.joined}</td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-rose-500 transition-all">
                                                <ShieldAlert className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-all">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
