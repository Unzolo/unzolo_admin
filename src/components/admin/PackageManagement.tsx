"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../utils/axios";
import {
    Package as PackageIcon,
    MapPin,
    IndianRupee,
    Trash2,
    Edit3,
    ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import CreatePackageModal from "./CreatePackageModal";

export default function PackageManagement() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingPkg, setEditingPkg] = useState<any>(null);
    const { data, isLoading, refetch } = useQuery({
        queryKey: ["adminPackages"],
        queryFn: async () => {
            const { data } = await api.get("/admin/packages");
            return data;
        },
    });

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this package?")) {
            try {
                await api.delete(`/admin/packages/${id}`);
                toast.success("Package deleted successfully");
                refetch();
            } catch (error) {
                console.error("Failed to delete package:", error);
                toast.error("Failed to delete package");
            }
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Packages...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-800">Packages ({data?.packages?.length || 0})</h2>
                <button
                    onClick={() => {
                        setEditingPkg(null);
                        setIsCreateModalOpen(true);
                    }}
                    className="w-full sm:w-auto bg-primary-normal text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary-light/50 hover:bg-primary-dark transition-all"
                >
                    Create New Package
                </button>
            </div>

            <CreatePackageModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setEditingPkg(null);
                }}
                onSuccess={() => refetch()}
                initialData={editingPkg}
                id={editingPkg?.id}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.packages?.map((pkg: any) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={pkg.id}
                        className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group"
                    >
                        <div className="h-44 bg-gray-100 relative">
                            {pkg.images?.[0]?.image_url ? (
                                <img src={pkg.images[0].image_url} alt={pkg.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <PackageIcon size={48} />
                                </div>
                            )}
                            <div className="absolute top-3 right-3 flex gap-2">
                                <button
                                    onClick={() => {
                                        setEditingPkg(pkg);
                                        setIsCreateModalOpen(true);
                                    }}
                                    className="bg-white/90 backdrop-blur-sm p-2 rounded-lg text-blue-600 hover:bg-white shadow-sm transition-all"
                                >
                                    <Edit3 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(pkg.id)}
                                    className="bg-white/90 backdrop-blur-sm p-2 rounded-lg text-red-600 hover:bg-white shadow-sm transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="p-5">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-gray-800 line-clamp-1">{pkg.title}</h3>
                                <span className="text-xs bg-primary-light text-primary-normal px-2 py-1 rounded-lg font-bold">Active</span>
                            </div>

                            <div className="flex items-center gap-2 text-gray-400 text-xs mb-4">
                                <MapPin size={14} />
                                <span>{pkg.destination}</span>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-1 text-primary-normal">
                                    <IndianRupee size={16} />
                                    <span className="font-bold text-lg">{pkg.cost}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-gray-100 overflow-hidden border border-white">
                                        {pkg.creator?.profile_picture && <img src={pkg.creator.profile_picture} className="w-full h-full object-cover" />}
                                    </div>
                                    <span className="text-[0.6rem] text-gray-400">by {pkg.creator?.username}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
