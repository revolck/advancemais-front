/**
 * API de Solicitações de Publicação de Vagas
 */

import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import type {
  SolicitacoesListParams,
  SolicitacoesListResponse,
  AprovarSolicitacaoPayload,
  RejeitarSolicitacaoPayload,
  SolicitacaoActionResponse,
  SetorDeVagasMetricasResponse,
} from "./types";

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return headers as Record<string, string>;
}

function getAuthHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};

  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildAuthHeaders(
  additionalHeaders?: HeadersInit
): Record<string, string> {
  return {
    ...apiConfig.headers,
    ...getAuthHeader(),
    ...normalizeHeaders(additionalHeaders),
  };
}

function buildQueryString(params: Record<string, any>): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        // Para status, a API espera valores separados por vírgula
        if (key === "status") {
          query.set(key, value.join(","));
        } else {
          value.forEach((item) => query.append(key, String(item)));
        }
      } else {
        query.set(key, String(value));
      }
    }
  });

  return query.toString();
}

// ============================================================================
// ROTAS
// ============================================================================

const SOLICITACOES_ROUTES = {
  LIST: "/api/v1/vagas/solicitacoes",
  GET: (id: string) => `/api/v1/vagas/solicitacoes/${id}`,
  APROVAR: (id: string) => `/api/v1/vagas/solicitacoes/${id}/aprovar`,
  REJEITAR: (id: string) => `/api/v1/vagas/solicitacoes/${id}/rejeitar`,
  METRICAS: "/api/v1/dashboard/setor-de-vagas/metricas",
};

// ============================================================================
// SOLICITAÇÕES
// ============================================================================

/**
 * Lista solicitações de publicação de vagas
 */
export async function listSolicitacoes(
  params?: SolicitacoesListParams,
  init?: RequestInit
): Promise<SolicitacoesListResponse> {
  const queryParams: Record<string, any> = {};

  if (params?.page) queryParams.page = params.page;
  if (params?.pageSize) queryParams.pageSize = params.pageSize;
  
  // Status: array de strings que será convertido para string separada por vírgula
  if (params?.status && params.status.length > 0) {
    queryParams.status = params.status;
  }
  
  if (params?.empresaId) queryParams.empresaId = params.empresaId;
  
  // Datas: garantir formato ISO string
  if (params?.criadoDe) {
    queryParams.criadoDe = typeof params.criadoDe === 'string' 
      ? params.criadoDe 
      : params.criadoDe.toISOString();
  }
  if (params?.criadoAte) {
    queryParams.criadoAte = typeof params.criadoAte === 'string'
      ? params.criadoAte
      : params.criadoAte.toISOString();
  }
  
  // Search: mínimo 3 caracteres
  if (params?.search && params.search.length >= 3) {
    queryParams.search = params.search;
  }

  const queryString = buildQueryString(queryParams);
  const url = queryString
    ? `${SOLICITACOES_ROUTES.LIST}?${queryString}`
    : SOLICITACOES_ROUTES.LIST;

  console.log("🔍 Buscando solicitações:", url);

  return apiFetch<SolicitacoesListResponse>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });
}

/**
 * Obtém detalhes completos de uma solicitação
 */
export async function getSolicitacaoById(
  id: string,
  init?: RequestInit
): Promise<any> {
  return apiFetch<any>(SOLICITACOES_ROUTES.GET(id), {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });
}

/**
 * Aprova uma solicitação de publicação
 */
export async function aprovarSolicitacao(
  id: string,
  payload?: AprovarSolicitacaoPayload,
  init?: RequestInit
): Promise<SolicitacaoActionResponse> {
  return apiFetch<SolicitacaoActionResponse>(SOLICITACOES_ROUTES.APROVAR(id), {
    init: {
      method: "PUT",
      ...init,
      headers: buildAuthHeaders({
        "Content-Type": "application/json",
        ...init?.headers,
      }),
      body: payload ? JSON.stringify(payload) : undefined,
    },
    cache: "no-cache",
  });
}

/**
 * Rejeita uma solicitação de publicação
 */
export async function rejeitarSolicitacao(
  id: string,
  payload: RejeitarSolicitacaoPayload,
  init?: RequestInit
): Promise<SolicitacaoActionResponse> {
  return apiFetch<SolicitacaoActionResponse>(SOLICITACOES_ROUTES.REJEITAR(id), {
    init: {
      method: "PUT",
      ...init,
      headers: buildAuthHeaders({
        "Content-Type": "application/json",
        ...init?.headers,
      }),
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
  });
}

// ============================================================================
// MÉTRICAS DO SETOR DE VAGAS
// ============================================================================

/**
 * Obtém métricas consolidadas para o dashboard do Setor de Vagas
 */
export async function getSetorDeVagasMetricas(
  init?: RequestInit
): Promise<SetorDeVagasMetricasResponse> {
  return apiFetch<SetorDeVagasMetricasResponse>(SOLICITACOES_ROUTES.METRICAS, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });
}

export type * from "./types";

