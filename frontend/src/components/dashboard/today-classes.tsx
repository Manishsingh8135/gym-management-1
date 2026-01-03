"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Users, Play } from "lucide-react";
import Link from "next/link";

const classes = [
  {
    id: 1,
    name: "Morning Yoga",
    time: "6:00 AM",
    instructor: "Sarah",
    booked: 12,
    capacity: 20,
    status: "ongoing",
  },
  {
    id: 2,
    name: "HIIT Blast",
    time: "7:00 AM",
    instructor: "Mike",
    booked: 18,
    capacity: 25,
    status: "upcoming",
  },
  {
    id: 3,
    name: "Zumba",
    time: "9:00 AM",
    instructor: "Lisa",
    booked: 25,
    capacity: 30,
    status: "upcoming",
  },
  {
    id: 4,
    name: "Spinning",
    time: "5:00 PM",
    instructor: "John",
    booked: 20,
    capacity: 20,
    status: "full",
  },
  {
    id: 5,
    name: "CrossFit",
    time: "6:00 PM",
    instructor: "Alex",
    booked: 12,
    capacity: 15,
    status: "upcoming",
  },
];

const statusColors = {
  ongoing: "bg-[#1db954] text-black",
  upcoming: "bg-[#282828] text-[#b3b3b3]",
  full: "bg-[#e91429] text-white",
};

export function TodayClasses() {
  return (
    <div className="rounded-lg bg-[#181818] p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Today&apos;s Classes</h3>
        <Link
          href="/classes"
          className="text-sm font-bold text-[#b3b3b3] hover:text-white transition-colors"
        >
          View all
        </Link>
      </div>
      <ScrollArea className="h-[280px]">
        <div className="space-y-1">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="group flex items-center gap-3 rounded-md p-3 transition-all duration-200 hover:bg-[#282828] cursor-pointer"
            >
              {/* Class time indicator */}
              <div className="relative flex h-12 w-12 items-center justify-center rounded-md bg-[#282828] group-hover:bg-[#3e3e3e] transition-colors">
                <span className="text-xs font-bold text-white">{cls.time.split(' ')[0]}</span>
                <span className="absolute -bottom-0.5 text-[8px] text-[#b3b3b3]">{cls.time.split(' ')[1]}</span>
                {/* Play button on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-[#1db954] rounded-md">
                  <Play className="h-5 w-5 text-black fill-black ml-0.5" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white truncate">{cls.name}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColors[cls.status as keyof typeof statusColors]}`}>
                    {cls.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#b3b3b3] mt-1">
                  <span>{cls.instructor}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {cls.booked}/{cls.capacity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
