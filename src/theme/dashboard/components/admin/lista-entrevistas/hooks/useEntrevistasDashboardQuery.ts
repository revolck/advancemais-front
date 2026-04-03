"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  listEntrevistasOverview,
  type EntrevistaOverviewCapabilities,
  type EntrevistaOverviewItem,
  type EntrevistasOverviewFiltrosDisponiveis,
  type EntrevistasOverviewSummary,
} from "@/api/entrevistas";
import { queryKeys } from "@/lib/react-query/queryKeys";

export interface NormalizedEntrevistasFilters {
  page: number;
  pageSize: number;
  search?: string;
  empresaUsuarioId?: string | null;
  vagaId?: string | null;
  recrutadorId?: string | null;
  statusEntrevista?: string[] | string | null;
  modalidades?: string[] | string | null;
  dataInicio?: string;
  dataFim?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface EntrevistasQueryResult {
  entrevistas: EntrevistaOverviewItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  summary?: EntrevistasOverviewSummary;
  filtrosDisponiveis?: EntrevistasOverviewFiltrosDisponiveis;
  capabilities?: EntrevistaOverviewCapabilities;
}

export function useEntrevistasDashboardQuery(
  filters: NormalizedEntrevistasFilters,
) {
  return useQuery<EntrevistasQueryResult, Error>({
    queryKey: queryKeys.entrevistas.list(filters),
    queryFn: async () => {
      const response = await listEntrevistasOverview({
        page: filters.page,
        pageSize: filters.pageSize,
        search: filters.search ?? undefined,
        empresaUsuarioId: filters.empresaUsuarioId ?? undefined,
        vagaId: filters.vagaId ?? undefined,
        recrutadorId: filters.recrutadorId ?? undefined,
        statusEntrevista: filters.statusEntrevista ?? undefined,
        modalidades: filters.modalidades ?? undefined,
        dataInicio: filters.dataInicio ?? undefined,
        dataFim: filters.dataFim ?? undefined,
        sortBy: filters.sortBy ?? undefined,
        sortDir: filters.sortDir ?? undefined,
      });

      const entrevistas = response.items ?? [];

      return {
        entrevistas,
        pagination: {
          page: response.pagination?.page ?? filters.page,
          pageSize: response.pagination?.pageSize ?? filters.pageSize,
          total: response.pagination?.total ?? entrevistas.length,
          totalPages:
            response.pagination?.totalPages ??
            Math.max(
              1,
              Math.ceil(
                (response.pagination?.total ?? entrevistas.length) /
                  Math.max(filters.pageSize, 1),
              ),
            ),
        },
        summary: response.summary,
        filtrosDisponiveis: response.filtrosDisponiveis,
        capabilities: response.capabilities,
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
