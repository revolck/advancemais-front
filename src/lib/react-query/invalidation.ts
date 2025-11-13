import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";

/**
 * Utilitários para invalidação de cache
 * Use após mutations (criar, atualizar, deletar) para garantir dados atualizados
 */

/**
 * Invalida todas as queries relacionadas a usuários
 * Use após criar, atualizar ou deletar um usuário
 * 
 * @param queryClient - Instância do QueryClient
 * 
 * @example
 * ```tsx
 * const queryClient = useQueryClient();
 * 
 * const mutation = useMutation({
 *   mutationFn: createUsuario,
 *   onSuccess: () => {
 *     invalidateUsuarios(queryClient);
 *   }
 * });
 * ```
 */
export function invalidateUsuarios(queryClient: QueryClient): void {
  queryClient.invalidateQueries({
    queryKey: queryKeys.usuarios.list({}),
  });
  queryClient.invalidateQueries({
    queryKey: ["admin-usuarios-list"],
  });
}

/**
 * Invalida todas as queries relacionadas a instrutores
 * Use após criar, atualizar ou deletar um instrutor
 * 
 * @param queryClient - Instância do QueryClient
 */
export function invalidateInstrutores(queryClient: QueryClient): void {
  queryClient.invalidateQueries({
    queryKey: queryKeys.instrutores.list({}),
  });
  queryClient.invalidateQueries({
    queryKey: ["admin-instrutores-list"],
  });
}

/**
 * Invalida todas as queries relacionadas a candidatos
 * Use após criar, atualizar ou deletar um candidato
 * 
 * @param queryClient - Instância do QueryClient
 */
export function invalidateCandidatos(queryClient: QueryClient): void {
  queryClient.invalidateQueries({
    queryKey: queryKeys.candidatos.list({}),
  });
  queryClient.invalidateQueries({
    queryKey: ["admin-candidatos-list"],
  });
}

/**
 * Invalida todas as queries relacionadas a usuários, instrutores e candidatos
 * Use após operações que afetam múltiplos tipos de usuários
 * 
 * @param queryClient - Instância do QueryClient
 */
export function invalidateAllUsers(queryClient: QueryClient): void {
  invalidateUsuarios(queryClient);
  invalidateInstrutores(queryClient);
  invalidateCandidatos(queryClient);
}

