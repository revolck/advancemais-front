// src/theme/website/components/blog-section/hooks/useBlogData.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import type { BlogPostData, BlogApiResponse } from "../types";
import { DEFAULT_BLOG_DATA, BLOG_CONFIG } from "../constants";

interface UseBlogDataReturn {
  data: BlogPostData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook para buscar dados dos posts do blog da API
 */
export function useBlogData(
  fetchFromApi: boolean = true,
  staticData?: BlogPostData[]
): UseBlogDataReturn {
  const [data, setData] = useState<BlogPostData[]>(
    staticData || DEFAULT_BLOG_DATA
  );
  const [isLoading, setIsLoading] = useState(fetchFromApi);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!fetchFromApi) {
      setData(staticData || DEFAULT_BLOG_DATA);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        BLOG_CONFIG.api.timeout
      );

      const response = await fetch(BLOG_CONFIG.api.endpoint, {
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

      const result: BlogApiResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || "Dados inválidos recebidos da API");
      }

      // Filtra apenas dados ativos e ordena
      const activeData = result.data
        .filter((item) => item.isActive)
        .sort((a, b) => a.order - b.order);

      setData(activeData);
    } catch (err) {
      console.error("Erro ao buscar dados dos posts do blog:", err);

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
      setData(DEFAULT_BLOG_DATA);
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
