import { useMemo } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  arquivarNotificacoes,
  getNotificacoesContador,
  listNotificacoes,
  marcarNotificacoesComoLidas,
  marcarTodasNotificacoesComoLidas,
} from "@/api/notificacoes";
import type {
  ListarNotificacoesParams,
  ListarNotificacoesResponse,
} from "@/api/notificacoes/types";

const NOTIFICATIONS_QUERY_KEY = "notifications";
const NOTIFICATIONS_COUNTER_KEY = "notifications-counter";

/**
 * Hook para listar notificações.
 * - retry: false - API já faz 3 tentativas internamente
 * - refetchInterval só ativo quando a query tem sucesso (evita loop de erros)
 */
export function useNotifications(params?: ListarNotificacoesParams) {
  const serializedParams = useMemo(
    () => (params ? JSON.stringify(params) : "default"),
    [params]
  );

  return useQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY, serializedParams],
    queryFn: () => listNotificacoes(params),
    retry: false, // API já faz retry interno
    refetchInterval: (query) => (query.state.status === "success" ? 30000 : false),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData, // Mantém dados anteriores durante refetch
  });
}

/**
 * Hook para contador de notificações não lidas (badge).
 * - retry: false - API já faz 3 tentativas internamente
 * - refetchInterval só ativo quando a query tem sucesso
 */
export function useNotificationsCounter() {
  return useQuery({
    queryKey: [NOTIFICATIONS_COUNTER_KEY],
    queryFn: () => getNotificacoesContador(),
    retry: false,
    refetchInterval: (query) => (query.state.status === "success" ? 30000 : false),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}

export function useMarkNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: marcarNotificacoesComoLidas,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_COUNTER_KEY] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tipo?: string) => marcarTodasNotificacoesComoLidas(tipo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_COUNTER_KEY] });
    },
  });
}

export function useArchiveNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: arquivarNotificacoes,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_COUNTER_KEY] });
    },
  });
}

export function getUnreadCount(
  data?: ListarNotificacoesResponse
): number | undefined {
  if (!data) return undefined;
  if (typeof data.contadores?.naoLidas === "number") {
    return data.contadores.naoLidas;
  }
  return data.data.filter((notification) => notification.status === "NAO_LIDA")
    .length;
}

