"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/api/client";
import { env } from "@/lib/env";
import {
  DEFAULT_WEBSITE_FEATURES,
  WEBSITE_FEATURES_CONFIG,
} from "../constants";
import type {
  WebsiteFeature,
  WebsiteFeaturesApiResponse,
  UseWebsiteFeaturesDataReturn,
} from "../types";

export function useWebsiteFeaturesData(
  customFeatures?: WebsiteFeature[]
): UseWebsiteFeaturesDataReturn {
  const [features, setFeatures] = useState<WebsiteFeature[]>(
    customFeatures || DEFAULT_WEBSITE_FEATURES
  );
  const [isLoading, setIsLoading] = useState(!customFeatures);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (customFeatures) {
      setFeatures(customFeatures);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        WEBSITE_FEATURES_CONFIG.api.timeout
      );

      const result = await apiFetch<WebsiteFeaturesApiResponse>(
        WEBSITE_FEATURES_CONFIG.api.endpoint,
        {
          init: {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          },
          mockData: {
            success: true,
            data: DEFAULT_WEBSITE_FEATURES,
          },
          cache: "short",
        }
      );

      clearTimeout(timeoutId);

      if (!result.success || !result.data) {
        throw new Error(result.message || "Dados inválidos recebidos da API");
      }

      setFeatures(result.data);
    } catch (err) {
      console.error("Erro ao buscar funcionalidades do website:", err);

      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError("Tempo limite excedido.");
        } else {
          setError(`Erro na API: ${err.message}`);
        }
      } else {
        setError("Erro desconhecido");
      }

      if (env.apiFallback === "mock") {
        setFeatures(DEFAULT_WEBSITE_FEATURES);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!customFeatures) {
      fetchData();
    }
  }, []);

  return {
    features,
    isLoading,
    error,
    refetch: fetchData,
  };
}
