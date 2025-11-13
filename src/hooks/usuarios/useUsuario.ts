import { useQuery } from "@tanstack/react-query";
import { getUsuarioById, type GetUsuarioResponse } from "@/api/usuarios";
import { queryKeys } from "@/lib/react-query/queryKeys";

export interface UseUsuarioParams {
  userId: string;
  enabled?: boolean;
}

export interface UseUsuarioReturn {
  data: GetUsuarioResponse | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook otimizado para buscar um usuário específico por ID
 * Útil para prefetch antes de navegar para a página de detalhes
 * 
 * @param params - Parâmetros da query
 * @returns Dados, estados de loading e função de refetch
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useUsuario({
 *   userId: '123',
 *   enabled: !!userId
 * });
 * ```
 */
export function useUsuario(params: UseUsuarioParams): UseUsuarioReturn {
  const { userId, enabled = true } = params;

  const query = useQuery({
    queryKey: queryKeys.usuarios.detail(userId),
    queryFn: async () => {
      return getUsuarioById(userId);
    },
    enabled: enabled && !!userId,
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 60 * 1000, // 1 minuto
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}

