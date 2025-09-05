// src/theme/website/components/training-results/hooks/useTrainingData.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import type { TrainingResultData } from "../types";
import { TRAINING_RESULTS_CONFIG } from "../constants";
import { listTreinamentosInCompany } from "@/api/websites/components";

interface UseTrainingDataReturn {
  data: TrainingResultData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  sectionTitle: string | null;
}

/**
 * Hook para buscar dados dos resultados de treinamento da API
 */
export function useTrainingData(
  fetchFromApi: boolean = true,
  staticData?: TrainingResultData[]
): UseTrainingDataReturn {
  const [data, setData] = useState<TrainingResultData[]>(staticData || []);
  const [isLoading, setIsLoading] = useState(fetchFromApi);
  const [error, setError] = useState<string | null>(null);
  const [sectionTitle, setSectionTitle] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!fetchFromApi) {
      setData(staticData || []);
      setSectionTitle(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      // Busca os dados da API do website para Treinamentos In Company
      // e mapeia para a estrutura do componente
      const raw = await listTreinamentosInCompany({ headers: { Accept: "application/json" } });

      // Consideramos o primeiro registro como fonte da seção
      const first = raw?.[0];
      if (!first) {
        setData([]);
        setSectionTitle(null);
        return;
      }

      const items = [
        { icon: first.icone1, desc: first.descricao1 },
        { icon: first.icone2, desc: first.descricao2 },
        { icon: first.icone3, desc: first.descricao3 },
        { icon: first.icone4, desc: first.descricao4 },
        { icon: first.icone5, desc: first.descricao5 },
      ];

      const mapped: TrainingResultData[] = items
        .map((it, idx) => ({
          id: `result-${idx + 1}`,
          title: it.desc || "",
          iconName: it.icon || undefined,
          color: "text-red-600",
          order: idx + 1,
          isActive: Boolean(it.desc),
        }))
        .filter((m) => m.isActive);

      // Ordena por ordem (já sequencial) e aplica
      setData(mapped.sort((a, b) => a.order - b.order));
      setSectionTitle(first.titulo || null);
    } catch (err) {
      console.error("Erro ao buscar dados dos resultados de treinamento:", err);

      if (err instanceof Error) {
        setError(`Erro na API: ${err.message}`);
      } else {
        setError("Erro desconhecido ao consultar a API.");
      }
      // Sem fallback mockado: mantém vazio para o componente tratar
      setData([]);
      setSectionTitle(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFromApi, staticData]);

  useEffect(() => {
    fetchData();
    // fetchData already depends on fetchFromApi and staticData
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    sectionTitle,
  };
}
