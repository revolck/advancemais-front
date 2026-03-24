"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  listAuditoriaLogs,
  type AuditoriaLog,
  type AuditoriaFiltrosDisponiveis,
} from "@/api/auditoria";
import { queryKeys } from "@/lib/react-query/queryKeys";

export interface NormalizedHistoricoFilters {
  page: number;
  pageSize: number;
  categorias?: string[] | null;
  tipo?: string | null;
  search?: string;
  dataInicio?: string;
  dataFim?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface HistoricoQueryResult {
  logs: AuditoriaLog[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  filtrosDisponiveis?: AuditoriaFiltrosDisponiveis;
}

export function useHistoricoDashboardQuery(filters: NormalizedHistoricoFilters) {
  return useQuery<HistoricoQueryResult, Error>({
    queryKey: queryKeys.auditoria.logs.list(filters),
    queryFn: async () => {
      const response = await listAuditoriaLogs({
        page: filters.page,
        pageSize: filters.pageSize,
        categorias: filters.categorias ?? undefined,
        tipos: filters.tipo ?? undefined,
        search: filters.search ?? undefined,
        dataInicio: filters.dataInicio ?? undefined,
        dataFim: filters.dataFim ?? undefined,
        sortBy: filters.sortBy ?? "dataHora",
        sortDir: filters.sortDir ?? "desc",
      });

      const logs = response.items ?? [];

      return {
        logs,
        pagination: {
          page: response.page ?? filters.page,
          pageSize: response.pageSize ?? filters.pageSize,
          total: response.total ?? logs.length,
          totalPages:
            response.totalPages ??
            Math.max(
              1,
              Math.ceil((response.total ?? logs.length) / filters.pageSize)
            ),
        },
        filtrosDisponiveis: response.filtrosDisponiveis,
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
