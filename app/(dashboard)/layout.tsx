"use client";

import type React from "react";
import { Sidebar } from "@/components/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Search } from "@/components/search";
import { Suspense } from "react";
import { NotificationBell } from "@/components/notification-bell";
import { UserProfile } from "@/components/user-profile";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar component */}
      <Sidebar />

      {/* Main content area with responsive padding to account for sidebar */}
      <div className="lg:pl-64 xl:pl-72 min-h-screen flex flex-col">
        {/* Header - fixed position with responsive width */}
        <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            {/* Left section - Search */}
            <div className="flex-1 pl-10 lg:max-w-sm">
              <Suspense
                fallback={
                  <div className="w-full h-9 bg-muted/30 rounded-md animate-pulse" />
                }
              >
                <Search />
              </Suspense>
            </div>

            {/* Right section - various controls */}
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <ModeToggle />
              <NotificationBell />
              <UserProfile />
            </div>
          </div>
        </header>

        {/* Main content with padding */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
