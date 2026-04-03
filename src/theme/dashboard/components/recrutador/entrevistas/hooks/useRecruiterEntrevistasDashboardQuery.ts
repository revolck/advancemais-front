"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  listRecrutadorEntrevistasOverview,
  type ListRecrutadorEntrevistasOverviewParams,
  type RecrutadorEntrevistasOverviewResponse,
} from "@/api/recrutador";

export interface NormalizedRecruiterEntrevistasFilters
  extends ListRecrutadorEntrevistasOverviewParams {
  page: number;
  pageSize: number;
}

export interface RecruiterEntrevistasQueryResult {
  entrevistas: RecrutadorEntrevistasOverviewResponse["items"];
  pagination: RecrutadorEntrevistasOverviewResponse["pagination"];
  summary?: RecrutadorEntrevistasOverviewResponse["summary"];
  filtrosDisponiveis?: RecrutadorEntrevistasOverviewResponse["filtrosDisponiveis"];
  capabilities?: RecrutadorEntrevistasOverviewResponse["capabilities"];
}

export function useRecruiterEntrevistasDashboardQuery(
  filters: NormalizedRecruiterEntrevistasFilters,
) {
  return useQuery<RecruiterEntrevistasQueryResult, Error>({
    queryKey: ["recrutador-entrevistas-list", filters],
    queryFn: async () => {
      const response = await listRecrutadorEntrevistasOverview({
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
