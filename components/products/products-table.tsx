import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ProductFormDialog } from "./product-form-dialog";
import { useProducts } from "@/hooks/use-products";
import { PencilIcon, Trash2 } from "lucide-react";

export function ProductsTable() {
  const { t, language } = useLanguage();
  const { data, updateProduct, deleteProduct } = useProducts();
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    product: any | null;
  }>({ open: false, product: null });

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    productId: string | null;
  }>({ open: false, productId: null });

  const handleDelete = async () => {
    if (confirmDialog.productId) {
      await deleteProduct(confirmDialog.productId);
      setConfirmDialog({ open: false, productId: null });
    }
  };

  if (!data) return <div className="text-center py-10">{t("loading")}</div>;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full table-auto text-sm text-left">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="px-4 py-2">{t("id")}</th>
            <th className="px-4 py-2">{t("name")}</th>
            <th className="px-4 py-2">{t("price")}</th>
            <th className="px-4 py-2">{t("rating")}</th>
            <th className="px-4 py-2">{t("rewiev")}</th>
            <th className="px-4 py-2 text-center">{t("actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((product: any) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="px-4 py-2">{product.id}</td>
              <td className="px-4 py-2">
                {product.translations?.find(
                  (tr: any) => tr.language === language
                )?.name || product.translations?.[0]?.name}
              </td>
              <td className="px-4 py-2">
                {product.prices
                  ?.map((p: any) => `${p.value} ${p.currency}`)
                  .join(", ")}
              </td>
              <td className="px-4 py-2">{product.rating}</td>
              <td className="px-4 py-2">{product.rewiev}</td>
              <td className="px-4 py-2 flex justify-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditDialog({ open: true, product })}
                >
                  <PencilIcon className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() =>
                    setConfirmDialog({ open: true, productId: product.id })
                  }
                >
                  <Trash2 className="w-4 h-4" />
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
            if (editDialog.product?.id) {
              await updateProduct(String(editDialog.product.id), data);
              setEditDialog({ open: false, product: null });
            }
          }}
          initialData={editDialog.product}
        />
      )}

      {confirmDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">{t("confirmDelete")}</h2>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setConfirmDialog({ open: false, productId: null })}
              >
                {t("cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                {t("delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}