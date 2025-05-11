"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Users,
  Wallet,
  UserCircle,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, memo } from "react";
import { useRouter } from "next/navigation";

// Memo-ized sidebar link component to prevent unnecessary re-renders
const SidebarLink = memo(
  ({
    item,
    pathname,
    onLinkClick,
  }: {
    item: { title: string; href: string; icon: any };
    pathname: string;
    onLinkClick: () => void;
  }) => {
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        onClick={onLinkClick}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          pathname === item.href
            ? "bg-secondary-bg text-white"
            : "text-muted-foreground hover:bg-secondary-bg hover:text-white"
        )}
      >
        <Icon className="h-5 w-5" />
        <span>{item.title}</span>
      </Link>
    );
  }
);

// Add display name to avoid warnings
SidebarLink.displayName = "SidebarLink";

// Memo-ized logout button component
const LogoutButton = memo(
  ({ onClick, logoutText }: { onClick: () => void; logoutText: string }) => {
    return (
      <Button
        variant="ghost"
        className="w-full flex items-center justify-start gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary-bg hover:text-white transition-colors"
        onClick={onClick}
      >
        <LogOut className="h-5 w-5" />
        <span>{logoutText}</span>
      </Button>
    );
  }
);

LogoutButton.displayName = "LogoutButton";

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const router = useRouter();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebarItems = [
    {
      title: t("dashboard"),
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: t("users"),
      href: "/dashboard/users",
      icon: Users,
    },
    {
      title: t("payments"),
      href: "/dashboard/payments",
      icon: CreditCard,
    },
    {
      title: t("withdrawals"),
      href: "/dashboard/withdrawals",
      icon: Wallet,
    },
    {
      title: t("tariffs"),
      href: "/dashboard/tariffs",
      icon: Package,
    },
    {
      title: t("statistics"),
      href: "/dashboard/statistics",
      icon: BarChart3,
    },
    {
      title: t("notifications"),
      href: "/dashboard/notifications",
      icon: Bell,
    },
    {
      title: t("profile"),
      href: "/dashboard/profile",
      icon: UserCircle,
    },
    {
      title: t("settings"),
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleLinkClick = () => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile menu toggle button - only visible on small screens */}
      <div className="lg:hidden  fixed top-3 left-4 z-50">
        <Button
          size="icon"
          variant="outline"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="xl:bg-dark-bg bg-outline  border-border"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Responsive sidebar using media classes only */}
      <div
        className={cn(
          "h-screen dark:bg-dark-bg bg-inherit border-r border-border flex flex-col fixed z-40 transition-all duration-300 ease-in-out",
          "w-full sm:w-80 md:w-72 lg:w-64 xl:w-72",
          isMobileMenuOpen ? "left-0" : "-left-full lg:left-0"
        )}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold text-red-500">Tarmoqli Marketing</h2>
          {/* Close button for mobile - shown inside sidebar */}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="space-y-1 px-2">
            {sidebarItems.map((item) => (
              <SidebarLink
                key={item.href}
                item={item}
                pathname={pathname}
                onLinkClick={handleLinkClick}
              />
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-border">
          <LogoutButton
            onClick={() => setIsLogoutDialogOpen(true)}
            logoutText={t("logout")}
          />
        </div>
        <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("confirmLogout")}</DialogTitle>
              <DialogDescription>{t("confirmLogoutMessage")}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsLogoutDialogOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                {t("logout")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content padding to push content away from sidebar on large screens */}
      <div className="lg:pl-64 xl:pl-72">
        {/* Your page content would go here */}
      </div>
    </>
  );
}
