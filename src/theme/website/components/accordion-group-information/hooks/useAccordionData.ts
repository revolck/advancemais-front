// src/theme/website/components/accordion-group-information/hooks/useAccordionData.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import type { AccordionSectionData } from "../types";
// Sem fallback de mock; usa apenas dados da API ou estático
import { getSobreEmpresaDataClient } from "@/api/websites/components";

interface UseAccordionDataReturn {
  data: AccordionSectionData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook para buscar dados das seções de accordion da API
 */
export function useAccordionData(
  fetchFromApi: boolean = true,
  staticData?: AccordionSectionData[]
): UseAccordionDataReturn {
  const [data, setData] = useState<AccordionSectionData[]>(staticData || []);
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

      const result = await getSobreEmpresaDataClient();

      // Filtra apenas dados ativos e ordena
      const activeData = result
        .filter((item) => item.isActive)
        .sort((a, b) => a.order - b.order)
        .map((section) => ({
          ...section,
          items: section.items
            .filter((item) => item.isActive)
            .sort((a, b) => a.order - b.order),
        }));

      setData(activeData);
    } catch (err) {
      console.error("Erro ao buscar dados dos accordions:", err);

      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError("Tempo limite excedido. Usando dados padrão.");
        } else {
          setError(`Erro na API: ${err.message}. Usando dados padrão.`);
        }
      } else {
      setError("Erro desconhecido.");
      }

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
