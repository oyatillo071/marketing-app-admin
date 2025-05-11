"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchStatistics } from "@/lib/api"

export function useStatistics() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["statistics"],
    queryFn: fetchStatistics,
  })

  return {
    data,
    isLoading,
    error,
  }
}
