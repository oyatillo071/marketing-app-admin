"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TariffsTable } from "@/components/tariffs/tariffs-table";
import { Download, Plus, FileText, FileBarChart } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useTariffs } from "@/hooks/use-tariffs";
import { exportToPDF, exportStatsToPDF } from "@/lib/pdf-export";
import { TariffFormDialog } from "@/components/tariffs/tariff-form-dialog";

export default function TariffsPage() {
  const { t, language } = useLanguage();
  const { data: tariffs, createTariff } = useTariffs();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleExport = () => {
    if (!tariffs) return; // Add this null check

    const columns = [
      { header: t("id"), accessor: "id" },
      { header: t("name"), accessor: "name" },
      { header: t("price"), accessor: "price" },
      { header: t("description"), accessor: "description" },
      { header: t("status"), accessor: "status" },
      { header: t("term"), accessor: "term" },
      { header: t("referralBonus"), accessor: "referral_bonus" },
    ];

    exportToPDF(tariffs, columns, t("tariffs"), "tariffs-export");
  };

  const handleAddTariff = (data: any) => {
    createTariff(data);
    setIsAddDialogOpen(false);
  };

  const handleExportStats = () => {
    if (!tariffs) return; // Add this null check

    // Rest of the function remains the same
    const stats = {
      summary: {
        totalTariffs: tariffs.length || 0,
        activeTariffs: tariffs.filter((t) => t.status === "Faol").length || 0,
        inactiveTariffs: tariffs.filter((t) => t.status !== "Faol").length || 0,
        averagePrice: tariffs.length
          ? (
              tariffs.reduce((sum, t) => sum + (t.prices?.[0]?.value || 0), 0) /
              tariffs.length
            ).toFixed(2)
          : 0,
      },
      distribution: {
        byTerm: {
          "30 days or less": tariffs.filter((t) => t.term <= 30).length || 0,
          "31-90 days":
            tariffs.filter((t) => t.term > 30 && t.term <= 90).length || 0,
          "91+ days": tariffs.filter((t) => t.term > 90).length || 0,
        },
      },
    };

    exportStatsToPDF(stats, t("tariffStatistics"), "tariffs-statistics");
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col gap-4">
        <h2 className="md:text-3xl text-2xl font-bold tracking-tight">
          {t("tariffs")}
        </h2>
        <div className="grid grid-cols-2 sm:flex items-center gap-4">
          <Button
            variant="outline"
            className="p-2"
            size="sm"
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            {t("downloadPDF")}
          </Button>
          <Button
            variant="outline"
            className="p-2"
            size="sm"
            onClick={() => window.print()}
          >
            <FileText className="mr-2 h-4 w-4" />
            {t("print")}
          </Button>
          {/* <Button
            variant="outline"
            className="p-2"
            size="sm"
            onClick={handleExportStats}
          >
            <FileBarChart className="mr-2 h-4 w-4" />
            {t("exportStats")}
          </Button> */}
          <Button
            size="sm"
            className="bg-button-bg hover:bg-button-hover"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("add")}
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">{t("allTariffs")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("tariffsDescription")}
        </p>
      </div>

      <TariffsTable />

      <TariffFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddTariff}
      />
    </div>
  );
}
