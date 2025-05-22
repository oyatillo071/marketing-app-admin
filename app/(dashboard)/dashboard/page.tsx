"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUpRight,
  BarChart3,
  DollarSign,
  Loader2,
  Users,
} from "lucide-react";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentPayments } from "@/components/dashboard/recent-payments";
import { NewUsers } from "@/components/dashboard/new-users";
import { useLanguage } from "@/contexts/language-context";
import { useStatistics } from "@/hooks/use-statistics";
import { usePayments } from "@/hooks/use-payments";
import { useUsers } from "@/hooks/use-users";

export default function DashboardPage() {
  const { t } = useLanguage();
  const { data: statistics, isLoading: statsLoading } = useStatistics();
  const { data: payments, isLoading: paymentsLoading } = usePayments();
  const { data: users, isLoading: usersLoading } = useUsers();

  const isLoading = statsLoading || paymentsLoading || usersLoading;

  if (isLoading) {
    return (
      <div className="min-w-[250px] max-w-[1440px] w-full mx-auto flex-1 space-y-4 p-4 md:p-8 pt-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-[250px] max-w-[1440px] w-full mx-auto flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t("dashboard")}</h2>
      </div>
      <Tabs defaultValue="umumiy" className="space-y-4">
        <TabsList>
          <TabsTrigger value="umumiy">{t("overview")}</TabsTrigger>
          <TabsTrigger value="analitika">{t("analytics")}</TabsTrigger>
        </TabsList>
        <TabsContent value="umumiy" className="space-y-4">
          {/* statistiks  */}
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("totalUsers")}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statistics?.userStats?.total}
                </div>
                <p className="text-xs text-muted-foreground">{t("allUsers")}</p>
                <div className="text-sm font-medium text-green-500 mt-2">
                  +{statistics?.userStats?.growth}% {t("comparedToLastMonth")}
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
                <p className="text-xs text-muted-foreground">{t("allTime")}</p>
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
                  +{statistics?.tariffStats?.growth}% {t("comparedToLastMonth")}
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

          {/* Charts Section */}
          <div className="min-w-[250px] max-w-[1440px] w-full mx-auto grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
            {/* Revenue Statistics Card */}
            <Card className="col-span-1 md:col-span-2 lg:col-span-4">
              <CardHeader>
                <CardTitle>{t("revenueStatistics")}</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <RevenueChart data={statistics?.monthlyRevenue || []} />
              </CardContent>
            </Card>
            {/* Recent Payments Card */}
            <Card className="col-span-1 md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>{t("recentPayments")}</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentPayments data={payments.slice(0, 5)} />
              </CardContent>
            </Card>
          </div>

          {/* new users  */}
          <div className="grid overflow-auto gap-4 w-full sm:grid-cols-1 ">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>{t("newUsers")}</CardTitle>
              </CardHeader>
              <CardContent>
                <NewUsers data={users.slice(0, 5)} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analitika" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("analytics")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{t("analyticsNotAvailable")}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
