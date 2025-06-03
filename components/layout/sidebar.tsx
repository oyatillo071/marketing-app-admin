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
  UserPlus,
  ChevronDown,
  Plus,
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

// Add new interface for sidebar items with children
interface SidebarItem {
  title: string;
  href?: string;
  icon: any;
  children?: SidebarItem[];
}

// Modify SidebarLink component to handle nested items
const SidebarLink = memo(
  ({
    item,
    pathname,
    onLinkClick,
    level = 0,
  }: {
    item: SidebarItem;
    pathname: string;
    onLinkClick: () => void;
    level?: number;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;

    const isActive = item.href
      ? pathname === item.href
      : item.children?.some((child) => pathname === child.href);

    const handleClick = () => {
      if (hasChildren) {
        setIsOpen(!isOpen);
      } else {
        onLinkClick();
      }
    };

    return (
      <div>
        <div
          onClick={handleClick}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
            isActive
              ? "bg-secondary-bg text-white"
              : "text-muted-foreground hover:bg-secondary-bg hover:text-white",
            level > 0 && "ml-6"
          )}
        >
          <Icon className="h-5 w-5" />
          <span className="flex-1">{item.title}</span>
          {hasChildren && (
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isOpen && "transform rotate-180"
              )}
            />
          )}
        </div>
        {hasChildren && isOpen && (
          <div className="mt-1">
            {item?.children?.map((child) => (
              <Link
                key={child.href}
                href={child.href || "#"}
                onClick={onLinkClick}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ml-6",
                  pathname === child.href
                    ? "bg-secondary-bg text-white"
                    : "text-muted-foreground hover:bg-secondary-bg hover:text-white"
                )}
              >
                {child.icon && <child.icon className="h-5 w-5" />}
                <span>{child.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
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

  const sidebarItems: SidebarItem[] = [
    {
      title: t("dashboard"),
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: t("users"),
      icon: Users,
      children: [
        {
          title: t("allUsers"),
          href: "/dashboard/users",
          icon: Users,
        },
        {
          title: t("addUser"),
          href: "/dashboard/users/add",
          icon: UserPlus,
        },
      ],
    },
    {
      title: t("payments"),
      icon: CreditCard,
      children: [
        {
          title: t("allPayments"),
          href: "/dashboard/payments",
          icon: CreditCard,
        },
        {
          title: t("paymentRequests"),
          href: "/dashboard/payments/payment-socket",
          icon: Bell,
        },
      ],
    },
    {
      title: t("tariffs"),
      href: "/dashboard/tariffs",
      icon: Wallet,
    },
    {
      title: t("withdrawals"),
      href: "/dashboard/withdrawals",
      icon: Wallet,
    },
    {
      title: t("products"),
      icon: Package,
      children: [
        {
          title: t("allProducts"),
          href: "/dashboard/products",
          icon: Package,
        },
        {
          title: t("addProduct"),
          href: "/dashboard/products/add",
          icon: Plus,
        },
      ],
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
                key={item.href || item.title}
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
