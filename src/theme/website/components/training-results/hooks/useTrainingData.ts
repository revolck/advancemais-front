// src/theme/website/components/training-results/hooks/useTrainingData.ts

"use client";

import { useState, useEffect } from "react";
import type { TrainingResultData, TrainingResultsApiResponse } from "../types";
import {
  DEFAULT_TRAINING_RESULTS,
  TRAINING_RESULTS_CONFIG,
} from "../constants";

interface UseTrainingDataReturn {
  data: TrainingResultData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook para buscar dados dos resultados de treinamento da API
 */
export function useTrainingData(
  fetchFromApi: boolean = true,
  staticData?: TrainingResultData[]
): UseTrainingDataReturn {
  const [data, setData] = useState<TrainingResultData[]>(
    staticData || DEFAULT_TRAINING_RESULTS
  );
  const [isLoading, setIsLoading] = useState(fetchFromApi);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!fetchFromApi) {
      setData(staticData || DEFAULT_TRAINING_RESULTS);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        TRAINING_RESULTS_CONFIG.api.timeout
      );

      const response = await fetch(TRAINING_RESULTS_CONFIG.api.endpoint, {
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

      const result: TrainingResultsApiResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || "Dados inválidos recebidos da API");
      }

      // Filtra apenas dados ativos e ordena
      const activeData = result.data
        .filter((item) => item.isActive)
        .sort((a, b) => a.order - b.order);

      setData(activeData);
    } catch (err) {
      console.error("Erro ao buscar dados dos resultados de treinamento:", err);

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
      setData(DEFAULT_TRAINING_RESULTS);
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
