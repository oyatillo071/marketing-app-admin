"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const router = useRouter()
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

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
  ]

  const handleLogout = () => {
    // Clear token and redirect to login
    localStorage.removeItem("token")
    router.push("/login")
  }

  return (
    <div className="w-64 h-screen bg-dark-bg border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold text-red-500">Tarmoqli Marketing</h1>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="space-y-1 px-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "bg-secondary-bg text-white"
                  : "text-muted-foreground hover:bg-secondary-bg hover:text-white",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full flex items-center justify-start gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary-bg hover:text-white transition-colors"
          onClick={() => setIsLogoutDialogOpen(true)}
        >
          <LogOut className="h-5 w-5" />
          <span>{t("logout")}</span>
        </Button>
      </div>

      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirmLogout")}</DialogTitle>
            <DialogDescription>{t("confirmLogoutMessage")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogoutDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              {t("logout")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
