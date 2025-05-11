"use client"

import { NotificationsForm } from "@/components/notifications/notifications-form"
import { NotificationsTable } from "@/components/notifications/notifications-table"
import { useLanguage } from "@/contexts/language-context"

export default function NotificationsPage() {
  const { t } = useLanguage()

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t("notifications")}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-medium mb-4">{t("newNotification")}</h3>
          <NotificationsForm />
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4">{t("sentNotifications")}</h3>
          <NotificationsTable />
        </div>
      </div>
    </div>
  )
}
