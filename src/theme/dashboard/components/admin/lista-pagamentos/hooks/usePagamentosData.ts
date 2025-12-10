"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { getPagamentosEmpresa } from "@/api/empresas/pagamentos";
import type { PagamentosParams } from "@/api/empresas/pagamentos/types";

const DEFAULT_PAGE_SIZE = 10;

export function usePagamentosData(initialFilters?: PagamentosParams) {
  const [filters, setFilters] = useState<PagamentosParams>({
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
    queryKey: ["empresa", "pagamentos", JSON.stringify(filters)],
    queryFn: () => getPagamentosEmpresa(filters),
    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchOnWindowFocus: false,
  });

  const updateFilters = useCallback((newFilters: Partial<PagamentosParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

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
    data: response?.data ?? null,
    isLoading,
    error: error?.message ?? null,
    filters,
    updateFilters,
    loadPage,
    clearFilters,
    refetch,
  };
}


