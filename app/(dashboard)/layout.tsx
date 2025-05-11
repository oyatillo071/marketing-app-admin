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
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center px-4 border-b border-border">
          <div className="flex-1"></div>
          <div className="flex items-center space-x-4">
            <Suspense>
              <Search />
            </Suspense>
            <ModeToggle />
            <LanguageSwitcher />
            <NotificationBell />
            <UserProfile />
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-background">
          <Suspense>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}
