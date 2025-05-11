"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { TariffsTable } from "@/components/tariffs/tariffs-table";
import { Download, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useTariffs } from "@/hooks/use-tariffs";
import { exportToPDF } from "@/lib/pdf-export";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function TariffsPage() {
  const { t } = useLanguage();
  const { data: tariffs, createTariff } = useTariffs();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTariff, setNewTariff] = useState({
    name: "",
    price: "",
    description: "",
  });

  const handleExport = () => {
    const columns = [
      { header: t("id"), accessor: "id" },
      { header: t("name"), accessor: "name" },
      { header: t("price"), accessor: "price" },
      { header: t("description"), accessor: "description" },
      { header: t("status"), accessor: "status" },
    ];

    exportToPDF(tariffs, columns, t("tariffs"), "tariffs-export");
  };

  const handleAddTariff = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API to add the tariff
    createTariff({
      name: newTariff.name,
      price: Number.parseFloat(newTariff.price),
      description: newTariff.description,
      features: [],
    });
    setIsAddDialogOpen(false);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col  gap-4 justify-between">
        <h2 className="md:text-3xl text-2xl font-bold tracking-tight">
          {t("tariffs")}
        </h2>
        <div className="grid grid-cols-2 items-center gap-4">
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

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("add")} {t("tariff")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTariff}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  {t("name")}
                </Label>
                <Input
                  id="name"
                  value={newTariff.name}
                  onChange={(e) =>
                    setNewTariff({ ...newTariff, name: e.target.value })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  {t("price")}
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newTariff.price}
                  onChange={(e) =>
                    setNewTariff({ ...newTariff, price: e.target.value })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  {t("description")}
                </Label>
                <Input
                  id="description"
                  value={newTariff.description}
                  onChange={(e) =>
                    setNewTariff({ ...newTariff, description: e.target.value })
                  }
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{t("save")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
