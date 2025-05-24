"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchNotifications, sendNotification } from "@/lib/api";
import { toast } from "sonner";

export function useNotifications() {
  const queryClient = useQueryClient();

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  const sendMutation = useMutation({
    mutationFn: (data: any) => sendNotification(data, ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Bildirishnoma muvaffaqiyatli yuborildi.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Bildirishnomani yuborishda xatolik yuz berdi.");
    },
  });

  const sendAllMutation = useMutation({
    mutationFn: (data: any) => sendNotification(data, "all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Barcha foydalanuvchilarga yuborildi.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Barchaga yuborishda xatolik yuz berdi.");
    },
  });

  return {
    data,
    isLoading,
    error,
    sendNotification: (data: any) => sendMutation.mutateAsync(data),
    sendNotificationAll: (data: any) => sendAllMutation.mutateAsync(data),
  };
}
