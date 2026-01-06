"use client";

import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { SelectOption } from "@/components/ui/custom/select/types";
import {
  listAdminCompanies,
  type AdminCompanyListApiResponse,
  type AdminCompanyListItem,
} from "@/api/empresas";

function isErrorResponse(
  response: AdminCompanyListApiResponse
): response is Extract<AdminCompanyListApiResponse, { success?: false }> {
  return "success" in response && response.success === false;
}

const SELECT_QUERY_KEY = ["admin-companies", "select-options", "estagios"] as const;
const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 30 * 60 * 1000;

const buildCompanyListQueryKey = (page: number, pageSize: number) =>
  ["admin-company-list", "estagios", page, pageSize] as const;

async function fetchCompanies(
  queryClient: ReturnType<typeof useQueryClient>
): Promise<AdminCompanyListItem[]> {
  const pageSize = 100;
  const collected: AdminCompanyListItem[] = [];

  let currentPage = 1;
  let totalPages = 1;

  while (currentPage <= totalPages) {
    const response = await queryClient.fetchQuery({
      queryKey: buildCompanyListQueryKey(currentPage, pageSize),
      queryFn: async () => listAdminCompanies({ page: currentPage, pageSize }),
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
    });

    if (isErrorResponse(response)) {
      throw new Error(response.message || "Erro ao carregar empresas.");
    }

    const data = response.data ?? [];
    collected.push(...data);

    const pagination = response.pagination;
    if (!pagination) break;

    totalPages = pagination.totalPages ?? currentPage;
    if (currentPage >= totalPages) break;
    currentPage += 1;
  }

  return collected;
}

export function useEmpresasForSelect(enabled: boolean = true) {
  const queryClient = useQueryClient();

  const queryFn = useCallback(() => fetchCompanies(queryClient), [queryClient]);

  const {
    data: empresasData = [],
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: SELECT_QUERY_KEY,
    queryFn,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    enabled,
  });

  const empresas = useMemo<SelectOption[]>(() => {
    return empresasData
      .map((empresa) => ({ value: empresa.id, label: empresa.nome }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  }, [empresasData]);

  const errorMessage =
    error instanceof Error
      ? error.message
      : error
        ? "Erro ao carregar empresas. Tente novamente."
        : null;

  const handleRefetch = useCallback(async () => {
    const result = await refetch();
    if (result.error) throw result.error;
    return result.data ?? [];
  }, [refetch]);

  return {
    empresas,
    empresasData,
    isLoading: isLoading || isFetching,
    error: errorMessage,
    refetch: handleRefetch,
  };
}

