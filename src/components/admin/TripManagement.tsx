"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../utils/axios";
import { Compass, MapPin, IndianRupee, Trash2, Calendar, Users, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import SearchFilterBar from "../ui/SearchFilterBar";

const TRAVEL_TYPE_COLORS: Record<string, string> = {
    luxury: "bg-amber-100 text-amber-700",
    non_luxury: "bg-blue-100 text-blue-700",
    digital_nomad: "bg-purple-100 text-purple-700",
};

const FILTERS = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Luxury", value: "luxury" },
    { label: "Non-luxury", value: "non_luxury" },
    { label: "Digital Nomad", value: "digital_nomad" },
];

const SORT_OPTIONS = [
    { label: "Newest first", value: "newest" },
    { label: "Oldest first", value: "oldest" },
    { label: "Price: Low → High", value: "price_asc" },
    { label: "Price: High → Low", value: "price_desc" },
    { label: "Most members", value: "members_desc" },
    { label: "Title A–Z", value: "title_asc" },
];

export default function TripManagement() {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [sort, setSort] = useState("newest");

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["adminTrips"],
        queryFn: async () => { const { data } = await api.get("/admin/trips"); return data; },
    });

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this community trip? This action is permanent.")) return;
        try {
            await api.delete(`/admin/trips/${id}`);
            toast.success("Trip deleted");
            refetch();
        } catch { toast.error("Failed to delete trip"); }
    };


    const allTrips: any[] = data?.trips || [];

    const displayed = useMemo(() => {
        let list = [...allTrips];
        const q = search.toLowerCase();

        if (q) list = list.filter(t =>
            (t.title || "").toLowerCase().includes(q) ||
            (t.destination || "").toLowerCase().includes(q) ||
            (t.creator?.username || "").toLowerCase().includes(q)
        );

        if (filter === "active") list = list.filter(t => t.is_active);
        if (filter === "inactive") list = list.filter(t => !t.is_active);
        if (["luxury", "non_luxury", "digital_nomad"].includes(filter)) list = list.filter(t => t.travel_type === filter);

        if (sort === "newest") list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        if (sort === "oldest") list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        if (sort === "price_asc") list.sort((a, b) => (a.cost || 0) - (b.cost || 0));
        if (sort === "price_desc") list.sort((a, b) => (b.cost || 0) - (a.cost || 0));
        if (sort === "members_desc") list.sort((a, b) => (b.max_members || 0) - (a.max_members || 0));
        if (sort === "title_asc") list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));

        return list;
    }, [allTrips, search, filter, sort]);

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
            <Loader2 size={28} className="text-purple-500 animate-spin" />
            <p className="text-sm text-gray-400">Loading trips...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Community Trips</h2>
                <p className="text-xs text-gray-400 mt-0.5">{allTrips.length} user-created trips</p>
            </div>

            <SearchFilterBar
                search={search}
                onSearchChange={setSearch}
                placeholder="Search by title, destination or creator…"
                filters={FILTERS}
                activeFilter={filter}
                onFilterChange={setFilter}
                sortOptions={SORT_OPTIONS}
                activeSort={sort}
                onSortChange={setSort}
                total={allTrips.length}
                filtered={displayed.length}
            />

            {displayed.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 flex flex-col items-center gap-3 text-center">
                    <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <Compass size={24} className="text-blue-200" />
                    </div>
                    <p className="text-sm text-gray-400">{search || filter !== "all" ? "No trips match your filters." : "No community trips found."}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {displayed.map((trip: any, i: number) => (
                        <motion.div
                            key={trip.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all group"
                        >
                            {/* Cover */}
                            <div className="relative h-44 bg-blue-50">
                                {trip.cover_image
                                    ? <img src={trip.cover_image} alt={trip.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    : <div className="w-full h-full flex items-center justify-center"><Compass size={40} className="text-blue-200" /></div>
                                }
                                <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
                                    <button
                                        onClick={() => handleDelete(trip.id)}
                                        className="p-2 rounded-xl bg-white/90 backdrop-blur-sm text-red-500 hover:bg-red-500 hover:text-white shadow-sm transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="absolute top-3 left-3 flex gap-1.5">
                                    <span className={`text-[0.6rem] font-bold px-2 py-1 rounded-full ${trip.is_active ? 'bg-emerald-500 text-white' : 'bg-gray-400 text-white'}`}>
                                        {trip.is_active ? "Active" : "Inactive"}
                                    </span>
                                    {trip.travel_type && (
                                        <span className={`text-[0.6rem] font-bold px-2 py-1 rounded-full capitalize ${TRAVEL_TYPE_COLORS[trip.travel_type] || 'bg-gray-100 text-gray-600'}`}>
                                            {trip.travel_type.replace("_", " ")}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-4">
                                <h3 className="font-bold text-gray-800 truncate mb-2">{trip.title}</h3>
                                <div className="space-y-1.5 mb-3">
                                    {trip.destination && (
                                        <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                                            <MapPin size={12} className="text-primary-normal" />
                                            <span className="truncate">{trip.destination}</span>
                                        </div>
                                    )}
                                    {trip.start_date && (
                                        <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                                            <Calendar size={12} className="text-primary-normal" />
                                            <span>{format(new Date(trip.start_date), "MMM d, yyyy")}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                                        <Users size={12} className="text-primary-normal" />
                                        <span>Max {trip.max_members || "—"} members</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                    <div className="flex items-center gap-0.5 text-primary-normal font-bold">
                                        <IndianRupee size={15} />
                                        <span className="text-lg">{trip.cost?.toLocaleString() || "Dynamic"}</span>
                                    </div>
                                    {trip.creator && (
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-[0.5rem] font-bold text-gray-400 border-2 border-white shadow-sm overflow-hidden shrink-0">
                                                {trip.creator.profile_picture
                                                    ? <img src={trip.creator.profile_picture} className="w-full h-full object-cover" />
                                                    : trip.creator.username?.[0]?.toUpperCase()}
                                            </div>
                                            <span className="text-[0.6rem] text-gray-400">@{trip.creator.username}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
