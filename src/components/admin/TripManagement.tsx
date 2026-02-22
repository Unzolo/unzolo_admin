"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../utils/axios";
import {
    Compass,
    MapPin,
    IndianRupee,
    Trash2,
    Calendar,
    Users
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function TripManagement() {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ["adminTrips"],
        queryFn: async () => {
            const { data } = await api.get("/admin/trips");
            return data;
        },
    });

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this trip? This action is permanent.")) {
            try {
                await api.delete(`/admin/trips/${id}`);
                toast.success("Trip deleted successfully");
                refetch();
            } catch (error) {
                console.error("Failed to delete trip:", error);
                toast.error("Failed to delete trip.");
            }
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Trips...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-800">Community Trips ({data?.trips?.length || 0})</h2>
                <p className="text-sm text-gray-500">Manage user-created travel groups and community trips.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.trips?.map((trip: any) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={trip.id}
                        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group"
                    >
                        <div className="h-44 bg-blue-50 relative">
                            {trip.cover_image ? (
                                <img src={trip.cover_image} alt={trip.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-blue-200">
                                    <Compass size={64} />
                                </div>
                            )}
                            <div className="absolute top-3 right-3 flex gap-2">
                                <button
                                    onClick={() => handleDelete(trip.id)}
                                    className="bg-white/90 backdrop-blur-sm p-2 rounded-lg text-red-600 hover:bg-red-500 hover:text-white shadow-sm transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="p-5">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-gray-800 line-clamp-1">{trip.title}</h3>
                                <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${trip.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                    {trip.is_active ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                            </div>

                            <div className="space-y-2 mt-3">
                                <div className="flex items-center gap-2 text-gray-500 text-xs">
                                    <MapPin size={14} className="text-primary-normal" />
                                    <span className="line-clamp-1">{trip.destination}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500 text-xs">
                                    <Calendar size={14} className="text-primary-normal" />
                                    <span>{new Date(trip.start_date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                                        <Users size={14} className="text-primary-normal" />
                                        <span>Max {trip.max_members} members</span>
                                    </div>
                                    <div className="text-xs font-bold text-primary-normal bg-primary-light px-2 py-0.5 rounded">
                                        {trip.travel_type}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-1 text-primary-normal">
                                    <IndianRupee size={16} />
                                    <span className="font-bold text-lg">{trip.cost || 'Dynamic'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-gray-100 overflow-hidden border border-white ring-2 ring-gray-50">
                                        {trip.creator?.profile_picture ? (
                                            <img src={trip.creator.profile_picture} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-300">
                                                {trip.creator?.username?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-medium">by {trip.creator?.username}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
