import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/language-context";
import { useState } from "react";

import Image from "next/image";
import { uploadMultImage } from "@/lib/api";
import { toast } from "sonner";
import { languages } from "../providers/language-switcher";

export function ProductFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: any) {
  const { t } = useLanguage();

  // Multi-language state
  const [activeLang, setActiveLang] = useState(languages[0].code);
  const [translations, setTranslations] = useState(
    languages.map((lang: any) => {
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
    initialData?.prices?.length
      ? initialData.prices
      : [{ currency: "", value: "" }]
  );

  // Photo state: {file: File, preview: string}[] for new, {photo_url: string}[] for existing
  const [photoFiles, setPhotoFiles] = useState<
    { file: File; preview: string }[]
  >([]);
  const [photoUrls, setPhotoUrls] = useState(
    initialData?.photo_url?.length ? initialData.photo_url : []
  );
  const [uploading, setUploading] = useState(false);

  // Other fields
  const [rating, setRating] = useState(initialData?.rating || "");
  const [rewiev, setRewiev] = useState(initialData?.rewiev || "");

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
  const handlePriceChange = (idx: number, field: string, value: string) => {
    setPrices((prev: any) =>
      prev.map((p: any, i: number) =>
        i === idx ? { ...p, [field]: value } : p
      )
    );
  };

  // Add/remove price
  const addPrice = () => setPrices([...prices, { currency: "", value: "" }]);
  const removePrice = (idx: number) =>
    setPrices(prices.filter((_: any, i: number) => i !== idx));

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

    // --- VALIDATSIYA ---
    const priceErrors = prices.some(
      (p: any) =>
        !p.currency ||
        !allowedCurrencies.find((c) => c.code === p.currency) ||
        !p.value ||
        isNaN(Number(p.value)) ||
        Number(p.value) <= 0
    );
    if (priceErrors) {
      toast.error("Valyuta va narxlarni to'g'ri kiriting!");
      setUploading(false);
      return;
    }

    if (photoFiles.length + photoUrls.length === 0) {
      toast.error("Kamida bitta rasm yuklang!");
      setUploading(false);
      return;
    }

    let uploadedPhotos = Array.isArray(photoUrls)
      ? photoUrls
          .filter(
            (p) => typeof p?.photo_url === "string" && p.photo_url.trim() !== ""
          )
          .map((p) => ({ photo_url: p.photo_url }))
      : [];

    if (photoFiles.length > 0) {
      try {
        const files = photoFiles.map((pf) => pf.file);
        const data = await uploadMultImage(files);

        // uploadMultImage har doim [{ photo_url: "..." }] formatida qaytadi
        const formatted = Array.isArray(data)
          ? data
              .filter(
                (p) =>
                  typeof p?.photo_url === "string" && p.photo_url.trim() !== ""
              )
              .map((p) => ({ photo_url: p.photo_url }))
          : [];

        uploadedPhotos = [...uploadedPhotos, ...formatted].slice(0, 10);
      } catch (err: any) {
        toast.error(err?.message || "Rasm yuklashda xatolik");
        setUploading(false);
        return;
      }
    }

    // API-ga yuborish
    await onSubmit({
      rating: Number(rating),
      rewiev: Number(rewiev),
      photo_url: uploadedPhotos, // Faqat massiv va har bir elementda faqat photo_url property
      translations,
      prices: prices
        .filter(
          (p: any) =>
            p.currency &&
            allowedCurrencies.find((c) => c.code === p.currency) &&
            p.value &&
            !isNaN(Number(p.value)) &&
            Number(p.value) > 0
        )
        .map((p: any) => ({
          currency: p.currency,
          value: Number(p.value),
        })),
    });

    setUploading(false);

    // Clean up previews
    photoFiles.forEach((pf) => URL.revokeObjectURL(pf.preview));
    setPhotoFiles([]);

    // --- Eski variant (keyinchalik ishlatish uchun) ---
    /*
    onSubmit({
      rating: Number(rating),
      rewiev: Number(rewiev),
      photo_url: uploadedPhotos, // filter kerak emas
      translations,
      prices: prices
        .filter((p: any) => p.currency && p.value)
        .map((p: any) => ({
          currency: p.currency,
          value: Number(p.value),
        })),
    });
    */
  };

  // Valyutalar select uchun
  const allowedCurrencies = [
    { code: "UZS", name: "UZS (so'm)" },
    { code: "USD", name: "USD (dollar)" },
    { code: "RUB", name: "RUB (rubl)" },
    { code: "KZT", name: "KZT (tenge)" },
    { code: "KGS", name: "KGS (som)" },
    { code: "TJS", name: "TJS (somoni)" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogTitle>{t("addCard")}</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              name="rating"
              type="number"
              min={0}
              placeholder={t("rating") || "Rating"}
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
            <Input
              name="rewiev"
              type="number"
              min={0}
              placeholder={t("rewiev") || "Review"}
              value={rewiev}
              onChange={(e) => setRewiev(e.target.value)}
            />
          </div>

          {/* Photo upload */}
          <div>
            <label className="block mb-1">{t("photo")}</label>
            <div className="flex gap-2 flex-wrap">
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
            <TabsList>
              {languages.map((lang: any) => (
                <TabsTrigger key={lang.code} value={lang.code}>
                  {lang.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {languages.map((lang: any, idx: number) => (
              <TabsContent key={lang.code} value={lang.code}>
                <div className="space-y-2">
                  <Input
                    placeholder={t("name")}
                    value={translations[idx].name}
                    onChange={(e) =>
                      handleTranslationChange(lang.code, "name", e.target.value)
                    }
                  />
                  <Input
                    placeholder={t("description")}
                    value={translations[idx].description}
                    onChange={(e) =>
                      handleTranslationChange(
                        lang.code,
                        "description",
                        e.target.value
                      )
                    }
                  />
                  <Input
                    placeholder={t("longDescription") || "Long Description"}
                    value={translations[idx].longDescription}
                    onChange={(e) =>
                      handleTranslationChange(
                        lang.code,
                        "longDescription",
                        e.target.value
                      )
                    }
                  />
                  <Input
                    placeholder={t("features")}
                    value={translations[idx].features}
                    onChange={(e) =>
                      handleTranslationChange(
                        lang.code,
                        "features",
                        e.target.value
                      )
                    }
                  />
                  <Input
                    placeholder={t("usage") || "Usage"}
                    value={translations[idx].usage}
                    onChange={(e) =>
                      handleTranslationChange(
                        lang.code,
                        "usage",
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
            {prices.map((price: any, idx: number) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select
                  value={price.currency}
                  onChange={(e) =>
                    handlePriceChange(idx, "currency", e.target.value)
                  }
                  className="border rounded px-2 py-1"
                  required
                >
                  <option value="">Valyutani tanlang</option>
                  {allowedCurrencies.map((cur) => (
                    <option key={cur.code} value={cur.code}>
                      {cur.name}
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  placeholder={t("price")}
                  value={price.value}
                  onChange={(e) =>
                    handlePriceChange(idx, "value", e.target.value)
                  }
                  min={1}
                  required
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removePrice(idx)}
                  disabled={prices.length === 1}
                >
                  ×
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addPrice}>
              {t("add")}
            </Button>
          </div>

          <Button type="submit" className="w-full" disabled={uploading}>
            {uploading ? t("loading") || "Loading..." : t("save")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
