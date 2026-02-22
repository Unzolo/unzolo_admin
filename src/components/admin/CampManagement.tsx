"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../utils/axios";
import { useRouter } from "next/navigation";
import { Map as CampIcon, MapPin, IndianRupee, Trash2, Edit3, Plus, Calendar, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

export default function CampManagement() {
    const router = useRouter();
    const { data, isLoading, refetch } = useQuery({
        queryKey: ["adminCamps"],
        queryFn: async () => { const { data } = await api.get("/admin/camps"); return data; },
    });

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this camp? This action cannot be undone.")) return;
        try {
            await api.delete(`/admin/camps/${id}`);
            toast.success("Camp deleted");
            refetch();
        } catch { toast.error("Failed to delete camp"); }
    };

    if (isLoading) return <PageLoader label="Loading camps..." />;

    const camps = data?.camps || [];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Camps"
                count={camps.length}
                action={{ label: "Host New Camp", onClick: () => router.push("/camps/create"), color: "amber" }}
            />
            {camps.length === 0 ? (
                <EmptyState icon={CampIcon} message="No camps yet. Host your first one!" />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {camps.map((camp: any, i: number) => (
                        <motion.div
                            key={camp.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all group"
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
                                    <ActionBtn icon={Edit3} onClick={() => router.push(`/camps/edit/${camp.id}`)} color="blue" />
                                    <ActionBtn icon={Trash2} onClick={() => handleDelete(camp.id)} color="red" />
                                </div>
                                <div className="absolute top-3 left-3">
                                    <span className="text-[0.6rem] font-bold px-2 py-1 rounded-full bg-amber-500 text-white">Camp</span>
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

function PageHeader({ title, count, action }: { title: string; count: number; action?: { label: string; onClick: () => void; color?: string } }) {
    const btnCls = action?.color === "amber"
        ? "bg-amber-500 hover:opacity-90 shadow-amber-100"
        : "bg-primary-normal hover:opacity-90";
    return (
        <div className="flex items-center justify-between gap-4">
            <div>
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{count} {count === 1 ? "record" : "records"}</p>
            </div>
            {action && (
                <button onClick={action.onClick} className={`flex items-center gap-2 h-9 px-4 rounded-xl text-white text-sm font-semibold active:scale-95 transition-all shadow-sm ${btnCls}`}>
                    <Plus size={15} />
                    {action.label}
                </button>
            )}
        </div>
    );
}

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
