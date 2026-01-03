"use client";

import { Bell, Search, Menu, ChevronLeft, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 bg-transparent px-4 md:px-6">
      {/* Left side - Navigation and Search */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full bg-[#000000]/70 text-white hover:bg-[#000000] transition-colors"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Navigation arrows */}
        <div className="hidden md:flex items-center gap-2">
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#000000]/70 text-white hover:bg-[#000000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#000000]/70 text-white hover:bg-[#000000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Search bar - Spotify style */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#121212]" />
          <input
            type="search"
            placeholder="What do you want to manage?"
            className="h-10 w-[300px] lg:w-[400px] rounded-full bg-white pl-10 pr-4 text-sm text-[#121212] placeholder:text-[#757575] focus:outline-none focus:ring-2 focus:ring-white"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#000000]/70 text-white hover:bg-[#000000] hover:scale-105 transition-all">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#1db954] text-[10px] font-bold text-black">
                3
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-[#282828] border-[#404040] text-white">
            <DropdownMenuLabel className="text-white">Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#404040]" />
            <div className="max-h-[300px] overflow-auto">
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 text-white hover:bg-[#3e3e3e] focus:bg-[#3e3e3e] cursor-pointer">
                <p className="text-sm font-medium">New member registered</p>
                <p className="text-xs text-[#b3b3b3]">
                  John Doe just joined the gym
                </p>
                <p className="text-xs text-[#b3b3b3]">2 minutes ago</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 text-white hover:bg-[#3e3e3e] focus:bg-[#3e3e3e] cursor-pointer">
                <p className="text-sm font-medium">Payment received</p>
                <p className="text-xs text-[#b3b3b3]">
                  ₹5,000 payment from Jane Smith
                </p>
                <p className="text-xs text-[#b3b3b3]">15 minutes ago</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 text-white hover:bg-[#3e3e3e] focus:bg-[#3e3e3e] cursor-pointer">
                <p className="text-sm font-medium">Membership expiring</p>
                <p className="text-xs text-[#b3b3b3]">
                  5 memberships expiring this week
                </p>
                <p className="text-xs text-[#b3b3b3]">1 hour ago</p>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator className="bg-[#404040]" />
            <DropdownMenuItem className="justify-center text-[#1db954] hover:bg-[#3e3e3e] focus:bg-[#3e3e3e] cursor-pointer font-medium">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-8 items-center gap-2 rounded-full bg-[#000000]/70 pl-0.5 pr-2 hover:bg-[#000000] transition-all group">
              <Avatar className="h-7 w-7">
                <AvatarImage src="/avatars/admin.png" alt="Admin" />
                <AvatarFallback className="bg-[#1db954] text-black text-xs font-bold">
                  AD
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-bold text-white hidden sm:inline">Admin</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[#282828] border-[#404040] text-white">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-[#b3b3b3]">
                  admin@jerai.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#404040]" />
            <DropdownMenuItem className="text-white hover:bg-[#3e3e3e] focus:bg-[#3e3e3e] cursor-pointer">Profile</DropdownMenuItem>
            <DropdownMenuItem className="text-white hover:bg-[#3e3e3e] focus:bg-[#3e3e3e] cursor-pointer">Settings</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#404040]" />
            <DropdownMenuItem className="text-[#e91429] hover:bg-[#3e3e3e] focus:bg-[#3e3e3e] cursor-pointer">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
