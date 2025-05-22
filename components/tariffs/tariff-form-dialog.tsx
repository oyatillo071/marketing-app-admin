"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/language-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useRef } from "react";

export function TariffFormDialog({
  open,
  onOpenChange,
  tariff,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tariff?: any;
  onSubmit: (data: any) => void;
}) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("basic");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    term: "",
    referral_bonus: "",
    status: "Faol",
    photo_url: "",
    translations: [
      { language: "uz", name: "", description: "" },
      { language: "ru", name: "", description: "" },
      { language: "en", name: "", description: "" },
      { language: "kz", name: "", description: "" },
      { language: "kg", name: "", description: "" },
      { language: "tj", name: "", description: "" },
      { language: "cn", name: "", description: "" },
    ],
    prices: [
      { currency: "UZS", value: "" },
      { currency: "USD", value: "" },
      { currency: "EUR", value: "" },
      { currency: "RUB", value: "" },
      { currency: "KZT", value: "" },
      { currency: "KGS", value: "" },
      { currency: "CNY", value: "" },
    ],
  });

  useEffect(() => {
    if (tariff) {
      // Initialize form with tariff data
      const translations = formData.translations.map((tr) => {
        const found = tariff.translations?.find(
          (t: any) => t.language === tr.language
        );
        return {
          language: tr.language,
          name: found?.name || "",
          description: found?.description || "",
        };
      });

      const prices = formData.prices.map((pr) => {
        const found = tariff.prices?.find(
          (p: any) => p.currency === pr.currency
        );
        return {
          currency: pr.currency,
          value: found ? String(found.value) : "",
        };
      });

      setFormData({
        term: String(tariff.term || ""),
        referral_bonus: String(tariff.referral_bonus || ""),
        status: tariff.status || "Faol",
        photo_url: tariff.photo_url || "",
        translations,
        prices,
      });
    } else {
      // Reset form for new tariff
      setFormData({
        term: "",
        referral_bonus: "",
        status: "Faol",
        photo_url: "",
        translations: [
          { language: "uz", name: "", description: "" },
          { language: "ru", name: "", description: "" },
          { language: "en", name: "", description: "" },
          { language: "kz", name: "", description: "" },
          { language: "kg", name: "", description: "" },
          { language: "tj", name: "", description: "" },
          { language: "cn", name: "", description: "" },
        ],
        prices: [
          { currency: "UZS", value: "" },
          { currency: "USD", value: "" },
          { currency: "EUR", value: "" },
          { currency: "RUB", value: "" },
          { currency: "KZT", value: "" },
          { currency: "KGS", value: "" },
          { currency: "CNY", value: "" },
        ],
      });
      setSelectedFile(null);
    }
  }, [tariff, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert string values to numbers
    const processedData = {
      ...formData,
      term: Number(formData.term),
      referral_bonus: Number(formData.referral_bonus),
      prices: formData.prices.map((p) => ({
        ...p,
        value: p.value ? Number(p.value) : 0,
      })),
      selectedFile, // Pass the file for upload
    };

    onSubmit(processedData);
  };

  const updateTranslation = (
    language: string,
    field: string,
    value: string
  ) => {
    setFormData({
      ...formData,
      translations: formData.translations.map((tr) =>
        tr.language === language ? { ...tr, [field]: value } : tr
      ),
    });
  };

  const updatePrice = (currency: string, value: string) => {
    setFormData({
      ...formData,
      prices: formData.prices.map((p) =>
        p.currency === currency ? { ...p, value } : p
      ),
    });
  };

  const languages = [
    { code: "uz", label: "O'zbek" },
    { code: "ru", label: "Русский" },
    { code: "en", label: "English" },
    { code: "kz", label: "Қазақша" },
    { code: "kg", label: "Кыргызча" },
    { code: "tj", label: "Тоҷикӣ" },
    { code: "cn", label: "中文" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{tariff ? t("editTariff") : t("addTariff")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="basic">{t("basicInfo")}</TabsTrigger>
              <TabsTrigger value="translations">
                {t("translations")}
              </TabsTrigger>
              <TabsTrigger value="prices">{t("prices")}</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[60vh]">
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="term">
                      {t("term")} ({t("days")})
                    </Label>
                    <Input
                      id="term"
                      type="number"
                      value={formData.term}
                      onChange={(e) =>
                        setFormData({ ...formData, term: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="referral_bonus">
                      {t("referralBonus")} (%)
                    </Label>
                    <Input
                      id="referral_bonus"
                      type="number"
                      value={formData.referral_bonus}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          referral_bonus: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="status"
                      checked={formData.status === "Faol"}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          status: checked ? "Faol" : "Nofaol",
                        })
                      }
                    />
                    <Label htmlFor="status">
                      {formData.status === "Faol" ? t("active") : t("inactive")}
                    </Label>
                  </div>
                </div>

                <div className="space-y-2 p-4">
                  <Label className="text-2xl">{t("photo")}</Label>
                  <div className="flex  flex-col-reverse justify-start gap-4">
                    {(selectedFile || formData.photo_url) && (
                      <div className="relative w-full h-full border rounded-md overflow-hidden">
                        <img
                          src={
                            selectedFile
                              ? URL.createObjectURL(selectedFile)
                              : formData.photo_url
                          }
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {t("uploadPhoto")}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="translations" className="space-y-6 p-4">
                {languages.map((lang) => {
                  const translation = formData.translations.find(
                    (tr) => tr.language === lang.code
                  );

                  return (
                    <div
                      key={lang.code}
                      className="space-y-4 border-b pb-6 last:border-b-0"
                    >
                      <h3 className="font-medium text-lg">{lang.label}</h3>

                      <div className="space-y-2">
                        <Label htmlFor={`name-${lang.code}`}>{t("name")}</Label>
                        <Input
                          id={`name-${lang.code}`}
                          value={translation?.name || ""}
                          onChange={(e) =>
                            updateTranslation(lang.code, "name", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`description-${lang.code}`}>
                          {t("description")}
                        </Label>
                        <Textarea
                          id={`description-${lang.code}`}
                          value={translation?.description || ""}
                          onChange={(e) =>
                            updateTranslation(
                              lang.code,
                              "description",
                              e.target.value
                            )
                          }
                          rows={3}
                        />
                      </div>
                    </div>
                  );
                })}
              </TabsContent>

              <TabsContent value="prices" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
                  {formData.prices.map((price) => (
                    <div key={price.currency} className="space-y-2">
                      <Label htmlFor={`price-${price.currency}`}>
                        {price.currency}
                      </Label>
                      <Input
                        id={`price-${price.currency}`}
                        type="number"
                        step="0.01"
                        value={price.value}
                        onChange={(e) =>
                          updatePrice(price.currency, e.target.value)
                        }
                        placeholder="0.00"
                      />
                    </div>
                  ))}
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
            <Button type="submit">{tariff ? t("save") : t("add")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
