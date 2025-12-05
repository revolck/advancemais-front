"use client";

import { useQuery } from "@tanstack/react-query";

import {
  listVagas,
  type VagaListItem,
  type VagaListParams,
  type VagaStatus,
} from "@/api/vagas";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/config/roles";

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

// Todos os status disponíveis - usado quando não há filtro específico
const ALL_STATUSES: VagaStatus[] = [
  "RASCUNHO",
  "EM_ANALISE",
  "PUBLICADO",
  "DESPUBLICADA",
  "PAUSADA",
  "ENCERRADA",
  "EXPIRADO",
];

// Status disponíveis para SETOR_DE_VAGAS (sem RASCUNHO)
const SETOR_DE_VAGAS_STATUSES: VagaStatus[] = [
  "EM_ANALISE",
  "PUBLICADO",
  "DESPUBLICADA",
  "PAUSADA",
  "ENCERRADA",
  "EXPIRADO",
];

function buildParams(
  filters: NormalizedVagaFilters,
  userRole: UserRole | null
): VagaListParams {
  const params: VagaListParams = {
    page: filters.page,
    pageSize: filters.pageSize,
  };

  // Se não há status selecionado, enviar TODOS os status (API retorna PUBLICADO por padrão)
  // Se há status selecionado, enviar o(s) status para filtrar
  if (filters.statuses.length === 0) {
    // SETOR_DE_VAGAS não pode ver RASCUNHO
    // Apenas EMPRESA pode ver seus próprios rascunhos (API já faz essa validação)
    const statusList = userRole === UserRole.SETOR_DE_VAGAS 
      ? SETOR_DE_VAGAS_STATUSES 
      : ALL_STATUSES;
    
    params.status = statusList;
  } else if (filters.statuses.length === 1) {
    params.status = filters.statuses[0];
  } else {
    params.status = filters.statuses;
  }

  return params;
}

function applyClientFilters(
  vagas: VagaListItem[],
  filters: NormalizedVagaFilters,
  userRole: UserRole | null
): VagaListItem[] {
  const searchTerm = filters.search?.toLowerCase();
  const locationTerm = filters.location?.toLowerCase();
  const companyTerm = filters.company?.toLowerCase();

  return vagas.filter((vaga) => {
    // SETOR_DE_VAGAS não pode ver vagas RASCUNHO
    if (userRole === UserRole.SETOR_DE_VAGAS && vaga.status === "RASCUNHO") {
      return false;
    }

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
  const userRole = useUserRole();

  // Serializa os filtros para garantir que a queryKey seja diferente quando os valores mudam
  const serializedFilters = JSON.stringify({
    page: filters.page,
    pageSize: filters.pageSize,
    statuses: filters.statuses,
    company: filters.company,
    location: filters.location,
    search: filters.search,
    userRole, // Incluir role na queryKey para re-fetch quando mudar
  });

  return useQuery<VagasQueryResult, Error>({
    queryKey: ["admin-vagas-list", serializedFilters],
    queryFn: async () => {
      const params = buildParams(filters, userRole);
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

      const filtered = applyClientFilters(vagas, filters, userRole);
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
    // Remover placeholderData para forçar re-render quando filtros mudam
    staleTime: 0, // Sempre buscar dados frescos quando filtros mudam
    gcTime: 5 * 60 * 1000,
  });
}
