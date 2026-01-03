"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { UserCheck, CreditCard, UserPlus, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  {
    type: "check_in",
    message: "John Doe checked in",
    time: "2 mins ago",
    icon: UserCheck,
  },
  {
    type: "payment",
    message: "₹5,000 payment from Jane Smith",
    time: "15 mins ago",
    icon: CreditCard,
  },
  {
    type: "new_member",
    message: "New member: Mike Johnson",
    time: "32 mins ago",
    icon: UserPlus,
  },
  {
    type: "booking",
    message: "Sarah booked Yoga class",
    time: "45 mins ago",
    icon: Calendar,
  },
  {
    type: "check_in",
    message: "Emily Davis checked in",
    time: "1 hour ago",
    icon: UserCheck,
  },
  {
    type: "payment",
    message: "₹12,000 payment from Alex Wilson",
    time: "2 hours ago",
    icon: CreditCard,
  },
];

const typeColors = {
  check_in: "bg-[#1db954] text-black",
  payment: "bg-[#f59e0b] text-black",
  new_member: "bg-[#3b82f6] text-white",
  booking: "bg-[#a855f7] text-white",
};

export function RecentActivity() {
  return (
    <div className="rounded-lg bg-[#181818] p-4">
      <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
      <ScrollArea className="h-[280px]">
        <div className="space-y-1">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-md p-3 transition-all duration-200 hover:bg-[#282828] cursor-pointer group"
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-105",
                  typeColors[activity.type as keyof typeof typeColors]
                )}
              >
                <activity.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {activity.message}
                </p>
                <p className="text-xs text-[#b3b3b3]">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
