"use client";

import { useState, useEffect, useCallback } from "react";
import type { ServiceBenefitsData, ServiceType } from "../types";
// Sem fallback de mock; usa apenas dados da API ou estático
import { getServiceBenefitsDataClient } from "@/api/websites/components/service-benefits";

interface UseServiceBenefitsReturn {
  data: ServiceBenefitsData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook para buscar dados dos benefícios de serviço da API
 */
export function useServiceBenefits(
  service: ServiceType,
  fetchFromApi: boolean = true,
  staticData?: ServiceBenefitsData[],
): UseServiceBenefitsReturn {
  const [data, setData] = useState<ServiceBenefitsData[]>(staticData || []);
  const [isLoading, setIsLoading] = useState(fetchFromApi);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!fetchFromApi) {
      setData(staticData || []);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await getServiceBenefitsDataClient(service);
      const activeData = result
        .filter((item) => item.isActive)
        .sort((a, b) => a.order - b.order);

      setData(activeData || []);
    } catch (err) {
      console.error("Erro ao buscar dados dos benefícios de serviço:", err);
      setError(err instanceof Error ? `Erro na API: ${err.message}` : "Erro desconhecido.");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFromApi, service, staticData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
