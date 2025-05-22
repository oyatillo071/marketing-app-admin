"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUpRight,
  BarChart3,
  DollarSign,
  Download,
  Loader2,
  Plus,
  Trash2,
  Users,
  Edit,
} from "lucide-react";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { TariffDistributionChart } from "@/components/statistics/tariff-distribution-chart";
import { useLanguage } from "@/contexts/language-context";
import { useStatistics } from "@/hooks/use-statistics";
import { exportStatsToPDF } from "@/lib/pdf-export";
import { usePayments } from "@/hooks/use-payments";
import { useWithdrawals } from "@/hooks/use-withdrawals";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserActivityChart } from "@/components/statistics/user-activity-chart";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatisticsForm } from "@/components/statistics/statistics-form";

export default function StatisticsPage() {
  const { t } = useLanguage();
  const {
    data: statistics,
    isLoading,
    createStatistics,
    updateStatistics,
    deleteStatistics,
    isCreating,
    isUpdating,
    isDeleting,
  } = useStatistics();
  const { data: payments } = usePayments();
  const { data: withdrawals } = useWithdrawals();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentStatistics, setCurrentStatistics] = useState<any>(null);

  const handleExport = () => {
    if (statistics) {
      exportStatsToPDF(statistics, t("statistics"), "statistics-export");
    }
  };

  const handleCreateOrUpdate = (data: any) => {
    if (currentStatistics) {
      updateStatistics(currentStatistics.id, data);
    } else {
      createStatistics(data);
    }
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    if (currentStatistics && currentStatistics.id) {
      deleteStatistics(currentStatistics.id);
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>{t("loading")}</p>
        </div>
      </div>
    );
  }
  console.log(statistics);
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">{t("statistics")}</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={!statistics}
          >
            <Download className="mr-2 h-4 w-4" />
            {t("downloadPDF")}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setCurrentStatistics(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("add")}
          </Button>
          {statistics && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentStatistics(statistics);
                  setIsFormOpen(true);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                {t("edit")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setCurrentStatistics(statistics);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("delete")}
              </Button>
            </>
          )}
        </div>
      </div>

      {!statistics || statistics.length == 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-muted rounded-lg p-6">
          <p className="text-lg mb-4">{t("noStatisticsFound")}</p>
          <Button
            onClick={() => {
              setCurrentStatistics(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("createStatistics")}
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="umumiy" className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <TabsTrigger value="umumiy">{t("overview")}</TabsTrigger>
            <TabsTrigger value="foydalanuvchilar">{t("users")}</TabsTrigger>
            <TabsTrigger value="tolovlar">{t("payments")}</TabsTrigger>
            <TabsTrigger value="yechib_olishlar">
              {t("withdrawals")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="umumiy" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("totalUsers")}
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statistics.userStats?.total}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("allUsers")}
                  </p>
                  <div className="text-sm font-medium text-green-500 mt-2">
                    +{statistics.userStats?.growth}% {t("comparedToLastMonth")}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("totalRevenue")}
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${statistics?.revenueStats?.total.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("allTime")}
                  </p>
                  <div className="text-sm font-medium text-green-500 mt-2">
                    +{statistics?.revenueStats?.growth}%{" "}
                    {t("comparedToLastMonth")}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("activeTariffs")}
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statistics?.tariffStats?.total}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("currentlyActiveTariffs")}
                  </p>
                  <div className="text-sm font-medium text-green-500 mt-2">
                    +{statistics?.tariffStats?.growth}%{" "}
                    {t("comparedToLastMonth")}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("pendingWithdrawals")}
                  </CardTitle>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statistics?.withdrawalStats?.pending}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("withdrawalRequests")}
                  </p>
                  <div className="text-sm font-medium text-red-500 mt-2">
                    {statistics?.withdrawalStats?.growth}%{" "}
                    {t("comparedToLastMonth")}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
              <Card className="col-span-1 lg:col-span-4">
                <CardHeader>
                  <CardTitle>{t("revenueStatistics")}</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <RevenueChart data={statistics.monthlyRevenue} />
                </CardContent>
              </Card>
              <Card className="col-span-1 lg:col-span-3">
                <CardHeader>
                  <CardTitle>{t("tariffDistribution")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <TariffDistributionChart
                    data={[
                      {
                        name: "Premium",
                        value: statistics.tariffStats.premium,
                        color: "#ef4444",
                      },
                      {
                        name: "Standard",
                        value: statistics.tariffStats.standard,
                        color: "#22c55e",
                      },
                      {
                        name: "Basic",
                        value: statistics.tariffStats.basic,
                        color: "#6b7280",
                      },
                    ]}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="foydalanuvchilar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("userActivity")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <UserActivityChart data={statistics.userActivity} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="tolovlar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("paymentStatistics")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("id")}</TableHead>
                        <TableHead>{t("name")}</TableHead>
                        <TableHead>{t("amount")}</TableHead>
                        <TableHead>{t("status")}</TableHead>
                        <TableHead>{t("date")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments && payments.length > 0 ? (
                        payments.slice(0, 5).map((payment: any) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">
                              {payment.id}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-2 bg-red-500">
                                  <AvatarFallback>
                                    {payment.user.initials}
                                  </AvatarFallback>
                                </Avatar>
                                {payment.user.name}
                              </div>
                            </TableCell>
                            <TableCell>${payment.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge className="bg-green-500">
                                {payment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{payment.date}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            {t("noDataFound")}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="yechib_olishlar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("withdrawalStatistics")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("id")}</TableHead>
                        <TableHead>{t("name")}</TableHead>
                        <TableHead>{t("amount")}</TableHead>
                        <TableHead>{t("cardNumber")}</TableHead>
                        <TableHead>{t("status")}</TableHead>
                        <TableHead>{t("date")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals && withdrawals.length > 0 ? (
                        withdrawals.slice(0, 5).map((withdrawal: any) => (
                          <TableRow key={withdrawal.id}>
                            <TableCell className="font-medium">
                              {withdrawal.id}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-2 bg-red-500">
                                  <AvatarFallback>
                                    {withdrawal.user.initials}
                                  </AvatarFallback>
                                </Avatar>
                                {withdrawal.user.name}
                              </div>
                            </TableCell>
                            <TableCell>
                              ${withdrawal.amount.toFixed(2)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {withdrawal.cardNumber}
                            </TableCell>
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
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            {t("noDataFound")}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Statistics Form Dialog */}
      <StatisticsForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        statistics={currentStatistics}
        onSubmit={handleCreateOrUpdate}
        isSubmitting={isCreating || isUpdating}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmDeleteMessage")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("deleting")}
                </>
              ) : (
                t("delete")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
