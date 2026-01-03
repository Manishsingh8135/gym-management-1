"use client";

import { Users, UserCheck, IndianRupee, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  {
    title: "Total Members",
    value: "1,284",
    change: "+12%",
    changeType: "positive" as const,
    icon: Users,
    description: "from last month",
    color: "#1db954",
  },
  {
    title: "Today's Check-ins",
    value: "127",
    change: "+8%",
    changeType: "positive" as const,
    icon: UserCheck,
    description: "vs yesterday",
    color: "#1ed760",
  },
  {
    title: "Monthly Revenue",
    value: "₹4,52,000",
    change: "+23%",
    changeType: "positive" as const,
    icon: IndianRupee,
    description: "from last month",
    color: "#f59e0b",
  },
  {
    title: "Expiring Soon",
    value: "18",
    change: "-5%",
    changeType: "negative" as const,
    icon: AlertCircle,
    description: "next 7 days",
    color: "#e91429",
  },
];

export function StatsCards() {
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
