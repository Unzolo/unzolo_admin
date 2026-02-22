"use client";

import TripWizard from "@/components/admin/TripWizard";
import { useQuery } from "@tanstack/react-query";
import api from "@/utils/axios";
import { useParams } from "next/navigation";

export default function EditCampPage() {
    const { id } = useParams();

    const { data: camp, isLoading } = useQuery({
        queryKey: ["camp", id],
        queryFn: async () => {
            const { data } = await api.get(`/admin/camps`);
            const item = data.camps.find((c: any) => c.id === Number(id));
            return item;
        }
    });

    if (isLoading) return <div className="p-20 text-center">Loading Camp...</div>;
    if (!camp) return <div className="p-20 text-center text-red-500">Camp not found</div>;

    return <TripWizard type="camp" initialData={camp} />;
}
