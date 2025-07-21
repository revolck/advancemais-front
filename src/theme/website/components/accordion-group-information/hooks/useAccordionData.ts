// src/theme/website/components/accordion-group-information/hooks/useAccordionData.ts

"use client";

import { useState, useEffect } from "react";
import type { AccordionSectionData, AccordionApiResponse } from "../types";
import { DEFAULT_ACCORDION_DATA, ACCORDION_CONFIG } from "../constants";

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
  const [data, setData] = useState<AccordionSectionData[]>(
    staticData || DEFAULT_ACCORDION_DATA
  );
  const [isLoading, setIsLoading] = useState(fetchFromApi);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!fetchFromApi) {
      setData(staticData || DEFAULT_ACCORDION_DATA);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        ACCORDION_CONFIG.api.timeout
      );

      const response = await fetch(ACCORDION_CONFIG.api.endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: AccordionApiResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || "Dados inválidos recebidos da API");
      }

      // Filtra apenas dados ativos e ordena
      const activeData = result.data
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
        setError("Erro desconhecido. Usando dados padrão.");
      }

      // Fallback para dados padrão
      setData(DEFAULT_ACCORDION_DATA);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchFromApi]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
