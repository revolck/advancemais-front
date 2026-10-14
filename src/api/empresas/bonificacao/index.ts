import { apiFetch } from "@/api/client";
import { empresasRoutes } from "@/api/routes";
import { buildAuthHeaders } from "@/lib/auth-utils";
import { apiConfig } from "@/lib/env";

export interface BonificacaoEmpresa {
  planoId: string;
  planoNome: string;
  quantidadeVagas: number;
  /** Último instante de uso (ISO) */
  validoAte: string;
  /** true enquanto a empresa não viu a modal de presente */
  exibir: boolean;
}

export interface PlanoGratuitoExpirado {
  planoId: string;
  planoNome: string;
  inauguracao: boolean;
  expirouEm: string | null;
}

export interface SituacaoBonificacao {
  bonificacao: BonificacaoEmpresa | null;
  gratuitoExpirado: PlanoGratuitoExpirado | null;
}

export interface PreviaBonificacaoInauguracao {
  campanha: string;
  plano: { id: string; nome: string; quantidadeVagas: number } | null;
  inicio: string;
  validoAte: string;
  encerrada: boolean;
  elegiveis: number;
  concessoesAdminParaConverter: number;
  jaBonificadas: number;
  comPlanoAtivo: number;
  excluidas: { nomeCompleto: string; cnpj: string | null }[];
}

export interface ResultadoBonificacaoInauguracao {
  plano: string;
  validoAte: string;
  criadas: number;
  convertidas: number;
}

interface Resposta<T> {
  success: boolean;
  data: T;
  message?: string;
}

function request<T>(url: string, method: "GET" | "POST") {
  return apiFetch<Resposta<T>>(url, {
    init: {
      method,
      headers: {
        Accept: apiConfig.headers.Accept,
        ...(method === "POST"
          ? { "Content-Type": apiConfig.headers["Content-Type"] }
          : {}),
        ...buildAuthHeaders(),
      },
      body: method === "POST" ? "{}" : undefined,
    },
    cache: "no-cache",
    // ações gravam dados: nunca repetir automaticamente
    retries: method === "GET" ? 1 : 0,
  });
}

export const getMinhaBonificacao = () =>
  request<SituacaoBonificacao>(empresasRoutes.bonificacao.minha(), "GET");

export const marcarBonificacaoExibida = () =>
  request<{ marcadas: number }>(empresasRoutes.bonificacao.minhaExibida(), "POST");

export const getPreviaBonificacaoInauguracao = () =>
  request<PreviaBonificacaoInauguracao>(
    empresasRoutes.bonificacao.inauguracao(),
    "GET"
  );

export const aplicarBonificacaoInauguracao = () =>
  request<ResultadoBonificacaoInauguracao>(
    empresasRoutes.bonificacao.inauguracaoAplicar(),
    "POST"
  );
