"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchNotifications, sendNotification } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

export function useNotifications() {
  const queryClient = useQueryClient()

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  })

  const sendMutation = useMutation({
    mutationFn: sendNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      toast({
        title: "Bildirishnoma yuborildi",
        description: "Bildirishnoma muvaffaqiyatli yuborildi.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik yuz berdi",
        description: error.message || "Bildirishnomani yuborishda xatolik yuz berdi.",
        variant: "destructive",
      })
    },
  })

  return {
    data,
    isLoading,
    error,
    sendNotification: (data: any) => sendMutation.mutate(data),
  }
}
