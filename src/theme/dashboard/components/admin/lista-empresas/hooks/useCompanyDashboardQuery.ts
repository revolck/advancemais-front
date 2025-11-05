"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  listAdminCompanies,
  type AdminCompanyListItem,
  type AdminCompanyListParams,
} from "@/api/empresas";
import { queryKeys } from "@/lib/react-query/queryKeys";
import type { Partnership } from "../types";

function mapAdminCompanyToPartnership(
  company: AdminCompanyListItem
): Partnership {
  const plan = company.plano;
  const vagasPublicadas = company.vagasPublicadas ?? 0;
  const limiteVagas = company.limiteVagasPlano ?? plan?.quantidadeVagas ?? 0;

  return {
    id: company.id,
    tipo: plan?.modo,
    inicio: plan?.inicio ?? null,
    fim: plan?.fim ?? null,
    ativo: company.ativa,
    empresa: {
      id: company.id,
      nome: company.nome,
      avatarUrl: company.avatarUrl ?? null,
      cidade: company.cidade ?? null,
      estado: company.estado ?? null,
      descricao: company.informacoes?.descricao ?? null,
      instagram: null,
      linkedin: null,
      codUsuario: company.codUsuario,
      cnpj: company.cnpj ?? null,
      ativo: company.ativa,
      status: company.ativa ? "ATIVO" : "INATIVO",
      criadoEm: company.criadoEm ?? null,
      parceira: company.parceira,
      diasTesteDisponibilizados: company.diasTesteDisponibilizados ?? null,
      banida: company.banida,
      banimentoAtivo: company.banimentoAtivo ?? null,
      bloqueada: company.bloqueada ?? false,
      bloqueioAtivo: company.bloqueioAtivo ?? null,
    },
    plano: {
      id: plan?.id ?? `${company.id}-plano`,
      nome: plan?.nome ?? "Plano não informado",
      valor: plan?.valor ?? null,
      quantidadeVagas: plan?.quantidadeVagas ?? limiteVagas,
      vagasPublicadas,
      tipo: plan?.modo,
      inicio: plan?.inicio ?? null,
      fim: plan?.fim ?? null,
      metodoPagamento: plan?.metodoPagamento ?? null,
      modeloPagamento: plan?.modeloPagamento ?? null,
      statusPagamento: plan?.statusPagamento ?? null,
      duracaoEmDias: plan?.duracaoEmDias ?? null,
      diasRestantes: plan?.diasRestantes ?? null,
    },
    pagamento: null,
    raw: company,
  };
}

export interface NormalizedCompanyFilters {
  page: number;
  pageSize: number;
  search?: string;
}

export interface CompanyQueryResult {
  partnerships: Partnership[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

function buildParams(filters: NormalizedCompanyFilters): AdminCompanyListParams {
  const params: AdminCompanyListParams = {
    page: filters.page,
    pageSize: filters.pageSize,
  };

  if (filters.search && filters.search.trim().length > 0) {
    params.search = filters.search.trim();
  }

  return params;
}

export function useCompanyDashboardQuery(
  filters: NormalizedCompanyFilters,
  enabled: boolean
) {
  return useQuery<CompanyQueryResult, Error>({
    queryKey: queryKeys.empresas.list(filters),
    queryFn: async () => {
      const params = buildParams(filters);
      const response = await listAdminCompanies(params);

      if (!response || !("data" in response)) {
        throw new Error("Resposta inválida da API");
      }

      const partnerships = response.data.map(mapAdminCompanyToPartnership);
      const pagination = response.pagination ?? {
        page: filters.page,
        pageSize: filters.pageSize,
        total: partnerships.length,
        totalPages: Math.max(
          1,
          Math.ceil(partnerships.length / filters.pageSize)
        ),
      };

      return {
        partnerships,
        pagination: {
          page: pagination.page ?? filters.page,
          pageSize: pagination.pageSize ?? filters.pageSize,
          total: pagination.total ?? partnerships.length,
          totalPages:
            pagination.totalPages ??
            Math.max(
              1,
              Math.ceil(
                (pagination.total ?? partnerships.length) / filters.pageSize
              )
            ),
        },
      } satisfies CompanyQueryResult;
    },
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
