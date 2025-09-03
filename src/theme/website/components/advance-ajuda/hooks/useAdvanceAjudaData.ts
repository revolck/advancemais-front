// src/theme/website/components/advance-ajuda/hooks/useAdvanceAjudaData.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  AdvanceAjudaData,
  AdvanceAjudaApiResponse,
  AdvanceAjudaBackendResponse,
} from "../types";

const API_ENDPOINT = "/api/v1/advance-ajuda";
const API_TIMEOUT = 5000;

interface UseAdvanceAjudaDataReturn {
  data: AdvanceAjudaData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook para buscar dados de destaque Advance Ajuda da API
 */
export function useAdvanceAjudaData(
  fetchFromApi: boolean = true,
  staticData?: AdvanceAjudaData[]
): UseAdvanceAjudaDataReturn {
  const [data, setData] = useState<AdvanceAjudaData[]>(staticData || []);
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
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const response = await fetch(API_ENDPOINT, {
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

      const result: AdvanceAjudaApiResponse | AdvanceAjudaBackendResponse[] =
        await response.json();

      const rawData = Array.isArray(result) ? result : result.data;
      if (!rawData) {
        throw new Error(
          (Array.isArray(result) ? "" : result.message) ||
            "Dados inválidos recebidos da API"
        );
      }

      const mappedData: AdvanceAjudaData[] = rawData.map((item) => ({
        id: item.id,
        title: item.titulo,
        description: item.descricao,
        imageUrl: item.imagemUrl || "",
        imageAlt: item.imagemTitulo || "",
        benefits: [
          {
            id: `${item.id}-1`,
            title: item.titulo1,
            description: item.descricao1,
            order: 1,
          },
          {
            id: `${item.id}-2`,
            title: item.titulo2,
            description: item.descricao2,
            order: 2,
          },
          {
            id: `${item.id}-3`,
            title: item.titulo3,
            description: item.descricao3,
            order: 3,
          },
        ],
      }));

      setData(mappedData);
    } catch (err) {
      console.error("Erro ao buscar dados de Advance Ajuda:", err);

      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError("Tempo limite excedido.");
        } else {
          setError(`Erro na API: ${err.message}`);
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
