// src/theme/website/components/about-advantages/hooks/useAboutAdvantagesData.ts

"use client";

import { useState, useEffect } from "react";
import type { AboutAdvantagesApiData } from "../types";
// Sem fallback de mock; usa apenas API ou dados estáticos
// import { env } from "@/lib/env";
import {
  listDiferenciais,
  type DiferenciaisBackendResponse,
} from "@/api/websites/components";

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
    staticData || ({ whyChoose: { id: "", title: "", description: "", buttonText: "", buttonUrl: "", isActive: false }, advantageCards: [] } as AboutAdvantagesApiData)
  );
  const [isLoading, setIsLoading] = useState(fetchFromApi);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!fetchFromApi) {
      setData(staticData || data);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await listDiferenciais();
      const first = result[0];

      if (!first) {
        throw new Error("Dados não encontrados");
      }

      const mapped = mapDiferenciaisToData(first);
      setData(mapped);
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

      // Sem fallback de mock
    } finally {
      setIsLoading(false);
    }
  };

  const mapDiferenciaisToData = (
    item: DiferenciaisBackendResponse,
  ): AboutAdvantagesApiData => {
    const DEFAULT_ICONS = ["Award", "Lightbulb", "Target", "Users"] as const;
    const cards = [1, 2, 3, 4].map((i) => ({
      id: `card-${i}`,
      icon:
        (item as any)[`icone${i}`] || DEFAULT_ICONS[i - 1],
      title: (item as any)[`titulo${i}`] || "",
      description: (item as any)[`descricao${i}`] || "",
      order: i,
      isActive: true,
    }));

    return {
      whyChoose: {
        id: item.id,
        title: item.titulo || "",
        description: item.descricao || "",
        buttonText: item.botaoLabel || "",
        buttonUrl: item.botaoUrl || "",
        isActive: true,
      },
      advantageCards: cards,
    };
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchFromApi]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
