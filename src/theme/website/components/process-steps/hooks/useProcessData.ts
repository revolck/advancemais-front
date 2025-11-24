// src/theme/website/components/process-steps/hooks/useProcessData.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import { listSistema } from "@/api/websites/components/sistema";
import type { ProcessSectionData } from "../types";

interface UseProcessDataReturn {
  data: ProcessSectionData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook para buscar dados das etapas do processo da API
 */
export function useProcessData(): UseProcessDataReturn {
  const [data, setData] = useState<ProcessSectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await listSistema();
      
      // Verificar se o resultado é um array válido e não vazio
      if (!Array.isArray(result) || result.length === 0) {
        setError("Nenhum dado encontrado.");
        setData(null);
        return;
      }

      const first = result[0];

      if (!first) {
        setError("Dados incompletos.");
        setData(null);
        return;
      }

      const processData: ProcessSectionData = {
        id: first.id,
        subtitle: first.subtitulo,
        title: first.titulo,
        description: first.descricao,
        steps: [
          {
            id: `${first.id}-step1`,
            number: 1,
            title: first.etapa1Titulo,
            description: first.etapa1Descricao,
            order: 1,
            isActive: true,
          },
          {
            id: `${first.id}-step2`,
            number: 2,
            title: first.etapa2Titulo,
            description: first.etapa2Descricao,
            order: 2,
            isActive: true,
          },
          {
            id: `${first.id}-step3`,
            number: 3,
            title: first.etapa3Titulo,
            description: first.etapa3Descricao,
            order: 3,
            isActive: true,
          },
        ].filter((step) => step.title && step.description),
      };

      setData(processData);
    } catch (err) {
      console.error("Erro ao buscar dados das etapas do processo:", err);
      setError("Não foi possível carregar os dados.");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
