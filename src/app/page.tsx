"use client";

import React, { useState } from "react";
import {
  Users,
  Package,
  Map as CampIcon,
  MessageSquare,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  TrendingUp,
  Search,
  Bell,
  Menu,
  X,
  Compass
} from "lucide-react";

import UserManagement from "@/components/admin/UserManagement";
import PackageManagement from "@/components/admin/PackageManagement";
import CampManagement from "@/components/admin/CampManagement";
import PostManagement from "@/components/admin/PostManagement";
import ChatManagement from "@/components/admin/ChatManagement";
import TripManagement from "@/components/admin/TripManagement";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "users":
        return <UserManagement />;
      case "packages":
        return <PackageManagement />;
      case "camps":
        return <CampManagement />;
      case "trips":
        return <TripManagement />;
      case "posts":
        return <PostManagement />;
      case "chats":
        return <ChatManagement />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans relative">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-normal p-2 rounded-lg">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold text-gray-800 tracking-tight">Unzolo Admin</span>
          </div>
          <button
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem
            icon={LayoutDashboard}
            label="Dashboard"
            active={activeTab === "dashboard"}
            onClick={() => {
              setActiveTab("dashboard");
              setIsSidebarOpen(false);
            }}
          />
          <NavItem
            icon={Users}
            label="User Management"
            active={activeTab === "users"}
            onClick={() => {
              setActiveTab("users");
              setIsSidebarOpen(false);
            }}
          />
          <NavItem
            icon={TrendingUp}
            label="Post Moderation"
            active={activeTab === "posts"}
            onClick={() => {
              setActiveTab("posts");
              setIsSidebarOpen(false);
            }}
          />
          <NavItem
            icon={Package}
            label="Packages"
            active={activeTab === "packages"}
            onClick={() => {
              setActiveTab("packages");
              setIsSidebarOpen(false);
            }}
          />
          <NavItem
            icon={CampIcon}
            label="Camps"
            active={activeTab === "camps"}
            onClick={() => {
              setActiveTab("camps");
              setIsSidebarOpen(false);
            }}
          />
          <NavItem
            icon={Compass}
            label="Community Trips"
            active={activeTab === "trips"}
            onClick={() => {
              setActiveTab("trips");
              setIsSidebarOpen(false);
            }}
          />
          <NavItem
            icon={MessageSquare}
            label="User Chats"
            active={activeTab === "chats"}
            onClick={() => {
              setActiveTab("chats");
              setIsSidebarOpen(false);
            }}
          />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 gap-4">
          <div className="flex items-center gap-4 flex-1">
            <button
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="relative flex-1 max-w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-extralight" size={18} />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full bg-gray-50 border-none rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary-light transition-all text-sm shadow-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="h-10 w-10 rounded-full bg-primary-light flex items-center justify-center text-primary-normal font-bold">
              A
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 lg:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import api from "@/utils/axios";

function DashboardOverview() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const res = await api.get("/admin/stats");
      return res.data;
    }
  });

  const stats = [
    { label: "Total Users", value: statsData?.stats?.userCount?.toLocaleString() || "0", icon: Users, color: "text-blue-600" },
    { label: "Active Packages", value: statsData?.stats?.packageCount?.toLocaleString() || "0", icon: Package, color: "text-green-600" },
    { label: "Camps Hosted", value: statsData?.stats?.campCount?.toLocaleString() || "0", icon: CampIcon, color: "text-amber-600" },
    { label: "Total Trips", value: statsData?.stats?.tripCount?.toLocaleString() || "0", icon: Compass, color: "text-blue-500" },
    { label: "Total Posts", value: statsData?.stats?.postCount?.toLocaleString() || "0", icon: TrendingUp, color: "text-purple-600" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-normal"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 capitalize">Overview</h1>
          <p className="text-gray-500 text-xs sm:text-sm">Welcome back, here's what's happening today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 sm:p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} bg-opacity-10 p-2.5 sm:p-3 rounded-lg bg-current`}>
                <stat.icon size={20} className="sm:size-6" />
              </div>
              <span className="text-xs font-bold text-green-500">+Real-time</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">{stat.value}</h3>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-8 min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="bg-primary-light size-16 rounded-full flex items-center justify-center mx-auto">
            <TrendingUp className="text-primary-normal" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Growth Tracking</h2>
          <p className="text-gray-400 max-w-sm">Analytics and growth charts will be integrated in the next phase.</p>
        </div>
      </div>
    </>
  )
}

function NavItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-lg transition-all duration-200 ${active
        ? "bg-primary-normal text-white shadow-lg shadow-primary-light/50"
        : "text-gray-500 hover:bg-gray-50 hover:text-primary-normal"
        }`}
    >
      <Icon size={20} />
      <span className="font-semibold text-sm">{label}</span>
    </button>
  );
}
