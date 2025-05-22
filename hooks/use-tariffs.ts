"use client";

import {
  fetchTariffs,
  createTariff as createTariffApi,
  updateTariff as updateTariffApi,
  deleteTariff as deleteTariffApi,
} from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useTariffs = () => {
  const queryClient = useQueryClient();

  // Fetch tariffs
  const { data, isLoading, error } = useQuery({
    queryKey: ["tariffs"],
    queryFn: fetchTariffs,
  });

  // Create
  const createMutation = useMutation({
    mutationFn: createTariffApi,
    onSuccess: () => {
      toast.success("Tarif muvaffaqiyatli yaratildi");
      queryClient.invalidateQueries({ queryKey: ["tariffs"] });
    },
    onError: () => {
      toast.error("Tarif yaratishda xatolik yuz berdi");
    },
  });

  // Update
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateTariffApi(id, data),
    onSuccess: () => {
      toast.success("Tarif yangilandi");
      queryClient.invalidateQueries({ queryKey: ["tariffs"] });
    },
    onError: () => {
      toast.error("Tarif yangilashda xatolik yuz berdi");
    },
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTariffApi(id),
    onSuccess: () => {
      toast.success("Tarif o‘chirildi");
      queryClient.invalidateQueries({ queryKey: ["tariffs"] });
    },
    onError: () => {
      toast.error("Tarifni o‘chirishda xatolik yuz berdi");
    },
  });

  return {
    data,
    isLoading,
    error,
    createTariff: createMutation.mutateAsync,
    updateTariff: updateMutation.mutateAsync,
    deleteTariff: deleteMutation.mutateAsync,
  };
};
