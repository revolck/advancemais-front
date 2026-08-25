/**
 * API Client para Respostas de Provas
 */

import { apiFetch } from "../client";
import { apiConfig } from "@/lib/env";
import { provasRoutes } from "./routes";
import type {
  RespostaComQuestao,
  RespostasListResponse,
  ListRespostasParams,
  AvaliacaoHistoricoItem,
  ListAvaliacaoHistoricoResponse,
  ListAvaliacaoRespostasParams,
  ListAvaliacaoRespostasResponse,
  AvaliacaoRespostaDetalhe,
  AvaliacaoRespostaDetalheResponse,
  AvaliacaoRespostaComentario,
  AvaliacaoRespostaComentarioPayload,
  AvaliacaoRespostaComentarioResponse,
  CorrigirAvaliacaoRespostaPayload,
  CorrigirAvaliacaoRespostaResponse,
  DeleteAvaliacaoRespostaComentarioResponse,
  FixarAvaliacaoRespostaComentarioPayload,
  ListAvaliacaoRespostaComentariosParams,
  ListAvaliacaoRespostaComentariosResponse,
  UpdateAvaliacaoRespostaComentarioPayload,
} from "./types";

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) return Object.fromEntries(headers.entries());
  if (Array.isArray(headers)) return Object.fromEntries(headers);
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

function buildHeaders(
  additional?: HeadersInit,
  auth = true
): Record<string, string> {
  return {
    Accept: apiConfig.headers.Accept,
    "Content-Type": "application/json",
    ...(auth ? getAuthHeader() : {}),
    ...normalizeHeaders(additional),
  };
}

/**
 * Lista respostas de uma prova
 */
export async function listRespostas(
  cursoId: string | number,
  turmaId: string,
  provaId: string,
  params?: ListRespostasParams,
  options?: {
    headers?: HeadersInit;
    cache?: "no-cache" | "short" | "medium" | "long";
  }
): Promise<RespostaComQuestao[]> {
  const url = provasRoutes.respostas.list(cursoId, turmaId, provaId);
  
  // Constrói query string
  const queryParams = new URLSearchParams();
  if (params?.questaoId) {
    queryParams.append("questaoId", params.questaoId);
  }
  if (params?.inscricaoId) {
    queryParams.append("inscricaoId", params.inscricaoId);
  }
  
  const urlWithParams = queryParams.toString() 
    ? `${url}?${queryParams.toString()}`
    : url;
  
  const response = await apiFetch<RespostasListResponse>(
    urlWithParams,
    {
      init: {
        method: "GET",
        headers: buildHeaders(options?.headers),
      },
      cache: options?.cache || "short",
    }
  );
  return response.data || [];
}

/**
 * Lista submissões por avaliação (nova API)
 */
export async function listAvaliacaoRespostas(
  avaliacaoId: string,
  params?: ListAvaliacaoRespostasParams,
  options?: {
    headers?: HeadersInit;
    cache?: "no-cache" | "short" | "medium" | "long";
  }
): Promise<ListAvaliacaoRespostasResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set("page", String(params.page));
  if (params?.pageSize) queryParams.set("pageSize", String(params.pageSize));
  if (params?.search) queryParams.set("search", params.search);
  if (params?.statusCorrecao) queryParams.set("statusCorrecao", params.statusCorrecao);
  if (params?.orderBy) queryParams.set("orderBy", params.orderBy);
  if (params?.order) queryParams.set("order", params.order);

  const endpoint = provasRoutes.avaliacoes.respostas.list(avaliacaoId);
  const url = queryParams.toString() ? `${endpoint}?${queryParams.toString()}` : endpoint;

  const response = await apiFetch<ListAvaliacaoRespostasResponse>(url, {
    init: {
      method: "GET",
      headers: buildHeaders(options?.headers),
    },
    cache: options?.cache || "short",
  });

  return {
    success: Boolean(response?.success ?? true),
    data: Array.isArray(response?.data) ? response.data : [],
    pagination: response?.pagination,
  };
}

/**
 * Lista histórico de eventos por avaliação
 */
export async function listAvaliacaoHistorico(
  avaliacaoId: string,
  params?: {
    page?: number;
    pageSize?: number;
  },
  options?: {
    headers?: HeadersInit;
    cache?: "no-cache" | "short" | "medium" | "long";
  }
): Promise<AvaliacaoHistoricoItem[]> {
  const queryParams = new URLSearchParams();
  queryParams.set("avaliacaoId", avaliacaoId);
  if (params?.page) queryParams.set("page", String(params.page));
  if (params?.pageSize) queryParams.set("pageSize", String(params.pageSize));

  const url = `${provasRoutes.avaliacoes.historico()}?${queryParams.toString()}`;
  const response = await apiFetch<
    ListAvaliacaoHistoricoResponse | AvaliacaoHistoricoItem[]
  >(url, {
    init: {
      method: "GET",
      headers: buildHeaders(options?.headers),
    },
    cache: options?.cache || "no-cache",
  });

  if (Array.isArray(response)) return response;

  if (
    response &&
    typeof response === "object" &&
    Array.isArray((response as ListAvaliacaoHistoricoResponse).items)
  ) {
    return (response as ListAvaliacaoHistoricoResponse).items ?? [];
  }

  if (
    response &&
    typeof response === "object" &&
    Array.isArray((response as ListAvaliacaoHistoricoResponse).data)
  ) {
    const data = (response as ListAvaliacaoHistoricoResponse).data;
    return Array.isArray(data) ? data : [];
  }

  if (
    response &&
    typeof response === "object" &&
    Array.isArray((response as ListAvaliacaoHistoricoResponse).historico)
  ) {
    return (response as ListAvaliacaoHistoricoResponse).historico ?? [];
  }

  const nestedData =
    response &&
    typeof response === "object" &&
    "data" in response &&
    (response as ListAvaliacaoHistoricoResponse).data &&
    typeof (response as ListAvaliacaoHistoricoResponse).data === "object"
      ? ((response as ListAvaliacaoHistoricoResponse).data as {
          data?: AvaliacaoHistoricoItem[];
          historico?: AvaliacaoHistoricoItem[];
          items?: AvaliacaoHistoricoItem[];
        })
      : null;

  if (nestedData) {
    if (Array.isArray(nestedData.items)) return nestedData.items;
    if (Array.isArray(nestedData.data)) return nestedData.data;
    if (Array.isArray(nestedData.historico)) return nestedData.historico;
  }

  return [];
}

/**
 * Busca detalhe de uma submissão por avaliação (nova API)
 */
export async function getAvaliacaoRespostaById(
  avaliacaoId: string,
  respostaId: string,
  options?: {
    headers?: HeadersInit;
    cache?: "no-cache" | "short" | "medium" | "long";
  }
): Promise<AvaliacaoRespostaDetalhe> {
  const response = await apiFetch<AvaliacaoRespostaDetalheResponse>(
    provasRoutes.avaliacoes.respostas.get(avaliacaoId, respostaId),
    {
      init: {
        method: "GET",
        headers: buildHeaders(options?.headers),
      },
      cache: options?.cache || "short",
    }
  );

  return response?.data;
}

/**
 * Corrige submissão por avaliação (nova API)
 */
export async function corrigirAvaliacaoResposta(
  avaliacaoId: string,
  respostaId: string,
  payload: CorrigirAvaliacaoRespostaPayload,
  options?: {
    headers?: HeadersInit;
  }
): Promise<CorrigirAvaliacaoRespostaResponse> {
  return apiFetch<CorrigirAvaliacaoRespostaResponse>(
    provasRoutes.avaliacoes.respostas.corrigir(avaliacaoId, respostaId),
    {
      init: {
        method: "PATCH",
        body: JSON.stringify(payload),
        headers: buildHeaders(options?.headers, true),
      },
      cache: "no-cache",
    }
  );
}

export async function listAvaliacaoRespostaComentarios(
  avaliacaoId: string,
  respostaId: string,
  params?: ListAvaliacaoRespostaComentariosParams,
  options?: {
    headers?: HeadersInit;
    cache?: "no-cache" | "short" | "medium" | "long";
  }
): Promise<ListAvaliacaoRespostaComentariosResponse> {
  const queryParams = new URLSearchParams();
  if (params?.filtro) queryParams.set("filtro", params.filtro);
  if (params?.search) queryParams.set("search", params.search);
  if (params?.page) queryParams.set("page", String(params.page));
  if (params?.pageSize) queryParams.set("pageSize", String(params.pageSize));

  const endpoint = provasRoutes.avaliacoes.respostas.comentarios.list(
    avaliacaoId,
    respostaId
  );
  const url = queryParams.toString() ? `${endpoint}?${queryParams.toString()}` : endpoint;
  const response = await apiFetch<ListAvaliacaoRespostaComentariosResponse>(url, {
    init: {
      method: "GET",
      headers: buildHeaders(options?.headers),
    },
    cache: options?.cache || "no-cache",
  });

  return {
    success: Boolean(response?.success ?? true),
    data: Array.isArray(response?.data) ? response.data : [],
    total: response?.total ?? 0,
    pagination: response?.pagination,
  };
}

export async function createAvaliacaoRespostaComentario(
  avaliacaoId: string,
  respostaId: string,
  payload: AvaliacaoRespostaComentarioPayload,
  options?: {
    headers?: HeadersInit;
  }
): Promise<AvaliacaoRespostaComentario> {
  const response = await apiFetch<AvaliacaoRespostaComentarioResponse>(
    provasRoutes.avaliacoes.respostas.comentarios.create(avaliacaoId, respostaId),
    {
      init: {
        method: "POST",
        body: JSON.stringify(payload),
        headers: buildHeaders(options?.headers),
      },
      cache: "no-cache",
    }
  );

  return response.data;
}

export async function updateAvaliacaoRespostaComentario(
  avaliacaoId: string,
  respostaId: string,
  comentarioId: string,
  payload: UpdateAvaliacaoRespostaComentarioPayload,
  options?: {
    headers?: HeadersInit;
  }
): Promise<AvaliacaoRespostaComentario> {
  const response = await apiFetch<AvaliacaoRespostaComentarioResponse>(
    provasRoutes.avaliacoes.respostas.comentarios.update(
      avaliacaoId,
      respostaId,
      comentarioId
    ),
    {
      init: {
        method: "PUT",
        body: JSON.stringify(payload),
        headers: buildHeaders(options?.headers),
      },
      cache: "no-cache",
    }
  );

  return response.data;
}

export async function deleteAvaliacaoRespostaComentario(
  avaliacaoId: string,
  respostaId: string,
  comentarioId: string,
  options?: {
    headers?: HeadersInit;
  }
): Promise<DeleteAvaliacaoRespostaComentarioResponse> {
  return apiFetch<DeleteAvaliacaoRespostaComentarioResponse>(
    provasRoutes.avaliacoes.respostas.comentarios.delete(
      avaliacaoId,
      respostaId,
      comentarioId
    ),
    {
      init: {
        method: "DELETE",
        headers: buildHeaders(options?.headers),
      },
      cache: "no-cache",
    }
  );
}

export async function fixarAvaliacaoRespostaComentario(
  avaliacaoId: string,
  respostaId: string,
  comentarioId: string,
  payload: FixarAvaliacaoRespostaComentarioPayload,
  options?: {
    headers?: HeadersInit;
  }
): Promise<AvaliacaoRespostaComentario> {
  const response = await apiFetch<AvaliacaoRespostaComentarioResponse>(
    provasRoutes.avaliacoes.respostas.comentarios.fixar(
      avaliacaoId,
      respostaId,
      comentarioId
    ),
    {
      init: {
        method: "PATCH",
        body: JSON.stringify(payload),
        headers: buildHeaders(options?.headers),
      },
      cache: "no-cache",
    }
  );

  return response.data;
}
