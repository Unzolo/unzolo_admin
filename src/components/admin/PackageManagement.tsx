"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../utils/axios";
import { useRouter } from "next/navigation";
import {
    Package as PackageIcon, MapPin, IndianRupee, Trash2, Edit3,
    Plus, Calendar, Loader2, Clock, AlertTriangle, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import SearchFilterBar from "../ui/SearchFilterBar";

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({ name, onConfirm, onCancel, loading }: {
    name: string; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                className="relative bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm z-10"
            >
                <button onClick={onCancel} className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 transition-all">
                    <X size={16} />
                </button>
                <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                    <AlertTriangle size={22} className="text-red-500" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Delete Package</h3>
                <p className="text-sm text-gray-500 mb-6">
                    Are you sure you want to delete <span className="font-semibold text-gray-700">"{name}"</span>? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={loading} className="flex-1 h-10 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                        {loading && <Loader2 size={14} className="animate-spin" />}
                        Delete
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Package Card ─────────────────────────────────────────────────────────────

function PackageCard({ pkg, onEdit, onDelete }: { pkg: any; onEdit: () => void; onDelete: () => void }) {
    const nights = pkg.start_date && pkg.end_date
        ? Math.ceil((new Date(pkg.end_date).getTime() - new Date(pkg.start_date).getTime()) / (1000 * 60 * 60 * 24))
        : null;

    const discountedPrice = pkg.discount > 0
        ? Math.round(pkg.cost * (1 - pkg.discount / 100))
        : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300"
        >
            {/* Image */}
            <div className="relative h-36 bg-linear-to-br from-gray-100 to-gray-200 overflow-hidden">
                {pkg.images?.[0]?.image_url ? (
                    <img
                        src={pkg.images[0].image_url}
                        alt={pkg.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <PackageIcon size={36} className="text-gray-300" />
                        <span className="text-xs text-gray-300 font-medium">No image</span>
                    </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

                {/* Top badges */}
                <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="text-[0.6rem] font-bold px-2.5 py-1 rounded-full bg-primary-normal/90 text-white backdrop-blur-sm">
                        Active
                    </span>
                    {pkg.travel_type && (
                        <span className="text-[0.6rem] font-bold px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm capitalize">
                            {pkg.travel_type.replace("_", " ")}
                        </span>
                    )}
                </div>

                {/* Action buttons */}
                <div className="absolute bottom-3 right-3 flex gap-2">
                    <button
                        onClick={onEdit}
                        title="Edit package"
                        className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-white/95 backdrop-blur-sm text-blue-600 text-xs font-bold shadow-lg hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                    >
                        <Edit3 size={12} />
                        Edit
                    </button>
                    <button
                        onClick={onDelete}
                        title="Delete package"
                        className="h-8 w-8 rounded-xl bg-white/95 backdrop-blur-sm text-red-500 shadow-lg hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center justify-center"
                    >
                        <Trash2 size={13} />
                    </button>
                </div>

                {/* Duration chip */}
                {nights !== null && nights > 0 && (
                    <div className="absolute bottom-3 left-3">
                        <span className="flex items-center gap-1 text-[0.6rem] font-bold px-2.5 py-1 rounded-full bg-black/50 text-white backdrop-blur-sm">
                            <Clock size={9} />
                            {nights}N / {nights + 1}D
                        </span>
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="p-3.5">
                <div className="mb-2">
                    <h3 className="font-bold text-gray-900 leading-snug line-clamp-1 text-sm">{pkg.title}</h3>
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
                    {pkg.destination && (
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                            <MapPin size={10} className="text-primary-normal" />
                            <span className="truncate max-w-[110px]">{pkg.destination}</span>
                        </div>
                    )}
                    {pkg.start_date && (
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                            <Calendar size={10} className="text-primary-normal" />
                            <span>{format(new Date(pkg.start_date), "MMM d, yyyy")}</span>
                        </div>
                    )}
                </div>

                {/* Price row */}
                <div className="flex items-center justify-between pt-2.5 border-t border-gray-50">
                    <div>
                        {discountedPrice ? (
                            <div className="flex items-center gap-1.5">
                                <div className="flex items-center gap-0.5 text-primary-normal font-extrabold">
                                    <IndianRupee size={13} strokeWidth={2.5} />
                                    <span className="text-base">{discountedPrice.toLocaleString()}</span>
                                </div>
                                <span className="text-[0.65rem] text-gray-400 line-through">₹{pkg.cost?.toLocaleString()}</span>
                                <span className="text-[0.55rem] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">{pkg.discount}% off</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-0.5 text-primary-normal font-extrabold">
                                <IndianRupee size={13} strokeWidth={2.5} />
                                <span className="text-base">{pkg.cost?.toLocaleString() || "—"}</span>
                            </div>
                        )}
                    </div>

                    {/* Creator chip */}
                    {pkg.creator && (
                        <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-2 py-1">
                            <div className="h-5 w-5 rounded-full overflow-hidden bg-primary-light border border-white shadow-sm shrink-0">
                                {pkg.creator.profile_picture
                                    ? <img src={pkg.creator.profile_picture} className="w-full h-full object-cover" alt="" />
                                    : <span className="flex items-center justify-center w-full h-full text-[0.45rem] font-bold text-primary-normal">{pkg.creator.username?.[0]?.toUpperCase()}</span>}
                            </div>
                            <span className="text-[0.6rem] text-gray-500 font-semibold">@{pkg.creator.username}</span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// ─── Sort / Filter config ─────────────────────────────────────────────────────

const FILTERS = [
    { label: "All", value: "all" },
    { label: "Discounted", value: "discount" },
    { label: "Luxury", value: "luxury" },
    { label: "Non-luxury", value: "non_luxury" },
    { label: "Digital Nomad", value: "digital_nomad" },
];

const SORT_OPTIONS = [
    { label: "Newest first", value: "newest" },
    { label: "Oldest first", value: "oldest" },
    { label: "Price: Low → High", value: "price_asc" },
    { label: "Price: High → Low", value: "price_desc" },
    { label: "Title A–Z", value: "title_asc" },
];

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function PackageManagement() {
    const router = useRouter();
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [sort, setSort] = useState("newest");

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["adminPackages"],
        queryFn: async () => { const { data } = await api.get("/admin/packages"); return data; },
    });

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await api.delete(`/admin/packages/${deleteTarget.id}`);
            toast.success("Package deleted");
            refetch();
            setDeleteTarget(null);
        } catch {
            toast.error("Failed to delete package");
        } finally {
            setDeleteLoading(false);
        }
    };


    const allPackages: any[] = data?.packages || [];

    const displayed = useMemo(() => {
        let list = [...allPackages];

        const q = search.toLowerCase();
        if (q) list = list.filter(p =>
            (p.title || "").toLowerCase().includes(q) ||
            (p.destination || "").toLowerCase().includes(q) ||
            (p.creator?.username || "").toLowerCase().includes(q)
        );

        if (filter === "discount") list = list.filter(p => (p.discount || 0) > 0);
        else if (filter !== "all") list = list.filter(p => p.travel_type === filter);

        if (sort === "newest") list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        if (sort === "oldest") list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        if (sort === "price_asc") list.sort((a, b) => (a.cost || 0) - (b.cost || 0));
        if (sort === "price_desc") list.sort((a, b) => (b.cost || 0) - (a.cost || 0));
        if (sort === "title_asc") list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));

        return list;
    }, [allPackages, search, filter, sort]);

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="relative">
                <div className="h-14 w-14 rounded-3xl bg-primary-light flex items-center justify-center">
                    <PackageIcon size={24} className="text-primary-normal" />
                </div>
                <div className="absolute -inset-1 rounded-3xl border-2 border-primary-normal/20 animate-ping" />
            </div>
            <p className="text-sm text-gray-400 font-medium">Loading packages...</p>
        </div>
    );

    return (
        <>
            <AnimatePresence>
                {deleteTarget && (
                    <DeleteModal
                        name={deleteTarget.name}
                        onConfirm={handleDelete}
                        onCancel={() => setDeleteTarget(null)}
                        loading={deleteLoading}
                    />
                )}
            </AnimatePresence>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Packages</h2>
                        <p className="text-sm text-gray-400 mt-0.5">
                            {allPackages.length} {allPackages.length === 1 ? "package" : "packages"} available
                        </p>
                    </div>
                    <button
                        onClick={() => router.push("/packages/create")}
                        className="flex items-center gap-2 h-10 px-5 rounded-2xl bg-primary-normal text-white text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm shadow-primary-light-active"
                    >
                        <Plus size={16} />
                        New Package
                    </button>
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
                    total={allPackages.length}
                    filtered={displayed.length}
                />

                {/* Empty state */}
                {displayed.length === 0 && (
                    <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-20 flex flex-col items-center gap-4 text-center">
                        <div className="h-16 w-16 rounded-3xl bg-primary-light flex items-center justify-center">
                            <PackageIcon size={28} className="text-primary-normal" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-700 mb-1">{search || filter !== "all" ? "No packages match your filters." : "No packages yet"}</p>
                            {!search && filter === "all" && (
                                <>
                                    <p className="text-sm text-gray-400">Create your first travel package to get started.</p>
                                    <button
                                        onClick={() => router.push("/packages/create")}
                                        className="flex items-center gap-2 h-9 px-4 rounded-xl bg-primary-normal text-white text-sm font-semibold hover:opacity-90 transition-all mt-4 mx-auto"
                                    >
                                        <Plus size={14} /> Create Package
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {displayed.map((pkg: any, i: number) => (
                        <motion.div key={pkg.id} transition={{ delay: i * 0.05 }}>
                            <PackageCard
                                pkg={pkg}
                                onEdit={() => router.push(`/packages/edit/${pkg.id}`)}
                                onDelete={() => setDeleteTarget({ id: pkg.id, name: pkg.title })}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </>
    );
}
