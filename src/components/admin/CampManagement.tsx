"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../utils/axios";
import {
    Map as CampIcon,
    MapPin,
    IndianRupee,
    Trash2,
    Edit3,
    Users
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import CreateCampModal from "./CreateCampModal";

export default function CampManagement() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingCamp, setEditingCamp] = useState<any>(null);
    const { data, isLoading, refetch } = useQuery({
        queryKey: ["adminCamps"],
        queryFn: async () => {
            const { data } = await api.get("/admin/camps");
            return data;
        },
    });

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this camp?")) {
            try {
                await api.delete(`/admin/camps/${id}`);
                toast.success("Camp deleted successfully");
                refetch();
            } catch (error) {
                console.error("Failed to delete camp:", error);
                toast.error("Failed to delete camp");
            }
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Camps...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-800">Camps ({data?.camps?.length || 0})</h2>
                <button
                    onClick={() => {
                        setEditingCamp(null);
                        setIsCreateModalOpen(true);
                    }}
                    className="w-full sm:w-auto bg-amber-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-amber-200 hover:bg-amber-700 transition-all"
                >
                    Host New Camp
                </button>
            </div>

            <CreateCampModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setEditingCamp(null);
                }}
                onSuccess={() => refetch()}
                initialData={editingCamp}
                id={editingCamp?.id}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.camps?.map((camp: any) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={camp.id}
                        className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group"
                    >
                        <div className="h-44 bg-gray-100 relative">
                            {camp.images?.[0]?.image_url ? (
                                <img src={camp.images[0].image_url} alt={camp.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <CampIcon size={48} />
                                </div>
                            )}
                            <div className="absolute top-3 right-3 flex gap-2">
                                <button
                                    onClick={() => {
                                        setEditingCamp(camp);
                                        setIsCreateModalOpen(true);
                                    }}
                                    className="bg-white/90 backdrop-blur-sm p-2 rounded-lg text-blue-600 hover:bg-white shadow-sm transition-all"
                                >
                                    <Edit3 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(camp.id)}
                                    className="bg-white/90 backdrop-blur-sm p-2 rounded-lg text-red-600 hover:bg-white shadow-sm transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="p-5">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-gray-800 line-clamp-1">{camp.title}</h3>
                                <span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-lg font-bold">Upcoming</span>
                            </div>

                            <div className="flex items-center gap-2 text-gray-400 text-xs mb-4">
                                <MapPin size={14} />
                                <span>{camp.destination}</span>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-1 text-amber-600">
                                    <IndianRupee size={16} />
                                    <span className="font-bold text-lg">{camp.cost}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-gray-100 overflow-hidden border border-white">
                                        {camp.creator?.profile_picture && <img src={camp.creator.profile_picture} className="w-full h-full object-cover" />}
                                    </div>
                                    <span className="text-[0.6rem] text-gray-400">by {camp.creator?.username}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
