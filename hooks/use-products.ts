import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

export function useProducts() {
  const queryClient = useQueryClient();

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Mahsulot yaratildi",
        description: "Yangi mahsulot muvaffaqiyatli yaratildi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik yuz berdi",
        description:
          error.message || "Mahsulotni yaratishda xatolik yuz berdi.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Mahsulot yangilandi",
        description: "Mahsulot ma'lumotlari muvaffaqiyatli yangilandi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik yuz berdi",
        description:
          error.message || "Mahsulotni yangilashda xatolik yuz berdi.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Mahsulot o'chirildi",
        description: "Mahsulot muvaffaqiyatli o'chirildi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik yuz berdi",
        description:
          error.message || "Mahsulotni o'chirishda xatolik yuz berdi.",
        variant: "destructive",
      });
    },
  });

  return {
    data,
    isLoading,
    error,
    createProduct: (data: any) => createMutation.mutate(data),
    updateProduct: (id: string, data: any) =>
      updateMutation.mutate({ id, data }),
    deleteProduct: (id: string) => deleteMutation.mutate(id),
  };
}
