"use client";

import { NotificationsForm } from "@/components/notifications/notifications-form";
import { NotificationsTable } from "@/components/notifications/notifications-table";
import { useLanguage } from "@/contexts/language-context";

export default function NotificationsPage() {
  const { t } = useLanguage();

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">
          {t("notifications")}
        </h2>
      </div>

      <div className="grid grid-cols-1  gap-6 items-start">
        <div className="p-2">
          <h3 className="text-lg font-medium mb-4">{t("newNotification")}</h3>
          <NotificationsForm />
        </div>

        <div className="w-full p-2 overflow-x-auto">
          <h3 className="text-lg font-medium mb-4">{t("sentNotifications")}</h3>
          <NotificationsTable />
        </div>
      </div>
    </div>
  );
}
