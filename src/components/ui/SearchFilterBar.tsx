"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, SlidersHorizontal, ChevronDown, X, ArrowUpDown } from "lucide-react";

export interface FilterOption {
    label: string;
    value: string;
}

export interface SortOption {
    label: string;
    value: string;
}

interface SearchFilterBarProps {
    search: string;
    onSearchChange: (v: string) => void;
    placeholder?: string;
    // filter
    filters?: FilterOption[];
    activeFilter?: string;
    onFilterChange?: (v: string) => void;
    filterLabel?: string;
    // sort
    sortOptions?: SortOption[];
    activeSort?: string;
    onSortChange?: (v: string) => void;
    // result count
    total?: number;
    filtered?: number;
}

export default function SearchFilterBar({
    search,
    onSearchChange,
    placeholder = "Search...",
    filters,
    activeFilter = "all",
    onFilterChange,
    filterLabel = "Filter",
    sortOptions,
    activeSort,
    onSortChange,
    total,
    filtered,
}: SearchFilterBarProps) {
    const [sortOpen, setSortOpen] = useState(false);
    const sortRef = useRef<HTMLDivElement>(null);

    // Close sort dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
                setSortOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const activeSortLabel = sortOptions?.find(s => s.value === activeSort)?.label;

    return (
        <div className="space-y-3">
            {/* Row 1 — Search + Sort */}
            <div className="flex gap-2">
                {/* Search */}
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                    <input
                        value={search}
                        onChange={e => onSearchChange(e.target.value)}
                        placeholder={placeholder}
                        className="w-full h-10 bg-white border border-gray-100 rounded-xl pl-9 pr-9 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-normal/20 focus:border-primary-normal/40 shadow-sm transition-all"
                    />
                    {search && (
                        <button
                            onClick={() => onSearchChange("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Sort dropdown */}
                {sortOptions && sortOptions.length > 0 && (
                    <div className="relative" ref={sortRef}>
                        <button
                            onClick={() => setSortOpen(o => !o)}
                            className="flex items-center gap-2 h-10 px-4 bg-white border border-gray-100 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 shadow-sm transition-all whitespace-nowrap"
                        >
                            <ArrowUpDown size={13} />
                            <span className="hidden sm:inline">{activeSortLabel || "Sort"}</span>
                            <ChevronDown size={12} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
                        </button>
                        {sortOpen && (
                            <div className="absolute right-0 top-12 z-30 bg-white rounded-2xl border border-gray-100 shadow-xl py-1.5 min-w-[160px]">
                                {sortOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => { onSortChange?.(opt.value); setSortOpen(false); }}
                                        className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${activeSort === opt.value
                                            ? "text-primary-normal bg-primary-light"
                                            : "text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Row 2 — Filter pills + result count */}
            {(filters || total !== undefined) && (
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    {/* Filter pills */}
                    {filters && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <SlidersHorizontal size={12} className="text-gray-300 shrink-0" />
                            {filters.map(f => (
                                <button
                                    key={f.value}
                                    onClick={() => onFilterChange?.(f.value)}
                                    className={`h-7 px-3 rounded-full text-xs font-semibold transition-all ${activeFilter === f.value
                                        ? "bg-primary-normal text-white shadow-sm"
                                        : "bg-white border border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50"
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Result count */}
                    {total !== undefined && (
                        <p className="text-xs text-gray-400 ml-auto whitespace-nowrap">
                            {filtered !== undefined && filtered !== total
                                ? <><span className="font-semibold text-gray-600">{filtered}</span> of {total}</>
                                : <><span className="font-semibold text-gray-600">{total}</span> results</>
                            }
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
