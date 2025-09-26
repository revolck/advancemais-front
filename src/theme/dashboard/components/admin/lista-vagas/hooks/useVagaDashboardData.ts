"use client";

import { useCallback, useEffect, useState } from "react";
import { listVagas } from "@/api/vagas";
import type { VagaListItem, VagaListParams } from "@/api/vagas";

interface UseVagaDashboardDataProps {
  enabled: boolean;
  pageSize: number;
  autoFetch?: boolean;
  onSuccess?: (data: VagaListItem[], response: any) => void;
  onError?: (error: string) => void;
}

interface VagaDashboardDataReturn {
  vagas: VagaListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  refetch: (params?: VagaListParams) => Promise<void>;
}

export function useVagaDashboardData({
  enabled,
  pageSize,
  autoFetch = true,
  onSuccess,
  onError,
}: UseVagaDashboardDataProps): VagaDashboardDataReturn {
  const [vagas, setVagas] = useState<VagaListItem[]>([]);
  const [pagination, setPagination] = useState<{
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVagas = useCallback(
    async (params?: VagaListParams) => {
      if (!enabled) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await listVagas({
          page: params?.page || 1,
          pageSize: params?.pageSize || pageSize,
          status: params?.status,
          usuarioId: params?.usuarioId,
        });

        // A API pode retornar um array direto ou um objeto com data e pagination
        if (Array.isArray(response)) {
          setVagas(response);
          setPagination(null);
          onSuccess?.(response, null);
        } else {
          setVagas(response.data || []);
          setPagination(response.pagination || null);
          onSuccess?.(response.data || [], response);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao carregar vagas";
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [enabled, pageSize, onSuccess, onError]
  );

  const refetch = useCallback(
    async (params?: VagaListParams) => {
      await fetchVagas(params);
    },
    [fetchVagas]
  );

  useEffect(() => {
    if (enabled && autoFetch) {
      fetchVagas();
    }
  }, [enabled, autoFetch, fetchVagas]);

  return {
    vagas,
    pagination,
    isLoading,
    error,
    refetch,
  };
}
