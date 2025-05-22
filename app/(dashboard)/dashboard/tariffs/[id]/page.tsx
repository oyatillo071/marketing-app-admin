"use client";
import { useRouter } from "next/router";
import { useTariffs } from "@/hooks/use-tariffs";
import { useLanguage } from "@/contexts/language-context";

export default function TariffDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: tariffsRaw } = useTariffs();
  const { t } = useLanguage();

  const tariff = tariffsRaw?.find((t: any) => t.id == id);

  if (!tariff) return <div>{t("loading")}</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">{t("tariffDetails")}</h1>
      <div className="mb-2">
        <b>ID:</b> {tariff.id}
      </div>
      <div className="mb-2">
        <b>{t("term")}:</b> {tariff.term}
      </div>
      <div className="mb-2">
        <b>{t("referral_bonus")}:</b> {tariff.referral_bonus}
      </div>
      <div className="mb-2">
        <b>{t("createdAt")}:</b> {tariff.createdAt}
      </div>
      <div className="mb-2">
        <b>{t("prices")}:</b>
        <ul>
          {tariff.prices?.map((p: any) => (
            <li key={p.currency}>
              {p.value} {p.currency}
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-2">
        <b>{t("translations")}:</b>
        <ul>
          {tariff.translations?.map((tr: any) => (
            <li key={tr.language}>
              <b>{tr.language}:</b> {tr.name || "-"} / {tr.description || "-"}
            </li>
          ))}
        </ul>
      </div>
      <button className="mt-4" onClick={() => router.back()}>
        {t("back")}
      </button>
    </div>
  );
}
