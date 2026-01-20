"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { getMockPagamentosCursos } from "@/mockData/pagamentos-cursos";
import type { PagamentosCursosParams } from "../types";

const DEFAULT_PAGE_SIZE = 10;

export function usePagamentosCursosData(
  initialFilters?: PagamentosCursosParams
) {
  const [filters, setFilters] = useState<PagamentosCursosParams>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    ...initialFilters,
  });

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["cursos", "pagamentos", JSON.stringify(filters)],
    queryFn: () => getMockPagamentosCursos(filters),
    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchOnWindowFocus: false,
  });

  const updateFilters = useCallback(
    (newFilters: Partial<PagamentosCursosParams>) => {
      setFilters((prev) => ({
        ...prev,
        ...newFilters,
      }));
    },
    []
  );

  const loadPage = useCallback((page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
    });
  }, []);

  return {
    data: response ?? null,
    isLoading,
    error: error?.message ?? null,
    filters,
    updateFilters,
    loadPage,
    clearFilters,
    refetch,
  };
}




