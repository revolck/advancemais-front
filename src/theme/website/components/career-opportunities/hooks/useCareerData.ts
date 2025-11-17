// src/theme/website/components/career-opportunities/hooks/useCareerData.ts

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { JobData, JobFilters, CareerApiResponse } from "../types";
import { CAREER_CONFIG } from "../constants";

interface UseCareerDataReturn {
  data: JobData[];
  filteredData: JobData[];
  filterCounts: {
    categorias: Array<{ nome: string; count: number }>;
    modalidades: Array<{ nome: string; count: number; icon: string }>;
    tiposContrato: Array<{ nome: string; count: number; icon: string }>;
    niveis: Array<{ nome: string; count: number }>;
  };
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  refetch: () => void;
}

/**
 * Hook para buscar e filtrar dados de vagas
 */
export function useCareerData(
  fetchFromApi: boolean = true,
  staticData?: JobData[],
  filters?: JobFilters
): UseCareerDataReturn {
  const [data, setData] = useState<JobData[]>(staticData || []);
  const [isLoading, setIsLoading] = useState(fetchFromApi);
  const [error, setError] = useState<string | null>(null);

  const filterCounts = {
    categorias: [],
    modalidades: [],
    tiposContrato: [],
    niveis: [],
  };

  // Aplicar filtros aos dados
  const filteredData = useMemo(() => {
    if (!filters) return data;

    return data
      .filter((job) => {
        const matchSearch =
          filters.busca.length < 2 ||
          job.titulo.toLowerCase().includes(filters.busca.toLowerCase()) ||
          job.empresa.toLowerCase().includes(filters.busca.toLowerCase()) ||
          job.descricao.toLowerCase().includes(filters.busca.toLowerCase());

        const matchCategoria =
          filters.categorias.length === 0 ||
          filters.categorias.includes(job.categoria);

        const matchModalidade =
          filters.modalidades.length === 0 ||
          filters.modalidades.includes(job.modalidade);

        const matchTipoContrato =
          filters.tiposContrato.length === 0 ||
          filters.tiposContrato.includes(job.tipoContrato);

        const matchNivel =
          filters.niveis.length === 0 || filters.niveis.includes(job.nivel);

        const matchDestaque = !filters.apenasDestaque || job.destaque;

        const matchPCD = !filters.apenasVagasPCD || job.pcd;

        return (
          matchSearch &&
          matchCategoria &&
          matchModalidade &&
          matchTipoContrato &&
          matchNivel &&
          matchDestaque &&
          matchPCD
        );
      })
      .sort((a, b) => {
        // Priorizar vagas em destaque
        if (a.destaque && !b.destaque) return -1;
        if (!a.destaque && b.destaque) return 1;
        return 0;
      });
  }, [data, filters]);

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
      const timeoutId = setTimeout(
        () => controller.abort(),
        CAREER_CONFIG.api.timeout
      );

      const response = await fetch(CAREER_CONFIG.api.endpoint, {
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

      const result: CareerApiResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || "Dados inválidos recebidos da API");
      }

      // Filtra apenas vagas ativas
      const activeJobs = result.data.filter((job) => job.isActive);
      setData(activeJobs);
    } catch (err) {
      console.error("Erro ao buscar dados das vagas:", err);

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
    filteredData,
    filterCounts,
    isLoading,
    error,
    totalCount: filteredData.length,
    refetch: fetchData,
  };
}
