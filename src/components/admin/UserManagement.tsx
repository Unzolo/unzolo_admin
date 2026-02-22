"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../utils/axios";
import {
    User as UserIcon,
    MoreVertical,
    ShieldAlert,
    ShieldCheck,
    Mail,
    Phone
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function UserManagement() {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ["adminUsers"],
        queryFn: async () => {
            const { data } = await api.get("/admin/users");
            return data;
        },
    });

    const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
        try {
            await api.post("/admin/users/status", { userId, status: !currentStatus });
            toast.success(`User ${!currentStatus ? "activated" : "blocked"} successfully`);
            refetch();
        } catch (error) {
            console.error("Failed to toggle user status:", error);
            toast.error("Failed to update user status");
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Users...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-800">Users ({data?.users?.length || 0})</h2>
                <div className="flex gap-2">
                    <button className="flex-1 sm:flex-none bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all text-center">Export CSV</button>
                </div>
            </div>

            <div className="grid gap-4">
                {data?.users?.map((user: any) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={user.id}
                        className="bg-white p-4 sm:p-5 rounded-lg border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary-light transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden border border-gray-100 flex items-center justify-center bg-gray-50 shrink-0">
                                {user.profile_picture ? (
                                    <img src={user.profile_picture} alt={user.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="text-gray-300" size={20} />
                                )}
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate">{user.full_name || "Unnamed User"}</h3>
                                <p className="text-xs sm:text-sm text-gray-400 truncate">@{user.username || "no-username"}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                            <div className="hidden md:flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-gray-500">
                                    <Phone size={14} />
                                    <span className="text-xs">{user.phone_number}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-500">
                                    <ShieldCheck size={14} className={user.role === 'admin' ? "text-primary-normal" : "text-gray-300"} />
                                    <span className="text-xs capitalize">{user.role}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 ml-auto sm:ml-0">
                                <button
                                    onClick={() => toggleUserStatus(user.id, user.is_active)}
                                    className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-[0.65rem] sm:text-[0.7rem] font-bold transition-all ${user.is_active
                                        ? "bg-green-50 text-green-600 hover:bg-red-50 hover:text-red-600"
                                        : "bg-red-50 text-red-600 hover:bg-green-50 hover:text-green-600"
                                        }`}
                                >
                                    {user.is_active ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                                    {user.is_active ? "Active" : "Blocked"}
                                </button>
                                <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg group-hover:text-gray-600">
                                    <MoreVertical size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
