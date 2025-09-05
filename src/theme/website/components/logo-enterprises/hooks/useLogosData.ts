"use client";

import { useState, useEffect, useCallback } from "react";
import { listLogoEnterprises } from "@/api/websites/components/logo-enterprises";
import type { LogoData } from "../types";

interface UseLogosDataReturn {
  data: LogoData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook para buscar dados dos logos das empresas da API
 */
export function useLogosData(
  fetchFromApi: boolean = true,
  staticData?: LogoData[]
): UseLogosDataReturn {
  const [data, setData] = useState<LogoData[]>(staticData || []);
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

      const result = await listLogoEnterprises();

      const mapped = result
        .filter((item) => item.status === "PUBLICADO" || item.status === true)
        .sort((a, b) => a.ordem - b.ordem)
        .map<LogoData>((item) => ({
          id: item.id,
          name: item.nome,
          src: item.imagemUrl,
          alt: item.imagemAlt,
          website: item.website,
          order: item.ordem,
        }));

      setData(mapped);
    } catch (err) {
      console.error("Erro ao buscar dados dos logos:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
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
