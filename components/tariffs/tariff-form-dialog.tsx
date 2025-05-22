"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/language-context";
import { useState } from "react";
import { uploadMultImage } from "@/lib/api";
import Image from "next/image";

// Tariff languages and currencies
const languages = [
  { code: "uz", name: "O'zbek" },
  { code: "ru", name: "Русский" },
  { code: "en", name: "English" },
  { code: "kz", name: "Қазақша" },
  { code: "kg", name: "Кыргызча" },
  { code: "tj", name: "Тоҷикӣ" },
  { code: "cn", name: "中文" },
];
const currencies = ["UZS", "USD", "EUR", "RUB", "KZT", "KGS", "CNY"];

export function TariffFormDialog({
  open,
  onOpenChange,
  onSubmit,
  tariff,
  initialData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  tariff: any;
}) {
  const { t } = useLanguage();

  // Multi-language state
  const [activeLang, setActiveLang] = useState(languages[0].code);
  const [translations, setTranslations] = useState(
    languages.map((lang) => {
      const found =
        initialData?.translations?.find(
          (tr: any) => tr.language === lang.code
        ) || {};
      return {
        language: lang.code,
        name: found.name || "",
        description: found.description || "",
        longDescription: found.longDescription || "",
        features: found.features || "",
        usage: found.usage || "",
      };
    })
  );

  // Prices state
  const [prices, setPrices] = useState(
    currencies.map((currency) => {
      const found = initialData?.prices?.find(
        (p: any) => p.currency === currency
      );
      return { currency, value: found ? String(found.value) : "" };
    })
  );

  // Photo state: {file: File, preview: string}[] for new, {photo_url: string}[] for existing
  const [photoFiles, setPhotoFiles] = useState<
    { file: File; preview: string }[]
  >([]);
  const [photoUrls, setPhotoUrls] = useState(
    initialData?.photo_url
      ? Array.isArray(initialData.photo_url)
        ? initialData.photo_url
        : [{ photo_url: initialData.photo_url }]
      : []
  );
  const [uploading, setUploading] = useState(false);

  // Other fields
  const [term, setTerm] = useState(initialData?.term || "");
  const [referralBonus, setReferralBonus] = useState(
    initialData?.referral_bonus || ""
  );
  const [status, setStatus] = useState(initialData?.status || "Faol");

  // Handle translation change
  const handleTranslationChange = (
    lang: string,
    field: string,
    value: string
  ) => {
    setTranslations((prev) =>
      prev.map((tr) => (tr.language === lang ? { ...tr, [field]: value } : tr))
    );
  };

  // Handle price change
  const handlePriceChange = (idx: number, value: string) => {
    setPrices((prev) => prev.map((p, i) => (i === idx ? { ...p, value } : p)));
  };

  // Remove photo (from state, not API)
  const removePhotoFile = (idx: number) =>
    setPhotoFiles(photoFiles.filter((_, i) => i !== idx));
  const removePhotoUrl = (idx: number) =>
    setPhotoUrls(photoUrls.filter((_: any, i: number) => i !== idx));

  // Upload photo handler (multiple, max 10)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files).slice(
      0,
      10 - photoFiles.length - photoUrls.length
    );
    const newFiles = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotoFiles((prev) =>
      [...prev, ...newFiles].slice(0, 10 - photoUrls.length)
    );
    e.target.value = "";
  };

  // Submit
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setUploading(true);

    let uploadedPhotos = [...photoUrls];
    if (photoFiles.length > 0) {
      try {
        const files = photoFiles.map((pf) => pf.file);
        const data = await uploadMultImage(files);
        if (Array.isArray(data?.urls)) {
          uploadedPhotos = [
            ...uploadedPhotos,
            ...data.urls.map((url: string) => ({ photo_url: url })),
          ].slice(0, 10);
        }
      } catch (err) {
        // handle error if needed
      }
    }

    setUploading(false);

    // onSubmit({
    //   term: Number(term),
    //   referral_bonus: Number(referralBonus),
    //   // status,
    //   photo_url: uploadedPhotos
    //     .filter((p: any) => p.photo_url)
    //     .map((p: any) => p.photo_url),

    //   translations: languages.map((lang, idx) => ({
    //     language: lang.code,
    //     title: translations[idx].name,
    //     body: translations[idx].description,
    //   })),
    //   prices: prices
    //     .filter((p: any) => p.currency && p.value)
    //     .map((p: any) => ({
    //       currency: p.currency,
    //       value: Number(p.value),
    //     })),
    // });

    onSubmit({
      term: Number(term),
      referral_bonus: Number(referralBonus),
      photo_url: uploadedPhotos[0]?.photo_url || "", // faqat bitta rasm yuboriladi
      translations: languages.map((lang, idx) => ({
        language: lang.code,
        title: translations[idx].name,
        body: translations[idx].description,
      })),
      prices: prices
        .filter((p: any) => p.currency && p.value)
        .map((p: any) => ({
          currency: p.currency,
          value: Number(p.value),
        })),
    });

    // Clean up previews
    photoFiles.forEach((pf) => URL.revokeObjectURL(pf.preview));
    setPhotoFiles([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl ">
        <DialogTitle>
          {initialData ? t("editTariff") : t("addTariff")}
        </DialogTitle>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[700px] overflow-auto"
        >
          <div className="flex flex-wrap gap-2">
            <Input
              name="term"
              type="number"
              min={0}
              placeholder={t("term") || "Term"}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
            <Input
              name="referral_bonus"
              type="number"
              min={0}
              placeholder={t("referralBonus") || "Referral Bonus"}
              value={referralBonus}
              onChange={(e) => setReferralBonus(e.target.value)}
            />
            {/* <select
              className="border rounded px-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">{t("active")}</option>
              <option value="unactive">{t("inactive")}</option>
            </select> */}
          </div>

          {/* Photo upload */}
          <div>
            <label className="block mb-1">{t("photo")}</label>
            <div className="flex gap-2 flex-wrap p-4">
              {/* Existing uploaded images */}
              {photoUrls.map((p: any, idx: number) =>
                p.photo_url ? (
                  <div key={`url-${idx}`} className="relative">
                    <Image
                      src={p.photo_url}
                      alt="photo"
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover border rounded"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2"
                      onClick={() => removePhotoUrl(idx)}
                    >
                      ×
                    </Button>
                  </div>
                ) : null
              )}
              {/* New images (not uploaded yet) */}
              {photoFiles.map((pf, idx) => (
                <div key={`file-${idx}`} className="relative">
                  <Image
                    src={pf.preview}
                    alt="preview"
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover border rounded"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2"
                    onClick={() => removePhotoFile(idx)}
                  >
                    ×
                  </Button>
                </div>
              ))}
              {/* Upload input */}
              {photoFiles.length + photoUrls.length < 10 && (
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                />
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t("maxFiles") || "Maximum 10 files"}
            </div>
          </div>

          {/* Multi-language tabs */}
          <Tabs value={activeLang} onValueChange={setActiveLang}>
            <TabsList className="grid grid-cols-2 h-40 md:h-10 sm:grid-cols-3 md:grid-cols-7 lg:grid-cols-7 gap-2 w-full mx-auto">
              {languages.map((lang) => (
                <TabsTrigger
                  key={lang.code}
                  value={lang.code}
                  className="truncate min-w-0"
                  style={{ maxWidth: 90 }}
                >
                  {lang.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {languages.map((lang, idx) => (
              <TabsContent key={lang.code} value={lang.code}>
                <div className="space-y-2  w-full mx-auto">
                  <Input
                    placeholder={t("title")}
                    value={translations[idx].name}
                    onChange={(e) =>
                      handleTranslationChange(lang.code, "name", e.target.value)
                    }
                  />
                  <Input
                    placeholder={t("body")}
                    value={translations[idx].description}
                    onChange={(e) =>
                      handleTranslationChange(
                        lang.code,
                        "description",
                        e.target.value
                      )
                    }
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Prices */}
          <div>
            <label className="block mb-1">{t("prices")}</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {prices.map((price: any, idx: number) => (
                <div key={price.currency} className="flex gap-2 mb-2">
                  <Input
                    placeholder={t("price") + " " + price.currency}
                    value={price.value}
                    type="number"
                    onChange={(e) => handlePriceChange(idx, e.target.value)}
                  />
                  <span className="self-center">{price.currency}</span>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={uploading}>
            {uploading ? t("loading") || "Loading..." : t("save")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
