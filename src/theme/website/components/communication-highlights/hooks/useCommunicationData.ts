// src/theme/website/components/communication-highlights/hooks/useCommunicationData.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import type { CommunicationData, CommunicationApiResponse } from "../types";
import { DEFAULT_COMMUNICATION_DATA, COMMUNICATION_CONFIG } from "../constants";

interface UseCommunicationDataReturn {
  data: CommunicationData;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook para buscar dados de comunicação da API
 */
export function useCommunicationData(
  fetchFromApi: boolean = true,
  staticData?: CommunicationData
): UseCommunicationDataReturn {
  const [data, setData] = useState<CommunicationData>(
    staticData || DEFAULT_COMMUNICATION_DATA
  );
  const [isLoading, setIsLoading] = useState(fetchFromApi);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!fetchFromApi) {
      setData(staticData || DEFAULT_COMMUNICATION_DATA);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        COMMUNICATION_CONFIG.api.timeout
      );

      const response = await fetch(COMMUNICATION_CONFIG.api.endpoint, {
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

      const result: CommunicationApiResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || "Dados inválidos recebidos da API");
      }

      // Filtra apenas dados ativos e ordena
      const processedData: CommunicationData = {
        textContent: result.data.textContent,
        gallery: result.data.gallery
          .filter((item) => item.isActive)
          .sort((a, b) => a.order - b.order),
      };

      setData(processedData);
    } catch (err) {
      console.error("Erro ao buscar dados de comunicação:", err);

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
      setData(DEFAULT_COMMUNICATION_DATA);
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
