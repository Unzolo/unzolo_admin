"use client";

import React, { useState, useRef } from "react";
import Modal from "../ui/Modal";
import api from "../../utils/axios";
import { Plus, Trash2, Image as ImageIcon, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface CreatePackageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
    id?: number;
}

export default function CreatePackageModal({ isOpen, onClose, onSuccess, initialData, id }: CreatePackageModalProps) {
    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [filePreviews, setFilePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: "",
        destination: "",
        cost: "",
        description: "",
        itinerary: "",
        highlights: "",
        travel_options: "",
        things_to_carry: "",
        exclusions: "",
        activities: "",
        images: [""]
    });

    React.useEffect(() => {
        if (initialData) {
            const parseField = (val: any, fallback: string = "") => {
                if (!val) return fallback;
                if (typeof val === 'string') {
                    try {
                        const parsed = JSON.parse(val);
                        return Array.isArray(parsed) ? parsed.join("\n") : (typeof parsed === 'object' ? JSON.stringify(parsed, null, 2) : val);
                    } catch (e) {
                        return val;
                    }
                }
                if (Array.isArray(val)) return val.join("\n");
                if (typeof val === 'object') return JSON.stringify(val, null, 2);
                return val;
            };

            setFormData({
                title: initialData.title,
                destination: initialData.destination,
                cost: initialData.cost.toString(),
                description: initialData.description,
                itinerary: initialData.itinerary || "",
                highlights: parseField(initialData.highlights),
                travel_options: parseField(initialData.travel_options),
                things_to_carry: parseField(initialData.things_to_carry),
                exclusions: parseField(initialData.exclusions),
                activities: parseField(initialData.activities),
                images: initialData.images?.map((img: any) => img.image_url) || [""]
            });
        } else {
            setFormData({ title: "", destination: "", cost: "", description: "", itinerary: "", highlights: "", travel_options: "", things_to_carry: "", exclusions: "", activities: "", images: [""] });
        }
        setSelectedFiles([]);
        setFilePreviews([]);
    }, [initialData, isOpen]);

    const handleAddImage = () => {
        setFormData({ ...formData, images: [...formData.images, ""] });
    };

    const handleRemoveImage = (index: number) => {
        const newImages = formData.images.filter((_: string, i: number) => i !== index);
        setFormData({ ...formData, images: newImages.length ? newImages : [""] });
    };

    const handleImageChange = (index: number, value: string) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData({ ...formData, images: newImages });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setSelectedFiles((prev) => [...prev, ...files]);

            const newPreviews = files.map(file => URL.createObjectURL(file));
            setFilePreviews((prev) => [...prev, ...newPreviews]);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        URL.revokeObjectURL(filePreviews[index]);
        setFilePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let uploadedUrls: string[] = [];

            // Upload files first if any
            if (selectedFiles.length > 0) {
                const uploadFormData = new FormData();
                selectedFiles.forEach(file => uploadFormData.append("images", file));

                const uploadRes = await api.post("/admin/upload-images", uploadFormData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });

                if (uploadRes.data.success) {
                    uploadedUrls = uploadRes.data.urls;
                }
            }

            const cleanedImages = formData.images.filter((img: string) => img.trim() !== "");
            const finalImages = [...cleanedImages, ...uploadedUrls];

            const formatArr = (val: string) => val.split("\n").map(i => i.trim()).filter(i => i !== "");
            let travelOpts = formData.travel_options;
            try {
                if (travelOpts.trim().startsWith('{') || travelOpts.trim().startsWith('[')) {
                    travelOpts = JSON.parse(travelOpts);
                }
            } catch (e) {
                // keep as string if not valid JSON
            }

            const payload = {
                ...formData,
                cost: Number(formData.cost),
                images: finalImages,
                highlights: JSON.stringify(formatArr(formData.highlights)),
                things_to_carry: JSON.stringify(formatArr(formData.things_to_carry)),
                exclusions: JSON.stringify(formatArr(formData.exclusions)),
                activities: JSON.stringify(formatArr(formData.activities)),
                travel_options: typeof travelOpts === 'string' ? travelOpts : JSON.stringify(travelOpts)
            };

            if (id) {
                await api.put(`/admin/packages/${id}`, payload);
                toast.success("Package updated successfully");
            } else {
                await api.post("/admin/packages", payload);
                toast.success("Package created successfully");
            }
            onSuccess();
            onClose();
            if (!id) setFormData({ title: "", destination: "", cost: "", description: "", itinerary: "", highlights: "", travel_options: "", things_to_carry: "", exclusions: "", activities: "", images: [""] });
            setSelectedFiles([]);
            setFilePreviews([]);
        } catch (error) {
            console.error("Failed to handle package:", error);
            toast.error("Failed to save package. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={id ? "Edit Package" : "Create New Package"}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Package Title</label>
                    <input
                        required
                        type="text"
                        placeholder="e.g. Exotic Maldives Getaway"
                        className="w-full bg-gray-50 border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary-light transition-all text-sm shadow-sm"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Destination</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Male, Maldives"
                            className="w-full bg-gray-50 border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary-light transition-all text-sm shadow-sm"
                            value={formData.destination}
                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Cost (₹)</label>
                        <input
                            required
                            type="number"
                            placeholder="e.g. 45000"
                            className="w-full bg-gray-50 border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary-light transition-all text-sm shadow-sm"
                            value={formData.cost}
                            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Description</label>
                    <textarea
                        required
                        rows={3}
                        placeholder="Describe the package in detail..."
                        className="w-full bg-gray-50 border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary-light transition-all text-sm shadow-sm resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Highlights (One per line)</label>
                        <textarea
                            rows={4}
                            placeholder="Exotic Beaches&#10;Water Sports&#10;Luxury Stay"
                            className="w-full bg-gray-50 border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary-light transition-all text-sm shadow-sm resize-none"
                            value={formData.highlights}
                            onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Inclusions / Activities (JSON or Text)</label>
                        <textarea
                            rows={4}
                            placeholder='{"stay": ["Hotels"], "food": ["Breakfast"]}'
                            className="w-full bg-gray-50 border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary-light transition-all text-sm shadow-sm resize-none"
                            value={formData.travel_options}
                            onChange={(e) => setFormData({ ...formData, travel_options: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Things to Carry (One per line)</label>
                        <textarea
                            rows={4}
                            placeholder="Sunscreen&#10;Camera&#10;Swimwear"
                            className="w-full bg-gray-50 border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary-light transition-all text-sm shadow-sm resize-none"
                            value={formData.things_to_carry}
                            onChange={(e) => setFormData({ ...formData, things_to_carry: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Exclusions (One per line)</label>
                        <textarea
                            rows={4}
                            placeholder="Airfare&#10;Insurance&#10;Personal Expenses"
                            className="w-full bg-gray-50 border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary-light transition-all text-sm shadow-sm resize-none"
                            value={formData.exclusions}
                            onChange={(e) => setFormData({ ...formData, exclusions: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Activities (One per line)</label>
                        <textarea
                            rows={4}
                            placeholder="Hiking&#10;Scuba Diving&#10;City Tour"
                            className="w-full bg-gray-50 border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary-light transition-all text-sm shadow-sm resize-none"
                            value={formData.activities}
                            onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Daily Itinerary</label>
                        <textarea
                            rows={4}
                            placeholder="Day 1: Arrival and Rest&#10;Day 2: City Tour..."
                            className="w-full bg-gray-50 border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary-light transition-all text-sm shadow-sm resize-none"
                            value={formData.itinerary}
                            onChange={(e) => setFormData({ ...formData, itinerary: e.target.value })}
                        />
                    </div>
                </div>

                {/* Image Upload Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-gray-700">Gallery</label>
                        <div className="flex gap-2">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <Upload size={14} /> Upload Files
                            </button>
                            <button
                                type="button"
                                onClick={handleAddImage}
                                className="text-primary-normal hover:text-primary-dark text-xs font-bold flex items-center gap-1 bg-primary-light/50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <Plus size={14} /> Add URL
                            </button>
                        </div>
                    </div>

                    {/* Previews */}
                    {filePreviews.length > 0 && (
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 bg-gray-50 p-3 rounded-lg border border-dashed border-gray-200">
                            {filePreviews.map((url, index) => (
                                <div key={index} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm bg-white">
                                    <img src={url} alt="preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* URL Inputs + Existing Previews if any */}
                    <div className="space-y-3">
                        {formData.images.map((url: string, index: number) => (
                            <div key={index} className="flex gap-2">
                                <div className="relative flex-1">
                                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="url"
                                        placeholder="https://example.com/image.jpg"
                                        className="w-full bg-gray-50 border-none rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary-light transition-all text-sm shadow-sm"
                                        value={url}
                                        onChange={(e) => handleImageChange(index, e.target.value)}
                                    />
                                    {url && (
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg overflow-hidden border border-white shadow-sm bg-gray-100">
                                            <img src={url} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(index)}
                                    className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full bg-primary-normal text-white py-4 rounded-lg font-bold shadow-xl shadow-primary-light/50 hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    >
                        {loading ? (id ? "Updating..." : "Creating...") : (id ? "Update Package" : "Create Package")}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
