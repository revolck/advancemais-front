"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  listAuditoriaTransacoes,
  type AuditoriaTransacao,
  type AuditoriaTransacoesListParams,
} from "@/api/auditoria";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { getMockTransacoesResponse } from "@/mockData/transacoes";

export interface NormalizedTransacoesFilters {
  page: number;
  pageSize: number;
  tipo?: string | string[] | null;
  status?: string | string[] | null;
  usuarioId?: string | null;
  empresaId?: string | null;
  startDate?: string;
  endDate?: string;
}

export interface TransacoesQueryResult {
  transacoes: AuditoriaTransacao[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function useTransacoesDashboardQuery(filters: NormalizedTransacoesFilters) {
  return useQuery<TransacoesQueryResult, Error>({
    queryKey: ["auditoria", "transacoes", filters],
    queryFn: async () => {
      // Usar dados mockados
      const response = getMockTransacoesResponse({
        tipo: filters.tipo
          ? Array.isArray(filters.tipo)
            ? filters.tipo
            : [filters.tipo]
          : undefined,
        status: filters.status
          ? Array.isArray(filters.status)
            ? filters.status
            : [filters.status]
          : undefined,
        usuarioId: filters.usuarioId ?? undefined,
        empresaId: filters.empresaId ?? undefined,
        page: filters.page,
        pageSize: filters.pageSize,
      });

      const transacoes = response.items ?? [];

      return {
        transacoes,
        pagination: {
          page: response.page ?? filters.page,
          pageSize: response.pageSize ?? filters.pageSize,
          total: response.total ?? transacoes.length,
          totalPages: response.totalPages ?? Math.max(1, Math.ceil((response.total ?? transacoes.length) / filters.pageSize)),
        },
      };

      // Código original da API (comentado para uso futuro)
      /*
      const params: AuditoriaTransacoesListParams = {
        page: filters.page,
        pageSize: filters.pageSize,
      };

      if (filters.tipo) {
        params.tipo = Array.isArray(filters.tipo) && filters.tipo.length === 1
          ? filters.tipo[0]
          : filters.tipo[0];
      }
      if (filters.status) {
        params.status = Array.isArray(filters.status) && filters.status.length === 1
          ? filters.status[0]
          : filters.status[0];
      }
      if (filters.usuarioId) {
        params.usuarioId = filters.usuarioId;
      }
      if (filters.empresaId) {
        params.empresaId = filters.empresaId;
      }
      if (filters.startDate) {
        params.startDate = filters.startDate;
      }
      if (filters.endDate) {
        params.endDate = filters.endDate;
      }

      const response = await listAuditoriaTransacoes(params);

      const transacoes = response.items ?? [];

      return {
        transacoes,
        pagination: {
          page: response.page ?? filters.page,
          pageSize: response.pageSize ?? filters.pageSize,
          total: response.total ?? transacoes.length,
          totalPages: response.totalPages ?? Math.max(1, Math.ceil((response.total ?? transacoes.length) / filters.pageSize)),
        },
      };
      */
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

