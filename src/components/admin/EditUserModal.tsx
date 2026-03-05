"use client";

import React, { useState, useEffect, useRef } from "react";
import Modal from "../ui/Modal";
import { Input } from "../ui/Input";
import { Search, MapPin, Loader2, Save, X } from "lucide-react";
import api from "../../utils/axios";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onSuccess: () => void;
}

export default function EditUserModal({ isOpen, onClose, user, onSuccess }: EditUserModalProps) {
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

    useEffect(() => {
        if (user && isOpen) {
            let locData = null;
            try {
                locData = typeof user.location === 'string' ? JSON.parse(user.location) : user.location;
            } catch (e) { locData = user.location; }

            setFormData({
                username: user.username || "",
                full_name: user.full_name || "",
                date_of_birth: user.birthday || "",
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
        }
    }, [user, isOpen]);

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
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update user");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit User Details">
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

                <div className="pt-4 sticky bottom-0 bg-white border-t border-gray-50 mt-4">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full h-12 rounded-xl bg-gray-900 text-white font-bold flex items-center justify-center gap-2 hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save Changes
                    </button>
                </div>
            </form>
        </Modal>
    );
}
