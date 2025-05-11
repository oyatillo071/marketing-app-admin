"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchSettings, updateSettings } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

export function useSettings() {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  })

  const updateMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] })
      toast({
        title: "Sozlamalar yangilandi",
        description: "Sozlamalar muvaffaqiyatli yangilandi.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik yuz berdi",
        description: error.message || "Sozlamalarni yangilashda xatolik yuz berdi.",
        variant: "destructive",
      })
    },
  })

  return {
    data,
    isLoading,
    error,
    updateSettings: (data: any) => updateMutation.mutate(data),
  }
}
