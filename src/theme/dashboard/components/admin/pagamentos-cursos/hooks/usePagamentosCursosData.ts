"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { listMeusPagamentos } from "@/api/cursos";
import type { MeuPagamentoItem } from "@/api/cursos/types";
import type {
  PagamentoCurso,
  PagamentosCursosData,
  PagamentosCursosParams,
} from "../types";

const DEFAULT_PAGE_SIZE = 10;
const EMPTY_DATA: PagamentosCursosData = {
  pagamentos: [],
  resumo: {
    totalPago: 0,
    totalPendente: 0,
    totalTransacoes: 0,
    ultimoPagamento: null,
  },
  pagination: { page: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0, totalPages: 1 },
  pendingCount: 0,
  filters: { cursos: [], turmas: [], metodos: [], status: [] },
};

export function mapMeuPagamentoToCurso(item: MeuPagamentoItem): PagamentoCurso {
  return {
    ...item,
    status:
      item.status === "PROCESSANDO"
        ? "EM_PROCESSAMENTO"
        : item.status === "ESTORNADO"
          ? "CANCELADO"
          : item.status,
  };
}

export function shouldShowPagamentosAsEmptyState(error: unknown): boolean {
  const status = (error as { status?: number } | null)?.status;
  return status === 403 || status === 404;
}

export function usePagamentosCursosData(
  initialFilters?: PagamentosCursosParams
) {
  const [filters, setFilters] = useState<PagamentosCursosParams>({
    tab: "pendentes",
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
    queryFn: async (): Promise<PagamentosCursosData> => {
      try {
        const response = await listMeusPagamentos(filters);
        const pagamentos = response.items.map(mapMeuPagamentoToCurso);
        return {
          pagamentos,
          resumo: response.summary,
          pagination: response.pagination,
          pendingCount: response.pendingCount,
          filters: response.filters,
        };
      } catch (error: any) {
        if (shouldShowPagamentosAsEmptyState(error)) {
          return {
            ...EMPTY_DATA,
            pagination: {
              ...EMPTY_DATA.pagination,
              page: filters.page ?? 1,
              pageSize: filters.pageSize ?? DEFAULT_PAGE_SIZE,
            },
          };
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchOnWindowFocus: true,
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
      tab: "pendentes",
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

