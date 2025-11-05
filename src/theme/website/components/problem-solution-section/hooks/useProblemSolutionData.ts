// src/theme/website/components/problem-solution-section/hooks/useProblemSolutionData.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import type { SectionData } from "../types";
import { getPlaninhasSectionDataClient } from "@/api/websites/components/planinhas";

// Dados padrão para fallback quando a API falha
const DEFAULT_SECTION_DATA: SectionData = {
  id: "recruitment-problems",
  mainTitle: "Você ainda recruta com emails e planilhas?",
  mainDescription:
    "O esforço e a boa vontade do Setor de Vagas têm um limite claro e acabam criando problemas e desafios relevantes. Simplifique seus processos e alcance resultados melhores com as ferramentas certas.",
  problems: [
    {
      id: "desorganization",
      icon: "Activity",
      iconColor: "text-red-500",
      title: "Sensação de Desorganização",
      description:
        "Se sentir desorganizado com a avalanche de demandas e informações afeta diretamente o desempenho do negócio.",
      order: 1,
      isActive: true,
    },
    {
      id: "repetitive-effort",
      icon: "Target",
      iconColor: "text-blue-600",
      title: "Esforço Repetitivo",
      description:
        "Tarefas manuais travam o bom uso do seu tempo e não te permite focar no que é essencial.",
      order: 2,
      isActive: true,
    },
    {
      id: "poor-results",
      icon: "Database",
      iconColor: "text-red-500",
      title: "Resultados Insatisfatórios",
      description:
        "Recrutamento manual gera atrasos que impedem seu negócio de crescer na velocidade que ele poderia.",
      order: 3,
      isActive: true,
    },
    {
      id: "lack-control",
      icon: "AlertTriangle",
      iconColor: "text-orange-500",
      title: "Falta de Controle",
      description:
        "Sem visibilidade dos processos, fica impossível identificar gargalos e otimizar resultados.",
      order: 4,
      isActive: true,
    },
  ],
  isActive: true,
};

interface UseProblemSolutionDataReturn {
  data: SectionData;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook para buscar dados da seção de problemas/soluções da API
 */
export function useProblemSolutionData(
  fetchFromApi: boolean = true,
  staticData?: SectionData
): UseProblemSolutionDataReturn {
  const [data, setData] = useState<SectionData>(
    staticData || DEFAULT_SECTION_DATA
  );
  const [isLoading, setIsLoading] = useState(fetchFromApi);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!fetchFromApi) {
      setData(staticData || DEFAULT_SECTION_DATA);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await getPlaninhasSectionDataClient();
      const processedData: SectionData = {
        ...DEFAULT_SECTION_DATA,
        ...result,
        problems: (result?.problems || [])
          .filter((item) => item.isActive !== false)
          .sort((a, b) => a.order - b.order),
      };
      setData(processedData);
    } catch (err) {
      console.error("Erro ao buscar dados da seção de problemas:", err);

      if (err instanceof Error) {
        setError(`Erro na API: ${err.message}. Usando dados padrão.`);
      } else {
        setError("Erro desconhecido. Usando dados padrão.");
      }

      // Fallback para dados padrão
      setData(DEFAULT_SECTION_DATA);
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
