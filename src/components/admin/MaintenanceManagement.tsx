"use client";

import React, { useState, useEffect } from "react";
import {
    Database, Trash2, AlertTriangle, CheckCircle2, RefreshCcw,
    Globe, Shield, Settings, Server, Users, Package, Map, TrendingUp, Copy
} from "lucide-react";
import api from "@/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const STAGING_URL = "https://staging.unzolo.com/api";
const PROD_URL = "https://api.unzolo.com/api";

const MaintenanceManagement = () => {
    const [confirmText, setConfirmText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [currentEnv, setCurrentEnv] = useState<string>("");
    const queryClient = useQueryClient();

    useEffect(() => {
        const saved = localStorage.getItem('unzolo_api_override');
        if (saved === PROD_URL) setCurrentEnv("production");
        else if (saved === STAGING_URL) setCurrentEnv("staging");
        else setCurrentEnv("default");
    }, []);

    const clearDataMutation = useMutation({
        mutationFn: async (type: string | null) => {
            const res = await api.post("/admin/clear-data", { type });
            return res.data;
        },
        onSuccess: (data) => {
            toast.success(data.message || "Action completed successfully!");
            setIsModalOpen(false);
            setConfirmText("");
            setSelectedType(null);
            queryClient.invalidateQueries();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Action failed");
        },
    });

    const cloneDataMutation = useMutation({
        mutationFn: async (type: string) => {
            const res = await api.post("/admin/clone-data", {
                type,
                sourceUrl: STAGING_URL
            });
            return res.data;
        },
        onSuccess: (data) => {
            toast.success(data.message || "Data cloned successfully!");
            queryClient.invalidateQueries();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Clone failed");
        },
    });

    const handleClearData = () => {
        if (confirmText.toLowerCase() === "clear data") {
            clearDataMutation.mutate(selectedType);
        } else {
            toast.error("Please type 'clear data' correctly to confirm");
        }
    };

    const openConfirmModal = (type: string | null) => {
        setSelectedType(type);
        setIsModalOpen(true);
    };

    const SELECTIVE_OPTIONS = [
        { id: "trips", label: "Trips", description: "Clear all community trips and expenses", icon: Trash2, color: "text-blue-500", bg: "bg-blue-50" },
        { id: "posts", label: "Posts", description: "Clear all social posts, likes and views", icon: Trash2, color: "text-pink-500", bg: "bg-pink-50" },
        { id: "packages", label: "Packages", description: "Clear all package listings", icon: Trash2, color: "text-emerald-500", bg: "bg-emerald-50" },
        { id: "camps", label: "Camps", description: "Clear all camp listings and images", icon: Trash2, color: "text-amber-500", bg: "bg-amber-50" },
        { id: "users", label: "Users", description: "Clear all users (vulnerable action)", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">System Maintenance</h1>
                <p className="text-sm text-gray-400 mt-1">Manage core system data and database maintenance tasks.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Full Reset Card */}
                <div className={`lg:col-span-2 bg-white rounded-3xl border shadow-sm overflow-hidden flex flex-col ${currentEnv === "production" ? "border-red-200" : "border-gray-100"}`}>
                    <div className={`p-6 border-b flex items-center justify-between ${currentEnv === "production" ? "bg-red-50/30 border-red-100" : "bg-white border-gray-50"}`}>
                        <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${currentEnv === "production" ? "bg-red-100 text-red-600" : "bg-red-50 text-red-500"}`}>
                                <Trash2 size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Complete Database Wipe</h3>
                                <p className="text-xs text-gray-400">Reset all transactional data and users</p>
                            </div>
                        </div>
                        {currentEnv === "production" && (
                            <span className="px-3 py-1 bg-red-600 text-white text-[0.6rem] font-black rounded-full uppercase tracking-tighter animate-pulse">
                                Production Mode
                            </span>
                        )}
                    </div>
                    <div className="p-6 flex-1 space-y-6">
                        <div className={`${currentEnv === "production" ? "bg-red-50 border-red-100" : "bg-amber-50 border-amber-100"} border rounded-2xl p-4 flex gap-4`}>
                            <AlertTriangle className={`${currentEnv === "production" ? "text-red-600" : "text-amber-500"} shrink-0`} size={20} />
                            <div className="space-y-1">
                                <p className={`text-sm font-bold ${currentEnv === "production" ? "text-red-900" : "text-amber-800"}`}>
                                    {currentEnv === "production" ? "DANGER: PRODUCTION ENVIRONMENT" : "Critical Warning"}
                                </p>
                                <p className={`text-xs leading-relaxed ${currentEnv === "production" ? "text-red-800 font-medium" : "text-amber-700"}`}>
                                    {currentEnv === "production"
                                        ? "This action will DELETE ALL PRODUCTION DATA. This cannot be undone. All users (except admins) and their content will be permanently removed from the LIVE database."
                                        : "A full wipe resets everything EXCEPT admin accounts. Use this ONLY if you need a fresh start."}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-gray-500 ml-1">Comprehensive Cleanup Includes:</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    "Users", "Social Posts", "Packages",
                                    "Camps", "Connections", "Notifications",
                                    "Private Chats", "Trip Details"
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100/50">
                                        <CheckCircle2 size={12} className="text-gray-400" />
                                        <span className="text-[0.65rem] font-bold text-gray-600 truncate">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className={`p-6 border-t text-right ${currentEnv === "production" ? "bg-red-50/10 border-red-50" : "bg-gray-50/50 border-gray-50"}`}>
                        <button
                            onClick={() => openConfirmModal(null)}
                            className={`px-6 h-11 text-white transition-all rounded-xl text-sm font-bold flex items-center justify-center gap-2 group shadow-lg ml-auto ${currentEnv === "production" ? "bg-red-600 hover:bg-black shadow-red-200" : "bg-red-500 hover:bg-red-600 shadow-red-200"
                                }`}
                        >
                            <Trash2 size={16} />
                            Wipe Everything
                        </button>
                    </div>
                </div>

                {/* Health & Status */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary-light flex items-center justify-center text-primary-normal">
                                <Database size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">System Health</h3>
                                <p className="text-xs text-gray-400">Database connection</p>
                            </div>
                        </div>
                        <button
                            onClick={() => queryClient.invalidateQueries()}
                            className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 transition-all hover:rotate-180 duration-500"
                        >
                            <RefreshCcw size={16} />
                        </button>
                    </div>
                    <div className="p-6 flex-1 flex flex-col items-center justify-center text-center space-y-3">
                        <div className={`h-20 w-20 rounded-full flex items-center justify-center relative ${currentEnv === "production" ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"}`}>
                            <Database size={40} />
                            <span className={`absolute bottom-1 right-1 h-4 w-4 border-4 border-white rounded-full ${currentEnv === "production" ? "bg-red-500" : "bg-emerald-500"}`} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800">Cloud Sync Active</p>
                            <p className="text-[0.7rem] text-gray-400 mt-1 max-w-[180px]">Connected to: <span className={`font-mono font-bold ${currentEnv === "production" ? "text-red-600" : "text-emerald-600"}`}>{currentEnv.toUpperCase()}</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Selective Cleanup Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 shadow-sm">
                        <Trash2 size={16} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">Selective Cleanup</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {SELECTIVE_OPTIONS.map((option) => (
                        <div key={option.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
                            <div className={`h-10 w-10 rounded-xl ${option.bg} ${option.color} flex items-center justify-center`}>
                                <option.icon size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm">{option.label}</h4>
                                <p className="text-[0.65rem] text-gray-400 mt-1 leading-relaxed">{option.description}</p>
                            </div>
                            <button
                                onClick={() => openConfirmModal(option.id)}
                                className="mt-auto w-full py-2 bg-gray-50 hover:bg-red-50 hover:text-red-500 text-gray-500 rounded-lg text-xs font-bold transition-all"
                            >
                                Clear {option.label}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sync from Staging Section */}
            {(currentEnv === "production" || currentEnv === "default") && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-primary-normal shadow-sm">
                            <RefreshCcw size={16} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Synchronization & Cloning</h2>
                            <p className="text-[0.65rem] text-gray-400">Import records from Staging into Production environment</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex items-center gap-6 group hover:border-primary-normal/30 transition-all">
                            <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <Package size={28} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900">Clone Packages</h4>
                                <p className="text-xs text-gray-400 mt-0.5">Import all missing packages from staging</p>
                            </div>
                            <button
                                onClick={() => cloneDataMutation.mutate("packages")}
                                disabled={cloneDataMutation.isPending}
                                className="h-10 px-6 rounded-xl bg-primary-normal text-white text-xs font-bold shadow-md shadow-primary-light-active hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                            >
                                {cloneDataMutation.isPending && cloneDataMutation.variables === "packages" ? <RefreshCcw size={14} className="animate-spin" /> : <Copy size={14} />}
                                Sync Packages
                            </button>
                        </div>

                        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex items-center gap-6 group hover:border-primary-normal/30 transition-all">
                            <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <Map size={28} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900">Clone Camps</h4>
                                <p className="text-xs text-gray-400 mt-0.5">Import all missing camps from staging</p>
                            </div>
                            <button
                                onClick={() => cloneDataMutation.mutate("camps")}
                                disabled={cloneDataMutation.isPending}
                                className="h-10 px-6 rounded-xl bg-primary-normal text-white text-xs font-bold shadow-md shadow-primary-light-active hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                            >
                                {cloneDataMutation.isPending && cloneDataMutation.variables === "camps" ? <RefreshCcw size={14} className="animate-spin" /> : <Copy size={14} />}
                                Sync Camps
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Environment Details Card */}
            <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-2xl relative overflow-hidden group">
                <Server className="absolute -right-4 -bottom-4 text-white/5 h-48 w-48 rotate-12 group-hover:rotate-6 transition-transform duration-700" />
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                    <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-white">
                        <Globe size={32} className="animate-pulse" />
                    </div>
                    <div className="flex-1 space-y-4">
                        <div>
                            <h3 className="text-xl font-bold text-white">Advanced Configuration</h3>
                            <p className="text-sm text-gray-400 mt-1 italic">Managing global endpoints for Unzolo Ecosystem</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                <p className="text-[0.6rem] font-bold text-gray-500 uppercase tracking-widest mb-1">Active Server</p>
                                <p className="text-sm font-mono text-primary-light break-all">{api.defaults.baseURL}</p>
                            </div>
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                <p className="text-[0.6rem] font-bold text-gray-500 uppercase tracking-widest mb-1">Environment Stage</p>
                                <div className="flex items-center gap-2">
                                    <span className={`h-2 w-2 rounded-full animate-ping ${currentEnv === "production" ? "bg-emerald-500" : "bg-primary-normal"}`} />
                                    <p className="text-sm font-bold text-white uppercase">{currentEnv === "default" ? "SYSTEM DEFAULT" : currentEnv}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="h-16 w-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
                                <AlertTriangle size={32} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Are you absolutely sure?</h2>
                                <p className="text-sm text-gray-400 mt-2">
                                    You are about to delete <span className="text-red-500 font-bold uppercase">{selectedType || "ALL SYSTEM"}</span> data.
                                    This action is permanent and cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-gray-600 ml-1">Type <span className="text-red-500">clear data</span> to confirm:</p>
                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    placeholder="clear data"
                                    className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => { setIsModalOpen(false); setConfirmText(""); setSelectedType(null); }}
                                    className="flex-1 h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleClearData}
                                    disabled={confirmText.toLowerCase() !== "clear data" || clearDataMutation.isPending}
                                    className={`flex-1 h-12 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2
                    ${confirmText.toLowerCase() === "clear data"
                                            ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200"
                                            : "bg-gray-300 cursor-not-allowed"
                                        }
                  `}
                                >
                                    {clearDataMutation.isPending ? (
                                        <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                    ) : (
                                        <>
                                            <Trash2 size={16} />
                                            Confirm Delete
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaintenanceManagement;
