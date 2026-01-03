"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AuthGuard } from "@/components/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AuthGuard>
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
          {/* Scrollable Container */}
          <div className="flex-1 overflow-y-auto">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 spotify-gradient backdrop-blur-md bg-[#1f1f1f]/80">
              <Header onMenuClick={() => setMobileMenuOpen(true)} />
            </div>
            
            {/* Main Content */}
            <main className="p-4 md:p-6">{children}</main>
          </div>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}
