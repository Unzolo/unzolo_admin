"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../utils/axios";
import { User as UserIcon, ShieldAlert, ShieldCheck, Phone, MoreVertical, Loader2, Users } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function UserManagement() {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ["adminUsers"],
        queryFn: async () => { const { data } = await api.get("/admin/users"); return data; },
    });

    const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
        try {
            await api.post("/admin/users/status", { userId, status: !currentStatus });
            toast.success(`User ${!currentStatus ? "activated" : "blocked"}`);
            refetch();
        } catch { toast.error("Failed to update user status"); }
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
            <Loader2 size={28} className="text-blue-500 animate-spin" />
            <p className="text-sm text-gray-400">Loading users...</p>
        </div>
    );

    const users = data?.users || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{users.length} registered users</p>
                </div>
                <button className="flex items-center gap-2 h-9 px-4 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
                    Export CSV
                </button>
            </div>

            {users.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 flex flex-col items-center gap-3 text-center">
                    <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <Users size={24} className="text-blue-200" />
                    </div>
                    <p className="text-sm text-gray-400">No users found.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="divide-y divide-gray-50">
                        {users.map((user: any, i: number) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors group"
                            >
                                {/* Avatar */}
                                <div className="h-10 w-10 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0 border border-gray-100">
                                    {user.profile_picture
                                        ? <img src={user.profile_picture} alt={user.full_name} className="w-full h-full object-cover" />
                                        : <UserIcon size={16} className="text-gray-300" />}
                                </div>

                                {/* Name / Username */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{user.full_name || "Unnamed User"}</p>
                                    <p className="text-xs text-gray-400 truncate">@{user.username || "no-username"}</p>
                                </div>

                                {/* Phone */}
                                <div className="hidden md:flex items-center gap-1.5 text-gray-400 text-xs shrink-0">
                                    <Phone size={12} />
                                    <span>{user.phone_number || "—"}</span>
                                </div>

                                {/* Role badge */}
                                <div className="hidden lg:block shrink-0">
                                    <span className={`text-[0.6rem] font-bold px-2.5 py-1 rounded-full capitalize ${user.role === 'admin' ? 'bg-primary-light text-primary-normal' : 'bg-gray-100 text-gray-500'
                                        }`}>{user.role || "user"}</span>
                                </div>

                                {/* Status toggle */}
                                <button
                                    onClick={() => toggleUserStatus(user.id, user.is_active)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[0.65rem] font-bold transition-all shrink-0 ${user.is_active
                                            ? "bg-emerald-50 text-emerald-600 hover:bg-red-50 hover:text-red-600"
                                            : "bg-red-50 text-red-600 hover:bg-emerald-50 hover:text-emerald-600"
                                        }`}
                                >
                                    {user.is_active ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                                    {user.is_active ? "Active" : "Blocked"}
                                </button>

                                <button className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100 shrink-0">
                                    <MoreVertical size={15} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
