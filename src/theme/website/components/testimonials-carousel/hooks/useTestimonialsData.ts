"use client";

import { useState, useEffect, useCallback } from "react";
import type { TestimonialData } from "../types";
import { listDepoimentos } from "@/api/websites/components/depoimentos";

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
  const [data, setData] = useState<TestimonialData[]>(staticData || []);
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

      // Busca depoimentos PUBLICADOS via API compartilhada
      const backendItems = await listDepoimentos({ headers: { Accept: "application/json" } }, "PUBLICADO");

      const mapped: TestimonialData[] = (backendItems || [])
        .sort((a, b) => a.ordem - b.ordem)
        .map((item) => ({
          id: item.depoimentoId,
          name: item.nome,
          position: item.cargo,
          company: undefined,
          testimonial: item.depoimento,
          imageUrl: item.fotoUrl || "",
          rating: 5,
          order: item.ordem,
          isActive: (typeof item.status === "string" ? item.status : item.status ? "PUBLICADO" : "RASCUNHO") === "PUBLICADO",
        }))
        .filter((t) => t.isActive);

      setData(mapped);
    } catch (err) {
      console.error("Erro ao buscar dados dos depoimentos:", err);
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
