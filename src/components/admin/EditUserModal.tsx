"use client";

import React, { useState, useEffect, useRef } from "react";
import Modal from "../ui/Modal";
import { Input } from "../ui/Input";
import { Search, MapPin, Loader2, Save, Edit2, Calendar, User as UserIcon, Languages, Heart, Compass } from "lucide-react";
import api from "../../utils/axios";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    initialMode?: "view" | "edit";
    onSuccess: () => void;
}

export default function EditUserModal({ isOpen, onClose, user, initialMode = "view", onSuccess }: EditUserModalProps) {
    const [mode, setMode] = useState<"view" | "edit">(initialMode);
    const [formData, setFormData] = useState<any>({
        username: "",
        full_name: "",
        date_of_birth: "",
        gender: "",
        location: "",
        latitude: null,
        longitude: null,
        languages: [],
        interests: [],
        styles: [],
    });
    const [submitting, setSubmitting] = useState(false);

    // Location search state
    const [locationInput, setLocationInput] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchingLocation, setSearchingLocation] = useState(false);
    const debounceRef = useRef<any>(null);

    // Fetch options
    const { data: options } = useQuery({
        queryKey: ["userMetaOptions"],
        queryFn: async () => {
            const [langs, ints, styles] = await Promise.all([
                api.get("/profile/get-languages"),
                api.get("/profile/get-interests"),
                api.get("/profile/get-styles"),
            ]);
            return {
                languages: langs.data.languages || [],
                interests: ints.data.interests || [],
                styles: styles.data.styles || [],
            };
        },
        enabled: isOpen,
    });

    const formatDateForInput = (dateString: string) => {
        if (!dateString) return "";
        // If it's DD/MM/YYYY or similar, we might need more logic. 
        // But if it's already YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // fallback
        return date.toISOString().split('T')[0];
    };

    useEffect(() => {
        if (user && isOpen) {
            let locData = null;
            try {
                locData = typeof user.location === 'string' ? JSON.parse(user.location) : user.location;
            } catch (e) { locData = user.location; }

            setFormData({
                username: user.username || "",
                full_name: user.full_name || "",
                date_of_birth: formatDateForInput(user.birthday || ""),
                gender: user.gender || "",
                location: user.location || "",
                latitude: user.latitude || null,
                longitude: user.longitude || null,
                languages: user.languages?.map((l: any) => l.id) || [],
                interests: user.interests?.map((i: any) => i.id) || [],
                styles: user.travelStyles?.map((s: any) => s.id) || [],
            });

            if (locData && locData.place) {
                setLocationInput(`${locData.place}${locData.state ? ', ' + locData.state : ''}`);
            } else if (typeof user.location === 'string' && user.location) {
                setLocationInput(user.location);
            } else {
                setLocationInput("");
            }
            setMode(initialMode);
        }
    }, [user, isOpen, initialMode]);

    const handleLocationSearch = async (val: string) => {
        setLocationInput(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (val.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setSearchingLocation(true);
            try {
                const { data } = await api.get(`/custom/place-search?place=${val}`);
                setSuggestions(data.data || []);
                setShowSuggestions(true);
            } catch (error) {
                console.error("Location search failed", error);
            } finally {
                setSearchingLocation(false);
            }
        }, 500);
    };

    const selectLocation = (item: any) => {
        const locDetails = {
            place: item.name,
            state: item.state,
            geoPosition: {
                latitude: item.latitude,
                longitude: item.longitude,
                __type: "GeoPoint",
            },
        };
        setFormData({
            ...formData,
            location: JSON.stringify(locDetails),
            latitude: item.latitude,
            longitude: item.longitude,
        });
        setLocationInput(`${item.name}, ${item.state}`);
        setShowSuggestions(false);
    };

    const toggleItem = (field: string, id: number) => {
        const current = [...formData[field]];
        if (current.includes(id)) {
            setFormData({ ...formData, [field]: current.filter(i => i !== id) });
        } else {
            setFormData({ ...formData, [field]: [...current, id] });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.put(`/admin/users/${user.id}`, formData);
            toast.success("User updated successfully");
            onSuccess();
            setMode("view");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update user");
        } finally {
            setSubmitting(false);
        }
    };

    const locData = (() => {
        try {
            return typeof user?.location === 'string' ? JSON.parse(user.location) : user?.location;
        } catch (e) { return null; }
    })();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={mode === "view" ? "User Profile" : "Edit User Details"}>
            {mode === "view" ? (
                <div className="space-y-8 pb-6">
                    {/* Hero Section */}
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="size-24 rounded-3xl bg-gray-100 overflow-hidden border-4 border-white shadow-xl">
                            {user?.profile_picture ? (
                                <img src={user.profile_picture} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <UserIcon size={40} />
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{user?.full_name || "Unnamed User"}</h3>
                            <p className="text-sm font-medium text-gray-400">@{user?.username || "no-username"}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                        <div className="space-y-1">
                            <p className="text-[0.65rem] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Calendar size={12} /> Birthday
                            </p>
                            <p className="text-sm font-bold text-gray-800">{user?.birthday || "Not set"}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[0.65rem] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                <UserIcon size={12} /> Gender
                            </p>
                            <p className="text-sm font-bold text-gray-800 capitalize">{user?.gender || "Not set"}</p>
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                            <p className="text-[0.65rem] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                <MapPin size={12} /> Location
                            </p>
                            <p className="text-sm font-bold text-gray-800">
                                {locData ? `${locData.place}${locData.state ? ', ' + locData.state : ''}` : (user?.location || "Not set")}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <p className="text-[0.65rem] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Languages size={14} /> Languages
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {user?.languages?.length > 0 ? user.languages.map((l: any) => (
                                    <span key={l.id} className="px-3 py-1.5 rounded-lg bg-primary-light text-primary-normal text-xs font-bold border border-primary-normal/10">
                                        {l.name}
                                    </span>
                                )) : <p className="text-xs text-gray-400 italic">No languages added</p>}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[0.65rem] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Heart size={14} /> Interests
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {user?.interests?.length > 0 ? user.interests.map((i: any) => (
                                    <span key={i.id} className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                                        {i.name}
                                    </span>
                                )) : <p className="text-xs text-gray-400 italic">No interests added</p>}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[0.65rem] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Compass size={14} /> Travel Styles
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {user?.travelStyles?.length > 0 ? user.travelStyles.map((s: any) => (
                                    <span key={s.id} className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 text-xs font-bold border border-purple-100">
                                        {s.name}
                                    </span>
                                )) : <p className="text-xs text-gray-400 italic">No styles added</p>}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 sticky bottom-0 bg-white border-t border-gray-50 flex gap-3">
                        <button
                            onClick={() => setMode("edit")}
                            className="flex-1 h-12 rounded-xl bg-gray-900 text-white font-bold flex items-center justify-center gap-2 hover:bg-black active:scale-[0.98] transition-all"
                        >
                            <Edit2 size={18} />
                            Edit Profile
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                            <Input
                                value={formData.full_name}
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                placeholder="Full Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Username</label>
                            <Input
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                placeholder="username"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date of Birth</label>
                            <Input
                                type="date"
                                value={formData.date_of_birth}
                                onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gender</label>
                            <select
                                className="flex h-12 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-normal/20 focus:border-primary-normal"
                                value={formData.gender}
                                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2 relative">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-normal transition-colors">
                                {searchingLocation ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                            </div>
                            <Input
                                className="pl-12"
                                value={locationInput}
                                onChange={e => handleLocationSearch(e.target.value)}
                                placeholder="Search city, area..."
                            />
                        </div>
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 mt-2 z-50 overflow-hidden divide-y divide-gray-50 max-h-60 overflow-y-auto">
                                {suggestions.map((item, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => selectLocation(item)}
                                        className="w-full p-4 hover:bg-gray-50 flex items-center gap-3 text-left transition-colors"
                                    >
                                        <div className="size-8 rounded-lg bg-gray-50 flex items-center justify-center text-primary-normal border border-gray-100 shrink-0">
                                            <MapPin size={16} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                                            <p className="text-[0.7rem] font-bold text-gray-400 truncate">{item.state}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Multiselect Sections */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Languages</label>
                            <div className="flex flex-wrap gap-2">
                                {options?.languages.map((lang: any) => (
                                    <button
                                        key={lang.id}
                                        type="button"
                                        onClick={() => toggleItem("languages", lang.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${formData.languages.includes(lang.id)
                                                ? "bg-primary-normal border-primary-normal text-white"
                                                : "bg-white border-gray-100 text-gray-500 hover:border-gray-300"
                                            }`}
                                    >
                                        {lang.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Interests</label>
                            <div className="flex flex-wrap gap-2">
                                {options?.interests.map((item: any) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => toggleItem("interests", item.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${formData.interests.includes(item.id)
                                                ? "bg-blue-500 border-blue-500 text-white"
                                                : "bg-white border-gray-100 text-gray-500 hover:border-gray-300"
                                            }`}
                                    >
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Travel Styles</label>
                            <div className="flex flex-wrap gap-2">
                                {options?.styles.map((item: any) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => toggleItem("styles", item.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${formData.styles.includes(item.id)
                                                ? "bg-purple-500 border-purple-500 text-white"
                                                : "bg-white border-gray-100 text-gray-500 hover:border-gray-300"
                                            }`}
                                    >
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 sticky bottom-0 bg-white border-t border-gray-50 mt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setMode("view")}
                            className="flex-1 h-12 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-[2] h-12 rounded-xl bg-gray-900 text-white font-bold flex items-center justify-center gap-2 hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            Save Changes
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );
}
