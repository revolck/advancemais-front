// src/theme/website/components/courses-carousel/hooks/useCoursesData.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import type { CourseData, CoursesApiResponse } from "../types";
import { COURSES_CONFIG } from "../constants";

interface UseCoursesDataReturn {
  data: CourseData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook para buscar dados dos cursos da API
 */
export function useCoursesData(
  fetchFromApi: boolean = true,
  staticData?: CourseData[]
): UseCoursesDataReturn {
  const [data, setData] = useState<CourseData[]>(staticData || []);
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

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        COURSES_CONFIG.api.timeout
      );

      const response = await fetch(COURSES_CONFIG.api.endpoint, {
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

      const result: CoursesApiResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || "Dados inválidos recebidos da API");
      }

      // Filtra apenas dados ativos e ordena
      const activeData = result.data
        .filter((item) => item.isActive)
        .sort((a, b) => a.order - b.order);

      setData(activeData);
    } catch (err) {
      console.error("Erro ao buscar dados dos cursos:", err);

      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError("Tempo limite excedido.");
        } else {
          setError(`Erro na API: ${err.message}.`);
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
