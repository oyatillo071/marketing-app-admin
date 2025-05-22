"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export function TariffDetailsDialog({
  open,
  onOpenChange,
  tariff,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tariff: any;
}) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState("details");

  if (!tariff) return null;

  const languages = [
    { code: "uz", label: "O'zbek" },
    { code: "ru", label: "Русский" },
    { code: "en", label: "English" },
    { code: "kz", label: "Қазақша" },
    { code: "kg", label: "Кыргызча" },
    { code: "tj", label: "Тоҷикӣ" },
    { code: "cn", label: "中文" },
  ];

  const currencies = ["UZS", "USD", "EUR", "RUB", "KZT", "KGS", "CNY"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{t("tariffDetails")}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">{t("details")}</TabsTrigger>
            <TabsTrigger value="translations">{t("translations")}</TabsTrigger>
            <TabsTrigger value="prices">{t("prices")}</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh]">
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("basicInfo")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{t("id")}:</span>
                      <span>{tariff.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">{t("term")}:</span>
                      <span>
                        {tariff.term} {t("days")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">{t("referralBonus")}:</span>
                      <span>{tariff.referral_bonus}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">{t("status")}:</span>
                      <Badge
                        className={
                          tariff.status === "Faol"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }
                      >
                        {tariff.status || "Faol"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">{t("createdAt")}:</span>
                      <span>
                        {new Date(tariff.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {tariff.photo_url && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("photo")}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                      <img
                        src={tariff.photo_url || "/placeholder.svg"}
                        alt={tariff.name}
                        className="max-h-48 object-contain rounded-md"
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="translations" className="space-y-4">
              {languages.map((lang) => {
                const translation =
                  tariff.translations?.find(
                    (tr: any) => tr.language === lang.code
                  ) || {};

                return (
                  <Card key={lang.code}>
                    <CardHeader>
                      <CardTitle>{lang.label}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <span className="font-medium">{t("name")}:</span>
                          <p className="mt-1 p-2 bg-muted rounded-md">
                            {translation.name || "-"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">
                            {t("description")}:
                          </span>
                          <p className="mt-1 p-2 bg-muted rounded-md min-h-[60px] whitespace-pre-wrap">
                            {translation.description || "-"}
                          </p>
                        </div>
                        {translation.longDescription && (
                          <div>
                            <span className="font-medium">
                              {t("longDescription")}:
                            </span>
                            <p className="mt-1 p-2 bg-muted rounded-md min-h-[60px] whitespace-pre-wrap">
                              {translation.longDescription}
                            </p>
                          </div>
                        )}
                        {translation.features && (
                          <div>
                            <span className="font-medium">
                              {t("features")}:
                            </span>
                            <p className="mt-1 p-2 bg-muted rounded-md min-h-[60px] whitespace-pre-wrap">
                              {translation.features}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="prices" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("allPrices")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {(() => {
                      // Language to preferred currency order
                      const languageToCurrencyOrder: Record<string, string[]> =
                        {
                          uz: ["UZS", "USD", "EUR", "RUB", "KZT", "KGS", "CNY"],
                          ru: ["RUB", "USD", "EUR", "UZS", "KZT", "KGS", "CNY"],
                          en: ["USD", "EUR", "UZS", "RUB", "KZT", "KGS", "CNY"],
                          kz: ["KZT", "USD", "RUB", "UZS", "EUR", "KGS", "CNY"],
                          kg: ["KGS", "USD", "RUB", "KZT", "UZS", "EUR", "CNY"],
                          tj: ["TJS", "USD", "RUB", "UZS", "KZT", "KGS", "CNY"],
                          cn: ["CNY", "USD", "EUR", "RUB", "UZS", "KZT", "KGS"],
                        };

                      // Get preferred currency order for the current language or use default
                      const currencyOrder = languageToCurrencyOrder[
                        language
                      ] || ["UZS", "USD", "EUR", "RUB", "KZT", "KGS", "CNY"];

                      // Create a sorted list of currencies
                      const sortedCurrencies = [...currencies].sort((a, b) => {
                        const aIndex = currencyOrder.indexOf(a);
                        const bIndex = currencyOrder.indexOf(b);
                        return aIndex - bIndex;
                      });

                      return sortedCurrencies.map((currency) => {
                        const price = tariff.prices?.find(
                          (p: any) => p.currency === currency
                        );

                        return (
                          <Card key={currency} className="border shadow-sm">
                            <CardHeader className="p-3">
                              <CardTitle className="text-lg">
                                {currency}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                              <span className="text-2xl font-bold">
                                {price ? price.value.toLocaleString() : "-"}
                              </span>
                            </CardContent>
                          </Card>
                        );
                      });
                    })()}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
