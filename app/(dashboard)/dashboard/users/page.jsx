"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UsersTable } from "@/components/users/users-table";
import { Download, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useUsers } from "@/hooks/use-users";
import { exportToPDF } from "@/lib/pdf-export";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

export default function UsersPage() {
  const { t } = useLanguage();
  const { data: users, isLoading } = useUsers();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    phone: "",
    email: "",
    tariff: "Basic",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleExportPDF = () => {
    const columns = [
      { header: t("id"), accessor: "id" },
      { header: t("name"), accessor: "name" },
      { header: t("phone"), accessor: "phone" },
      { header: t("email"), accessor: "email" },
      { header: t("tariff"), accessor: "tariff" },
      { header: t("status"), accessor: "status" },
      { header: t("balance"), accessor: "balance" },
      { header: t("registrationDate"), accessor: "registrationDate" },
    ];

    exportToPDF(users, columns, t("users"), "users-export");
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        throw new Error(t("errorOccurred"));
      }

      toast({
        title: t("success"),
        description: t("userAdded"),
      });

      setNewUser({ name: "", phone: "", email: "", tariff: "Basic" });
      setIsAddDialogOpen(false);
    } catch (error) {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">{t("users")}</h2>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                {t("export")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportPDF}>
                {t("downloadPDF")}
              </DropdownMenuItem>
              {/* <DropdownMenuItem>{t("downloadCSV")}</DropdownMenuItem> */}
              {/* <DropdownMenuItem>{t("downloadExcel")}</DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="sm"
            className="bg-button-bg hover:bg-button-hover"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("add")}
          </Button>
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="text-lg font-medium">{t("allUsers")}</h3>
        <p className="text-sm text-muted-foreground">{t("usersDescription")}</p>
      </div>

      {/* Users Table */}
      <UsersTable />

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("add")} {t("user")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddUser}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  {t("name")}
                </Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  {t("phone")}
                </Label>
                <Input
                  id="phone"
                  value={newUser.phone}
                  onChange={(e) =>
                    setNewUser({ ...newUser, phone: e.target.value })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  {t("email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("loading") : t("save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
