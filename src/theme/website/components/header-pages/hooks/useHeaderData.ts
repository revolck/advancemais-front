// src/theme/website/components/header-pages/hooks/useHeaderData.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import type { HeaderPageData, HeaderApiResponse } from "../types";
import { DEFAULT_HEADER_DATA, HEADER_CONFIG } from "../constants";

interface UseHeaderDataReturn {
  data: HeaderPageData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook para buscar dados do header da página da API
 */
export function useHeaderData(
  fetchFromApi: boolean = true,
  staticData?: HeaderPageData,
  currentPage?: string
): UseHeaderDataReturn {
  const pathname = usePathname();
  const targetPage = currentPage || pathname;

  const [data, setData] = useState<HeaderPageData | null>(staticData || null);
  const [isLoading, setIsLoading] = useState(fetchFromApi);
  const [error, setError] = useState<string | null>(null);

  // Função para encontrar o header correto baseado na página atual
  const findHeaderForPage = (
    headers: HeaderPageData[],
    page: string
  ): HeaderPageData | null => {
    // Procura por correspondência exata
    let header = headers.find(
      (h) => h.isActive && h.targetPages.includes(page)
    );

    // Se não encontrar, procura por wildcard
    if (!header) {
      header = headers.find((h) => h.isActive && h.targetPages.includes("*"));
    }

    return header || null;
  };

  const fetchData = useCallback(async () => {
    if (!fetchFromApi) {
      const fallbackData = findHeaderForPage(DEFAULT_HEADER_DATA, targetPage);
      setData(fallbackData);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        HEADER_CONFIG.api.timeout
      );

      const response = await fetch(
        `${HEADER_CONFIG.api.endpoint}?page=${encodeURIComponent(targetPage)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: HeaderApiResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || "Dados inválidos recebidos da API");
      }

      const headerData = findHeaderForPage(result.data, targetPage);
      setData(headerData);

      if (!headerData) {
        throw new Error("Nenhum header encontrado para esta página");
      }
    } catch (err) {
      console.error("Erro ao buscar dados do header:", err);

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
      const fallbackData = findHeaderForPage(DEFAULT_HEADER_DATA, targetPage);
      setData(fallbackData);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFromApi, targetPage]);

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
