"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { listCursos, type Curso, type CursosListParams } from "@/api/cursos";
import { queryKeys } from "@/lib/react-query/queryKeys";

import type { 
  Pagination, 
  Filters, 
  Meta 
} from "@/api/cursos/types";

export interface NormalizedCursosFilters {
  page: number;
  pageSize: number;
  statuses: string[];
  search?: string;
  categoriaId?: number;
  subcategoriaId?: number;
}

export interface CursosQueryResult {
  cursos: Curso[];
  pagination: Pagination;
  filters?: Filters;
  meta?: Meta;
}

function buildParams(filters: NormalizedCursosFilters): CursosListParams {
  const params: CursosListParams = {
    page: filters.page,
    pageSize: filters.pageSize,
  };

  if (filters.search && filters.search.trim().length > 0) {
    params.search = filters.search.trim();
  }

  if (filters.statuses.length > 0) {
    params.statusPadrao = filters.statuses; // Envia como array
  }

  if (filters.categoriaId) {
    params.categoriaId = filters.categoriaId;
  }

  if (filters.subcategoriaId) {
    params.subcategoriaId = filters.subcategoriaId;
  }

  return params;
}

export function useCursosDashboardQuery(
  filters: NormalizedCursosFilters,
  enabled: boolean
) {
  return useQuery<CursosQueryResult, Error>({
    queryKey: queryKeys.cursos.list(filters),
    queryFn: async () => {
      const params = buildParams(filters);
      const response = await listCursos(params);

      const cursos = response.data ?? [];
      
      // Usa a paginação completa da API ou cria fallback
      const pagination: Pagination = response.pagination ?? {
        requestedPage: filters.page,
        page: filters.page,
        isPageAdjusted: false,
        hasNext: false,
        hasPrevious: false,
        pageSize: filters.pageSize,
        total: cursos.length,
        totalPages: Math.max(
          1,
          Math.ceil(cursos.length / filters.pageSize)
        ),
      };

      return {
        cursos,
        pagination,
        filters: response.filters,
        meta: response.meta,
      } satisfies CursosQueryResult;
    },
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
