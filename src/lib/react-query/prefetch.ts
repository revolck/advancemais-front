import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { getUsuarioById, getInstrutorById } from "@/api/usuarios";

/**
 * Utilitários para prefetch de dados
 * Útil para melhorar UX ao pre-carregar dados antes de navegar
 */

/**
 * Prefetch de dados de um usuário específico
 * Útil para chamar em onMouseEnter ou antes de navegar
 * 
 * @param queryClient - Instância do QueryClient
 * @param userId - ID do usuário
 * 
 * @example
 * ```tsx
 * const queryClient = useQueryClient();
 * 
 * const handleMouseEnter = () => {
 *   prefetchUsuario(queryClient, userId);
 * };
 * ```
 */
export async function prefetchUsuario(
  queryClient: QueryClient,
  userId: string
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.usuarios.detail(userId),
    queryFn: async () => {
      return getUsuarioById(userId);
    },
    staleTime: 30 * 1000, // 30 segundos
  });
}

/**
 * Prefetch de dados de um instrutor específico
 * 
 * @param queryClient - Instância do QueryClient
 * @param instrutorId - ID do instrutor
 */
export async function prefetchInstrutor(
  queryClient: QueryClient,
  instrutorId: string
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.instrutores.detail(instrutorId),
    queryFn: async () => {
      return getInstrutorById(instrutorId);
    },
    staleTime: 30 * 1000, // 30 segundos
  });
}

