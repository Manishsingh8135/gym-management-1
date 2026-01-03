"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, UserCheck, IndianRupee, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { dashboardApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  todayCheckIns: number;
  expiringThisWeek: number;
  todayRevenue: number;
  newMembersThisMonth: number;
}

export function StatsCards() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await dashboardApi.getStats();
      return response.data.data as DashboardStats;
    },
  });

  const stats = [
    {
      title: "Total Members",
      value: data?.totalMembers?.toLocaleString() || "0",
      change: `+${data?.newMembersThisMonth || 0} this month`,
      changeType: "positive" as const,
      icon: Users,
      description: `${data?.activeMembers || 0} active`,
      color: "#1db954",
    },
    {
      title: "Today's Check-ins",
      value: data?.todayCheckIns?.toString() || "0",
      change: "Today",
      changeType: "positive" as const,
      icon: UserCheck,
      description: "gym visits",
      color: "#1ed760",
    },
    {
      title: "Today's Revenue",
      value: `₹${(data?.todayRevenue || 0).toLocaleString()}`,
      change: "Collected today",
      changeType: "positive" as const,
      icon: IndianRupee,
      description: "payments received",
      color: "#f59e0b",
    },
    {
      title: "Expiring Soon",
      value: data?.expiringThisWeek?.toString() || "0",
      change: "Action needed",
      changeType: (data?.expiringThisWeek || 0) > 0 ? "negative" as const : "positive" as const,
      icon: AlertCircle,
      description: "next 7 days",
      color: "#e91429",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg bg-[#181818] p-5">
            <Skeleton className="h-4 w-24 mb-2 bg-[#282828]" />
            <Skeleton className="h-8 w-16 mb-4 bg-[#282828]" />
            <Skeleton className="h-3 w-32 bg-[#282828]" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-[#181818] p-5 text-center text-red-400">
        Failed to load dashboard stats
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="group relative overflow-hidden rounded-lg bg-[#181818] p-5 transition-all duration-300 hover:bg-[#282828] cursor-pointer"
        >
          {/* Gradient overlay on hover */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
            style={{ background: `linear-gradient(135deg, ${stat.color} 0%, transparent 100%)` }}
          />
          
          <div className="relative flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#b3b3b3]">
                {stat.title}
              </p>
              <p className="text-3xl font-bold tracking-tight text-white">{stat.value}</p>
            </div>
            <div 
              className="flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110"
              style={{ backgroundColor: `${stat.color}20` }}
            >
              <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
            </div>
          </div>
          
          <div className="relative mt-4 flex items-center gap-2">
            <span
              className={cn(
                "flex items-center gap-1 font-bold text-xs",
                stat.changeType === "positive" ? "text-[#1db954]" : "text-[#e91429]"
              )}
            >
              {stat.changeType === "positive" ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {stat.change}
            </span>
            <span className="text-[#b3b3b3] text-xs">{stat.description}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
