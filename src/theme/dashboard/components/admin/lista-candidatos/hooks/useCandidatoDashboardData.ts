"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { listarCandidatosOverview } from "../../../../../../api/candidatos";
import type {
  CandidatoDashboardData,
  CandidatoDashboardFilters,
} from "../types";

export function useCandidatoDashboardData(
  initialFilters?: CandidatoDashboardFilters
) {
  const [data, setData] = useState<CandidatoDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CandidatoDashboardFilters>(
    initialFilters || {
      page: 1,
      pageSize: 20,
      onlyWithCandidaturas: true,
    }
  );

  // Use ref to track if we're already fetching to prevent multiple simultaneous calls
  const isFetchingRef = useRef(false);

  const fetchData = useCallback(
    async (currentFilters: CandidatoDashboardFilters) => {
      // Prevent multiple simultaneous calls
      if (isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        const response = await listarCandidatosOverview({
          page: currentFilters.page || 1,
          pageSize: currentFilters.pageSize || 20,
          empresaUsuarioId: currentFilters.empresaUsuarioId,
          vagaId: currentFilters.vagaId,
          status: currentFilters.status,
          search: currentFilters.search,
          onlyWithCandidaturas: currentFilters.onlyWithCandidaturas,
        });

        setData({
          candidatos: response.data,
          pagination: response.pagination,
          summary: response.summary,
          filters: response.filters,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao carregar candidatos";
        setError(errorMessage);
        console.error("Erro ao buscar candidatos:", err);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    },
    []
  );

  const updateFilters = useCallback(
    (newFilters: Partial<CandidatoDashboardFilters>) => {
      const updatedFilters = { ...filters, ...newFilters, page: 1 };
      setFilters(updatedFilters);
      fetchData(updatedFilters);
    },
    [filters, fetchData]
  );

  const refreshData = useCallback(() => {
    fetchData(filters);
  }, [fetchData, filters]);

  const loadPage = useCallback(
    (page: number) => {
      const updatedFilters = { ...filters, page };
      setFilters(updatedFilters);
      fetchData(updatedFilters);
    },
    [filters, fetchData]
  );

  // Load data only on initial mount
  useEffect(() => {
    fetchData(filters);
  }, [fetchData, filters]); // Include dependencies

  return {
    data,
    isLoading,
    error,
    filters,
    updateFilters,
    refreshData,
    loadPage,
  };
}
