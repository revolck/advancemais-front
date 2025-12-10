"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCartoes,
  adicionarCartao,
  definirCartaoPadrao,
  removerCartao,
  pagarPendente,
  getPreferenciaPagamento,
  atualizarPreferenciaPagamento,
} from "@/api/empresas/cartoes";
import type {
  AdicionarCartaoPayload,
  AtualizarPreferenciaPayload,
  CartaoEmpresa,
} from "@/api/empresas/cartoes/types";

// Query keys
export const cartoesQueryKeys = {
  all: ["cartoes"] as const,
  list: () => [...cartoesQueryKeys.all, "list"] as const,
  preferencia: () => [...cartoesQueryKeys.all, "preferencia"] as const,
};

/**
 * Hook para listar cartões da empresa
 */
export function useCartoes() {
  return useQuery({
    queryKey: cartoesQueryKeys.list(),
    queryFn: async () => {
      const response = await getCartoes();
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para adicionar novo cartão
 * - Tokeniza via SDK do MP no frontend
 * - Valida com cobrança teste
 * - Retorna info sobre pagamento pendente
 */
export function useAdicionarCartao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AdicionarCartaoPayload) => {
      const response = await adicionarCartao(payload);
      if (!response.success) {
        throw new Error(response.message || "Erro ao adicionar cartão");
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidar lista de cartões
      queryClient.invalidateQueries({ queryKey: cartoesQueryKeys.list() });
      // Invalidar dados da empresa (pode ter mudado cartão padrão)
      queryClient.invalidateQueries({ queryKey: ["minha-empresa"] });
      queryClient.invalidateQueries({ queryKey: ["empresa", "visao-geral"] });
    },
  });
}

/**
 * Hook para definir cartão como padrão
 */
export function useDefinirCartaoPadrao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cartaoId: string) => {
      const response = await definirCartaoPadrao(cartaoId);
      if (!response.success) {
        throw new Error(response.message || "Erro ao definir cartão padrão");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartoesQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: cartoesQueryKeys.preferencia() });
    },
  });
}

/**
 * Hook para remover cartão
 */
export function useRemoverCartao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cartaoId: string) => {
      const response = await removerCartao(cartaoId);
      if (!response.success) {
        throw new Error(response.message || "Erro ao remover cartão");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartoesQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: cartoesQueryKeys.preferencia() });
    },
  });
}

/**
 * Hook para pagar fatura pendente com cartão
 * - Usado quando plano está SUSPENSO
 * - Reativa o plano se pagamento for aprovado
 */
export function usePagarPendente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cartaoId: string) => {
      const response = await pagarPendente(cartaoId);
      if (!response.success) {
        throw new Error(response.message || "Erro ao processar pagamento");
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidar tudo relacionado a pagamentos e empresa
      queryClient.invalidateQueries({ queryKey: cartoesQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["minha-empresa"] });
      queryClient.invalidateQueries({ queryKey: ["empresa", "visao-geral"] });
      queryClient.invalidateQueries({ queryKey: ["empresa", "pagamentos"] });
    },
  });
}

/**
 * Hook para obter preferência de pagamento
 */
export function usePreferenciaPagamento() {
  return useQuery({
    queryKey: cartoesQueryKeys.preferencia(),
    queryFn: async () => {
      const response = await getPreferenciaPagamento();
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para atualizar preferência de pagamento
 * - Trocar entre cartão, PIX, boleto
 */
export function useAtualizarPreferenciaPagamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AtualizarPreferenciaPayload) => {
      const response = await atualizarPreferenciaPagamento(payload);
      if (!response.success) {
        throw new Error("Erro ao atualizar preferência de pagamento");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartoesQueryKeys.preferencia() });
      queryClient.invalidateQueries({ queryKey: ["minha-empresa"] });
    },
  });
}

/**
 * Helpers para UI
 */

/**
 * Retorna o cartão padrão da lista
 */
export function getCartaoPadrao(cartoes?: CartaoEmpresa[]): CartaoEmpresa | undefined {
  return cartoes?.find((c) => c.isPadrao);
}

/**
 * Verifica se o cartão está próximo de expirar (3 meses)
 */
export function cartaoProximoExpirar(cartao: CartaoEmpresa): boolean {
  const hoje = new Date();
  const expiracao = new Date(cartao.anoExpiracao, cartao.mesExpiracao - 1);
  const diffMeses =
    (expiracao.getFullYear() - hoje.getFullYear()) * 12 +
    (expiracao.getMonth() - hoje.getMonth());
  return diffMeses <= 3;
}

/**
 * Verifica se o cartão já expirou
 */
export function cartaoExpirado(cartao: CartaoEmpresa): boolean {
  const hoje = new Date();
  const expiracao = new Date(cartao.anoExpiracao, cartao.mesExpiracao - 1);
  return expiracao < hoje;
}


