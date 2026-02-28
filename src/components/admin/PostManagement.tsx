"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../utils/axios";
import { Heart, MessageCircle, Trash2, Eye, User as UserIcon, Flag, Loader2, RefreshCcw, Copy } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";
import SearchFilterBar from "../ui/SearchFilterBar";

const STAGING_URL = "https://staging.unzolo.com/api";
const PROD_URL = "https://api.unzolo.com/api";

const FILTERS = [
    { label: "All", value: "all" },
    { label: "Has Media", value: "media" },
    { label: "Text only", value: "text" },
    { label: "Popular (10+ likes)", value: "popular" },
];

const SORT_OPTIONS = [
    { label: "Newest first", value: "newest" },
    { label: "Oldest first", value: "oldest" },
    { label: "Most liked", value: "likes_desc" },
    { label: "Most commented", value: "comments_desc" },
    { label: "Most viewed", value: "views_desc" },
];

export default function PostManagement() {
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
        queryKey: ["adminPosts", viewSource],
        queryFn: async () => {
            const baseUrl = viewSource === "staging" ? STAGING_URL : "";
            const endpoint = baseUrl ? `${baseUrl}/admin/posts` : "/admin/posts";
            const { data } = await api.get(endpoint);
            return data;
        },
    });

    const cloneMutation = useMutation({
        mutationFn: async ({ id }: { id: number }) => {
            const res = await api.post("/admin/clone-data", {
                type: "posts",
                id,
                sourceUrl: STAGING_URL
            });
            return res.data;
        },
        onSuccess: () => {
            toast.success("Post cloned to Production!");
            queryClient.invalidateQueries({ queryKey: ["adminPosts"] });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Clone failed");
        }
    });

    const deletePost = async (id: string) => {
        if (!confirm("Delete this post permanently?")) return;
        try {
            await api.delete(`/admin/posts/${id}`);
            toast.success("Post deleted");
            refetch();
        } catch { toast.error("Failed to delete post"); }
    };

    const moderatePost = async (postId: string, currentModerated: boolean) => {
        const action = !currentModerated ? "moderate" : "unmoderate";
        if (!confirm(`Are you sure you want to ${action} this post? ${!currentModerated ? "It will be hidden from the frontend." : ""}`)) return;
        try {
            await api.post("/admin/posts/moderate", { postId, moderated: !currentModerated });
            toast.success(`Post ${!currentModerated ? "moderated and hidden" : "restored"}`);
            refetch();
        } catch { toast.error(`Failed to ${action} post`); }
    };

    const allPosts: any[] = data?.posts || [];

    const displayed = useMemo(() => {
        let list = [...allPosts];
        const q = search.toLowerCase();

        if (q) list = list.filter(p =>
            (p.content || "").toLowerCase().includes(q) ||
            (p.author?.username || "").toLowerCase().includes(q)
        );

        if (filter === "media") list = list.filter(p => p.media && p.media.length > 0);
        if (filter === "text") list = list.filter(p => !p.media || p.media.length === 0);
        if (filter === "popular") list = list.filter(p => (p.likesCount || 0) >= 10);
        if (filter === "moderated") list = list.filter(p => p.is_moderated);

        if (sort === "newest") list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        if (sort === "oldest") list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        if (sort === "likes_desc") list.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
        if (sort === "comments_desc") list.sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0));
        if (sort === "views_desc") list.sort((a, b) => (b.views || 0) - (a.views || 0));

        return list;
    }, [allPosts, search, filter, sort]);

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
            <Loader2 size={28} className="text-purple-500 animate-spin" />
            <p className="text-sm text-gray-400">Loading posts...</p>
        </div>
    );

    const isFromStaging = viewSource === "staging";

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-gray-900">Post Moderation</h2>
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
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewSource === "staging" ? "bg-purple-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                >
                                    Staging
                                </button>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {isFromStaging ? `Browsing staging - ${allPosts.length} posts found` : `${allPosts.length} posts to review`}
                    </p>
                </div>
            </div>

            <SearchFilterBar
                search={search}
                onSearchChange={setSearch}
                placeholder="Search by content or author…"
                filters={[...FILTERS, { label: "Moderated", value: "moderated" }]}
                activeFilter={filter}
                onFilterChange={setFilter}
                sortOptions={SORT_OPTIONS}
                activeSort={sort}
                onSortChange={setSort}
                total={allPosts.length}
                filtered={displayed.length}
            />

            {displayed.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 flex flex-col items-center gap-3 text-center">
                    <div className="h-14 w-14 rounded-2xl bg-purple-50 flex items-center justify-center">
                        <Flag size={24} className="text-purple-200" />
                    </div>
                    <p className="text-sm text-gray-400">{search || filter !== "all" ? "No posts match your filters." : "No posts to moderate."}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {displayed.map((post: any, i: number) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all group ${isFromStaging ? 'border-purple-200 bg-purple-50/10' : (post.is_moderated ? 'border-red-100 bg-red-50/5' : 'border-gray-100')}`}
                        >
                            {/* Header */}
                            <div className={`px-4 py-3 flex items-center justify-between border-b ${isFromStaging ? 'bg-purple-50' : (post.is_moderated ? 'bg-red-50/30 border-red-50 text-red-900' : 'bg-gray-50/50 border-gray-50')}`}>
                                <div className="flex items-center gap-2.5">
                                    <div className="h-7 w-7 rounded-full overflow-hidden bg-gray-200 shrink-0">
                                        {post.author?.profile_picture
                                            ? <img src={post.author.profile_picture} className="w-full h-full object-cover" />
                                            : <UserIcon size={14} className="m-auto mt-1.5 text-gray-400" />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-700">@{post.author?.username || "unknown"}</p>
                                        <p className="text-[0.6rem] text-gray-400">{format(new Date(post.created_at), "MMM d, yyyy")}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {isFromStaging && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); cloneMutation.mutate({ id: post.id }); }}
                                            disabled={cloneMutation.isPending && cloneMutation.variables?.id === post.id}
                                            className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white rounded-lg text-[0.6rem] font-bold shadow-lg hover:bg-purple-700 active:scale-95 transition-all"
                                        >
                                            {cloneMutation.isPending && cloneMutation.variables?.id === post.id ? <Loader2 size={10} className="animate-spin" /> : <Copy size={10} />}
                                            CLONE
                                        </button>
                                    )}
                                    {post.is_moderated && !isFromStaging && (
                                        <span className="text-[0.6rem] font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded-full mr-2">MODERATED</span>
                                    )}
                                    {!isFromStaging && (
                                        <button onClick={() => deletePost(post.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 flex-1">
                                <p className={`text-sm line-clamp-4 leading-relaxed ${post.is_moderated ? 'text-gray-400 italic' : 'text-gray-600'}`}>
                                    {post.content || <span className="italic text-gray-300">No text content</span>}
                                </p>
                            </div>

                            {/* Footer */}
                            {!isFromStaging && (
                                <div className="px-4 py-3 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <StatChip icon={Heart} value={post.likesCount || 0} color="text-red-400" />
                                        <StatChip icon={MessageCircle} value={post.commentsCount || 0} color="text-blue-400" />
                                        <StatChip icon={Eye} value={post.views || 0} color="text-gray-400" />
                                    </div>
                                    <button
                                        onClick={() => moderatePost(post.id, !!post.is_moderated)}
                                        className={`flex items-center gap-1.5 text-[0.6rem] font-bold transition-colors ${post.is_moderated ? 'text-emerald-500 hover:text-emerald-600' : 'text-amber-500 hover:text-amber-600'}`}
                                    >
                                        <Flag size={10} />
                                        {post.is_moderated ? "RESTORE POST" : "MODERATE"}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

function StatChip({ icon: Icon, value, color }: { icon: any; value: number; color: string }) {
    return (
        <div className={`flex items-center gap-1 ${color}`}>
            <Icon size={12} />
            <span className="text-[0.65rem] font-semibold text-gray-500">{value}</span>
        </div>
    );
}
