"use client";

import TripWizard from "@/components/admin/TripWizard";
import { useQuery } from "@tanstack/react-query";
import api from "@/utils/axios";
import { useParams } from "next/navigation";

export default function EditPackagePage() {
    const { id } = useParams();

    const { data: pkg, isLoading } = useQuery({
        queryKey: ["package", id],
        queryFn: async () => {
            const { data } = await api.get(`/admin/packages`);
            // The API returns all packages, normally we'd have a single package endpoint
            // but let's see if there's one. If not, we find it in the list.
            const item = data.packages.find((p: any) => p.id === Number(id));
            return item;
        }
    });

    if (isLoading) return <div className="p-20 text-center">Loading Package...</div>;
    if (!pkg) return <div className="p-20 text-center text-red-500">Package not found</div>;

    return <TripWizard type="package" initialData={pkg} />;
}
