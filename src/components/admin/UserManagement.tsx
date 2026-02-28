"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../utils/axios";
import { User as UserIcon, ShieldAlert, ShieldCheck, Phone, MoreVertical, Loader2, Users, RefreshCcw, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import SearchFilterBar from "../ui/SearchFilterBar";

const STAGING_URL = "https://staging.unzolo.com/api";
const PROD_URL = "https://api.unzolo.com/api";

const FILTERS = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Blocked", value: "blocked" },
    { label: "Admin", value: "admin" },
];

const SORT_OPTIONS = [
    { label: "Name A–Z", value: "name_asc" },
    { label: "Name Z–A", value: "name_desc" },
    { label: "Newest first", value: "newest" },
    { label: "Oldest first", value: "oldest" },
];

export default function UserManagement() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [sort, setSort] = useState("newest");
    const [viewSource, setViewSource] = useState<"local" | "staging">("local");
    const [currentEnv, setCurrentEnv] = useState<string>("");

    useEffect(() => {
        const saved = localStorage.getItem('unzolo_api_override');
        if (saved === PROD_URL) setCurrentEnv("production");
        else if (saved === STAGING_URL) setCurrentEnv("staging");
        else setCurrentEnv("default");
    }, []);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["adminUsers", viewSource],
        queryFn: async () => {
            const baseUrl = viewSource === "staging" ? STAGING_URL : "";
            const endpoint = baseUrl ? `${baseUrl}/admin/users` : "/admin/users";
            const { data } = await api.get(endpoint);
            return data;
        },
    });

    const cloneMutation = useMutation({
        mutationFn: async ({ id }: { id: string }) => {
            const res = await api.post("/admin/clone-data", {
                type: "users",
                id,
                sourceUrl: STAGING_URL
            });
            return res.data;
        },
        onSuccess: () => {
            toast.success("User synced from Staging!");
            queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Sync failed");
        }
    });

    const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
        try {
            await api.post("/admin/users/status", { userId, status: !currentStatus });
            toast.success(`User ${!currentStatus ? "activated" : "blocked"}`);
            refetch();
        } catch { toast.error("Failed to update user status"); }
    };


    const allUsers: any[] = data?.users || [];

    const displayed = useMemo(() => {
        let list = [...allUsers];

        // Search
        const q = search.toLowerCase();
        if (q) list = list.filter(u =>
            (u.full_name || "").toLowerCase().includes(q) ||
            (u.username || "").toLowerCase().includes(q) ||
            (u.phone_number || "").toLowerCase().includes(q)
        );

        // Filter
        if (filter === "active") list = list.filter(u => u.is_active);
        if (filter === "blocked") list = list.filter(u => !u.is_active);
        if (filter === "admin") list = list.filter(u => u.role === "admin");

        // Sort
        if (sort === "name_asc") list.sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));
        if (sort === "name_desc") list.sort((a, b) => (b.full_name || "").localeCompare(a.full_name || ""));
        if (sort === "newest") list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        if (sort === "oldest") list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        return list;
    }, [allUsers, search, filter, sort]);

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
            <Loader2 size={28} className="text-blue-500 animate-spin" />
            <p className="text-sm text-gray-400">Loading users...</p>
        </div>
    );

    const isFromStaging = viewSource === "staging";

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                        {currentEnv === "production" && (
                            <div className="flex p-0.5 bg-gray-100 rounded-xl">
                                <button
                                    onClick={() => setViewSource("local")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewSource === "local" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                >
                                    Production
                                </button>
                                <button
                                    onClick={() => setViewSource("staging")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewSource === "staging" ? "bg-blue-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                >
                                    Staging
                                </button>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {isFromStaging ? `Browsing staging - ${allUsers.length} records found` : `${allUsers.length} registered users`}
                    </p>
                </div>
            </div>

            <SearchFilterBar
                search={search}
                onSearchChange={setSearch}
                placeholder="Search by name, username or phone…"
                filters={FILTERS}
                activeFilter={filter}
                onFilterChange={setFilter}
                sortOptions={SORT_OPTIONS}
                activeSort={sort}
                onSortChange={setSort}
                total={allUsers.length}
                filtered={displayed.length}
            />

            {displayed.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 flex flex-col items-center gap-3 text-center">
                    <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <Users size={24} className="text-blue-200" />
                    </div>
                    <p className="text-sm text-gray-400">{search || filter !== "all" ? "No users match your filters." : "No users found."}</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="divide-y divide-gray-50">
                        {displayed.map((user: any, i: number) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors group ${isFromStaging ? 'bg-blue-50/10' : ''}`}
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

                                {/* Status / Sync toggle */}
                                <div className="flex items-center gap-2">
                                    {isFromStaging ? (
                                        <button
                                            onClick={() => cloneMutation.mutate({ id: user.id })}
                                            disabled={cloneMutation.isPending && cloneMutation.variables?.id === user.id}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-[0.65rem] font-bold shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
                                        >
                                            {cloneMutation.isPending && cloneMutation.variables?.id === user.id ? <Loader2 size={12} className="animate-spin" /> : <Copy size={12} />}
                                            SYNC USER
                                        </button>
                                    ) : (
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
                                    )}

                                    {!isFromStaging && (
                                        <button className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100 shrink-0">
                                            <MoreVertical size={15} />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
