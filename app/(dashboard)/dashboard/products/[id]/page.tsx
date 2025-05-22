"use client";

import { useParams, useRouter } from "next/navigation";
import { useProducts } from "@/hooks/use-products";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";

export default function ProductDetailsPage() {
  const params = useParams();
  const id = (() => {
    if (!params || !params.id) return "";
    if (typeof params.id === "string") return params.id;
    if (Array.isArray(params.id)) return params.id[0];
    return "";
  })();

  const router = useRouter();
  const { data: products, updateProduct } = useProducts();
  const product = products?.find((p: any) => String(p.id) === String(id));
  const [editOpen, setEditOpen] = useState(false);

  if (!product) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">
          {product.translations?.[0]?.name || "Product"}
        </h2>
        <Button onClick={() => setEditOpen(true)}>Edit</Button>
      </div>
      <div className="flex flex-wrap gap-3 mb-4">
        {product.photo_url?.map((p: any, i: number) =>
          p.photo_url ? (
            <Image
              key={i}
              src={p.photo_url}
              alt="product"
              width={120}
              height={120}
              className="rounded border object-cover"
            />
          ) : null
        )}
      </div>
      <div className="mb-2">
        <b>ID:</b> {product.id}
      </div>
      <div className="mb-2">
        <b>Rating:</b> {product.rating}
      </div>
      <div className="mb-2">
        <b>Review:</b> {product.rewiev}
      </div>
      <div className="mb-2">
        <b>Prices:</b>{" "}
        {product.prices?.map((p: any) => `${p.value} ${p.currency}`).join(", ")}
      </div>
      <div className="mb-2">
        <b>Description:</b> {product.translations?.[0]?.description}
      </div>
      {/* Qo‘shimcha maydonlar ham shu yerda chiqishi mumkin */}
      <Button variant="outline" className="mt-4" onClick={() => router.back()}>
        Back
      </Button>

      <ProductFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={async (data: any) => {
          await updateProduct(product.id, data);
          setEditOpen(false);
        }}
        initialData={product}
      />
    </div>
  );
}
