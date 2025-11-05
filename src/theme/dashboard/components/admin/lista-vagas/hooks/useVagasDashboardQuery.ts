"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  listVagas,
  type VagaListItem,
  type VagaListParams,
  type VagaStatus,
} from "@/api/vagas";
import { queryKeys } from "@/lib/react-query/queryKeys";

export interface NormalizedVagaFilters {
  page: number;
  pageSize: number;
  statuses: VagaStatus[];
  company?: string | null;
  location?: string | null;
  search?: string;
}

export interface VagasQueryResult {
  vagas: VagaListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

function buildParams(filters: NormalizedVagaFilters): VagaListParams {
  const params: VagaListParams = {
    page: filters.page,
    pageSize: filters.pageSize,
  };

  if (filters.statuses.length === 1) {
    params.status = filters.statuses[0];
  } else if (filters.statuses.length > 1) {
    params.status = filters.statuses;
  }

  return params;
}

function applyClientFilters(
  vagas: VagaListItem[],
  filters: NormalizedVagaFilters
): VagaListItem[] {
  const searchTerm = filters.search?.toLowerCase();
  const locationTerm = filters.location?.toLowerCase();
  const companyTerm = filters.company?.toLowerCase();

  return vagas.filter((vaga) => {
    const matchesStatus =
      filters.statuses.length === 0 || filters.statuses.includes(vaga.status);

    const matchesCompany =
      !companyTerm || vaga.empresa.nome.toLowerCase() === companyTerm;

    let matchesLocation = true;
    if (locationTerm) {
      const cidade = vaga.localizacao?.cidade ?? "—";
      const estado = vaga.localizacao?.estado ?? "—";
      const composed = `${cidade}, ${estado}`.toLowerCase();
      matchesLocation = composed === locationTerm;
    }

    let matchesSearch = true;
    if (searchTerm) {
      matchesSearch =
        vaga.titulo.toLowerCase().includes(searchTerm) ||
        vaga.codigo.toLowerCase().includes(searchTerm) ||
        vaga.empresa.nome.toLowerCase().includes(searchTerm);
    }

    return matchesStatus && matchesCompany && matchesLocation && matchesSearch;
  });
}

export function useVagasDashboardQuery(
  filters: NormalizedVagaFilters,
  enabled: boolean
) {
  return useQuery<VagasQueryResult, Error>({
    queryKey: queryKeys.vagas.list(filters),
    queryFn: async () => {
      const params = buildParams(filters);
      const response = await listVagas(params);

      let vagas: VagaListItem[] = [];
      let pagination = {
        page: filters.page,
        pageSize: filters.pageSize,
        total: 0,
        totalPages: 1,
      };

      if (Array.isArray(response)) {
        vagas = response;
        pagination.total = response.length;
        pagination.totalPages = Math.max(
          1,
          Math.ceil(response.length / filters.pageSize)
        );
      } else {
        vagas = response.data ?? [];
        pagination = {
          page: response.pagination?.page ?? filters.page,
          pageSize: response.pagination?.pageSize ?? filters.pageSize,
          total: response.pagination?.total ?? vagas.length,
          totalPages:
            response.pagination?.totalPages ??
            Math.max(1, Math.ceil((response.pagination?.total ?? vagas.length) / filters.pageSize)),
        };
      }

      const filtered = applyClientFilters(vagas, filters);
      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));

      const hasClientFilters =
        filters.statuses.length > 0 ||
        !!filters.company ||
        !!filters.location ||
        !!filters.search;

      const effectivePagination = hasClientFilters
        ? {
            page: Math.min(filters.page, totalPages),
            pageSize: filters.pageSize,
            total,
            totalPages,
          }
        : {
            page: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            totalPages: pagination.totalPages,
          };

      return {
        vagas: filtered,
        pagination: effectivePagination,
      } satisfies VagasQueryResult;
    },
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
