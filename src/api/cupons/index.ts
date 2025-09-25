/**
 * API de Cupons de Desconto
 */

import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import { cuponsRoutes } from "./routes";
import type {
  CupomDesconto,
  CreateCupomPayload,
  UpdateCupomPayload,
  CuponsListApiResponse,
  CupomDetailApiResponse,
  CupomCreateApiResponse,
  CuponsListParams,
} from "./types";

// ============================================================================
// UTILITÁRIOS DE AUTENTICAÇÃO
// ============================================================================

/**
 * Normaliza headers para garantir que sejam um objeto plano
 */
function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
  if (Array.isArray(headers)) {
    const result: Record<string, string> = {};
    headers.forEach(([key, value]) => {
      result[key] = value;
    });
    return result;
  }
  return headers as Record<string, string>;
}

/**
 * Obtém header de autorização do token armazenado nos cookies
 */
function getAuthHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};

  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Constrói headers padrão para requisições autenticadas
 */
function buildAuthHeaders(
  additionalHeaders?: HeadersInit
): Record<string, string> {
  return {
    ...apiConfig.headers,
    ...getAuthHeader(),
    ...normalizeHeaders(additionalHeaders),
  };
}

// ============================================================================
// CUPONS
// ============================================================================

/**
 * Lista todos os cupons de desconto
 */
export async function listCupons(
  params?: CuponsListParams,
  init?: RequestInit
): Promise<CuponsListApiResponse> {
  const endpoint = cuponsRoutes.list();
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.pageSize)
    searchParams.append("pageSize", params.pageSize.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder);
  if (params?.ativo !== undefined)
    searchParams.append("ativo", params.ativo.toString());
  if (params?.tipoDesconto)
    searchParams.append("tipoDesconto", params.tipoDesconto);
  if (params?.aplicarEm) searchParams.append("aplicarEm", params.aplicarEm);

  const url = searchParams.toString()
    ? `${endpoint}?${searchParams}`
    : endpoint;

  return apiFetch<CuponsListApiResponse>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders({
        Accept: "application/json",
        ...init?.headers,
      }),
    },
    cache: "no-cache",
  });
}

/**
 * Obtém detalhes de um cupom específico
 */
export async function getCupom(
  id: string,
  init?: RequestInit
): Promise<CupomDetailApiResponse> {
  const endpoint = cuponsRoutes.detail(id);

  return apiFetch<CupomDetailApiResponse>(endpoint, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders({
        Accept: "application/json",
        ...init?.headers,
      }),
    },
    cache: "no-cache",
  });
}

/**
 * Cria um novo cupom de desconto
 */
export async function createCupom(
  data: CreateCupomPayload,
  init?: RequestInit
): Promise<CupomCreateApiResponse> {
  const endpoint = cuponsRoutes.create();

  return apiFetch<CupomCreateApiResponse>(endpoint, {
    init: {
      method: "POST",
      ...init,
      headers: buildAuthHeaders({
        "Content-Type": "application/json",
        Accept: "application/json",
        ...init?.headers,
      }),
      body: init?.body ?? JSON.stringify(data),
    },
    cache: "no-cache",
  });
}

/**
 * Atualiza um cupom existente
 */
export async function updateCupom(
  id: string,
  data: UpdateCupomPayload,
  init?: RequestInit
): Promise<CupomDetailApiResponse> {
  const endpoint = cuponsRoutes.update(id);

  return apiFetch<CupomDetailApiResponse>(endpoint, {
    init: {
      method: "PUT",
      ...init,
      headers: buildAuthHeaders({
        "Content-Type": "application/json",
        Accept: "application/json",
        ...init?.headers,
      }),
      body: init?.body ?? JSON.stringify(data),
    },
    cache: "no-cache",
  });
}

/**
 * Remove um cupom
 */
export async function deleteCupom(
  id: string,
  init?: RequestInit
): Promise<void> {
  const endpoint = cuponsRoutes.delete(id);

  return apiFetch<void>(endpoint, {
    init: {
      method: "DELETE",
      ...init,
      headers: buildAuthHeaders({
        Accept: "application/json",
        ...init?.headers,
      }),
    },
    cache: "no-cache",
  });
}
