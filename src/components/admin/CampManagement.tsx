"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../utils/axios";
import { useRouter } from "next/navigation";
import { Map as CampIcon, MapPin, IndianRupee, Trash2, Edit3, Plus, Calendar, Loader2, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import SearchFilterBar from "../ui/SearchFilterBar";

const STAGING_URL = "https://staging.unzolo.com/api";
const PROD_URL = "https://api.unzolo.com/api";

const FILTERS = [
    { label: "All", value: "all" },
    { label: "Upcoming", value: "upcoming" },
    { label: "Past", value: "past" },
];

const SORT_OPTIONS = [
    { label: "Newest first", value: "newest" },
    { label: "Oldest first", value: "oldest" },
    { label: "Price: Low → High", value: "price_asc" },
    { label: "Price: High → Low", value: "price_desc" },
    { label: "Title A–Z", value: "title_asc" },
];

export default function CampManagement() {
    const router = useRouter();
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
        queryKey: ["adminCamps", viewSource],
        queryFn: async () => {
            const baseUrl = viewSource === "staging" ? STAGING_URL : "";
            const endpoint = baseUrl ? `${baseUrl}/admin/camps` : "/admin/camps";
            const { data } = await api.get(endpoint);
            return data;
        },
    });

    const cloneMutation = useMutation({
        mutationFn: async ({ id }: { id: number }) => {
            const res = await api.post("/admin/clone-data", {
                type: "camps",
                id,
                sourceUrl: STAGING_URL
            });
            return res.data;
        },
        onSuccess: () => {
            toast.success("Camp cloned successfully!");
            if (viewSource === "staging") {
                // If we were on staging, maybe stay there or suggest checking Prod
                toast.info("Item added to Production.");
            }
            queryClient.invalidateQueries({ queryKey: ["adminCamps"] });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Clone failed");
        }
    });

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this camp? This action cannot be undone.")) return;
        try {
            await api.delete(`/admin/camps/${id}`);
            toast.success("Camp deleted");
            refetch();
        } catch { toast.error("Failed to delete camp"); }
    };

    const allCamps: any[] = data?.camps || [];

    const displayed = useMemo(() => {
        let list = [...allCamps];
        const q = search.toLowerCase();
        const now = new Date();

        if (q) list = list.filter(c =>
            (c.title || "").toLowerCase().includes(q) ||
            (c.destination || "").toLowerCase().includes(q) ||
            (c.creator?.username || "").toLowerCase().includes(q)
        );

        if (filter === "upcoming") list = list.filter(c => c.start_date && new Date(c.start_date) >= now);
        if (filter === "past") list = list.filter(c => c.start_date && new Date(c.start_date) < now);

        if (sort === "newest") list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        if (sort === "oldest") list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        if (sort === "price_asc") list.sort((a, b) => (a.cost || 0) - (b.cost || 0));
        if (sort === "price_desc") list.sort((a, b) => (b.cost || 0) - (a.cost || 0));
        if (sort === "title_asc") list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));

        return list;
    }, [allCamps, search, filter, sort]);

    if (isLoading) return <PageLoader label="Loading camps..." />;

    const isFromStaging = viewSource === "staging";

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-gray-900">Camps</h2>
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
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewSource === "staging" ? "bg-amber-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                >
                                    Staging
                                </button>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {isFromStaging ? `Browsing staging - ${allCamps.length} records` : `${allCamps.length} ${allCamps.length === 1 ? "record" : "records"}`}
                    </p>
                </div>
                <button
                    onClick={() => router.push("/camps/create")}
                    className="flex items-center gap-2 h-9 px-4 rounded-xl text-white text-sm font-semibold bg-primary-normal hover:opacity-90 active:scale-95 transition-all shadow-sm"
                >
                    <Plus size={15} />
                    Host New Camp
                </button>
            </div>

            <SearchFilterBar
                search={search}
                onSearchChange={setSearch}
                placeholder="Search by title, destination or host…"
                filters={FILTERS}
                activeFilter={filter}
                onFilterChange={setFilter}
                sortOptions={SORT_OPTIONS}
                activeSort={sort}
                onSortChange={setSort}
                total={allCamps.length}
                filtered={displayed.length}
            />

            {displayed.length === 0 ? (
                <EmptyState icon={CampIcon} message={search || filter !== "all" ? "No camps match your filters." : "No camps yet. Host your first one!"} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {displayed.map((camp: any, i: number) => (
                        <motion.div
                            key={camp.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className={`bg-white rounded-2xl border ${isFromStaging ? 'border-amber-200 bg-amber-50/20' : 'border-gray-100'} shadow-sm overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all group`}
                        >
                            <div className="relative h-44 bg-amber-50">
                                {camp.images?.[0]?.image_url ? (
                                    <img src={camp.images[0].image_url} alt={camp.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <CampIcon size={40} className="text-amber-200" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); cloneMutation.mutate({ id: camp.id }); }}
                                        disabled={cloneMutation.isPending && cloneMutation.variables?.id === camp.id}
                                        title={isFromStaging ? "Clone to Production" : "Clone locally"}
                                        className={`p-2 rounded-xl backdrop-blur-sm shadow-sm transition-all bg-white/90 ${isFromStaging ? 'text-amber-600 hover:bg-amber-600 hover:text-white' : 'text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
                                    >
                                        {cloneMutation.isPending && cloneMutation.variables?.id === camp.id ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}
                                    </button>

                                    {!isFromStaging && (
                                        <>
                                            <ActionBtn icon={Edit3} onClick={() => router.push(`/camps/edit/${camp.id}`)} color="blue" />
                                            <ActionBtn icon={Trash2} onClick={() => handleDelete(camp.id)} color="red" />
                                        </>
                                    )}
                                </div>

                                <div className="absolute top-3 left-3">
                                    <span className={`text-[0.6rem] font-bold px-2 py-1 rounded-full text-white ${isFromStaging ? 'bg-amber-600' : 'bg-amber-500'}`}>
                                        {isFromStaging ? "On Staging" : "Camp"}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-800 truncate mb-1">{camp.title}</h3>
                                <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1.5">
                                    <MapPin size={12} />
                                    <span className="truncate">{camp.destination || "—"}</span>
                                </div>
                                {camp.start_date && (
                                    <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-3">
                                        <Calendar size={12} />
                                        <span>{format(new Date(camp.start_date), "MMM d, yyyy")}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                    <div className="flex items-center gap-0.5 text-amber-600 font-bold">
                                        <IndianRupee size={15} />
                                        <span className="text-lg">{camp.cost?.toLocaleString() || "—"}</span>
                                    </div>
                                    <CreatorChip creator={camp.creator} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ... rest of the helpers (PageHeader, ActionBtn, CreatorChip, PageLoader, EmptyState) exactly as before but ensuring they are exported or defined
function ActionBtn({ icon: Icon, onClick, color }: { icon: any; onClick: () => void; color: "blue" | "red" }) {
    const cls = color === "blue" ? "bg-white/90 text-blue-600 hover:bg-blue-500 hover:text-white" : "bg-white/90 text-red-500 hover:bg-red-500 hover:text-white";
    return (
        <button onClick={(e) => { e.stopPropagation(); onClick(); }} className={`p-2 rounded-xl backdrop-blur-sm shadow-sm transition-all ${cls}`}>
            <Icon size={14} />
        </button>
    );
}

function CreatorChip({ creator }: { creator: any }) {
    if (!creator) return null;
    return (
        <div className="flex items-center gap-1.5">
            <div className="h-6 w-6 rounded-full bg-gray-100 overflow-hidden border-2 border-white shadow-sm shrink-0">
                {creator.profile_picture && <img src={creator.profile_picture} className="w-full h-full object-cover" />}
            </div>
            <span className="text-[0.6rem] text-gray-400 font-medium">@{creator.username}</span>
        </div>
    );
}

function PageLoader({ label }: { label: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
            <Loader2 size={28} className="text-amber-500 animate-spin" />
            <p className="text-sm text-gray-400">{label}</p>
        </div>
    );
}

function EmptyState({ icon: Icon, message }: { icon: any; message: string }) {
    return (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 flex flex-col items-center gap-4 text-center">
            <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center">
                <Icon size={24} className="text-amber-300" />
            </div>
            <p className="text-sm text-gray-400">{message}</p>
        </div>
    );
}
