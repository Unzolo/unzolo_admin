"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../utils/axios";
import {
    Heart,
    MessageCircle,
    Trash2,
    Eye,
    User as UserIcon,
    Flag
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function PostManagement() {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ["adminPosts"],
        queryFn: async () => {
            const { data } = await api.get("/admin/posts");
            return data;
        },
    });

    const deletePost = async (id: string) => {
        if (confirm("Are you sure you want to delete this post?")) {
            try {
                await api.delete(`/admin/posts/${id}`);
                toast.success("Post deleted successfully");
                refetch();
            } catch (error) {
                console.error("Failed to delete post:", error);
                toast.error("Failed to delete post");
            }
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Posts...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-800">User Posts ({data?.posts?.length || 0})</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.posts?.map((post: any) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={post.id}
                        className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:border-red-100 transition-all hover:shadow-lg"
                    >
                        <div className="p-4 flex items-center justify-between border-b border-gray-50 bg-gray-50/50">
                            <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full overflow-hidden bg-gray-200">
                                    {post.author?.profile_picture ? (
                                        <img src={post.author.profile_picture} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon size={14} className="m-auto mt-1.5" />
                                    )}
                                </div>
                                <span className="text-[0.7rem] font-bold text-gray-700">@{post.author?.username}</span>
                            </div>
                            <button
                                onClick={() => deletePost(post.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="p-5 flex-1 space-y-3">
                            <p className="text-sm text-gray-600 line-clamp-4 leading-relaxed italic">
                                "{post.content || "No text content"}"
                            </p>

                            <div className="flex items-center gap-4 text-[0.6rem] text-gray-400">
                                <div className="flex items-center gap-1">
                                    <Heart size={12} className="text-red-400" />
                                    <span>{post.likesCount || 0}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MessageCircle size={12} className="text-blue-400" />
                                    <span>{post.commentsCount || 0}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Eye size={12} />
                                    <span>{post.views || 0}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 border-t border-gray-50 flex items-center justify-between text-[0.6rem] text-gray-400">
                            <span>{format(new Date(post.created_at), "MMM d, yyyy")}</span>
                            <div className="flex items-center gap-1 group cursor-pointer hover:text-amber-500 transition-colors">
                                <Flag size={10} />
                                <span className="font-bold">MODERATE</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
