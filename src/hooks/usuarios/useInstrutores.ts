import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { listInstrutores, type ListInstrutoresParams, type ListInstrutoresResponse } from "@/api/usuarios";
import { queryKeys } from "@/lib/react-query/queryKeys";
import type { StatusUsuario } from "@/api/usuarios/types";

export interface UseInstrutoresParams {
  page?: number;
  limit?: number;
  status?: StatusUsuario;
  search?: string;
  enabled?: boolean;
}

export interface UseInstrutoresReturn {
  data: ListInstrutoresResponse | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook otimizado para listar instrutores com cache de 30 segundos
 * 
 * @param params - Parâmetros de filtro e paginação
 * @returns Dados, estados de loading e função de refetch
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useInstrutores({
 *   page: 1,
 *   limit: 20,
 *   status: 'ATIVO',
 *   search: 'Maria'
 * });
 * ```
 */
export function useInstrutores(params: UseInstrutoresParams = {}): UseInstrutoresReturn {
  const {
    page = 1,
    limit = 20,
    status,
    search,
    enabled = true,
  } = params;

  // Normaliza parâmetros para a query key
  const normalizedParams = {
    page,
    limit,
    ...(status && { status }),
    // Apenas inclui search na query key se tiver 3+ caracteres
    ...(search && search.length >= 3 && { search }),
  };

  const query = useQuery({
    queryKey: queryKeys.instrutores.list(normalizedParams),
    queryFn: async () => {
      const queryParams: ListInstrutoresParams = {
        page,
        limit,
      };

      if (status) queryParams.status = status;
      // Apenas busca se tiver 3+ caracteres
      if (search && search.length >= 3) {
        queryParams.search = search;
      }

      return listInstrutores(queryParams);
    },
    enabled,
    staleTime: 30 * 1000, // 30 segundos (igual ao backend)
    gcTime: 60 * 1000, // 1 minuto
    placeholderData: keepPreviousData, // Mantém dados anteriores durante refetch
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}

