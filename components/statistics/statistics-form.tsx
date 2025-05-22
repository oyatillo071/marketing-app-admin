"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/language-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function StatisticsForm({
  open,
  onOpenChange,
  statistics,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statistics?: any;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState({
    onlineUserCount: statistics?.onlineUserCount || 0,
    totalEarned: statistics?.totalEarned || 0,
    statEarnings: [
      {
        currency: "UZS",
        amount: statistics?.statEarnings?.[0]?.amount || 0,
      },
    ],
    recentUsers: statistics?.recentUsers || [],
    userStats: {
      total: statistics?.userStats?.total || 0,
      growth: statistics?.userStats?.growth || 0,
    },
    revenueStats: {
      total: statistics?.revenueStats?.total || 0,
      growth: statistics?.revenueStats?.growth || 0,
    },
    tariffStats: {
      total: statistics?.tariffStats?.total || 0,
      growth: statistics?.tariffStats?.growth || 0,
      premium: statistics?.tariffStats?.premium || 0,
      standard: statistics?.tariffStats?.standard || 0,
      basic: statistics?.tariffStats?.basic || 0,
    },
    withdrawalStats: {
      pending: statistics?.withdrawalStats?.pending || 0,
      growth: statistics?.withdrawalStats?.growth || 0,
    },
    monthlyRevenue: statistics?.monthlyRevenue || [
      { month: "Jan", revenue: 0 },
      { month: "Feb", revenue: 0 },
      { month: "Mar", revenue: 0 },
      { month: "Apr", revenue: 0 },
      { month: "May", revenue: 0 },
      { month: "Jun", revenue: 0 },
      { month: "Jul", revenue: 0 },
      { month: "Aug", revenue: 0 },
      { month: "Sep", revenue: 0 },
      { month: "Oct", revenue: 0 },
      { month: "Nov", revenue: 0 },
      { month: "Dec", revenue: 0 },
    ],
    userActivity: statistics?.userActivity || [
      { day: "Mon", active: 0 },
      { day: "Tue", active: 0 },
      { day: "Wed", active: 0 },
      { day: "Thu", active: 0 },
      { day: "Fri", active: 0 },
      { day: "Sat", active: 0 },
      { day: "Sun", active: 0 },
    ],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateMonthlyRevenue = (index: number, value: number) => {
    const updatedRevenue = [...formData.monthlyRevenue];
    updatedRevenue[index] = { ...updatedRevenue[index], revenue: value };
    setFormData({ ...formData, monthlyRevenue: updatedRevenue });
  };

  const updateUserActivity = (index: number, value: number) => {
    const updatedActivity = [...formData.userActivity];
    updatedActivity[index] = { ...updatedActivity[index], active: value };
    setFormData({ ...formData, userActivity: updatedActivity });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {statistics ? t("editStatistics") : t("addStatistics")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="general">{t("general")}</TabsTrigger>
              <TabsTrigger value="revenue">{t("revenue")}</TabsTrigger>
              <TabsTrigger value="users">{t("users")}</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[60vh]">
              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="onlineUserCount">{t("onlineUsers")}</Label>
                    <Input
                      id="onlineUserCount"
                      type="number"
                      value={formData.onlineUserCount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          onlineUserCount: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalEarned">{t("totalEarned")}</Label>
                    <Input
                      id="totalEarned"
                      type="number"
                      value={formData.totalEarned}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          totalEarned: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="statEarnings">{t("earnings")} (UZS)</Label>
                  <Input
                    id="statEarnings"
                    type="number"
                    value={formData.statEarnings[0].amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        statEarnings: [
                          { currency: "UZS", amount: Number(e.target.value) },
                        ],
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tariffTotal">{t("totalTariffs")}</Label>
                    <Input
                      id="tariffTotal"
                      type="number"
                      value={formData.tariffStats.total}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tariffStats: {
                            ...formData.tariffStats,
                            total: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tariffGrowth">
                      {t("tariffGrowth")} (%)
                    </Label>
                    <Input
                      id="tariffGrowth"
                      type="number"
                      value={formData.tariffStats.growth}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tariffStats: {
                            ...formData.tariffStats,
                            growth: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="premiumTariffs">
                      {t("premiumTariffs")}
                    </Label>
                    <Input
                      id="premiumTariffs"
                      type="number"
                      value={formData.tariffStats.premium}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tariffStats: {
                            ...formData.tariffStats,
                            premium: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="standardTariffs">
                      {t("standardTariffs")}
                    </Label>
                    <Input
                      id="standardTariffs"
                      type="number"
                      value={formData.tariffStats.standard}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tariffStats: {
                            ...formData.tariffStats,
                            standard: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="basicTariffs">{t("basicTariffs")}</Label>
                    <Input
                      id="basicTariffs"
                      type="number"
                      value={formData.tariffStats.basic}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tariffStats: {
                            ...formData.tariffStats,
                            basic: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pendingWithdrawals">
                      {t("pendingWithdrawals")}
                    </Label>
                    <Input
                      id="pendingWithdrawals"
                      type="number"
                      value={formData.withdrawalStats.pending}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          withdrawalStats: {
                            ...formData.withdrawalStats,
                            pending: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="withdrawalGrowth">
                      {t("withdrawalGrowth")} (%)
                    </Label>
                    <Input
                      id="withdrawalGrowth"
                      type="number"
                      value={formData.withdrawalStats.growth}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          withdrawalStats: {
                            ...formData.withdrawalStats,
                            growth: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="revenue" className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("monthlyRevenue")}</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {formData.monthlyRevenue.map((item: any, index: number) => (
                      <div key={item.month} className="space-y-2">
                        <Label htmlFor={`revenue-${item.month}`}>
                          {item.month}
                        </Label>
                        <Input
                          id={`revenue-${item.month}`}
                          type="number"
                          value={item.revenue}
                          onChange={(e) =>
                            updateMonthlyRevenue(index, Number(e.target.value))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="revenueTotal">{t("totalRevenue")}</Label>
                    <Input
                      id="revenueTotal"
                      type="number"
                      value={formData.revenueStats.total}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          revenueStats: {
                            ...formData.revenueStats,
                            total: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="revenueGrowth">
                      {t("revenueGrowth")} (%)
                    </Label>
                    <Input
                      id="revenueGrowth"
                      type="number"
                      value={formData.revenueStats.growth}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          revenueStats: {
                            ...formData.revenueStats,
                            growth: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("userActivity")}</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {formData.userActivity.map((item: any, index: number) => (
                      <div key={item.day} className="space-y-2">
                        <Label htmlFor={`activity-${item.day}`}>
                          {item.day}
                        </Label>
                        <Input
                          id={`activity-${item.day}`}
                          type="number"
                          value={item.active}
                          onChange={(e) =>
                            updateUserActivity(index, Number(e.target.value))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="userTotal">{t("totalUsers")}</Label>
                    <Input
                      id="userTotal"
                      type="number"
                      value={formData.userStats.total}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          userStats: {
                            ...formData.userStats,
                            total: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userGrowth">{t("userGrowth")} (%)</Label>
                    <Input
                      id="userGrowth"
                      type="number"
                      value={formData.userStats.growth}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          userStats: {
                            ...formData.userStats,
                            growth: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("saving") : statistics ? t("save") : t("add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
