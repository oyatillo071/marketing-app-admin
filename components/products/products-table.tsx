// import { useProducts } from "@/hooks/use-products";

import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { use, useState } from "react";
import { ProductFormDialog } from "./product-form-dialog";
import { useProducts } from "@/hooks/use-products";

export function ProductsTable() {
  const { t, language } = useLanguage();
  const { data, updateProduct, deleteProduct } = useProducts();
  const [editDialog, setEditDialog] = useState({ open: false, product: null });

  if (!data) return <div>{t("loading")}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border">
        <thead>
          <tr>
            <th>{t("id")}</th>
            <th>{t("name")}</th>
            <th>{t("price")}</th>
            <th>{t("rating")}</th>
            <th>{t("rewiev")}</th>
            <th>{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((product: any) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>
                {product.translations?.find(
                  (tr: any) => tr.language === language
                )?.name || product.translations?.[0]?.name}
              </td>
              <td>
                {product.prices?.[0]?.value} {product.prices?.[0]?.currency}
              </td>
              <td>{product.rating}</td>
              <td>{product.rewiev}</td>
              <td>
                <Button
                  size="sm"
                  onClick={() => setEditDialog({ open: true, product })}
                  className="mr-2"
                >
                  {t("edit")}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteProduct(product.id)}
                >
                  {t("delete")}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editDialog.open && (
        <ProductFormDialog
          open={editDialog.open}
          onOpenChange={() => setEditDialog({ open: false, product: null })}
          onSubmit={async (data: any) => {
            if (editDialog.product) {
              await updateProduct(editDialog?.product?.id, data);
              setEditDialog({ open: false, product: null });
            }
          }}
          initialData={editDialog.product}
        />
      )}
    </div>
  );
}
