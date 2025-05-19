"use client";
import type React from "react";
import { Sidebar } from "@/components/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { NotificationBell } from "@/components/notification-bell";
import { UserProfile } from "@/components/user-profile";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // This is a workaround for a known issue with the `use client` directive
    // in Next.js. It ensures that the component is only rendered on the client side.
    if (typeof window !== "undefined") {
      if (!localStorage.getItem("mlm_user")) {
        useRouter().push("/login");
      }
    }
  }, []);
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar component */}
      <Sidebar />

      {/* Main content area with responsive padding to account for sidebar */}
      <div className="lg:pl-64 xl:pl-72 min-h-screen flex flex-col">
        {/* Header - fixed position with responsive width */}
        <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-end px-4 sm:px-6">
            {/* Right section - various controls */}
            <LanguageSwitcher />
            <ModeToggle />
            <NotificationBell />
            <UserProfile />
          </div>
        </header>

        {/* Main content with padding */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
