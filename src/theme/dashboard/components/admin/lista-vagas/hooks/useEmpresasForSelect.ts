"use client";

import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { SelectOption } from "@/components/ui/custom/select/types";
import {
  listAdminCompanies,
  type AdminCompanyListApiResponse,
  type AdminCompanyListItem,
} from "@/api/empresas";

interface EmpresaOption extends SelectOption {
  planoNome?: string;
  planoModo?: string;
}

function isErrorResponse(
  response: AdminCompanyListApiResponse
): response is Extract<AdminCompanyListApiResponse, { success?: false }> {
  return "success" in response && response.success === false;
}

function isEmpresaElegivel(empresa: AdminCompanyListItem): boolean {
  const plano = empresa.plano;

  if (!plano || !plano.id) {
    return false;
  }

  const modosValidos = new Set(["CLIENTE", "PARCEIRO", "TESTE"]);
  const modoValido = modosValidos.has(plano.modo);
  const planoAtivo = plano.status === "ATIVO";

  const empresaParceira = Boolean(empresa.parceira);
  const empresaEmTeste =
    plano.modo === "TESTE" || empresa.diasTesteDisponibilizados > 0;

  return (
    modoValido &&
    planoAtivo &&
    (plano.modo === "CLIENTE" || empresaParceira || empresaEmTeste)
  );
}

function mapEmpresaToOption(empresa: AdminCompanyListItem): EmpresaOption {
  const plano = empresa.plano;

  return {
    value: empresa.id,
    label: empresa.nome,
    planoNome: plano?.nome,
    planoModo: plano?.modo,
  };
}

const SELECT_QUERY_KEY = ["admin-companies", "select-options"] as const;
const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 30 * 60 * 1000;

const buildCompanyListQueryKey = (
  page: number,
  pageSize: number,
  search = ""
) => ["admin-company-list", page, pageSize, search] as const;

async function fetchEligibleCompanies(
  queryClient: ReturnType<typeof useQueryClient>
): Promise<AdminCompanyListItem[]> {
  const pageSize = 100;
  const collected: AdminCompanyListItem[] = [];

  let currentPage = 1;
  let totalPages = 1;

  while (currentPage <= totalPages) {
    const params = { page: currentPage, pageSize };
    const response = await queryClient.fetchQuery({
      queryKey: buildCompanyListQueryKey(
        params.page ?? 1,
        params.pageSize ?? pageSize
      ),
      queryFn: async () => listAdminCompanies(params),
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
    });

    if (isErrorResponse(response)) {
      throw new Error(response.message || "Erro ao carregar empresas.");
    }

    const data = response.data ?? [];
    collected.push(...data);

    const pagination = response.pagination;

    if (!pagination) {
      break;
    }

    totalPages = pagination.totalPages ?? currentPage;
    if (currentPage >= totalPages) {
      break;
    }

    currentPage += 1;
  }

  return collected.filter(isEmpresaElegivel);
}

export function useEmpresasForSelect(enabled: boolean = true) {
  const queryClient = useQueryClient();

  const queryFn = useCallback(
    () => fetchEligibleCompanies(queryClient),
    [queryClient]
  );

  const {
    data: rawEmpresas = [],
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: SELECT_QUERY_KEY,
    queryFn,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    enabled, // Só executa a query se enabled for true
  });

  const empresas = useMemo(() => {
    return rawEmpresas
      .map(mapEmpresaToOption)
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  }, [rawEmpresas]);

  const errorMessage =
    error instanceof Error
      ? error.message
      : error
        ? "Erro ao carregar empresas. Tente novamente."
        : null;

  const handleRefetch = useCallback(async () => {
    const result = await refetch();
    if (result.error) {
      throw result.error;
    }
    return result.data ?? [];
  }, [refetch]);

  return {
    empresas,
    empresasData: rawEmpresas,
    isLoading: isLoading || isFetching,
    error: errorMessage,
    refetch: handleRefetch,
  };
}

