"use client";

import { useState } from "react";
import api from "@/utils/axios";

export default function DebugPage() {
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const testProxy = async () => {
        setLoading(true);
        setResult(null);
        setError(null);
        try {
            console.log("Calling api.get('/admin/stats')...");
            const res = await api.get("/admin/stats");
            setResult(res.data);
        } catch (err: any) {
            console.error("Debug Error:", err);
            setError({
                status: err.response?.status,
                data: err.response?.data,
                message: err.message,
                url: err.config?.url,
                baseURL: err.config?.baseURL
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-10 space-y-5">
            <h1 className="text-2xl font-bold">API Proxy Debug</h1>
            <button
                onClick={testProxy}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
                {loading ? "Testing..." : "Test /admin/stats via Proxy"}
            </button>

            {error && (
                <div className="p-4 bg-red-100 border border-red-500 rounded text-red-700">
                    <p className="font-bold">Error {error.status}</p>
                    <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(error, null, 2)}</pre>
                </div>
            )}

            {result && (
                <div className="p-4 bg-green-100 border border-green-500 rounded text-green-700">
                    <p className="font-bold">Success!</p>
                    <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}
