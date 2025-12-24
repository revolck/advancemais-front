"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  listAlunosComInscricao,
  type AlunoComInscricao,
  type ListAlunosComInscricaoParams,
} from "@/api/cursos";
import { queryKeys } from "@/lib/react-query/queryKeys";

export interface NormalizedAlunosFilters {
  page: number;
  pageSize: number;
  status?: string | string[] | null; // Status único ou array para múltiplos status
  cursoId?: string | null; // UUID (string) - seleção individual
  turmaId?: string | null; // UUID (string) - seleção individual
  cidade?: string | string[] | null; // Cidade único ou array para múltiplas cidades
  search?: string;
}

export interface AlunosQueryResult {
  alunos: AlunoComInscricao[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function useAlunosDashboardQuery(filters: NormalizedAlunosFilters) {
  return useQuery<AlunosQueryResult, Error>({
    queryKey: queryKeys.alunos.list(filters),
    queryFn: async () => {
      const params: ListAlunosComInscricaoParams = {
        page: filters.page,
        limit: filters.pageSize,
      };

      if (filters.status) {
        params.status =
          Array.isArray(filters.status) && filters.status.length === 1
            ? filters.status[0]
            : filters.status;
      }
      if (filters.cursoId) {
        params.cursoId = filters.cursoId;
      }
      if (filters.turmaId) {
        params.turmaId = filters.turmaId;
      }
      if (filters.cidade) {
        params.cidade =
          Array.isArray(filters.cidade) && filters.cidade.length === 1
            ? filters.cidade[0]
            : filters.cidade;
      }
      if (filters.search) params.search = filters.search;

      const response = await listAlunosComInscricao(params);

      const alunos = response.data ?? [];
      const apiPagination = response.pagination;

      const page = apiPagination?.page ?? filters.page;
      const pageSize = apiPagination?.pageSize ?? filters.pageSize;
      const total = apiPagination?.total ?? alunos.length;
      const totalPages =
        apiPagination?.totalPages && apiPagination.totalPages > 0
          ? apiPagination.totalPages
          : Math.max(1, Math.ceil(total / Math.max(1, pageSize)));

      return {
        alunos,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
        },
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
