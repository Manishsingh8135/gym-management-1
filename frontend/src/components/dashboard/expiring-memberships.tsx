"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, RefreshCw, ChevronRight } from "lucide-react";
import Link from "next/link";

const expiringMembers = [
  {
    id: "1",
    name: "John Doe",
    memberId: "GYM001",
    plan: "Premium",
    expiryDate: "Jan 5, 2026",
    daysLeft: 2,
    phone: "9876543210",
    avatar: null,
  },
  {
    id: "2",
    name: "Jane Smith",
    memberId: "GYM002",
    plan: "Basic",
    expiryDate: "Jan 6, 2026",
    daysLeft: 3,
    phone: "9876543211",
    avatar: null,
  },
  {
    id: "3",
    name: "Mike Johnson",
    memberId: "GYM003",
    plan: "Premium",
    expiryDate: "Jan 7, 2026",
    daysLeft: 4,
    phone: "9876543212",
    avatar: null,
  },
  {
    id: "4",
    name: "Sarah Wilson",
    memberId: "GYM004",
    plan: "VIP",
    expiryDate: "Jan 8, 2026",
    daysLeft: 5,
    phone: "9876543213",
    avatar: null,
  },
];

const planColors: Record<string, string> = {
  Basic: "bg-[#282828] text-white",
  Premium: "bg-[#1db954] text-black",
  VIP: "bg-[#f59e0b] text-black",
};

export function ExpiringMemberships() {
  return (
    <div className="rounded-lg bg-[#181818] p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">Expiring Memberships</h3>
          <p className="text-sm text-[#b3b3b3]">
            Members expiring in the next 7 days
          </p>
        </div>
        <Link 
          href="/memberships?filter=expiring"
          className="flex items-center gap-1 text-sm font-bold text-[#b3b3b3] hover:text-white transition-colors"
        >
          View All
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      
      <div className="space-y-2">
        {expiringMembers.map((member) => (
          <div
            key={member.id}
            className="group flex items-center gap-4 rounded-md p-3 transition-all duration-200 hover:bg-[#282828] cursor-pointer"
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.avatar || ""} />
              <AvatarFallback className="bg-[#535353] text-white text-sm font-bold">
                {member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white truncate">{member.name}</p>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${planColors[member.plan] || planColors.Basic}`}>
                  {member.plan}
                </span>
              </div>
              <p className="text-xs text-[#b3b3b3] mt-0.5">
                {member.memberId} • Expires {member.expiryDate}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-[#e91429] text-white">
                {member.daysLeft}d left
              </span>
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#282828] text-[#b3b3b3] hover:text-white hover:bg-[#3e3e3e] transition-colors opacity-0 group-hover:opacity-100">
                <Phone className="h-4 w-4" />
              </button>
              <button className="flex h-8 items-center gap-1.5 px-3 rounded-full bg-[#1db954] text-black text-xs font-bold hover:bg-[#1ed760] hover:scale-105 transition-all opacity-0 group-hover:opacity-100">
                <RefreshCw className="h-3 w-3" />
                Renew
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
