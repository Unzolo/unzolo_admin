"use client";

import React, { useState, useEffect } from "react";
import { Globe, RefreshCcw, Server } from "lucide-react";
import { toast } from "sonner";

const STAGING_URL = "https://staging.unzolo.com/api";
const PROD_URL = "https://api.unzolo.com/api";

const GlobalEnvSwitch = () => {
    const [currentEnv, setCurrentEnv] = useState<string>("");
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('unzolo_api_override');
        if (saved === PROD_URL) setCurrentEnv("production");
        else if (saved === STAGING_URL) setCurrentEnv("staging");
        else setCurrentEnv("default");

        // Brief animation entry
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleSwitchEnv = (env: string) => {
        const url = env === "production" ? PROD_URL : STAGING_URL;
        localStorage.setItem('unzolo_api_override', url);
        toast.info(`Environment switching to ${env.toUpperCase()}...`, {
            description: "Refreshing application state",
        });
        setTimeout(() => window.location.reload(), 800);
    };

    const resetEnv = () => {
        localStorage.removeItem('unzolo_api_override');
        toast.success("Reset to default configuration. Reloading...");
        setTimeout(() => window.location.reload(), 800);
    };

    if (!isVisible) return null;

    return (
        <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-2xl border border-gray-100 shadow-inner scale-95 origin-right transition-all">
            <div className="flex items-center gap-1.5 px-2">
                <div className={`h-1.5 w-1.5 rounded-full ${currentEnv === "production" ? "bg-emerald-500 animate-pulse" : currentEnv === "staging" ? "bg-primary-normal animate-pulse" : "bg-gray-300"}`} />
                <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-tighter">
                    {currentEnv === "default" ? "Standard" : currentEnv}
                </span>
            </div>

            <div className="h-4 w-px bg-gray-200 mx-1" />

            <button
                onClick={() => handleSwitchEnv("staging")}
                className={`px-3 py-1.5 rounded-xl text-[0.65rem] font-black transition-all ${currentEnv === "staging" ? "bg-white text-primary-normal shadow-sm ring-1 ring-primary-normal/10" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
            >
                STAGING
            </button>
            <button
                onClick={() => handleSwitchEnv("production")}
                className={`px-3 py-1.5 rounded-xl text-[0.65rem] font-black transition-all ${currentEnv === "production" ? "bg-emerald-500 text-white shadow-md shadow-emerald-100" : "text-gray-400 hover:text-emerald-500 hover:bg-emerald-50"}`}
            >
                PROD
            </button>

            {currentEnv !== "default" && (
                <button
                    onClick={resetEnv}
                    className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition-all"
                    title="Reset to .env"
                >
                    <RefreshCcw size={12} />
                </button>
            )}
        </div>
    );
};

export default GlobalEnvSwitch;
