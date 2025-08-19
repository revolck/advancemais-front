// src/theme/website/components/testimonials-carousel/hooks/useTestimonialsData.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import type { TestimonialData, TestimonialsApiResponse } from "../types";
import { DEFAULT_TESTIMONIALS_DATA, TESTIMONIALS_CONFIG } from "../constants";

interface UseTestimonialsDataReturn {
  data: TestimonialData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook para buscar dados dos depoimentos da API
 */
export function useTestimonialsData(
  fetchFromApi: boolean = true,
  staticData?: TestimonialData[]
): UseTestimonialsDataReturn {
  const [data, setData] = useState<TestimonialData[]>(
    staticData || DEFAULT_TESTIMONIALS_DATA
  );
  const [isLoading, setIsLoading] = useState(fetchFromApi);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!fetchFromApi) {
      setData(staticData || DEFAULT_TESTIMONIALS_DATA);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        TESTIMONIALS_CONFIG.api.timeout
      );

      const response = await fetch(TESTIMONIALS_CONFIG.api.endpoint, {
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

      const result: TestimonialsApiResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || "Dados inválidos recebidos da API");
      }

      // Filtra apenas dados ativos e ordena
      const activeData = result.data
        .filter((item) => item.isActive)
        .sort((a, b) => a.order - b.order);

      setData(activeData);
    } catch (err) {
      console.error("Erro ao buscar dados dos depoimentos:", err);

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
      setData(DEFAULT_TESTIMONIALS_DATA);
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
