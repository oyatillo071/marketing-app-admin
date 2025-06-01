"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUserPayments,
  fetchPayments,
  fetchPaymentById,
  fetchPaymentsByStatus,
  checkPayment,
} from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

export function useUserPayments() {
  return useQuery({ queryKey: ["userPayments"], queryFn: fetchUserPayments });
}

export function usePayments() {
  return useQuery({ queryKey: ["payments"], queryFn: fetchPayments });
}

export function usePaymentById(id: string | number) {
  return useQuery({
    queryKey: ["payment", id],
    queryFn: () => fetchPaymentById(id),
    enabled: !!id,
  });
}

export function usePaymentsByStatus(status: string) {
  return useQuery({
    queryKey: ["payments", "status", status],
    queryFn: () => fetchPaymentsByStatus(status),
    enabled: !!status,
  });
}

export function useCheckPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast({ title: "To'lov tasdiqlandi" });
    },
    onError: () => {
      toast({
        title: "Xatolik",
        description: "To'lovni tasdiqlashda xatolik",
        variant: "destructive",
      });
    },
  });
}
