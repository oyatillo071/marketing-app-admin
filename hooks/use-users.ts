"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUsers, fetchUserById, updateUser, deleteUser } from "@/lib/api";
import { toast } from "sonner";
// import { toast } from "@/components/ui/use-toast";

export function useUsers() {
  const queryClient = useQueryClient();

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.info("Foydalanuvchi yangilandi");
    },
    onError: (error: any) => {
      toast(error.message || "Foydalanuvchini yangilashda xatolik yuz berdi.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Foydalanuvchi muvaffaqiyatli o'chirildi.");
    },
    onError: (error: any) => {
      toast.error(
        error.message || "Foydalanuvchini o'chirishda xatolik yuz berdi."
      );
    },
  });

  return {
    data,
    isLoading,
    error,
    updateUser: (id: string, data: any) => updateMutation.mutate({ id, data }),
    deleteUser: (id: any) => deleteMutation.mutate(id),
  };
}

export function useUser(id: string | any) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => fetchUserById(id),
    enabled: !!id,
  });
}
