"use client";

import { useState, useEffect } from "react";
import {
  fetchStatistics,
  createStatistics as createStatisticsApi,
  updateStatistics as updateStatisticsApi,
  deleteStatistics as deleteStatisticsApi,
} from "@/lib/api";
import { toast } from "sonner";
// import { toast } from "@/components/ui/use-toast";

export const useStatistics = () => {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const statistics = await fetchStatistics();
        setData(statistics);
        setError(null);
      } catch (err: any) {
        setError(err);
        toast.error(err.message || "Statistikani yuklashda xatolik yuz berdi.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const createStatistics = async (statisticsData: any) => {
    setIsCreating(true);
    try {
      const newStatistics = await createStatisticsApi(statisticsData);
      setData(newStatistics);
      toast.info("Yangi statistika muvaffaqiyatli yaratildi.");
      return newStatistics;
    } catch (err: any) {
      setError(err);
      toast.error(err.message || "Statistikani yaratishda xatolik yuz berdi.");
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const updateStatistics = async (id: string, statisticsData: any) => {
    setIsUpdating(true);
    try {
      const updatedStatistics = await updateStatisticsApi(id, statisticsData);
      setData(updatedStatistics);
      toast.success("Statistika ma'lumotlari muvaffaqiyatli yangilandi.");
      return updatedStatistics;
    } catch (err: any) {
      setError(err);
      toast.error(err.message || "Statistikani yangilashda xatolik yuz berdi.");
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteStatistics = async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteStatisticsApi(id);
      setData(null);
      toast.success("Statistika muvaffaqiyatli o'chirildi.");
    } catch (err: any) {
      setError(err);
      toast.error(err.message || "Statistikani o'chirishda xatolik yuz berdi.");
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    createStatistics,
    isCreating,
    updateStatistics,
    isUpdating,
    deleteStatistics,
    isDeleting,
  };
};
