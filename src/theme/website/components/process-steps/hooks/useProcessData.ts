// src/theme/website/components/process-steps/hooks/useProcessData.ts

"use client";

import { useState, useEffect } from "react";
import type { ProcessSectionData, ProcessApiResponse } from "../types";
import { DEFAULT_PROCESS_DATA, PROCESS_CONFIG } from "../constants";

interface UseProcessDataReturn {
  data: ProcessSectionData;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook para buscar dados das etapas do processo da API
 */
export function useProcessData(
  fetchFromApi: boolean = true,
  staticData?: ProcessSectionData
): UseProcessDataReturn {
  const [data, setData] = useState<ProcessSectionData>(
    staticData || DEFAULT_PROCESS_DATA
  );
  const [isLoading, setIsLoading] = useState(fetchFromApi);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!fetchFromApi) {
      setData(staticData || DEFAULT_PROCESS_DATA);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        PROCESS_CONFIG.api.timeout
      );

      const response = await fetch(PROCESS_CONFIG.api.endpoint, {
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

      const result: ProcessApiResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || "Dados inválidos recebidos da API");
      }

      // Filtra apenas etapas ativas e ordena
      const processData = {
        ...result.data,
        steps: result.data.steps
          .filter((step) => step.isActive)
          .sort((a, b) => a.order - b.order),
      };

      setData(processData);
    } catch (err) {
      console.error("Erro ao buscar dados das etapas do processo:", err);

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
      setData(DEFAULT_PROCESS_DATA);
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
