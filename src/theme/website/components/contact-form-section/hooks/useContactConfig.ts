// src/theme/website/components/contact-form-section/hooks/useContactConfig.ts

"use client";

import { useState, useEffect } from "react";
import type { ContactSectionData, ContactConfigApiResponse } from "../types";
import { DEFAULT_CONTACT_DATA, CONTACT_CONFIG } from "../constants";

interface UseContactConfigReturn {
  config: ContactSectionData;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useContactConfig(
  fetchFromApi: boolean = true,
  staticData?: ContactSectionData
): UseContactConfigReturn {
  const [config, setConfig] = useState<ContactSectionData>(
    staticData || DEFAULT_CONTACT_DATA
  );
  const [isLoading, setIsLoading] = useState(fetchFromApi);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    if (!fetchFromApi) {
      setConfig(staticData || DEFAULT_CONTACT_DATA);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        CONTACT_CONFIG.api.timeout
      );

      const response = await fetch(CONTACT_CONFIG.api.configEndpoint, {
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

      const result: ContactConfigApiResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || "Dados inválidos recebidos da API");
      }

      setConfig(result.data);
    } catch (err) {
      console.error("Erro ao buscar configuração do formulário:", err);

      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError("Tempo limite excedido. Usando configuração padrão.");
        } else {
          setError(`Erro na API: ${err.message}. Usando configuração padrão.`);
        }
      } else {
        setError("Erro desconhecido. Usando configuração padrão.");
      }

      // Fallback para configuração padrão
      setConfig(staticData || DEFAULT_CONTACT_DATA);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [fetchFromApi]);

  return {
    config,
    isLoading,
    error,
    refetch: fetchConfig,
  };
}
