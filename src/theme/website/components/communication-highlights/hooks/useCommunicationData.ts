// src/theme/website/components/communication-highlights/hooks/useCommunicationData.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import type { CommunicationData } from "../types";
import { COMMUNICATION_CONFIG } from "../constants";
import { listConexaoForte } from "@/api/websites/components";

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
    staticData || { textContent: { id: "", title: "", paragraphs: [], order: 0, isActive: false }, gallery: [] }
  );
  const [isLoading, setIsLoading] = useState(fetchFromApi);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!fetchFromApi) {
      setData(staticData || { textContent: { id: "", title: "", paragraphs: [], order: 0, isActive: false }, gallery: [] });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Consulta a API (primeiro item da lista) e mapeia
      const raw = await listConexaoForte({ headers: { Accept: "application/json" } });
      const first = raw?.[0];
      if (!first) {
        setData({ textContent: { id: "", title: "", paragraphs: [], order: 0, isActive: false }, gallery: [] });
        return;
      }

      const gallery = [
        { url: first.imagemUrl1, alt: first.imagemTitulo1 },
        { url: first.imagemUrl2, alt: first.imagemTitulo2 },
        { url: first.imagemUrl3, alt: first.imagemTitulo3 },
        { url: first.imagemUrl4, alt: first.imagemTitulo4 },
      ]
        .map((g, idx) => ({ id: `img-${idx + 1}`, imageUrl: g.url || "", alt: g.alt || "", order: idx + 1, isActive: Boolean(g.url) }))
        .filter((g) => g.isActive)
        .sort((a, b) => a.order - b.order);

      const processedData: CommunicationData = {
        textContent: {
          id: first.id || "conexao-forte",
          title: first.titulo || "",
          paragraphs: first.descricao ? [first.descricao] : [],
          order: 1,
          isActive: true,
        },
        gallery,
      };

      setData(processedData);
    } catch (err) {
      console.error("Erro ao buscar dados de comunicação:", err);

      if (err instanceof Error) {
        setError(`Erro na API: ${err.message}`);
      } else {
        setError("Erro desconhecido ao consultar a API.");
      }
      // Sem fallback mockado
      setData({ textContent: { id: "", title: "", paragraphs: [], order: 0, isActive: false }, gallery: [] });
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
