"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../utils/axios";
import { MessageSquare, ArrowRight, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

function UserAvatar({ user, size = "md" }: { user: any; size?: "sm" | "md" }) {
    const dim = size === "sm" ? "h-6 w-6 text-[0.5rem]" : "h-9 w-9 text-xs";
    const initial = user?.username?.charAt(0)?.toUpperCase() || "?";
    return (
        <div className={`${dim} rounded-full overflow-hidden bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100 shrink-0`}>
            {user?.profile_picture
                ? <img src={user.profile_picture} className="w-full h-full object-cover" alt="" />
                : initial}
        </div>
    );
}

export default function ChatManagement() {
    const { data, isLoading } = useQuery({
        queryKey: ["adminChats"],
        queryFn: async () => { const { data } = await api.get("/admin/chats"); return data; },
    });

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
            <Loader2 size={28} className="text-primary-normal animate-spin" />
            <p className="text-sm text-gray-400">Loading conversations...</p>
        </div>
    );

    const messages = data?.messages || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">User Chats</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Last {messages.length} messages</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm">
                    <Clock size={12} />
                    <span>Real-time view</span>
                </div>
            </div>

            {messages.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 flex flex-col items-center gap-3 text-center">
                    <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center">
                        <MessageSquare size={24} className="text-gray-200" />
                    </div>
                    <p className="text-sm text-gray-400">No chat records found.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-50">
                                    <th className="px-6 py-3.5 text-[0.6rem] font-bold uppercase tracking-widest text-gray-400">From</th>
                                    <th className="px-2 py-3.5 text-[0.6rem] font-bold uppercase tracking-widest text-gray-400 w-8"></th>
                                    <th className="px-6 py-3.5 text-[0.6rem] font-bold uppercase tracking-widest text-gray-400">To</th>
                                    <th className="px-6 py-3.5 text-[0.6rem] font-bold uppercase tracking-widest text-gray-400">Message</th>
                                    <th className="px-6 py-3.5 text-[0.6rem] font-bold uppercase tracking-widest text-gray-400 text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {messages.map((msg: any, i: number) => (
                                    <motion.tr
                                        key={msg.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.02 }}
                                        className="hover:bg-gray-50/60 transition-colors"
                                    >
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <UserAvatar user={msg.sender} />
                                                <span className="text-sm font-semibold text-gray-700">{msg.sender?.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-2 py-3.5">
                                            <ArrowRight size={14} className="text-gray-200" />
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full overflow-hidden bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-xs border border-purple-100 shrink-0">
                                                    {msg.receiver?.profile_picture
                                                        ? <img src={msg.receiver.profile_picture} className="w-full h-full object-cover" />
                                                        : msg.receiver?.username?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-700">{msg.receiver?.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5 max-w-xs">
                                            <p className="text-sm text-gray-500 truncate">{msg.message}</p>
                                        </td>
                                        <td className="px-6 py-3.5 text-right">
                                            <span className="text-xs text-gray-400">{format(new Date(msg.created_at), "HH:mm, MMM d")}</span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden divide-y divide-gray-50">
                        {messages.map((msg: any, i: number) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="p-4 space-y-3"
                            >
                                <div className="flex items-center gap-2">
                                    <UserAvatar user={msg.sender} size="sm" />
                                    <span className="text-xs font-bold text-gray-700">{msg.sender?.username}</span>
                                    <ArrowRight size={10} className="text-gray-300 mx-0.5" />
                                    <div className="h-6 w-6 rounded-full overflow-hidden bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-[0.5rem] border border-purple-100 shrink-0">
                                        {msg.receiver?.profile_picture
                                            ? <img src={msg.receiver.profile_picture} className="w-full h-full object-cover" />
                                            : msg.receiver?.username?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <span className="text-xs font-bold text-gray-700">{msg.receiver?.username}</span>
                                    <span className="ml-auto text-[0.6rem] text-gray-400">{format(new Date(msg.created_at), "HH:mm")}</span>
                                </div>
                                <p className="text-sm text-gray-500 bg-gray-50 px-3 py-2.5 rounded-xl">{msg.message}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
