// src/theme/website/components/about-advantages/hooks/useAboutAdvantagesData.ts

"use client";

import { useState, useEffect } from "react";
import type {
  AboutAdvantagesApiData,
  AboutAdvantagesApiResponse,
} from "../types";
import {
  DEFAULT_ABOUT_ADVANTAGES_DATA,
  ABOUT_ADVANTAGES_CONFIG,
} from "../constants";
import { env } from "@/lib/env";

interface UseAboutAdvantagesDataReturn {
  data: AboutAdvantagesApiData;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAboutAdvantagesData(
  fetchFromApi: boolean = true,
  staticData?: AboutAdvantagesApiData
): UseAboutAdvantagesDataReturn {
  const [data, setData] = useState<AboutAdvantagesApiData>(
    staticData || DEFAULT_ABOUT_ADVANTAGES_DATA
  );
  const [isLoading, setIsLoading] = useState(fetchFromApi);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!fetchFromApi) {
      setData(staticData || DEFAULT_ABOUT_ADVANTAGES_DATA);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        ABOUT_ADVANTAGES_CONFIG.api.timeout
      );

      const response = await fetch(ABOUT_ADVANTAGES_CONFIG.api.endpoint, {
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

      const result: AboutAdvantagesApiResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || "Dados inválidos recebidos da API");
      }

      setData(result.data);
      setIsLoading(false);
    } catch (err) {
      console.error("Erro ao buscar dados de vantagens:", err);

      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError("Tempo limite excedido.");
        } else {
          setError(`Erro na API: ${err.message}`);
        }
      } else {
        setError("Erro desconhecido");
      }

      switch (env.apiFallback) {
        case "mock":
          setData(DEFAULT_ABOUT_ADVANTAGES_DATA);
          setIsLoading(false);
          break;
        case "skeleton":
          setIsLoading(true);
          break;
        case "loading":
        default:
          setIsLoading(true);
          break;
      }
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
