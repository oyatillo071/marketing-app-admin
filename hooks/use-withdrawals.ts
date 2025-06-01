"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchWithdrawals,
  processWithdrawal,
  rejectWithdrawal,
} from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { useRef } from "react";

export function useWithdrawals() {
  const queryClient = useQueryClient();
  const triedRef = useRef(false);

  const {
    data: rawData = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["withdrawals"],
    queryFn: async () => {
      if (triedRef.current) return [];
      const data = await fetchWithdrawals();
      // Transform backend response to Withdrawal[]
      return data.map((item: any) => ({
        id: String(item.id),
        user: {
          id: String(item.user.id),
          name: item.user.name,
          initials: item.user.name
            .split(" ")
            .map((n: string) => n[0])
            .join(""),
        },
        amount: item.how_much,
        cardNumber: item.card || "",
        status:
          item.status === "SENDING"
            ? "Kutilmoqda"
            : item.status === "CANCELLED"
            ? "Rad etilgan"
            : "To'langan",
        date: item.to_send_date,
        reason: item.reason || "",
        processedBy: undefined, // Agar admin ma'lumotlari bo'lsa, shu yerda to'ldiring
      }));
    },
  });

  const processMutation = useMutation({
    mutationFn: processWithdrawal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      toast({
        title: "To'lov amalga oshirildi",
        description: "Pul yechib olish arizasi muvaffaqiyatli to'landi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik yuz berdi",
        description:
          error.message || "To'lovni amalga oshirishda xatolik yuz berdi.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectWithdrawal(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      toast({
        title: "Ariza rad etildi",
        description: "Pul yechib olish arizasi rad etildi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik yuz berdi",
        description: error.message || "Arizani rad etishda xatolik yuz berdi.",
        variant: "destructive",
      });
    },
  });

  if (error) {
    return {
      data: [],
      isLoading: false,
      error,
      processWithdrawal: () => {},
      rejectWithdrawal: () => {},
    };
  }

  return {
    data: rawData,
    isLoading,
    error,
    processWithdrawal: (id: string) => processMutation.mutate(id),
    rejectWithdrawal: (id: string, reason: string) =>
      rejectMutation.mutate({ id, reason }),
  };
}
