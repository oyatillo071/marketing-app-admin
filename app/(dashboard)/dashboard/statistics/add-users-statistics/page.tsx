"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getRandomUser, getRandomStatistics } from "@/lib/utils/statistics";
import { useStatistics } from "@/hooks/use-statistics";
import { useLanguage } from "@/contexts/language-context";

export default function AddUsersStatisticsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { createStatistics } = useStatistics();

  const [form, setForm] = useState<any>({
    onlineUserCount: "",
    totalEarned: "",
    statEarnings: [{ currency: "", amount: "" }],
    recentUsers: [],
  });

  // Qo'lda fieldlarni boshqarish
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx?: number) => {
    const { name, value } = e.target;
    if (name.startsWith("statEarnings")) {
      const statEarnings = [...form.statEarnings];
      statEarnings[idx!] = { ...statEarnings[idx!], [name.split(".")[1]]: value };
      setForm({ ...form, statEarnings });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // StatEarnings qatorini qo'shish
  const handleAddStatEarning = () => {
    setForm({ ...form, statEarnings: [...form.statEarnings, { currency: "", amount: "" }] });
  };

  // Recent user qo'shish (random)
  const handleAddRandomUser = () => {
    setForm((prev: any) => ({
      ...prev,
      recentUsers: [...(prev.recentUsers || []), getRandomUser()],
    }));
  };

  // Recent userni qo'lda qo'shish
  const handleAddManualUser = () => {
    setForm((prev: any) => ({
      ...prev,
      recentUsers: [
        ...(prev.recentUsers || []),
        { email: "", userEarnings: [{ currency: "", amount: "" }] },
      ],
    }));
  };

  // Recent user fieldlarini boshqarish
  const handleRecentUserChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    userIdx: number,
    earningIdx?: number
  ) => {
    const { name, value } = e.target;
    const recentUsers = [...form.recentUsers];
    if (name.startsWith("userEarnings")) {
      recentUsers[userIdx].userEarnings[earningIdx!] = {
        ...recentUsers[userIdx].userEarnings[earningIdx!],
        [name.split(".")[1]]: value,
      };
    } else {
      recentUsers[userIdx][name] = value;
    }
    setForm({ ...form, recentUsers });
  };

  // Recent user earning qo'shish
  const handleAddUserEarning = (userIdx: number) => {
    const recentUsers = [...form.recentUsers];
    recentUsers[userIdx].userEarnings.push({ currency: "", amount: "" });
    setForm({ ...form, recentUsers });
  };

  // To'liq random statistikani to'ldirish
  const handleRandomAll = () => {
    setForm(getRandomStatistics());
  };

  // Statistika yaratish
  const handleCreate = async () => {
    const prepared = {
      ...form,
      onlineUserCount: Number(form.onlineUserCount),
      totalEarned: form.totalEarned,
      statEarnings: form.statEarnings.map((s: any) => ({
        currency: s.currency,
        amount: s.amount,
      })),
      recentUsers: form.recentUsers.map((u: any) => ({
        email: u.email,
        userEarnings: u.userEarnings.map((e: any) => ({
          currency: e.currency,
          amount: e.amount,
        })),
      })),
    };
    await createStatistics(prepared);
    router.back();
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl sm:text-2xl font-bold">{t("addUserStatistics") || "Foydalanuvchi statistikasi qo‘shish"}</h2>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => router.back()}>
            {t("back") || "Orqaga"}
          </Button>
          <Button variant="secondary" onClick={handleRandomAll}>
            {t("randomFill") || "To‘liq random to‘ldirish"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        <div>
          <label className="block mb-1 font-medium">{t("onlineUserCount") || "Online foydalanuvchilar soni"}</label>
          <Input
            name="onlineUserCount"
            type="number"
            value={form.onlineUserCount}
            onChange={handleChange}
            placeholder={t("onlineUserCountPlaceholder") || "Masalan: 100"}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">{t("totalEarned") || "Jami daromad"}</label>
          <Input
            name="totalEarned"
            value={form.totalEarned}
            onChange={handleChange}
            placeholder={t("totalEarnedPlaceholder") || "Masalan: 2750"}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">{t("statEarnings") || "Statistik daromadlar"}</label>
          {form.statEarnings.map((s: any, idx: number) => (
            <div key={idx} className="flex gap-2 mb-2 flex-wrap">
              <Input
                name="statEarnings.currency"
                value={s.currency}
                onChange={e => handleChange(e, idx)}
                placeholder={t("currency") || "Valyuta (UZS, USD...)"}
                className="w-1/2 min-w-[120px]"
              />
              <Input
                name="statEarnings.amount"
                value={s.amount}
                onChange={e => handleChange(e, idx)}
                placeholder={t("amount") || "Miqdor"}
                className="w-1/2 min-w-[120px]"
              />
            </div>
          ))}
          <Button type="button" size="sm" onClick={handleAddStatEarning}>
            + {t("addEarningRow") || "Daromad qatori"}
          </Button>
        </div>
        <div>
          <label className="block mb-1 font-medium">{t("recentUsers") || "Recent foydalanuvchilar"}</label>
          <div className="flex gap-2 mb-2 flex-wrap">
            <Button type="button" size="sm" onClick={handleAddRandomUser}>
              {t("randomUser") || "Random user"}
            </Button>
            <Button type="button" size="sm" onClick={handleAddManualUser}>
              {t("manualUser") || "Qo‘lda user"}
            </Button>
          </div>
          {form.recentUsers.map((u: any, userIdx: number) => (
            <div key={userIdx} className="border rounded p-2 mb-2 space-y-2 bg-gray-50">
              <Input
                name="email"
                value={u.email}
                onChange={e => handleRecentUserChange(e, userIdx)}
                placeholder={t("email") || "Email"}
                className="mb-1"
              />
              <div className="pl-2">
                <label className="block mb-1 text-sm">{t("userEarnings") || "User earnings"}</label>
                {u.userEarnings.map((e: any, earningIdx: number) => (
                  <div key={earningIdx} className="flex gap-2 mb-1 flex-wrap">
                    <Input
                      name="userEarnings.currency"
                      value={e.currency}
                      onChange={ev => handleRecentUserChange(ev, userIdx, earningIdx)}
                      placeholder={t("currency") || "Valyuta"}
                      className="w-1/2 min-w-[100px]"
                    />
                    <Input
                      name="userEarnings.amount"
                      value={e.amount}
                      onChange={ev => handleRecentUserChange(ev, userIdx, earningIdx)}
                      placeholder={t("amount") || "Miqdor"}
                      className="w-1/2 min-w-[100px]"
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  size={"sm"}
                  variant="outline"
                  onClick={() => handleAddUserEarning(userIdx)}
                >
                  + {t("addEarning") || "Earning"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button className="w-full" onClick={handleCreate}>
        {t("createStatistics") || "Statistika yaratish"}
      </Button>
    </div>
  );
}