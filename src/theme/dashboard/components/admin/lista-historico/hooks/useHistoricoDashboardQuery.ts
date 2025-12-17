"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  listAuditoriaLogs,
  type AuditoriaLog,
  type AuditoriaLogsListParams,
} from "@/api/auditoria";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { getMockAuditoriaLogsResponse } from "@/mockData/auditoria";

export interface NormalizedHistoricoFilters {
  page: number;
  pageSize: number;
  categoria?: string | string[] | null;
  tipo?: string | null;
  usuarioId?: string | null;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface HistoricoQueryResult {
  logs: AuditoriaLog[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function useHistoricoDashboardQuery(filters: NormalizedHistoricoFilters) {
  return useQuery<HistoricoQueryResult, Error>({
    queryKey: ["auditoria", "historico", filters],
    queryFn: async () => {
      // Usar dados mockados
      const response = getMockAuditoriaLogsResponse({
        categoria: filters.categoria
          ? Array.isArray(filters.categoria)
            ? filters.categoria
            : [filters.categoria]
          : undefined,
        tipo: filters.tipo ?? undefined,
        usuarioId: filters.usuarioId ?? undefined,
        search: filters.search ?? undefined,
        page: filters.page,
        pageSize: filters.pageSize,
      });

      const logs = response.items ?? [];

      return {
        logs,
        pagination: {
          page: response.page ?? filters.page,
          pageSize: response.pageSize ?? filters.pageSize,
          total: response.total ?? logs.length,
          totalPages: response.totalPages ?? Math.max(1, Math.ceil((response.total ?? logs.length) / filters.pageSize)),
        },
      };

      // Código original da API (comentado para uso futuro)
      /*
      const params: AuditoriaLogsListParams = {
        page: filters.page,
        pageSize: filters.pageSize,
      };

      if (filters.categoria) {
        params.categoria = Array.isArray(filters.categoria) && filters.categoria.length === 1
          ? filters.categoria[0]
          : filters.categoria[0];
      }
      if (filters.tipo) {
        params.tipo = filters.tipo;
      }
      if (filters.usuarioId) {
        params.usuarioId = filters.usuarioId;
      }
      if (filters.search) {
        params.search = filters.search;
      }
      if (filters.startDate) {
        params.startDate = filters.startDate;
      }
      if (filters.endDate) {
        params.endDate = filters.endDate;
      }

      const response = await listAuditoriaLogs(params);

      const logs = response.items ?? [];

      return {
        logs,
        pagination: {
          page: response.page ?? filters.page,
          pageSize: response.pageSize ?? filters.pageSize,
          total: response.total ?? logs.length,
          totalPages: response.totalPages ?? Math.max(1, Math.ceil((response.total ?? logs.length) / filters.pageSize)),
        },
      };
      */
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

