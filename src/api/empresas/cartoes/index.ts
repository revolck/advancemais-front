import { apiFetch } from "@/api/client";
import type {
  ListarCartoesResponse,
  AdicionarCartaoPayload,
  AdicionarCartaoResponse,
  CartaoActionResponse,
  PagarPendenteResponse,
  PreferenciaPagamentoResponse,
  AtualizarPreferenciaPayload,
} from "./types";
import { cartoesRoutes } from "./routes";

/**
 * Lista todos os cartões da empresa
 */
export async function getCartoes(): Promise<ListarCartoesResponse> {
  return apiFetch<ListarCartoesResponse>(cartoesRoutes.list(), {
    cache: "no-cache",
    retries: 2,
    timeout: 10000,
  });
}

/**
 * Adiciona um novo cartão
 * - Valida o cartão com cobrança de R$ 1,00 + estorno
 * - Retorna informação sobre pagamento pendente se houver
 *
 * @param payload - Token do cartão gerado pelo SDK do MP
 */
export async function adicionarCartao(
  payload: AdicionarCartaoPayload
): Promise<AdicionarCartaoResponse> {
  return apiFetch<AdicionarCartaoResponse>(cartoesRoutes.add(), {
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
    retries: 1,
    timeout: 30000, // Timeout maior pois valida cartão
  });
}

/**
 * Define um cartão como padrão para cobrança automática
 *
 * @param cartaoId - ID do cartão
 */
export async function definirCartaoPadrao(
  cartaoId: string
): Promise<CartaoActionResponse> {
  return apiFetch<CartaoActionResponse>(cartoesRoutes.setPadrao(cartaoId), {
    init: {
      method: "PUT",
    },
    cache: "no-cache",
    retries: 2,
    timeout: 10000,
  });
}

/**
 * Remove um cartão
 * - Não permite remover se for o único cartão e plano estiver ativo
 *
 * @param cartaoId - ID do cartão
 */
export async function removerCartao(
  cartaoId: string
): Promise<CartaoActionResponse> {
  return apiFetch<CartaoActionResponse>(cartoesRoutes.remove(cartaoId), {
    init: {
      method: "DELETE",
    },
    cache: "no-cache",
    retries: 1,
    timeout: 10000,
  });
}

/**
 * Paga fatura pendente com um cartão específico
 * - Usa quando plano está SUSPENSO e usuário quer pagar com cartão cadastrado
 * - Se sucesso, reativa o plano automaticamente
 *
 * @param cartaoId - ID do cartão para usar no pagamento
 */
export async function pagarPendente(
  cartaoId: string
): Promise<PagarPendenteResponse> {
  return apiFetch<PagarPendenteResponse>(cartoesRoutes.pagarPendente(cartaoId), {
    init: {
      method: "POST",
    },
    cache: "no-cache",
    retries: 1,
    timeout: 30000, // Timeout maior pois processa pagamento
  });
}

/**
 * Obtém a preferência de pagamento atual da empresa
 * - Método preferido (cartão, PIX, boleto)
 * - Cartão padrão (se método for cartão)
 * - Próxima cobrança
 */
export async function getPreferenciaPagamento(): Promise<PreferenciaPagamentoResponse> {
  return apiFetch<PreferenciaPagamentoResponse>(cartoesRoutes.preferencia.get(), {
    cache: "no-cache",
    retries: 2,
    timeout: 10000,
  });
}

/**
 * Atualiza a preferência de pagamento
 * - Permite trocar entre cartão, PIX e boleto
 *
 * @param payload - Novo método e cartão (se aplicável)
 */
export async function atualizarPreferenciaPagamento(
  payload: AtualizarPreferenciaPayload
): Promise<PreferenciaPagamentoResponse> {
  return apiFetch<PreferenciaPagamentoResponse>(cartoesRoutes.preferencia.update(), {
    init: {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
    retries: 1,
    timeout: 10000,
  });
}

export * from "./types";
export { cartoesRoutes } from "./routes";


