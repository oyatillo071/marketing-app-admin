import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { ProductFormDialog } from "./product-form-dialog";
import { useProducts } from "@/hooks/use-products";
import { PencilIcon, Trash2 } from "lucide-react";

const PAGE_SIZE = 10;

export function ProductsTable() {
  const { t, language } = useLanguage();
  const { data, updateProduct, deleteProduct } = useProducts();

  // Dialog state
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    product: any | null;
  }>({ open: false, product: null });
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    productId: string | null;
  }>({ open: false, productId: null });

  // Universal search state
  const [search, setSearch] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);

  // Universal search: id, nomi, narxi, reytingi, otzivi bo‘yicha
  const filteredData = useMemo(() => {
    let filtered = data || [];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((p: any) => {
        const name = (
          p.translations?.find((tr: any) => tr.language === language)?.name ||
          p.translations?.[0]?.name ||
          ""
        ).toLowerCase();
        const price = (
          p.prices?.map((pr: any) => String(pr.value)).join(" ") || ""
        ).toLowerCase();
        const rating = String(p.rating || "").toLowerCase();
        const rewiev = String(p.rewiev || "").toLowerCase();
        const id = String(p.id || "").toLowerCase();
        return (
          id.includes(q) ||
          name.includes(q) ||
          price.includes(q) ||
          rating.includes(q) ||
          rewiev.includes(q)
        );
      });
    }
    return filtered;
  }, [data, search, language]);

  // Pagination
  const pageCount = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = filteredData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handleDelete = async () => {
    if (confirmDialog.productId) {
      await deleteProduct(confirmDialog.productId);
      setConfirmDialog({ open: false, productId: null });
    }
  };

  if (!data) return <div className="text-center py-10">{t("loading")}</div>;

  return (
    <div className="overflow-x-auto rounded-lg border  shadow-sm p-4">
      {/* Universal search */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          className="border px-2 py-1 rounded"
          placeholder={
            t("search") ||
            "ID, nomi, narxi, reytingi yoki otzivi bo‘yicha qidirish"
          }
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <table className="min-w-full table-auto text-sm text-left">
        <thead >
          <tr className="mb-4">
            <th className="px-4 py-2">{t("id")}</th>
            <th className="px-4 py-2">{t("name")}</th>
            <th className="px-4 py-2">{t("price")}</th>
            <th className="px-4 py-2">{t("rating")}</th>
            <th className="px-4 py-2">{t("rewiev")}</th>
            <th className="px-4 py-2 text-center">{t("actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y ">
          {paginatedData.map((product: any) => (
            <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-4 py-2">{product.id}</td>
              <td className="px-4 py-2">
                {product.translations?.find(
                  (tr: any) => tr.language === language
                )?.name || product.translations?.[0]?.name}
              </td>
              <td className="px-4 py-2">
                {product?.coin ? product.coin:" - "}
                  
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

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span>
          {t("page") || "Sahifa"} {page} / {pageCount || 1}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            {t("prev") || "Oldingi"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page === pageCount || pageCount === 0}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
          >
            {t("next") || "Keyingi"}
          </Button>
        </div>
      </div>

      {/* Edit dialog */}
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

      {/* Delete confirm dialog */}
      {confirmDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">{t("confirmDelete")}</h2>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() =>
                  setConfirmDialog({ open: false, productId: null })
                }
              >
                {t("cancel")}
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                {t("delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
