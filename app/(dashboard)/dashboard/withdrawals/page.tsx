"use client";

import { Button } from "@/components/ui/button";
import { WithdrawalsTable } from "@/components/withdrawals/withdrawals-table";
import { Download } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useWithdrawals } from "@/hooks/use-withdrawals";
import { exportToPDF } from "@/lib/pdf-export";

export default function WithdrawalsPage() {
  const { t } = useLanguage();
  const { data: withdrawals } = useWithdrawals();

  const handleExport = () => {
    const columns = [
      { header: t("id"), accessor: "id" },
      { header: t("name"), accessor: "user.name" },
      { header: t("amount"), accessor: "amount" },
      { header: t("cardNumber"), accessor: "cardNumber" },
      { header: t("status"), accessor: "status" },
      { header: t("date"), accessor: "date" },
    ];

    exportToPDF(withdrawals, columns, t("withdrawals"), "withdrawals-export");
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          {t("withdrawals")}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            {t("downloadPDF")}
          </Button>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium">{t("allWithdrawals")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("withdrawalsDescription")}
        </p>
      </div>
      <WithdrawalsTable />
    </div>
  );
}
