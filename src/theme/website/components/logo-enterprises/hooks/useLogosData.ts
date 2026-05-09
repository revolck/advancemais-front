"use client";

import { useState, useEffect, useCallback } from "react";
import { listLogoEnterprises } from "@/api/websites/components/logo-enterprises";
import { mapLogoEnterpriseResponsesToLogoData } from "@/api/websites/components/logo-enterprises/normalization";
import type { LogoData } from "../types";

interface UseLogosDataReturn {
  data: LogoData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook para buscar dados dos logos das empresas da API
 */
export function useLogosData(
  fetchFromApi: boolean = true,
  staticData?: LogoData[],
): UseLogosDataReturn {
  const [data, setData] = useState<LogoData[]>(staticData || []);
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

      const result = await listLogoEnterprises();

      const mapped = mapLogoEnterpriseResponsesToLogoData(result);

      setData(mapped);
    } catch (err) {
      console.error("Erro ao buscar dados dos logos:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFromApi, staticData]);

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
