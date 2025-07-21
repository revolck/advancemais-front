// src/theme/website/components/problem-solution-section/hooks/useProblemSolutionData.ts

"use client";

import { useState, useEffect } from "react";
import type { SectionData, ProblemSolutionApiResponse } from "../types";
import { DEFAULT_SECTION_DATA, PROBLEM_SOLUTION_CONFIG } from "../constants";

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

  const fetchData = async () => {
    if (!fetchFromApi) {
      setData(staticData || DEFAULT_SECTION_DATA);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        PROBLEM_SOLUTION_CONFIG.api.timeout
      );

      const response = await fetch(PROBLEM_SOLUTION_CONFIG.api.endpoint, {
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

      const result: ProblemSolutionApiResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || "Dados inválidos recebidos da API");
      }

      // Filtra apenas problemas ativos e ordena
      const processedData = {
        ...result.data,
        problems: result.data.problems
          .filter((item) => item.isActive)
          .sort((a, b) => a.order - b.order),
      };

      setData(processedData);
    } catch (err) {
      console.error("Erro ao buscar dados da seção de problemas:", err);

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
      setData(DEFAULT_SECTION_DATA);
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
