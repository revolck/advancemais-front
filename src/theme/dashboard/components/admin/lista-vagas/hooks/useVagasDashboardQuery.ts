"use client";

import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  listVagas,
  type VagaListItem,
  type VagaListParams,
  type VagaStatus,
} from "@/api/vagas";
import { listMyCompanyVacancies } from "@/api/empresas";
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
  /** Vagas da página atual (já filtradas) */
  vagas: VagaListItem[];
  /** Todas as vagas das situações escolhidas: base das opções de empresa/localização */
  todas: VagaListItem[];
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

/** Situações pedidas à API (sem filtro = todas) */
function statusParaApi(filters: NormalizedVagaFilters): VagaListParams["status"] {
  if (filters.statuses.length === 0) return ALL_STATUSES;
  return filters.statuses.length === 1 ? filters.statuses[0] : filters.statuses;
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
      !companyTerm || vaga.empresa?.nome?.toLowerCase() === companyTerm;

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
        Boolean(vaga.empresa?.nome?.toLowerCase().includes(searchTerm));
    }

    return matchesStatus && matchesCompany && matchesLocation && matchesSearch;
  });
}

/** Filtra e pagina no navegador, sobre todas as vagas carregadas */
export function paginarVagas(
  todas: VagaListItem[],
  filters: NormalizedVagaFilters
): VagasQueryResult {
  const filtradas = applyClientFilters(todas, filters);
  const total = filtradas.length;
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  const page = Math.min(Math.max(1, filters.page), totalPages);
  const inicio = (page - 1) * filters.pageSize;
  return {
    vagas: filtradas.slice(inicio, inicio + filters.pageSize),
    todas,
    pagination: { page, pageSize: filters.pageSize, total, totalPages },
  };
}

/**
 * Lista de vagas do painel. Busca TODAS as vagas das situações escolhidas (a API
 * devolvia só a página pedida, sem total, e a tela mostrava 10 sem próxima página;
 * busca e filtros de empresa/localização só olhavam essas 10). Paginação, busca e
 * filtros rodam sobre o conjunto inteiro; trocar de página não chama a API de novo.
 */
export function useVagasDashboardQuery(
  filters: NormalizedVagaFilters,
  enabled: boolean
) {
  const userRole = useUserRole();
  const status = statusParaApi(filters);
  const { page, pageSize, statuses, company, location, search } = filters;

  // select estável: o React Query só recalcula a página quando os dados ou os filtros
  // mudam (um objeto novo a cada render dispararia os efeitos que dependem de `data`)
  const selecionar = useCallback(
    (todas: VagaListItem[]) =>
      paginarVagas(todas, { page, pageSize, statuses, company, location, search }),
    // statuses entra pelo conteúdo, não pela referência do array
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, pageSize, statuses.join(","), company, location, search]
  );

  return useQuery<VagaListItem[], Error, VagasQueryResult>({
    queryKey: ["admin-vagas-list", { status, userRole }],
    queryFn: async () => {
      // Empresa: só as próprias (rota /minhas, já restrita pelo token)
      if (userRole === UserRole.EMPRESA) {
        const response = await listMyCompanyVacancies({ status: status as any });
        return "data" in response ? ((response.data ?? []) as VagaListItem[]) : [];
      }
      const response = await listVagas({ status });
      return Array.isArray(response) ? response : (response.data ?? []);
    },
    select: selecionar,
    enabled,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });
}
