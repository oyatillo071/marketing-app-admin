// "use client"

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
// import { fetchTariffs, createTariff, updateTariff, deleteTariff } from "@/lib/api"
// import { toast } from "@/components/ui/use-toast"

// export function useTariffs() {
//   const queryClient = useQueryClient()

//   const {
//     data = [],
//     isLoading,
//     error,
//   } = useQuery({
//     queryKey: ["tariffs"],
//     queryFn: fetchTariffs,
//   })

//   const createMutation = useMutation({
//     mutationFn: createTariff,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["tariffs"] })
//       toast({
//         title: "Tarif yaratildi",
//         description: "Yangi tarif muvaffaqiyatli yaratildi.",
//       })
//     },
//     onError: (error: any) => {
//       toast({
//         title: "Xatolik yuz berdi",
//         description: error.message || "Tarifni yaratishda xatolik yuz berdi.",
//         variant: "destructive",
//       })
//     },
//   })

//   const updateMutation = useMutation({
//     mutationFn: ({ id, data }: { id: string; data: any }) => updateTariff(id, data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["tariffs"] })
//       toast({
//         title: "Tarif yangilandi",
//         description: "Tarif ma'lumotlari muvaffaqiyatli yangilandi.",
//       })
//     },
//     onError: (error: any) => {
//       toast({
//         title: "Xatolik yuz berdi",
//         description: error.message || "Tarifni yangilashda xatolik yuz berdi.",
//         variant: "destructive",
//       })
//     },
//   })

//   const deleteMutation = useMutation({
//     mutationFn: deleteTariff,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["tariffs"] })
//       toast({
//         title: "Tarif o'chirildi",
//         description: "Tarif muvaffaqiyatli o'chirildi.",
//       })
//     },
//     onError: (error: any) => {
//       toast({
//         title: "Xatolik yuz berdi",
//         description: error.message || "Tarifni o'chirishda xatolik yuz berdi.",
//         variant: "destructive",
//       })
//     },
//   })

//   return {
//     data,
//     isLoading,
//     error,
//     createTariff: (data: any) => createMutation.mutate(data),
//     updateTariff: (id: string, data: any) => updateMutation.mutate({ id, data }),
//     deleteTariff: (id: string) => deleteMutation.mutate(id),
//   }
// }

"use client";

import { useState, useEffect } from "react";
import {
  fetchTariffs,
  createTariff as createTariffApi,
  updateTariff as updateTariffApi,
  deleteTariff as deleteTariffApi,
} from "@/lib/api";

export const useTariffs = () => {
  const [data, setData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const tariffs = await fetchTariffs();
        setData(tariffs);
        setError(null);
      } catch (err: any) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const createTariff = async (tariffData: any) => {
    try {
      const newTariff = await createTariffApi(tariffData);
      setData(data ? [...data, newTariff] : [newTariff]);
    } catch (err: any) {
      setError(err);
      throw err;
    }
  };

  const updateTariff = async (id: string, tariffData: any) => {
    try {
      const updatedTariff = await updateTariffApi(id, tariffData);
      setData(
        data
          ? data.map((tariff) => (tariff.id === id ? updatedTariff : tariff))
          : [updatedTariff]
      );
    } catch (err: any) {
      setError(err);
      throw err;
    }
  };

  const deleteTariff = async (id: string) => {
    try {
      await deleteTariffApi(id);
      setData(data ? data.filter((tariff) => tariff.id !== id) : []);
    } catch (err: any) {
      setError(err);
      throw err;
    }
  };

  return {
    data,
    isLoading,
    error,
    createTariff,
    updateTariff,
    deleteTariff,
  };
};
