"use client";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Trash2, Pencil, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import {
  apiProducts,
  uploadImage,
  addProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/api";
import { toast } from "sonner";

const LANGS = [
  { code: "uz", label: "O‘zbek" },
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
  { code: "kz", label: "Қазақша" },
  { code: "kg", label: "Кыргызча" },
  { code: "tj", label: "Тоҷикӣ" },
  { code: "cn", label: "中文" },
];
const CURRENCIES = ["UZS", "USD", "EUR", "RUB", "KZT", "KGS", "CNY"];

export default function ProductsPage() {
  const { t, lang } = useLanguage();
  const [products, setProducts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    term: "",
    referral_bonus: "",
    photo_url: "",
    translations: LANGS.map((l) => ({ language: l.code, title: "", body: "" })),
    prices: CURRENCIES.map((c) => ({ currency: c, value: "" })),
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const loadProducts = async () => {
    setLoading(true);
    const data = await apiProducts();
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.term) errs.term = t("required");
    if (!form.referral_bonus) errs.referral_bonus = t("required");
    form.translations.forEach((tr, i) => {
      if (!tr.title) errs[`title_${tr.language}`] = t("required");
      if (!tr.body) errs[`body_${tr.language}`] = t("required");
    });
    form.prices.forEach((pr, i) => {
      if (!pr.value || isNaN(pr.value))
        errs[`price_${pr.currency}`] = t("invalidPrice");
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // File tanlanganda file state-ga saqlanadi
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Fayl hajmi 5MB dan oshmasligi kerak!");
      return;
    }
    setSelectedFile(file);
  };

  // Submitda birinchi rasmni yuklash, keyin formni yuborish
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    let photo_url = form.photo_url;

    // Agar selectedFile bor bo‘lsa, upload qilib, natijani to‘liq URLga aylantiring
    if (selectedFile) {
      try {
        const img = await uploadImage(selectedFile);
        if (img.url) {
          photo_url = img.url;
        } else if (img.path) {
          photo_url = `${
            process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || ""
          }/${img.path.replace(/^\/+/, "")}`;
        }
      } catch (err) {
        toast.error("Rasm yuklashda xatolik!");
        return;
      }
    }

    // Qo‘shimcha qo‘shtirnoqlarni olib tashlash va undefined ni tozalash
    if (typeof photo_url === "string") {
      photo_url = photo_url.replace(/^"+|"+$/g, "");
    }
    if (!photo_url || photo_url === "undefined/uploads/undefined") {
      photo_url = "";
    }

    const payload = {
      term: Number(form.term),
      referral_bonus: Number(form.referral_bonus),
      photo_url: [photo_url], // bu yerda har doim to‘liq URL yoki bo‘sh string bo‘lishi kerak
      translations: form.translations,
      prices: form.prices.map((p) => ({ ...p, value: Number(p.value) })),
    };

    if (editId) {
      await updateProduct(editId, payload);
    } else {
      await addProduct(payload);
    }
    setForm({
      term: "",
      referral_bonus: "",
      photo_url: "",
      translations: LANGS.map((l) => ({
        language: l.code,
        title: "",
        body: "",
      })),
      prices: CURRENCIES.map((c) => ({ currency: c, value: "" })),
    });
    setSelectedFile(null);
    setEditId(null);
    setIsOpen(false);
    loadProducts();
  };

  const handleEdit = (product) => {
    // Remove extra quotes from photo_url if present
    let photo_url = product.photo_url;
    if (typeof photo_url === "string") {
      photo_url = photo_url.replace(/^"+|"+$/g, "");
    }
    setForm({
      term: product.term,
      referral_bonus: product.referral_bonus,
      photo_url,
      translations: LANGS.map((l) => {
        const tr = product.translations.find((t) => t.language === l.code);
        return {
          language: l.code,
          title: tr?.title || "",
          body: tr?.body || "",
        };
      }),
      prices: CURRENCIES.map((c) => {
        const pr = product.prices.find((p) => p.currency === c);
        return { currency: c, value: pr ? pr.value : "" };
      }),
    });
    setEditId(product.id);
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    await deleteProduct(id);
    loadProducts();
  };

  // Helper to get translation by current language
  const getTranslation = (product) => {
    return (
      product.translations.find((t) => t.language === lang) ||
      product.translations[0]
    );
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-bold">
          {t("products") || "Products"}
        </h2>
        <div className="flex gap-2">
          {/* Add Product Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditId(null);
              setForm({
                term: "",
                referral_bonus: "",
                photo_url: "",
                translations: LANGS.map((l) => ({
                  language: l.code,
                  title: "",
                  body: "",
                })),
                prices: CURRENCIES.map((c) => ({
                  currency: c,
                  value: "",
                })),
              });
              setIsOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("addProduct") || "Add Product"}
          </Button>
          {/* Edit Product Button (hidden, only for modal trigger) */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <span className="hidden" />
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editId
                    ? t("editProduct") || "Edit Product"
                    : t("addProduct") || "Add Product"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      placeholder={t("term") || "Term (days)"}
                      type="number"
                      value={form.term}
                      onChange={(e) =>
                        setForm({ ...form, term: e.target.value })
                      }
                    />
                    {errors.term && (
                      <p className="text-red-500 text-xs mt-1">{errors.term}</p>
                    )}
                  </div>
                  <div>
                    <Input
                      placeholder={t("referralBonus") || "Referral bonus"}
                      type="number"
                      value={form.referral_bonus}
                      onChange={(e) =>
                        setForm({ ...form, referral_bonus: e.target.value })
                      }
                    />
                    {errors.referral_bonus && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.referral_bonus}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {t("uploadPhoto") || "Upload Photo"}
                    </Button>
                    {form.photo_url && (
                      <img
                        src={
                          form.photo_url.startsWith("http")
                            ? form.photo_url
                            : `${
                                process.env.NEXT_PUBLIC_API_URL || ""
                              }/${form.photo_url.replace(/^undefined\//, "")}`
                        }
                        alt="Product"
                        className="w-16 h-16 object-cover rounded shadow"
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Max: 5MB, JPG/PNG
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    {t("translations") || "Translations"}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {form.translations.map((tr, idx) => (
                      <div
                        key={tr.language}
                        className="border rounded p-3 bg-muted/30"
                      >
                        <div className="font-medium mb-1">
                          {LANGS.find((l) => l.code === tr.language)?.label}
                        </div>
                        <Input
                          className="mb-1"
                          placeholder={t("title") || "Title"}
                          value={tr.title}
                          onChange={(e) => {
                            const arr = [...form.translations];
                            arr[idx].title = e.target.value;
                            setForm({ ...form, translations: arr });
                          }}
                        />
                        {errors[`title_${tr.language}`] && (
                          <p className="text-red-500 text-xs">
                            {errors[`title_${tr.language}`]}
                          </p>
                        )}
                        <Input
                          placeholder={t("description") || "Description"}
                          value={tr.body}
                          onChange={(e) => {
                            const arr = [...form.translations];
                            arr[idx].body = e.target.value;
                            setForm({ ...form, translations: arr });
                          }}
                        />
                        {errors[`body_${tr.language}`] && (
                          <p className="text-red-500 text-xs">
                            {errors[`body_${tr.language}`]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    {t("prices") || "Prices"}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {form.prices.map((pr, idx) => (
                      <div key={pr.currency} className="flex flex-col">
                        <label className="text-xs font-medium mb-1">
                          {pr.currency}
                        </label>
                        <Input
                          placeholder={t("price") || "Price"}
                          type="number"
                          value={pr.value}
                          onChange={(e) => {
                            const arr = [...form.prices];
                            arr[idx].value = e.target.value;
                            setForm({ ...form, prices: arr });
                          }}
                        />
                        {errors[`price_${pr.currency}`] && (
                          <p className="text-red-500 text-xs">
                            {errors[`price_${pr.currency}`]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setEditId(null);
                      setForm({
                        term: "",
                        referral_bonus: "",
                        photo_url: "",
                        translations: LANGS.map((l) => ({
                          language: l.code,
                          title: "",
                          body: "",
                        })),
                        prices: CURRENCIES.map((c) => ({
                          currency: c,
                          value: "",
                        })),
                      });
                    }}
                  >
                    {t("cancel") || "Cancel"}
                  </Button>
                  <Button type="submit">
                    {editId ? t("save") || "Save" : t("add") || "Add"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="overflow-x-auto rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>{t("photo") || "Photo"}</TableHead>
              <TableHead>{t("title") || "Title"}</TableHead>
              <TableHead>{t("term") || "Term"}</TableHead>
              <TableHead>{t("referralBonus") || "Referral Bonus"}</TableHead>
              <TableHead>{t("prices") || "Prices"}</TableHead>
              <TableHead>{t("actions") || "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <span className="animate-pulse">
                    {t("loading") || "Loading..."}
                  </span>
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {t("noProducts") || "No products found"}
                </TableCell>
              </TableRow>
            ) : (
              products.map((product, idx) => {
                const tr = getTranslation(product);
                return (
                  <TableRow key={product.id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      {product.photo_url &&
                      product.photo_url !== "undefined/uploads/undefined" ? (
                        <img
                          src={
                            product.photo_url.startsWith("http")
                              ? product.photo_url
                              : `${
                                  process.env.NEXT_PUBLIC_API_URL || ""
                                }/${product.photo_url.replace(
                                  /^undefined\//,
                                  ""
                                )}`
                          }
                          alt={tr.title}
                          className="w-16 h-16 object-cover rounded shadow"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                          {t("noPhoto") || "No photo"}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">{tr.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {tr.body}
                      </div>
                    </TableCell>
                    <TableCell>{product.term}</TableCell>
                    <TableCell>{product.referral_bonus}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.prices.map((pr) => (
                          <span
                            key={pr.currency}
                            className="inline-block bg-primary/10 dark:bg-primary/20 text-primary px-2 py-0.5 rounded text-xs"
                          >
                            {pr.value} {pr.currency}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(product)}
                          title={t("edit") || "Edit"}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(product.id)}
                          title={t("delete") || "Delete"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
