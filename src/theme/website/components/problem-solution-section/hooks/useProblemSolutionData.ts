// src/theme/website/components/problem-solution-section/hooks/useProblemSolutionData.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import type { SectionData } from "../types";
import { DEFAULT_SECTION_DATA } from "../constants";
import { getPlaninhasSectionDataClient } from "@/api/websites/components";

interface UseProblemSolutionDataReturn {
  data: SectionData;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook para buscar dados da seção de problemas/soluções da API
 */
export function useProblemSolutionData(
  fetchFromApi: boolean = true,
  staticData?: SectionData
): UseProblemSolutionDataReturn {
  const [data, setData] = useState<SectionData>(
    staticData || DEFAULT_SECTION_DATA
  );
  const [isLoading, setIsLoading] = useState(fetchFromApi);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!fetchFromApi) {
      setData(staticData || DEFAULT_SECTION_DATA);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await getPlaninhasSectionDataClient();
      const processedData: SectionData = {
        ...DEFAULT_SECTION_DATA,
        ...result,
        problems: (result?.problems || [])
          .filter((item) => item.isActive !== false)
          .sort((a, b) => a.order - b.order),
      };
      setData(processedData);
    } catch (err) {
      console.error("Erro ao buscar dados da seção de problemas:", err);

      if (err instanceof Error) {
        setError(`Erro na API: ${err.message}. Usando dados padrão.`);
      } else {
        setError("Erro desconhecido. Usando dados padrão.");
      }

      // Fallback para dados padrão
      setData(DEFAULT_SECTION_DATA);
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
