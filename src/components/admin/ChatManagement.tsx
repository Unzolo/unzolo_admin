"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../utils/axios";
import { MessageSquare, ArrowRight, Clock, Loader2, Trash2, Flag } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";
import SearchFilterBar from "../ui/SearchFilterBar";

const SORT_OPTIONS = [
    { label: "Newest first", value: "newest" },
    { label: "Oldest first", value: "oldest" },
    { label: "Sender A–Z", value: "sender_asc" },
    { label: "Receiver A–Z", value: "receiver_asc" },
];

const FILTERS = [
    { label: "All", value: "all" },
    { label: "Moderated", value: "moderated" },
];

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
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("newest");
    const [filter, setFilter] = useState("all");

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["adminChats"],
        queryFn: async () => { const { data } = await api.get("/admin/chats"); return data; },
    });

    const handleDeleteMessage = async (id: number) => {
        if (!confirm("Delete this message permanently?")) return;
        try {
            await api.delete(`/admin/chats/messages/${id}`);
            toast.success("Message deleted");
            refetch();
        } catch { toast.error("Failed to delete message"); }
    };

    const toggleMessageModeration = async (messageId: number, currentModerated: boolean) => {
        const action = !currentModerated ? "moderate" : "unmoderate";
        if (!confirm(`Are you sure you want to ${action} this message? ${!currentModerated ? "It will be hidden from the users." : ""}`)) return;
        try {
            await api.post("/admin/chats/moderate", { messageId, moderated: !currentModerated });
            toast.success(`Message ${!currentModerated ? "moderated" : "restored"}`);
            refetch();
        } catch { toast.error(`Failed to ${action} message`); }
    };

    const allMessages: any[] = data?.messages || [];

    const displayed = useMemo(() => {
        let list = [...allMessages];
        const q = search.toLowerCase();

        if (q) list = list.filter(m =>
            (m.message || "").toLowerCase().includes(q) ||
            (m.sender?.username || "").toLowerCase().includes(q) ||
            (m.receiver?.username || "").toLowerCase().includes(q)
        );

        if (filter === "moderated") list = list.filter(m => m.is_moderated);

        if (sort === "newest") list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        if (sort === "oldest") list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        if (sort === "sender_asc") list.sort((a, b) => (a.sender?.username || "").localeCompare(b.sender?.username || ""));
        if (sort === "receiver_asc") list.sort((a, b) => (a.receiver?.username || "").localeCompare(b.receiver?.username || ""));

        return list;
    }, [allMessages, search, sort, filter]);

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
            <Loader2 size={28} className="text-primary-normal animate-spin" />
            <p className="text-sm text-gray-400">Loading conversations...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">User Chats</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Last {allMessages.length} messages</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm">
                    <Clock size={12} />
                    <span>Real-time view</span>
                </div>
            </div>

            <SearchFilterBar
                search={search}
                onSearchChange={setSearch}
                placeholder="Search by sender, receiver or message…"
                filters={FILTERS}
                activeFilter={filter}
                onFilterChange={setFilter}
                sortOptions={SORT_OPTIONS}
                activeSort={sort}
                onSortChange={setSort}
                total={allMessages.length}
                filtered={displayed.length}
            />

            {displayed.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 flex flex-col items-center gap-3 text-center">
                    <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center">
                        <MessageSquare size={24} className="text-gray-200" />
                    </div>
                    <p className="text-sm text-gray-400">{search || filter !== "all" ? "No messages match your filters." : "No chat records found."}</p>
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
                                    <th className="px-6 py-3.5 text-[0.6rem] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {displayed.map((msg: any, i: number) => (
                                    <motion.tr
                                        key={msg.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.02 }}
                                        className={`transition-colors group ${msg.is_moderated ? 'bg-red-50/20 hover:bg-red-50/40' : 'hover:bg-gray-50/60'}`}
                                    >
                                        <td className="px-6 py-3.5 w-48">
                                            <div className="flex items-center gap-3 text-left">
                                                <UserAvatar user={msg.sender} />
                                                <span className="text-sm font-semibold text-gray-700">{msg.sender?.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-2 py-3.5 w-8">
                                            <ArrowRight size={14} className="text-gray-200" />
                                        </td>
                                        <td className="px-6 py-3.5 w-48">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full overflow-hidden bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-xs border border-purple-100 shrink-0">
                                                    {msg.receiver?.profile_picture
                                                        ? <img src={msg.receiver.profile_picture} className="w-full h-full object-cover" />
                                                        : msg.receiver?.username?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-700">{msg.receiver?.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <div className="flex flex-col gap-1">
                                                <p className={`text-sm ${msg.is_moderated ? 'text-red-400 line-through' : 'text-gray-500'}`}>{msg.message}</p>
                                                <span className="text-[0.6rem] text-gray-300">{format(new Date(msg.created_at), "HH:mm, MMM d")}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => toggleMessageModeration(msg.id, !!msg.is_moderated)}
                                                    className={`p-2 rounded-xl transition-all ${msg.is_moderated ? 'text-emerald-500 hover:bg-emerald-50' : 'text-amber-500 hover:bg-amber-50'}`}
                                                    title={msg.is_moderated ? "Restore Message" : "Moderate Message"}
                                                >
                                                    <Flag size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMessage(msg.id)}
                                                    className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                                    title="Delete Message"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden divide-y divide-gray-50">
                        {displayed.map((msg: any, i: number) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className={`p-4 space-y-3 ${msg.is_moderated ? 'bg-red-50/20' : ''}`}
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
                                <div className="flex items-start gap-2">
                                    <p className={`flex-1 text-sm bg-gray-50 px-3 py-2.5 rounded-xl ${msg.is_moderated ? 'text-red-400 line-through bg-red-50/50' : 'text-gray-500'}`}>{msg.message}</p>
                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={() => toggleMessageModeration(msg.id, !!msg.is_moderated)}
                                            className={`p-2 rounded-xl border border-gray-100 bg-white ${msg.is_moderated ? 'text-emerald-500' : 'text-amber-500'}`}
                                        >
                                            <Flag size={12} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteMessage(msg.id)}
                                            className="p-2 rounded-xl border border-gray-100 bg-white text-gray-300"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

