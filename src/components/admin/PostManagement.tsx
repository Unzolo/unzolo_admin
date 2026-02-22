"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../utils/axios";
import { Heart, MessageCircle, Trash2, Eye, User as UserIcon, Flag, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function PostManagement() {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ["adminPosts"],
        queryFn: async () => { const { data } = await api.get("/admin/posts"); return data; },
    });

    const deletePost = async (id: string) => {
        if (!confirm("Delete this post permanently?")) return;
        try {
            await api.delete(`/admin/posts/${id}`);
            toast.success("Post deleted");
            refetch();
        } catch { toast.error("Failed to delete post"); }
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
            <Loader2 size={28} className="text-purple-500 animate-spin" />
            <p className="text-sm text-gray-400">Loading posts...</p>
        </div>
    );

    const posts = data?.posts || [];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Post Moderation</h2>
                <p className="text-xs text-gray-400 mt-0.5">{posts.length} posts to review</p>
            </div>

            {posts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 flex flex-col items-center gap-3 text-center">
                    <div className="h-14 w-14 rounded-2xl bg-purple-50 flex items-center justify-center">
                        <Flag size={24} className="text-purple-200" />
                    </div>
                    <p className="text-sm text-gray-400">No posts to moderate.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {posts.map((post: any, i: number) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md hover:border-gray-200 transition-all group"
                        >
                            {/* Header */}
                            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-50 bg-gray-50/50">
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
                                <button onClick={() => deletePost(post.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-4 flex-1">
                                <p className="text-sm text-gray-600 line-clamp-4 leading-relaxed">
                                    {post.content || <span className="italic text-gray-300">No text content</span>}
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-3 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <StatChip icon={Heart} value={post.likesCount || 0} color="text-red-400" />
                                    <StatChip icon={MessageCircle} value={post.commentsCount || 0} color="text-blue-400" />
                                    <StatChip icon={Eye} value={post.views || 0} color="text-gray-400" />
                                </div>
                                <button className="flex items-center gap-1.5 text-[0.6rem] font-bold text-amber-500 hover:text-amber-600 transition-colors">
                                    <Flag size={10} />
                                    MODERATE
                                </button>
                            </div>
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
