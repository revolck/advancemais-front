"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  listAuditoriaTransacoes,
  type AuditoriaTransacao,
  type AuditoriaTransacoesFiltrosDisponiveis,
  type AuditoriaTransacoesResumo,
} from "@/api/auditoria";
import { queryKeys } from "@/lib/react-query/queryKeys";

export interface NormalizedTransacoesFilters {
  page: number;
  pageSize: number;
  tipos?: string | string[] | null;
  status?: string | string[] | null;
  gateway?: string | null;
  usuarioId?: string | null;
  empresaId?: string | null;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  dataInicio?: string;
  dataFim?: string;
}

export interface TransacoesQueryResult {
  transacoes: AuditoriaTransacao[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  resumo?: AuditoriaTransacoesResumo;
  filtrosDisponiveis?: AuditoriaTransacoesFiltrosDisponiveis;
}

export function useTransacoesDashboardQuery(filters: NormalizedTransacoesFilters) {
  return useQuery<TransacoesQueryResult, Error>({
    queryKey: queryKeys.auditoria.transacoes.list(filters),
    queryFn: async () => {
      const response = await listAuditoriaTransacoes({
        page: filters.page,
        pageSize: filters.pageSize,
        tipos: filters.tipos ?? undefined,
        status: filters.status ?? undefined,
        gateway: filters.gateway ?? undefined,
        usuarioId: filters.usuarioId ?? undefined,
        empresaId: filters.empresaId ?? undefined,
        search: filters.search ?? undefined,
        sortBy: filters.sortBy ?? undefined,
        sortDir: filters.sortDir ?? undefined,
        dataInicio: filters.dataInicio ?? undefined,
        dataFim: filters.dataFim ?? undefined,
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
        resumo: response.resumo,
        filtrosDisponiveis: response.filtrosDisponiveis,
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
