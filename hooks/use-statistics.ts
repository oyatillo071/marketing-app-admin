
"use client";

import {
  fetchStatistics,
  createStatistics as createStatisticsApi,
  updateStatistics as updateStatisticsApi,
  deleteStatistics as deleteStatisticsApi,
} from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useStatistics = () => {
  const queryClient = useQueryClient();

  // Fetch
  const { data, isLoading, error } = useQuery({
    queryKey: ["statistics"],
    queryFn: fetchStatistics,
  });

  // Create
  const createMutation = useMutation({
    mutationFn: createStatisticsApi,
    onSuccess: () => {
      toast.success("Statistika yaratildi");
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
    onError: () => {
      toast.error("Statistika yaratishda xatolik");
    },
  });

  // Update
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateStatisticsApi(id, data),
    onSuccess: () => {
      toast.success("Statistika yangilandi");
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
    onError: () => {
      toast.error("Statistika yangilashda xatolik");
    },
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteStatisticsApi(id),
    onSuccess: () => {
      toast.success("Statistika o‘chirildi");
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
    onError: () => {
      toast.error("Statistikani o‘chirishda xatolik");
    },
  });

  return {
    data,
    isLoading,
    error,
    createStatistics: createMutation.mutateAsync,
    updateStatistics: updateMutation.mutateAsync,
    deleteStatistics: deleteMutation.mutateAsync,
  };
};