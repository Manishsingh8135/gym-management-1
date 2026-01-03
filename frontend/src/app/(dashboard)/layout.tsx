"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-black">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px] p-0 bg-black border-none">
          <Sidebar className="relative w-full" />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-[280px] flex flex-col min-h-screen p-2 pl-0 lg:pl-0">
        <div className="flex-1 rounded-lg bg-gradient-to-b from-[#1f1f1f] to-[#121212] overflow-hidden flex flex-col">
          {/* Header with gradient background */}
          <div className="spotify-gradient">
            <Header onMenuClick={() => setMobileMenuOpen(true)} />
          </div>
          
          {/* Scrollable Content */}
          <ScrollArea className="flex-1">
            <main className="p-4 md:p-6">{children}</main>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
