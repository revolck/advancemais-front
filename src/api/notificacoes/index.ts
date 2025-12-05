import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import { notificacoesRoutes } from "./routes";
import type {
  ArquivarNotificacoesResponse,
  ContadorNotificacoesResponse,
  ListarNotificacoesParams,
  ListarNotificacoesResponse,
  MarcarNotificacoesPayload,
  MarcarNotificacoesResponse,
} from "./types";

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) {
    const normalized: Record<string, string> = {};
    headers.forEach((value, key) => {
      normalized[key] = value;
    });
    return normalized;
  }
  if (Array.isArray(headers)) {
    return headers.reduce<Record<string, string>>((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
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

export async function listNotificacoes(
  params?: ListarNotificacoesParams,
  init?: RequestInit
): Promise<ListarNotificacoesResponse> {
  const endpoint = notificacoesRoutes.list();
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.pageSize)
    searchParams.append("pageSize", params.pageSize.toString());
  params?.status?.forEach((status) => searchParams.append("status", status));
  params?.tipo?.forEach((tipo) => searchParams.append("tipo", tipo));
  params?.prioridade?.forEach((prioridade) =>
    searchParams.append("prioridade", prioridade)
  );
  if (params?.apenasNaoLidas)
    searchParams.append("apenasNaoLidas", "true");

  const url =
    searchParams.toString().length > 0
      ? `${endpoint}?${searchParams.toString()}`
      : endpoint;

  return apiFetch<ListarNotificacoesResponse>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders({
        Accept: "application/json",
        ...init?.headers,
      }),
    },
    cache: "no-cache",
    retries: 1, // Não fazer muitos retries para listar notificações
  });
}

export async function getNotificacoesContador(
  init?: RequestInit
): Promise<ContadorNotificacoesResponse> {
  const endpoint = notificacoesRoutes.counter();

  return apiFetch<ContadorNotificacoesResponse>(endpoint, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders({
        Accept: "application/json",
        ...init?.headers,
      }),
    },
    cache: "no-cache",
    retries: 1, // Não fazer muitos retries para contador
  });
}

export async function marcarNotificacoesComoLidas(
  payload: MarcarNotificacoesPayload,
  init?: RequestInit
): Promise<MarcarNotificacoesResponse> {
  const endpoint = notificacoesRoutes.markRead();

  return apiFetch<MarcarNotificacoesResponse>(endpoint, {
    init: {
      method: "PUT",
      ...init,
      headers: buildAuthHeaders({
        "Content-Type": "application/json",
        Accept: "application/json",
        ...init?.headers,
      }),
      body: init?.body ?? JSON.stringify(payload),
    },
    cache: "no-cache",
  });
}

export async function marcarTodasNotificacoesComoLidas(
  tipo?: string,
  init?: RequestInit
): Promise<MarcarNotificacoesResponse> {
  const endpoint = notificacoesRoutes.markAllRead();
  const body =
    tipo !== undefined && tipo !== null ? JSON.stringify({ tipo }) : "{}";

  return apiFetch<MarcarNotificacoesResponse>(endpoint, {
    init: {
      method: "PUT",
      ...init,
      headers: buildAuthHeaders({
        "Content-Type": "application/json",
        Accept: "application/json",
        ...init?.headers,
      }),
      body: init?.body ?? (tipo ? body : "{}"),
    },
    cache: "no-cache",
  });
}

export async function arquivarNotificacoes(
  payload: MarcarNotificacoesPayload,
  init?: RequestInit
): Promise<ArquivarNotificacoesResponse> {
  const endpoint = notificacoesRoutes.archive();

  return apiFetch<ArquivarNotificacoesResponse>(endpoint, {
    init: {
      method: "PUT",
      ...init,
      headers: buildAuthHeaders({
        "Content-Type": "application/json",
        Accept: "application/json",
        ...init?.headers,
      }),
      body: init?.body ?? JSON.stringify(payload),
    },
    cache: "no-cache",
  });
}

