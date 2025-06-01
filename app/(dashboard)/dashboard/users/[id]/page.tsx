"use client";

import { useUser } from "@/hooks/use-users";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Download, Edit, Trash, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { exportToPDF } from "@/lib/pdf-export";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useUsers } from "@/hooks/use-users";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePayments } from "@/hooks/use-payments";
import { useWithdrawals } from "@/hooks/use-withdrawals";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function UserDetailPage() {
  const pathname = usePathname();
  const segments = pathname?.split("/") ?? [];
  const id: string | undefined =
    segments.length > 0 ? segments[segments.length - 1] : undefined;
  console.log(id);

  const { t } = useLanguage();
  const router = useRouter();
  const { data: user, isLoading } = useUser(id);
  const { deleteUser } = useUsers();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { data: allPayments } = usePayments();
  const { data: allWithdrawals } = useWithdrawals();
  const [userPayments, setUserPayments] = useState<any[]>([]);
  const [userWithdrawals, setUserWithdrawals] = useState<any[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (allPayments && user) {
      const filteredPayments = allPayments.filter(
        (payment: any) => payment.userId === user.id
      );
      setUserPayments(filteredPayments);
    }
  }, [allPayments, user]);

  useEffect(() => {
    if (allWithdrawals && user) {
      const filteredWithdrawals = allWithdrawals.filter(
        (withdrawal: any) => withdrawal.userId === user.id
      );
      setUserWithdrawals(filteredWithdrawals);
    }
  }, [allWithdrawals, user]);

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        coin: user.coin,
        status: user.status || "base",
        dailyEarnings: user.dailyEarnings || 0,
      });
    }
  }, [user]);

  const handleExportUserData = () => {
    if (user) {
      const userData = [user];
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
      exportToPDF(
        userData,
        columns,
        `${t("userDetails")}: ${user.name}`,
        `user-${user.id}-export`
      );
    }
  };

  const handleExportPayments = () => {
    if (userPayments.length > 0) {
      const columns = [
        { header: t("id"), accessor: "id" },
        { header: t("amount"), accessor: "amount" },
        { header: t("status"), accessor: "status" },
        { header: t("date"), accessor: "date" },
      ];
      exportToPDF(
        userPayments,
        columns,
        `${t("paymentHistory")}: ${user?.name}`,
        `payments-${user?.id}-export`
      );
    }
  };

  const handleExportWithdrawals = () => {
    if (userWithdrawals.length > 0) {
      const columns = [
        { header: t("id"), accessor: "id" },
        { header: t("amount"), accessor: "amount" },
        { header: t("cardNumber"), accessor: "cardNumber" },
        { header: t("status"), accessor: "status" },
        { header: t("date"), accessor: "date" },
      ];
      exportToPDF(
        userWithdrawals,
        columns,
        `${t("withdrawalHistory")}: ${user?.name}`,
        `withdrawals-${user?.id}-export`
      );
    }
  };

  const handleDeleteUser = () => {
    deleteUser(id);
    setIsDeleteDialogOpen(false);
    router.push("/dashboard/users");
  };

  const { updateUser } = useUsers();

  const handleEditChange = (field: string, value: any) => {
    setEditForm((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUser(user.id, editForm);
      setIsEditDialogOpen(false);
    } catch (error) {
      // error handling
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("back")}
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-24 mt-2" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview" disabled>
              {t("overview")}
            </TabsTrigger>
            <TabsTrigger value="payments" disabled>
              {t("payments")}
            </TabsTrigger>
            <TabsTrigger value="withdrawals" disabled>
              {t("withdrawals")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("back")}
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <h2 className="text-2xl font-bold">{t("userNotFound")}</h2>
          <p className="text-muted-foreground">
            {t("userNotFoundDescription")}
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push("/dashboard/users")}
          >
            {t("backToUsers")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("back")}
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 bg-red-500">
            <AvatarFallback>{user.initials}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <Badge
              className={user.status === "Faol" ? "bg-green-500" : "bg-red-500"}
            >
              {user.status}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit className="mr-2 h-4 w-4" />
            {t("edit")}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash className="mr-2 h-4 w-4" />
            {t("delete")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
          <TabsTrigger value="payments">{t("payments")}</TabsTrigger>
          <TabsTrigger value="withdrawals">{t("withdrawals")}</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("userDetails")}</CardTitle>
                <CardDescription>{t("userDetailsDescription")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">{t("id")}</div>
                  <div>{user.id}</div>
                  <div className="font-medium">{t("name")}</div>
                  <div>{user.name}</div>
                  <div className="font-medium">{t("email")}</div>
                  <div>{user.email}</div>
                  <div className="font-medium">{t("role")}</div>
                  <div>{user.role}</div>
                  <div className="font-medium">{t("isActive")}</div>
                  <div>
                    <Badge
                      className={user.isActive ? "bg-green-500" : "bg-red-500"}
                    >
                      {user.isActive ? t("active") : t("inactive")}
                    </Badge>
                  </div>
                  <div className="font-medium">{t("coin")}</div>
                  <div>{user.coin}</div>
                  <div className="font-medium">{t("registrationDate")}</div>
                  <div>{new Date(user.createdAt).toLocaleString()}</div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportUserData}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {t("exportUserData")}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("activitySummary")}</CardTitle>
                <CardDescription>
                  {t("activitySummaryDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">{t("lastLogin")}</div>
                  <div>2024-01-15 14:30</div>
                  <div className="font-medium">{t("totalLogins")}</div>
                  <div>42</div>
                  <div className="font-medium">{t("totalPayments")}</div>
                  <div>{userPayments.length}</div>
                  <div className="font-medium">{t("totalWithdrawals")}</div>
                  <div>{userWithdrawals.length}</div>
                  <div className="font-medium">{t("totalSpent")}</div>
                  <div>
                    $
                    {userPayments
                      .reduce((sum, p) => sum + p.amount, 0)
                      .toFixed(2)}
                  </div>
                  <div className="font-medium">{t("totalWithdrawn")}</div>
                  <div>
                    $
                    {userWithdrawals
                      .reduce((sum, w) => sum + w.amount, 0)
                      .toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="payments" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("paymentHistory")}</CardTitle>
                <CardDescription>
                  {t("paymentHistoryDescription")}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPayments}
                disabled={userPayments.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                {t("downloadPDF")}
              </Button>
            </CardHeader>
            <CardContent>
              {userPayments.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("id")}</TableHead>
                        <TableHead>{t("amount")}</TableHead>
                        <TableHead>{t("status")}</TableHead>
                        <TableHead>{t("date")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">
                            {payment.id}
                          </TableCell>
                          <TableCell>${payment.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500">
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{payment.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p>{t("noPaymentsFound")}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="withdrawals" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("withdrawalHistory")}</CardTitle>
                <CardDescription>
                  {t("withdrawalHistoryDescription")}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportWithdrawals}
                disabled={userWithdrawals.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                {t("downloadPDF")}
              </Button>
            </CardHeader>
            <CardContent>
              {userWithdrawals.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("id")}</TableHead>
                        <TableHead>{t("amount")}</TableHead>
                        <TableHead>{t("cardNumber")}</TableHead>
                        <TableHead>{t("status")}</TableHead>
                        <TableHead>{t("date")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userWithdrawals.map((withdrawal) => (
                        <TableRow key={withdrawal.id}>
                          <TableCell className="font-medium">
                            {withdrawal.id}
                          </TableCell>
                          <TableCell>${withdrawal.amount.toFixed(2)}</TableCell>
                          <TableCell>{withdrawal.cardNumber}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                withdrawal.status === "To'langan"
                                  ? "bg-green-500"
                                  : withdrawal.status === "Kutilmoqda"
                                  ? "bg-gray-500"
                                  : "bg-red-500"
                              }
                            >
                              {withdrawal.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{withdrawal.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p>{t("noWithdrawalsFound")}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirmDelete")}</DialogTitle>
            <DialogDescription>{t("confirmDeleteMessage")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT USER DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("edit")} {t("user")}
            </DialogTitle>
            <DialogDescription>{t("editUserDescription")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("name")}</Label>
                <Input
                  id="name"
                  value={editForm?.name || ""}
                  onChange={(e) => handleEditChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm?.email || ""}
                  onChange={(e) => handleEditChange("email", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">{t("role")}</Label>
                <Input
                  id="role"
                  value={editForm?.role || ""}
                  onChange={(e) => handleEditChange("role", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coin">{t("coin")}</Label>
                <Input
                  id="coin"
                  type="number"
                  value={editForm?.coin ?? 0}
                  onChange={(e) =>
                    handleEditChange("coin", Number(e.target.value))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">{t("status")}</Label>
                <select
                  id="status"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={editForm?.status || "base"}
                  onChange={(e) => handleEditChange("status", e.target.value)}
                  required
                >
                  <option value="base">Base</option>
                  <option value="vip">VIP</option>
                  <option value="vvip">VVIP</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dailyEarnings">{t("dailyEarnings")}</Label>
                <Input
                  id="dailyEarnings"
                  type="number"
                  value={editForm?.dailyEarnings ?? 0}
                  onChange={(e) =>
                    handleEditChange("dailyEarnings", Number(e.target.value))
                  }
                  required
                />
              </div>
              <div className="flex items-center justify-between space-y-0 pt-5">
                <Label htmlFor="isActive">{t("active")}</Label>
                <Switch
                  id="isActive"
                  checked={!!editForm?.isActive}
                  onCheckedChange={(checked) =>
                    handleEditChange("isActive", checked)
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsEditDialogOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
