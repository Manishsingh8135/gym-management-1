"use client";

import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserCheck, CreditCard, UserPlus, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { dashboardApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  type: "check_in" | "payment" | "new_member" | "booking";
  message: string;
  timestamp: string;
}

const typeColors = {
  check_in: "bg-[#1db954] text-black",
  payment: "bg-[#f59e0b] text-black",
  new_member: "bg-[#3b82f6] text-white",
  booking: "bg-[#a855f7] text-white",
};

const typeIcons = {
  check_in: UserCheck,
  payment: CreditCard,
  new_member: UserPlus,
  booking: Calendar,
};

export function RecentActivity() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: async () => {
      const response = await dashboardApi.getRecentActivity();
      return response.data.data as Activity[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="rounded-lg bg-[#181818] p-4">
        <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <Skeleton className="h-10 w-10 rounded-full bg-[#282828]" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2 bg-[#282828]" />
                <Skeleton className="h-3 w-1/4 bg-[#282828]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const displayActivities = activities || [];

  return (
    <div className="rounded-lg bg-[#181818] p-4">
      <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
      <ScrollArea className="h-[280px]">
        <div className="space-y-1">
          {displayActivities.length === 0 ? (
            <p className="text-sm text-[#b3b3b3] text-center py-4">No recent activity</p>
          ) : (
            displayActivities.map((activity, index) => {
              const IconComponent = typeIcons[activity.type] || UserCheck;
              const timeAgo = formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true });
              
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-md p-3 transition-all duration-200 hover:bg-[#282828] cursor-pointer group"
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-105",
                      typeColors[activity.type] || typeColors.check_in
                    )}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {activity.message}
                    </p>
                    <p className="text-xs text-[#b3b3b3]">{timeAgo}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
