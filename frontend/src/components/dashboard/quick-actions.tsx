"use client";

import { UserPlus, CreditCard, ScanLine, CalendarPlus, Megaphone, Play } from "lucide-react";
import Link from "next/link";

const actions = [
  {
    title: "New Member",
    description: "Register a new gym member",
    icon: UserPlus,
    href: "/members/new",
    primary: true,
  },
  {
    title: "Collect Payment",
    description: "Record a payment",
    icon: CreditCard,
    href: "/payments/collect",
    primary: false,
  },
  {
    title: "Quick Check-in",
    description: "Scan member entry",
    icon: ScanLine,
    href: "/attendance/check-in",
    primary: false,
  },
  {
    title: "Book Class",
    description: "Schedule a class booking",
    icon: CalendarPlus,
    href: "/classes/book",
    primary: false,
  },
  {
    title: "Announcement",
    description: "Send to all members",
    icon: Megaphone,
    href: "/announcements/new",
    primary: false,
  },
];

export function QuickActions() {
  return (
    <div className="rounded-lg bg-[#181818] p-4">
      <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
      <div className="space-y-2">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="group flex items-center gap-3 rounded-md p-3 transition-all duration-200 hover:bg-[#282828]"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-md transition-colors ${
              action.primary ? "bg-[#1db954]" : "bg-[#282828] group-hover:bg-[#3e3e3e]"
            }`}>
              <action.icon className={`h-5 w-5 ${action.primary ? "text-black" : "text-white"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{action.title}</p>
              <p className="text-xs text-[#b3b3b3] truncate">{action.description}</p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1db954] shadow-lg">
                <Play className="h-4 w-4 text-black fill-black ml-0.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
