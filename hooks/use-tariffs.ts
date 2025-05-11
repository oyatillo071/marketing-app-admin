"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchTariffs, createTariff, updateTariff, deleteTariff } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

export function useTariffs() {
  const queryClient = useQueryClient()

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tariffs"],
    queryFn: fetchTariffs,
  })

  const createMutation = useMutation({
    mutationFn: createTariff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tariffs"] })
      toast({
        title: "Tarif yaratildi",
        description: "Yangi tarif muvaffaqiyatli yaratildi.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik yuz berdi",
        description: error.message || "Tarifni yaratishda xatolik yuz berdi.",
        variant: "destructive",
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateTariff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tariffs"] })
      toast({
        title: "Tarif yangilandi",
        description: "Tarif ma'lumotlari muvaffaqiyatli yangilandi.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik yuz berdi",
        description: error.message || "Tarifni yangilashda xatolik yuz berdi.",
        variant: "destructive",
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTariff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tariffs"] })
      toast({
        title: "Tarif o'chirildi",
        description: "Tarif muvaffaqiyatli o'chirildi.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik yuz berdi",
        description: error.message || "Tarifni o'chirishda xatolik yuz berdi.",
        variant: "destructive",
      })
    },
  })

  return {
    data,
    isLoading,
    error,
    createTariff: (data: any) => createMutation.mutate(data),
    updateTariff: (id: string, data: any) => updateMutation.mutate({ id, data }),
    deleteTariff: (id: string) => deleteMutation.mutate(id),
  }
}
