// src/theme/website/components/advance-ajuda/hooks/useAdvanceAjudaData.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import { getAdvanceAjudaDataClient } from "@/api/websites/components/advance-ajuda";
import type { AdvanceAjudaData } from "../types";

interface UseAdvanceAjudaDataReturn {
  data: AdvanceAjudaData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook para buscar dados de destaque Advance Ajuda da API
 */
export function useAdvanceAjudaData(
  fetchFromApi: boolean = true,
  staticData?: AdvanceAjudaData[],
): UseAdvanceAjudaDataReturn {
  const [data, setData] = useState<AdvanceAjudaData[]>(staticData || []);
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

      const result = await getAdvanceAjudaDataClient();
      setData(result);
    } catch (err) {
      console.error("Erro ao buscar dados de Advance Ajuda:", err);
      setError(
        err instanceof Error ? `Erro na API: ${err.message}` : "Erro desconhecido.",
      );
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

