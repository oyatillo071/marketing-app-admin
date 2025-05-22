"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Plus, FileText } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { exportToPDF } from "@/lib/pdf-export";
import { ProductsTable } from "@/components/products/products-table";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { useProducts } from "@/hooks/use-products";

export default function ProductsPage() {
  const { t } = useLanguage();
  const { data: products, createProduct } = useProducts();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleExport = () => {
    if (!products) return;

    const columns = [
      { header: t("id"), accessor: "id" },
      { header: t("name"), accessor: "name" },
      { header: t("price"), accessor: "price" },
      { header: t("rating"), accessor: "rating" },
      { header: t("rewiev"), accessor: "rewiev" },
      { header: t("description"), accessor: "description" },
    ];

    exportToPDF(products, columns, t("products"), "products-export");
  };

  const handleAddProduct = (data: any) => {
    createProduct(data);
    setIsAddDialogOpen(false);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col gap-4">
        <h2 className="md:text-3xl text-2xl font-bold tracking-tight">
          {t("products")}
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
          <Button
            size="sm"
            className="bg-button-bg hover:bg-button-hover"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("addProduct")}
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">{t("allProducts")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("productsDescription")}
        </p>
      </div>

      <ProductsTable />

      <ProductFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddProduct}
      />
    </div>
  );
}
