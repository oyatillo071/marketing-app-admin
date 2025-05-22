"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPayments } from "@/lib/api";

export function usePayments() {
  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["payments"],
    queryFn: fetchPayments,
  });

  return {
    data,
    isLoading,
    error,
  };
}
