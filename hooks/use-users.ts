"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchUsers, fetchUserById, updateUser, deleteUser } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

export function useUsers() {
  const queryClient = useQueryClient()

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast({
        title: "Foydalanuvchi yangilandi",
        description: "Foydalanuvchi ma'lumotlari muvaffaqiyatli yangilandi.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik yuz berdi",
        description: error.message || "Foydalanuvchini yangilashda xatolik yuz berdi.",
        variant: "destructive",
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast({
        title: "Foydalanuvchi o'chirildi",
        description: "Foydalanuvchi muvaffaqiyatli o'chirildi.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik yuz berdi",
        description: error.message || "Foydalanuvchini o'chirishda xatolik yuz berdi.",
        variant: "destructive",
      })
    },
  })

  return {
    data,
    isLoading,
    error,
    updateUser: (id: string, data: any) => updateMutation.mutate({ id, data }),
    deleteUser: (id: string) => deleteMutation.mutate(id),
  }
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => fetchUserById(id),
    enabled: !!id,
  })
}
