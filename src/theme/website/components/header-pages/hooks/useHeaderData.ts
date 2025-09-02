// src/theme/website/components/header-pages/hooks/useHeaderData.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import type { HeaderPageData } from "../types";
import { DEFAULT_HEADER_DATA } from "../constants";
import { getHeaderForPage } from "@/api/websites/components";

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
  const pathname = usePathname() || "";
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
    // Fallback helper
    const setFallback = (message?: string) => {
      if (message) setError(message);
      const fallbackData = findHeaderForPage(DEFAULT_HEADER_DATA, targetPage);
      setData(fallbackData);
    };

    if (!fetchFromApi) {
      setFallback();
      setIsLoading(false);
      return;
    }

    // Map pathname to API page code
    const mapPathToPageCode = (path: string): string => {
      const p = path.toLowerCase();
      if (p.startsWith("/sobre")) return "SOBRE";
      if (p.startsWith("/consultoria")) return "SERVICOS";
      if (p.startsWith("/recrutamento")) return "RECRUTAMENTO";
      return "SOBRE";
    };

    // Map API response to theme type
    const mapToTheme = (item: any, path: string): HeaderPageData => ({
      id: item.id,
      title: item.titulo,
      subtitle: item.subtitulo ?? "",
      description: item.descricao ?? "",
      buttonText: item.buttonLabel ?? "Saiba mais",
      buttonUrl: item.buttonLink ?? "#",
      imageUrl: item.imagemUrl ?? "/images/headers/default-header.webp",
      imageAlt: item.titulo ?? "header",
      isActive: true,
      targetPages: [path],
    });

    try {
      setIsLoading(true);
      setError(null);

      const pageCode = mapPathToPageCode(targetPage);
      const apiItem = await getHeaderForPage(pageCode);
      if (!apiItem) {
        setFallback("Nenhum cabeçalho encontrado. Usando dados padrão.");
        return;
      }
      const mapped = mapToTheme(apiItem, targetPage);
      setData(mapped);
    } catch (err) {
      console.error("Erro ao buscar dados do header:", err);
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setFallback(message);
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
