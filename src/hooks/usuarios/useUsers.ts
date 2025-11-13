import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { listUsuarios, type ListUsuariosParams, type ListUsuariosResponse } from "@/api/usuarios";
import { queryKeys } from "@/lib/react-query/queryKeys";
import type { StatusUsuario, Role } from "@/api/usuarios/types";

export interface UseUsersParams {
  page?: number;
  limit?: number;
  status?: StatusUsuario;
  role?: Role;
  cidade?: string;
  estado?: string;
  search?: string;
  enabled?: boolean;
}

export interface UseUsersReturn {
  data: ListUsuariosResponse | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook otimizado para listar usuários com cache de 30 segundos
 * 
 * @param params - Parâmetros de filtro e paginação
 * @returns Dados, estados de loading e função de refetch
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useUsers({
 *   page: 1,
 *   limit: 20,
 *   status: 'ATIVO',
 *   search: 'João'
 * });
 * ```
 */
export function useUsers(params: UseUsersParams = {}): UseUsersReturn {
  const {
    page = 1,
    limit = 20,
    status,
    role,
    cidade,
    estado,
    search,
    enabled = true,
  } = params;

  // Normaliza parâmetros para a query key
  const normalizedParams = {
    page,
    limit,
    ...(status && { status }),
    ...(role && { role }),
    ...(cidade && { cidade }),
    ...(estado && { estado }),
    // Apenas inclui search na query key se tiver 3+ caracteres
    ...(search && search.length >= 3 && { search }),
  };

  const query = useQuery({
    queryKey: queryKeys.usuarios.list(normalizedParams),
    queryFn: async () => {
      const queryParams: ListUsuariosParams = {
        page,
        limit,
      };

      if (status) queryParams.status = status;
      if (role) queryParams.role = role;
      if (cidade) queryParams.cidade = cidade;
      if (estado) queryParams.estado = estado;
      // Apenas busca se tiver 3+ caracteres
      if (search && search.length >= 3) {
        queryParams.search = search;
      }

      return listUsuarios(queryParams);
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

