"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchWithdrawals, processWithdrawal, rejectWithdrawal } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

export function useWithdrawals() {
  const queryClient = useQueryClient()

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["withdrawals"],
    queryFn: fetchWithdrawals,
  })

  const processMutation = useMutation({
    mutationFn: processWithdrawal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] })
      toast({
        title: "To'lov amalga oshirildi",
        description: "Pul yechib olish arizasi muvaffaqiyatli to'landi.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik yuz berdi",
        description: error.message || "To'lovni amalga oshirishda xatolik yuz berdi.",
        variant: "destructive",
      })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectWithdrawal(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] })
      toast({
        title: "Ariza rad etildi",
        description: "Pul yechib olish arizasi rad etildi.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik yuz berdi",
        description: error.message || "Arizani rad etishda xatolik yuz berdi.",
        variant: "destructive",
      })
    },
  })

  return {
    data,
    isLoading,
    error,
    processWithdrawal: (id: string) => processMutation.mutate(id),
    rejectWithdrawal: (id: string, reason: string) => rejectMutation.mutate({ id, reason }),
  }
}
