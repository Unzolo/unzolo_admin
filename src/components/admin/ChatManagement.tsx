"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../utils/axios";
import {
    MessageSquare,
    User as UserIcon,
    Clock,
    Search,
    ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function ChatManagement() {
    const { data, isLoading } = useQuery({
        queryKey: ["adminChats"],
        queryFn: async () => {
            const { data } = await api.get("/admin/chats");
            return data;
        },
    });

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Chats...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Recent User Conversations</h2>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={12} />
                    <span>Showing last 100 messages</span>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                {/* Mobile View: Cards */}
                <div className="md:hidden divide-y divide-gray-50">
                    {data?.messages?.map((msg: any) => (
                        <div key={msg.id} className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-[0.5rem] border border-blue-100">
                                        {msg.sender?.profile_picture ? (
                                            <img src={msg.sender.profile_picture} className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            msg.sender?.username?.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <span className="text-xs font-bold text-gray-700">{msg.sender?.username}</span>
                                </div>
                                <ArrowRight size={10} className="text-gray-300" />
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-700">{msg.receiver?.username}</span>
                                    <div className="h-6 w-6 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-[0.5rem] border border-purple-100">
                                        {msg.receiver?.profile_picture ? (
                                            <img src={msg.receiver.profile_picture} className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            msg.receiver?.username?.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg italic">
                                "{msg.message}"
                            </p>
                            <div className="flex justify-end italic">
                                <span className="text-[0.6rem] text-gray-400">{format(new Date(msg.created_at), "HH:mm, MMM d")}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Sender</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center"></th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Receiver</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Message</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data?.messages?.map((msg: any) => (
                                <tr key={msg.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-[0.6rem] border border-blue-100">
                                                {msg.sender?.profile_picture ? (
                                                    <img src={msg.sender.profile_picture} className="w-full h-full object-cover rounded-full" />
                                                ) : (
                                                    msg.sender?.username?.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <span className="text-sm font-semibold text-gray-700">{msg.sender?.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <ArrowRight size={14} className="text-gray-300 mx-auto" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-[0.6rem] border border-purple-100">
                                                {msg.receiver?.profile_picture ? (
                                                    <img src={msg.receiver.profile_picture} className="w-full h-full object-cover rounded-full" />
                                                ) : (
                                                    msg.receiver?.username?.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <span className="text-sm font-semibold text-gray-700">{msg.receiver?.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600 line-clamp-1 max-w-xs">{msg.message}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-gray-400">{format(new Date(msg.created_at), "HH:mm, MMM d")}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {(!data?.messages || data.messages.length === 0) && (
                    <div className="py-20 text-center text-gray-400 italic text-sm">No historical chat records found.</div>
                )}
            </div>
        </div>
    );
}
