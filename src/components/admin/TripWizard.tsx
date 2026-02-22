"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    Plus, Trash2, Image as ImageIcon, X, Star, Mountain, Luggage, Ban,
    Tent, Utensils, Gamepad2, PartyPopper, Check, ChevronRight, ChevronLeft,
    Calendar, MapPin, Users, IndianRupee, Tag, Clock, ArrowLeft, Upload,
    Sparkles, Package, Tent as CampIcon, Info, Settings, List, BookOpen,
    CheckCircle2, Circle, Loader2, Save
} from "lucide-react";
import { toast } from "sonner";
import api from "../../utils/axios";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface TripWizardProps {
    type: "package" | "camp";
    initialData?: any;
}

const CATEGORIES = [
    { key: 'stay', label: 'Stay', icon: Tent },
    { key: 'food', label: 'Food', icon: Utensils },
    { key: 'events', label: 'Events', icon: PartyPopper },
    { key: 'games', label: 'Games', icon: Gamepad2 },
    { key: 'activities', label: 'Activities', icon: Mountain }
];

const ADDITIONAL_LISTS = [
    { key: 'highlights', label: 'Highlights', icon: Star, placeholder: 'e.g. Scenic mountain views', color: 'text-amber-500', bg: 'bg-amber-50 border-amber-100' },
    { key: 'inclusions', label: 'Inclusions', icon: Check, placeholder: 'e.g. Accommodation included', color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-100' },
    { key: 'exclusions', label: 'Exclusions', icon: Ban, placeholder: 'e.g. Flights not included', color: 'text-red-400', bg: 'bg-red-50 border-red-100' },
    { key: 'things_to_carry', label: 'Things to Carry', icon: Luggage, placeholder: 'e.g. Sunscreen, Hat', color: 'text-blue-500', bg: 'bg-blue-50 border-blue-100' }
];

const STEPS = [
    { id: 1, label: 'Basic Info', icon: Info, description: 'Title, dates & location' },
    { id: 2, label: 'Pricing', icon: Settings, description: 'Pricing & booking details' },
    { id: 3, label: 'Details', icon: List, description: 'Highlights & provisions' },
    { id: 4, label: 'Itinerary', icon: BookOpen, description: 'Day-by-day schedule' },
];

// ─── UI Primitives ────────────────────────────────────────────────────────────

const Label = ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
    <label htmlFor={htmlFor} className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
        {children}
    </label>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
        <Label>{label}</Label>
        {children}
    </div>
);

const inputCls = "w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-800 placeholder:text-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-primary-normal/20 focus:border-primary-normal focus:bg-white";
const selectCls = `${inputCls} cursor-pointer appearance-none`;

// ─── Step 1: Basic Info ───────────────────────────────────────────────────────

const Step1 = ({ formData, setFormData, handleFileSelect, filePreviews, removeFile, fileInputRef }: any) => (
    <div className="space-y-6">
        {/* Image Upload Zone */}
        <div>
            <Label>Trip Photos</Label>
            <div
                onClick={() => fileInputRef.current?.click()}
                className="relative w-full h-48 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center cursor-pointer hover:border-primary-normal/40 hover:bg-primary-light/30 transition-all group overflow-hidden"
            >
                <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileSelect} multiple accept="image/*" />
                {filePreviews.length > 0 ? (
                    <div className="absolute inset-0 flex gap-2 p-3 overflow-x-auto" onClick={(e) => e.stopPropagation()}>
                        {filePreviews.map((src: string, i: number) => (
                            <div key={i} className="relative shrink-0 h-full aspect-square rounded-xl overflow-hidden shadow-md">
                                <img src={src} className="w-full h-full object-cover" alt="" />
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                                    className="absolute top-1.5 right-1.5 p-1 bg-black/60 rounded-full text-white hover:bg-red-500 transition-colors"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        ))}
                        <div className="shrink-0 h-full aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-primary-normal hover:text-primary-normal transition-all cursor-pointer px-3" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                            <Plus size={20} />
                            <span className="text-[0.6rem] font-bold">Add</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3 text-gray-400 group-hover:text-primary-normal transition-colors">
                        <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:shadow-md transition-shadow">
                            <Upload size={24} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold">Click to upload photos</p>
                            <p className="text-xs text-gray-300">PNG, JPG, WEBP up to 10MB each</p>
                        </div>
                    </div>
                )}
            </div>
        </div>

        <Field label="Trip Title">
            <input className={inputCls} placeholder="e.g. Himalayan Adventure Trek" value={formData.title || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })} />
        </Field>

        <Field label="Description">
            <textarea
                className={`${inputCls} h-24 py-3 resize-none`}
                placeholder="Describe the experience, highlights, and what makes this trip unique..."
                value={formData.description || ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
            />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Destination">
                <div className="relative">
                    <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input className={`${inputCls} pl-10`} placeholder="e.g. Manali, Himachal Pradesh" value={formData.destination || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, destination: e.target.value })} />
                </div>
            </Field>
            <Field label="Starting Location">
                <div className="relative">
                    <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input className={`${inputCls} pl-10`} placeholder="e.g. Delhi, India" value={formData.start_location || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, start_location: e.target.value })} />
                </div>
            </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Start Date">
                <div className="relative">
                    <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input type="date" className={`${inputCls} pl-10`} value={formData.start_date || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, start_date: e.target.value })} />
                </div>
            </Field>
            <Field label="End Date">
                <div className="relative">
                    <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input type="date" className={`${inputCls} pl-10`} value={formData.end_date || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, end_date: e.target.value })} />
                </div>
            </Field>
        </div>
    </div>
);

// ─── Step 2: Pricing ──────────────────────────────────────────────────────────

const Step2 = ({ formData, setFormData }: any) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Trip Type">
                <select className={selectCls} value={formData.travel_type || ""} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, travel_type: e.target.value })}>
                    <option value="digital_nomad">Digital Nomad</option>
                    <option value="luxury">Luxury</option>
                    <option value="non_luxury">Non Luxury</option>
                </select>
            </Field>
            <Field label="Transport">
                <select className={selectCls} value={formData.transport_type || ""} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, transport_type: e.target.value })}>
                    <option value="public_transport">Public Transport</option>
                    <option value="car">Car</option>
                    <option value="bus">Bus</option>
                    <option value="train">Train</option>
                    <option value="bike">Bike</option>
                </select>
            </Field>
        </div>

        <div className="p-4 bg-linear-to-br from-gray-50 to-gray-100/60 rounded-2xl border border-gray-100 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Pricing</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Price (Adult)">
                    <div className="relative">
                        <IndianRupee size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input type="number" className={`${inputCls} pl-9`} placeholder="0" value={formData.cost || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, cost: e.target.value })} />
                    </div>
                </Field>
                <Field label="Price (Child)">
                    <div className="relative">
                        <IndianRupee size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input type="number" className={`${inputCls} pl-9`} placeholder="0" value={formData.price_child || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, price_child: e.target.value })} />
                    </div>
                </Field>
                <Field label="Discount (%)">
                    <div className="relative">
                        <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input type="number" className={`${inputCls} pl-9`} placeholder="0" value={formData.discount || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, discount: e.target.value })} />
                    </div>
                </Field>
            </div>
        </div>

        <Field label="Maximum Members">
            <div className="relative">
                <Users size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input type="number" className={`${inputCls} pl-9`} placeholder="e.g. 20" value={formData.max_members || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, max_members: e.target.value })} />
            </div>
        </Field>

        <div className="p-4 bg-linear-to-br from-blue-50 to-indigo-50/60 rounded-2xl border border-blue-100/80 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">Advance Booking</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Advance Amount">
                    <div className="relative">
                        <IndianRupee size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input type="number" className={`${inputCls} pl-9`} placeholder="0" value={formData.advance_amount || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, advance_amount: e.target.value })} />
                    </div>
                </Field>
                <Field label="Advance Cut-off Date">
                    <div className="relative">
                        <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input type="date" className={`${inputCls} pl-9`} value={formData.advance_cutoff_date || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, advance_cutoff_date: e.target.value })} />
                    </div>
                </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Booking Opens">
                    <div className="relative">
                        <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input type="date" className={`${inputCls} pl-9`} value={formData.booking_start_date || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, booking_start_date: e.target.value })} />
                    </div>
                </Field>
                <Field label="Booking Closes">
                    <div className="relative">
                        <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input type="date" className={`${inputCls} pl-9`} value={formData.booking_end_date || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, booking_end_date: e.target.value })} />
                    </div>
                </Field>
            </div>
        </div>
    </div>
);

// ─── Tag Badge ─────────────────────────────────────────────────────────────────

const TagBadge = ({ label, onRemove, color }: { label: string; onRemove: () => void; color: string }) => (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${color} transition-all`}>
        {label}
        <button onClick={onRemove} className="hover:text-gray-700 transition-colors">
            <X size={10} />
        </button>
    </span>
);

// ─── Provision Item ───────────────────────────────────────────────────────────

const ProvisionItem = ({ label, icon: Icon, values, onUpdate, placeholder, color, bg }: any) => {
    const [inputValue, setInputValue] = useState("");
    const handleAdd = () => {
        if (!inputValue.trim()) return;
        onUpdate([...values, inputValue.trim()]);
        setInputValue("");
    };
    return (
        <div className={`rounded-2xl border p-4 space-y-3 ${bg}`}>
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Icon size={16} className={color} />
                    <span className="text-sm font-semibold text-gray-700">{label}</span>
                    <span className="text-[0.65rem] text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">{values.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        className="h-8 rounded-xl border border-white bg-white px-3 text-xs text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-normal/20 focus:border-primary-normal transition-all w-36"
                        placeholder={placeholder}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <button
                        onClick={handleAdd}
                        className="h-8 w-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary-normal hover:text-primary-normal hover:bg-primary-light transition-all"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            </div>
            {values.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {values.map((val: string, i: number) => (
                        <TagBadge
                            key={i}
                            label={val}
                            color={`${color} bg-white border-gray-200`}
                            onRemove={() => onUpdate(values.filter((_: any, idx: number) => idx !== i))}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Category Item ────────────────────────────────────────────────────────────

const CategoryItem = ({ cat, values, onUpdate }: any) => {
    const [input, setInput] = useState("");
    const PRESETS: Record<string, string[]> = {
        stay: ['Hotel', 'Hostel', 'Camping', 'Homestay'],
        food: ['Breakfast', 'Lunch', 'Dinner', 'All Meals'],
        events: ['Bonfire', 'Cultural Show', 'Live Music'],
        games: ['Cricket', 'Volleyball', 'Indoor Games'],
        activities: ['Trekking', 'Rafting', 'Paragliding', 'Zip-line']
    };
    const presets = PRESETS[cat.key] || [];
    const handleAdd = (val: string) => {
        if (!val.trim() || values.includes(val.trim())) return;
        onUpdate([...values, val.trim()]);
        setInput("");
    };
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-primary-light rounded-xl">
                        <cat.icon size={15} className="text-primary-normal" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{cat.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd(input)}
                        placeholder="Custom..."
                        className="h-8 w-28 rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary-normal/20 focus:border-primary-normal transition-all"
                    />
                    <button onClick={() => handleAdd(input)} className="h-8 w-8 rounded-xl bg-primary-normal text-white flex items-center justify-center hover:opacity-90 transition-all">
                        <Plus size={14} />
                    </button>
                </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {presets.map(preset => (
                    <button
                        key={preset}
                        onClick={() => handleAdd(preset)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${values.includes(preset) ? 'bg-primary-normal text-white border-primary-normal' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-primary-normal hover:text-primary-normal'}`}
                    >
                        {preset}
                    </button>
                ))}
            </div>
            {values.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-50">
                    {values.map((val: string, i: number) => (
                        <span key={i} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-primary-light text-primary-normal border border-primary-light-active">
                            {val}
                            <button onClick={() => onUpdate(values.filter((_: any, idx: number) => idx !== i))} className="hover:text-red-500">
                                <X size={10} />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Step 3: Details ──────────────────────────────────────────────────────────

const Step3 = ({ formData, setFormData, handleCategoryUpdate }: any) => (
    <div className="space-y-8">
        <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest">Travel Options</h3>
            <div className="space-y-3">
                {CATEGORIES.map(cat => (
                    <CategoryItem
                        key={cat.key}
                        cat={cat}
                        values={formData.travel_options[cat.key] || []}
                        onUpdate={(items: string[]) => handleCategoryUpdate(cat.key, items)}
                    />
                ))}
            </div>
        </div>
        <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest">Trip Provisions</h3>
            <div className="space-y-3">
                {ADDITIONAL_LISTS.map(list => (
                    <ProvisionItem
                        key={list.key}
                        label={list.label}
                        icon={list.icon}
                        placeholder={list.placeholder}
                        color={list.color}
                        bg={list.bg}
                        values={formData[list.key as keyof typeof formData] as string[] || []}
                        onUpdate={(items: string[]) => setFormData((prev: any) => ({ ...prev, [list.key]: items }))}
                    />
                ))}
            </div>
        </div>
    </div>
);

// ─── Step 4: Itinerary ────────────────────────────────────────────────────────

const Step4 = ({ formData, setFormData }: any) => {
    const blank = { title: "", description: "", location: "", time: "09:00", type: "Activity" };
    const [form, setForm] = useState(blank);
    const [editIdx, setEditIdx] = useState<number | null>(null);

    const save = () => {
        if (!form.title.trim()) return;
        setFormData((prev: any) => {
            const list = [...prev.itinerary];
            if (editIdx !== null) list[editIdx] = form;
            else list.push(form);
            return { ...prev, itinerary: list };
        });
        setForm(blank);
        setEditIdx(null);
    };

    const TYPE_COLORS: Record<string, string> = {
        Activity: 'bg-blue-100 text-blue-700',
        Food: 'bg-amber-100 text-amber-700',
        Travel: 'bg-purple-100 text-purple-700',
        Rest: 'bg-green-100 text-green-700'
    };

    return (
        <div className="space-y-6">
            {/* Item List */}
            {formData.itinerary.length > 0 && (
                <div className="space-y-2">
                    {formData.itinerary.map((item: any, idx: number) => (
                        <div key={idx} className={`flex gap-3 p-4 rounded-2xl border transition-all group ${editIdx === idx ? 'border-primary-normal bg-primary-light/20' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'}`}>
                            <div className="shrink-0 w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center text-center">
                                <Clock size={12} className="text-gray-400" />
                                <span className="text-[0.6rem] font-bold text-gray-500 mt-0.5">{item.time}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
                                    <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[item.type] || 'bg-gray-100 text-gray-600'}`}>{item.type}</span>
                                </div>
                                {item.description && <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{item.description}</p>}
                                {item.location && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <MapPin size={10} className="text-gray-300" />
                                        <span className="text-[0.65rem] text-gray-400">{item.location}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setEditIdx(idx); setForm(item); }} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-300 hover:text-blue-500 transition-all">
                                    <Plus size={14} />
                                </button>
                                <button onClick={() => setFormData((prev: any) => ({ ...prev, itinerary: prev.itinerary.filter((_: any, i: number) => i !== idx) }))} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Form */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-5 space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{editIdx !== null ? 'Edit Activity' : 'Add Activity'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Title">
                        <input className={inputCls} placeholder="e.g. Sunrise trek to peak" value={form.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, title: e.target.value })} />
                    </Field>
                    <Field label="Location">
                        <div className="relative">
                            <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                            <input className={`${inputCls} pl-9`} placeholder="e.g. Base camp" value={form.location} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, location: e.target.value })} />
                        </div>
                    </Field>
                </div>
                <Field label="Description">
                    <textarea className={`${inputCls} h-20 py-3 resize-none`} placeholder="Describe this activity..." value={form.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, description: e.target.value })} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Time">
                        <div className="relative">
                            <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                            <input type="time" className={`${inputCls} pl-9`} value={form.time} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, time: e.target.value })} />
                        </div>
                    </Field>
                    <Field label="Type">
                        <select className={selectCls} value={form.type || ""} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, type: e.target.value })}>
                            <option>Activity</option>
                            <option>Food</option>
                            <option>Travel</option>
                            <option>Rest</option>
                        </select>
                    </Field>
                </div>
                <div className="flex gap-2 pt-1">
                    {editIdx !== null && (
                        <button onClick={() => { setForm(blank); setEditIdx(null); }} className="flex-1 h-10 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-all">
                            Cancel
                        </button>
                    )}
                    <button onClick={save} className="flex-1 h-10 rounded-xl bg-primary-normal text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all">
                        {editIdx !== null ? 'Update' : 'Add to Itinerary'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TripWizard({ type, initialData }: TripWizardProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [filePreviews, setFilePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const accentColor = type === "package" ? "primary" : "amber";
    const accentBg = type === "package" ? "bg-primary-normal" : "bg-amber-500";
    const accentLight = type === "package" ? "bg-primary-light" : "bg-amber-50";
    const accentText = type === "package" ? "text-primary-normal" : "text-amber-600";

    const [formData, setFormData] = useState({
        title: "", description: "", destination: "", start_location: "",
        start_date: "", end_date: "",
        travel_type: "non_luxury", transport_type: "public_transport",
        cost: "", price_child: "", discount: "", max_members: "",
        advance_amount: "", advance_cutoff_date: "", booking_start_date: "", booking_end_date: "",
        travel_options: {} as Record<string, string[]>,
        highlights: [] as string[], inclusions: [] as string[],
        exclusions: [] as string[], things_to_carry: [] as string[],
        activities: [] as string[], itinerary: [] as any[],
        images: [""]
    });

    useEffect(() => {
        if (initialData) {
            const parseJSON = (val: any) => {
                if (!val) return null;
                if (typeof val === 'string') { try { return JSON.parse(val); } catch { return null; } }
                return val;
            };
            setFormData({
                ...initialData,
                cost: initialData.cost?.toString() || "",
                price_child: initialData.price_child?.toString() || "",
                discount: initialData.discount?.toString() || "",
                max_members: initialData.max_members?.toString() || "",
                advance_amount: initialData.advance_amount?.toString() || "",
                start_date: initialData.start_date ? new Date(initialData.start_date).toISOString().split('T')[0] : "",
                end_date: initialData.end_date ? new Date(initialData.end_date).toISOString().split('T')[0] : "",
                advance_cutoff_date: initialData.advance_cutoff_date ? new Date(initialData.advance_cutoff_date).toISOString().split('T')[0] : "",
                booking_start_date: initialData.booking_start_date ? new Date(initialData.booking_start_date).toISOString().split('T')[0] : "",
                booking_end_date: initialData.booking_end_date ? new Date(initialData.booking_end_date).toISOString().split('T')[0] : "",
                travel_options: parseJSON(initialData.travel_options) || {},
                highlights: parseJSON(initialData.highlights) || [],
                inclusions: parseJSON(initialData.inclusions) || [],
                exclusions: parseJSON(initialData.exclusions) || [],
                things_to_carry: parseJSON(initialData.things_to_carry) || [],
                activities: parseJSON(initialData.activities) || [],
                itinerary: parseJSON(initialData.itinerary) || [],
                images: initialData.images?.map((img: any) => img.image_url) || [""]
            });
        }
    }, [initialData]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setSelectedFiles(prev => [...prev, ...files]);
            setFilePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        URL.revokeObjectURL(filePreviews[index]);
        setFilePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleCategoryUpdate = (key: string, items: string[]) => {
        setFormData(prev => ({ ...prev, travel_options: { ...prev.travel_options, [key]: items } }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            let uploadedUrls: string[] = [];
            if (selectedFiles.length > 0) {
                const uploadFormData = new FormData();
                selectedFiles.forEach(file => uploadFormData.append("images", file));
                const { data } = await api.post("/admin/upload-images", uploadFormData, { headers: { "Content-Type": "multipart/form-data" } });
                if (data.success) uploadedUrls = data.urls;
            }

            const cleanedImages = formData.images.filter((img: string) => img.trim() !== "");
            const finalImages = [...cleanedImages, ...uploadedUrls];
            const { images: _img, creator: _c, created_at: _ca, id: _id, ...cleanFormData } = formData as any;

            const sanitizeDate = (d: string) => (!d || d.trim() === "" || isNaN(new Date(d).getTime())) ? null : d;

            const payload = {
                ...cleanFormData,
                cost: Number(formData.cost), price_child: Number(formData.price_child),
                discount: Number(formData.discount), max_members: Number(formData.max_members),
                advance_amount: Number(formData.advance_amount),
                start_date: sanitizeDate(formData.start_date),
                end_date: sanitizeDate(formData.end_date),
                advance_cutoff_date: sanitizeDate(formData.advance_cutoff_date),
                booking_start_date: sanitizeDate(formData.booking_start_date),
                booking_end_date: sanitizeDate(formData.booking_end_date),
                images: finalImages,
                highlights: JSON.stringify(formData.highlights),
                inclusions: JSON.stringify(formData.inclusions),
                exclusions: JSON.stringify(formData.exclusions),
                things_to_carry: JSON.stringify(formData.things_to_carry),
                activities: JSON.stringify(formData.activities),
                travel_options: JSON.stringify(formData.travel_options),
                itinerary: JSON.stringify(formData.itinerary)
            };

            const endpoint = type === "package" ? "packages" : "camps";
            if (initialData?.id) {
                await api.put(`/admin/${endpoint}/${initialData.id}`, payload);
                toast.success(`${type === "package" ? "Package" : "Camp"} updated successfully`);
            } else {
                await api.post(`/admin/${endpoint}`, payload);
                toast.success(`${type === "package" ? "Package" : "Camp"} created successfully`);
            }
            router.push("/");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to save. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const stepContent: Record<number, React.ReactNode> = {
        1: <Step1 formData={formData} setFormData={setFormData} handleFileSelect={handleFileSelect} filePreviews={filePreviews} removeFile={removeFile} fileInputRef={fileInputRef} />,
        2: <Step2 formData={formData} setFormData={setFormData} />,
        3: <Step3 formData={formData} setFormData={setFormData} handleCategoryUpdate={handleCategoryUpdate} />,
        4: <Step4 formData={formData} setFormData={setFormData} />
    };

    const isEditing = !!initialData?.id;

    return (
        <div className="min-h-screen bg-[#F4F6F8]">
            {/* Top Bar */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="h-9 w-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div className="flex items-center gap-2.5">
                            <div className={`h-8 w-8 rounded-xl ${accentBg} flex items-center justify-center`}>
                                {type === "package" ? <Package size={16} className="text-white" /> : <CampIcon size={16} className="text-white" />}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800 leading-none">
                                    {isEditing ? "Edit" : "Create"} {type === "package" ? "Package" : "Camp"}
                                </p>
                                <p className="text-[0.65rem] text-gray-400 mt-0.5">Step {step} of 4 — {STEPS[step - 1].description}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={step === 4 ? handleSubmit : () => setStep(s => Math.min(s + 1, 4))}
                        disabled={loading}
                        className={`h-9 px-5 rounded-xl text-sm font-semibold text-white ${accentBg} hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm`}
                    >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : step === 4 ? <Save size={14} /> : null}
                        {loading ? "Saving..." : step === 4 ? (isEditing ? "Update" : "Publish") : "Continue"}
                        {!loading && step < 4 && <ChevronRight size={14} />}
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex gap-8">
                {/* Sidebar Steps */}
                <aside className="hidden lg:flex flex-col gap-2 w-56 shrink-0">
                    <div className="sticky top-24 space-y-1.5">
                        <p className="text-[0.65rem] font-bold uppercase tracking-widest text-gray-400 px-3 mb-3">Progress</p>
                        {STEPS.map((s) => {
                            const isDone = step > s.id;
                            const isActive = step === s.id;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => setStep(s.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all ${isActive ? `${accentLight} ${accentText}` : isDone ? 'hover:bg-gray-100 text-gray-500' : 'text-gray-400 hover:bg-gray-50'}`}
                                >
                                    <div className={`h-8 w-8 shrink-0 rounded-xl flex items-center justify-center transition-all ${isActive ? `${accentBg} text-white shadow-sm` : isDone ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-100 text-gray-400'}`}>
                                        {isDone ? <CheckCircle2 size={14} /> : <s.icon size={14} />}
                                    </div>
                                    <div>
                                        <p className={`text-xs font-semibold ${isActive ? accentText : isDone ? 'text-gray-600' : 'text-gray-400'}`}>{s.label}</p>
                                        <p className="text-[0.6rem] text-gray-400 leading-none mt-0.5">{s.description}</p>
                                    </div>
                                </button>
                            );
                        })}

                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="px-3 space-y-1.5">
                                <div className="flex justify-between text-[0.65rem] text-gray-400">
                                    <span>Completion</span>
                                    <span className="font-semibold">{Math.round(((step - 1) / 4) * 100)}%</span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${accentBg} rounded-full transition-all duration-500`}
                                        style={{ width: `${((step - 1) / 4) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    {/* Mobile Step Pills */}
                    <div className="flex lg:hidden gap-2 mb-6 overflow-x-auto pb-1">
                        {STEPS.map((s) => {
                            const isDone = step > s.id;
                            const isActive = step === s.id;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => setStep(s.id)}
                                    className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${isActive ? `${accentBg} text-white shadow-sm` : isDone ? 'bg-emerald-50 text-emerald-600' : 'bg-white text-gray-400 border border-gray-200'}`}
                                >
                                    {isDone ? <CheckCircle2 size={12} /> : <s.icon size={12} />}
                                    {s.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className={`px-8 py-5 border-b border-gray-50 flex items-center gap-3`}>
                            <div className={`h-9 w-9 rounded-xl ${accentBg} flex items-center justify-center shadow-sm`}>
                                {React.createElement(STEPS[step - 1].icon, { size: 16, className: "text-white" })}
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-gray-800">{STEPS[step - 1].label}</h2>
                                <p className="text-xs text-gray-400">{STEPS[step - 1].description}</p>
                            </div>
                        </div>
                        <div className="p-6 md:p-8">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {stepContent[step]}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Bottom Navigation */}
                    <div className="flex items-center justify-between mt-6">
                        <button
                            onClick={() => setStep(s => Math.max(s - 1, 1))}
                            disabled={step === 1}
                            className="h-10 px-5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all flex items-center gap-2"
                        >
                            <ChevronLeft size={15} />
                            Back
                        </button>
                        <div className="flex items-center gap-1.5">
                            {STEPS.map(s => (
                                <div key={s.id} className={`h-1.5 rounded-full transition-all duration-300 ${step === s.id ? `w-6 ${accentBg}` : step > s.id ? 'w-3 bg-emerald-400' : 'w-3 bg-gray-200'}`} />
                            ))}
                        </div>
                        <button
                            onClick={step === 4 ? handleSubmit : () => setStep(s => Math.min(s + 1, 4))}
                            disabled={loading}
                            className={`h-10 px-5 rounded-xl text-sm font-semibold text-white ${accentBg} hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm`}
                        >
                            {loading && <Loader2 size={14} className="animate-spin" />}
                            {loading ? "Saving..." : step === 4 ? (isEditing ? "Update" : "Publish") : "Continue"}
                            {!loading && step < 4 && <ChevronRight size={15} />}
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}
