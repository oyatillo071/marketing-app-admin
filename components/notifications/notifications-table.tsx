"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/language-context";
import { useNotifications } from "@/hooks/use-notifications";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export function NotificationsTable() {
  const { t } = useLanguage();
  const { data: notifications, isLoading } = useNotifications();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  const handleViewDetails = (notification: any) => {
    setSelectedNotification(notification);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("id")}</TableHead>
              <TableHead>{t("title")}</TableHead>
              <TableHead>{t("recipient")}</TableHead>
              <TableHead>{t("date")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead>{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("id")}</TableHead>
            <TableHead>{t("title")}</TableHead>
            <TableHead>{t("recipient")}</TableHead>
            <TableHead>{t("date")}</TableHead>
            <TableHead>{t("status")}</TableHead>
            <TableHead>{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notifications.map((notification: any) => (
            <TableRow key={notification.id}>
              <TableCell className="font-medium">{notification.id}</TableCell>
              <TableCell>{notification.title}</TableCell>
              <TableCell>
                <Badge
                  className={
                    notification.recipient === "Premium foydalanuvchilar"
                      ? "bg-red-500 px-2 py-1"
                      : "bg-green-500 px-2 py-1"
                  }
                >
                  {notification.recipient}
                </Badge>
              </TableCell>
              <TableCell>{notification.date}</TableCell>
              <TableCell>
                <Badge className="bg-green-500">{notification.status}</Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">{t("openMenu")}</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => handleViewDetails(notification)}
                    >
                      {t("view")}
                    </DropdownMenuItem>
                    <DropdownMenuItem>{t("send")}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal for Notification Details */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("notificationDetails")}</DialogTitle>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4">
              <p>
                <strong>{t("title")}:</strong> {selectedNotification.title}
              </p>
              <p>
                <strong>{t("recipient")}:</strong>{" "}
                {selectedNotification.recipient}
              </p>
              <p>
                <strong>{t("date")}:</strong> {selectedNotification.date}
              </p>
              <p>
                <strong>{t("status")}:</strong> {selectedNotification.status}
              </p>
              <p>
                <strong>{t("message")}:</strong> {selectedNotification.message}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
