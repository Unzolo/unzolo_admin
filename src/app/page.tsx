"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Package, Map as CampIcon, MessageSquare, LayoutDashboard,
  LogOut, ShieldCheck, TrendingUp, Search, Bell, Menu, X, Compass,
  ChevronRight
} from "lucide-react";
import UserManagement from "@/components/admin/UserManagement";
import PackageManagement from "@/components/admin/PackageManagement";
import CampManagement from "@/components/admin/CampManagement";
import PostManagement from "@/components/admin/PostManagement";
import ChatManagement from "@/components/admin/ChatManagement";
import TripManagement from "@/components/admin/TripManagement";
import { useQuery } from "@tanstack/react-query";
import api from "@/utils/axios";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: null },
  { id: "users", label: "Users", icon: Users, badge: null },
  { id: "packages", label: "Packages", icon: Package, badge: null },
  { id: "camps", label: "Camps", icon: CampIcon, badge: null },
  { id: "trips", label: "Community Trips", icon: Compass, badge: null },
  { id: "posts", label: "Post Moderation", icon: TrendingUp, badge: null },
  { id: "chats", label: "User Chats", icon: MessageSquare, badge: null },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const activeNav = NAV.find(n => n.id === activeTab);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardOverview onNavigate={setActiveTab} />;
      case "users": return <UserManagement />;
      case "packages": return <PackageManagement />;
      case "camps": return <CampManagement />;
      case "trips": return <TripManagement />;
      case "posts": return <PostManagement />;
      case "chats": return <ChatManagement />;
      default: return <DashboardOverview onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F4F6F8] font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-primary-normal flex items-center justify-center">
              <ShieldCheck size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-800 tracking-tight">Unzolo Admin</span>
          </div>
          <button className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-50" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[0.6rem] font-bold uppercase tracking-widest text-gray-300 px-3 mb-3">Menu</p>
          {NAV.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${isActive
                  ? "bg-primary-normal text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  }`}
              >
                <item.icon size={17} />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && <ChevronRight size={13} className="opacity-70" />}
              </button>
            );
          })}
        </nav>

        {/* Admin badge + logout */}
        <div className="p-4 border-t border-gray-50 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50">
            <div className="h-8 w-8 rounded-xl bg-primary-light flex items-center justify-center text-primary-normal font-bold text-sm shrink-0">A</div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-700 truncate">Super Admin</p>
              <p className="text-[0.6rem] text-gray-400">full access</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-xl text-sm font-semibold transition-all">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Nav */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 lg:px-8 gap-4 flex-shrink-0">
          <button className="lg:hidden p-2 rounded-xl text-gray-400 hover:bg-gray-50" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[0.6rem] font-bold uppercase tracking-widest text-gray-300">Portal</span>
            <span className="text-gray-200">/</span>
            <span className="text-xs font-semibold text-gray-600">{activeNav?.label}</span>
          </div>
          <div className="flex-1" />
          <div className="relative w-52 hidden md:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input placeholder="Search..." className="w-full h-9 bg-gray-50 rounded-xl pl-9 pr-4 text-sm border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-normal/20 focus:border-primary-normal transition-all placeholder:text-gray-300" />
          </div>
          <button className="relative p-2 rounded-xl hover:bg-gray-50 transition-all text-gray-400">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Dashboard Overview ───────────────────────────────────────────────────────

function DashboardOverview({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => { const res = await api.get("/admin/stats"); return res.data; }
  });

  const stats = [
    { label: "Total Users", value: statsData?.stats?.userCount ?? 0, icon: Users, from: "from-blue-500", to: "to-blue-600", light: "bg-blue-50", text: "text-blue-600", tab: "users" },
    { label: "Active Packages", value: statsData?.stats?.packageCount ?? 0, icon: Package, from: "from-emerald-500", to: "to-emerald-600", light: "bg-emerald-50", text: "text-emerald-600", tab: "packages" },
    { label: "Camps Hosted", value: statsData?.stats?.campCount ?? 0, icon: CampIcon, from: "from-amber-500", to: "to-amber-600", light: "bg-amber-50", text: "text-amber-600", tab: "camps" },
    { label: "Community Trips", value: statsData?.stats?.tripCount ?? 0, icon: Compass, from: "from-purple-500", to: "to-purple-600", light: "bg-purple-50", text: "text-purple-600", tab: "trips" },
    { label: "Total Posts", value: statsData?.stats?.postCount ?? 0, icon: TrendingUp, from: "from-pink-500", to: "to-pink-600", light: "bg-pink-50", text: "text-pink-600", tab: "posts" },
  ];

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="space-y-3 text-center">
        <div className="h-12 w-12 rounded-2xl bg-primary-light mx-auto flex items-center justify-center">
          <div className="h-5 w-5 rounded-full border-2 border-primary-normal border-t-transparent animate-spin" />
        </div>
        <p className="text-xs text-gray-400 font-semibold">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-400 mt-1">Welcome back — here's what's happening today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <button
            key={i}
            onClick={() => onNavigate(stat.tab)}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group text-left w-full cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`h-10 w-10 rounded-xl ${stat.light} flex items-center justify-center`}>
                <stat.icon size={18} className={stat.text} />
              </div>
              <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all mt-1" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1 font-medium">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Placeholder chart */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 min-h-[320px] flex flex-col items-center justify-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-primary-light flex items-center justify-center">
          <TrendingUp size={28} className="text-primary-normal" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-800">Analytics Coming Soon</h2>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">Growth charts and detailed analytics will be integrated in the next phase.</p>
        </div>
      </div>
    </div>
  );
}
