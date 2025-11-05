import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import { PERMISSOES_ROUTES } from "./routes";
import type {
  PermissaoRecurso,
  PermissaoRecursoListParams,
  PermissaoRecursoListResponse,
  PermissaoRecursoCreatePayload,
  PermissaoRecursoCreateResponse,
  PermissaoGrant,
  PermissaoGrantListParams,
  PermissaoGrantListResponse,
  PermissaoGrantCreateResponse,
  PermissaoGrantUpdateResponse,
  PermissaoGrantDeleteResponse,
  CreateGrantPayload,
  UpdateGrantPayload,
  AuditoriaAcessoItem,
  AuditoriaListParams,
  AuditoriaListResponse,
  MinhasPermissoesResponse,
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

function buildAuthHeaders(additionalHeaders?: HeadersInit): Record<string, string> {
  return {
    ...apiConfig.headers,
    ...getAuthHeader(),
    ...normalizeHeaders(additionalHeaders),
  };
}

// Recursos
export async function listRecursos(
  params?: PermissaoRecursoListParams,
  init?: RequestInit,
): Promise<PermissaoRecursoListResponse> {
  const endpoint = PERMISSOES_ROUTES.RECURSOS;
  const sp = new URLSearchParams();
  if (params?.categoria) sp.set("categoria", params.categoria);
  if (params?.ativo !== undefined) sp.set("ativo", String(params.ativo));
  const url = sp.toString() ? `${endpoint}?${sp}` : endpoint;
  return apiFetch<PermissaoRecursoListResponse>(url, {
    init: { method: "GET", ...init, headers: buildAuthHeaders(init?.headers) },
  });
}

export async function createRecurso(
  data: PermissaoRecursoCreatePayload,
  init?: RequestInit,
): Promise<PermissaoRecursoCreateResponse> {
  return apiFetch<PermissaoRecursoCreateResponse>(PERMISSOES_ROUTES.RECURSOS, {
    init: {
      method: "POST",
      headers: { ...buildAuthHeaders(init?.headers), "Content-Type": "application/json" },
      body: JSON.stringify(data),
      ...init,
    },
  });
}

// Grants
export async function listGrants(
  params?: PermissaoGrantListParams,
  init?: RequestInit,
): Promise<PermissaoGrantListResponse> {
  const sp = new URLSearchParams();
  if (params?.role) sp.set("role", params.role);
  if (params?.usuarioId) sp.set("usuarioId", params.usuarioId);
  if (params?.recurso) sp.set("recurso", params.recurso);
  if (params?.acao) sp.set("acao", params.acao);
  if (params?.ativo !== undefined) sp.set("ativo", String(params.ativo));
  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));
  const url = sp.toString() ? `${PERMISSOES_ROUTES.GRANTS}?${sp}` : PERMISSOES_ROUTES.GRANTS;
  return apiFetch<PermissaoGrantListResponse>(url, {
    init: { method: "GET", ...init, headers: buildAuthHeaders(init?.headers) },
  });
}

export async function createGrant(
  data: CreateGrantPayload,
  init?: RequestInit,
): Promise<PermissaoGrantCreateResponse> {
  return apiFetch<PermissaoGrantCreateResponse>(PERMISSOES_ROUTES.GRANTS, {
    init: {
      method: "POST",
      headers: { ...buildAuthHeaders(init?.headers), "Content-Type": "application/json" },
      body: JSON.stringify(data),
      ...init,
    },
  });
}

export async function updateGrant(
  id: string,
  data: UpdateGrantPayload,
  init?: RequestInit,
): Promise<PermissaoGrantUpdateResponse> {
  return apiFetch<PermissaoGrantUpdateResponse>(PERMISSOES_ROUTES.GRANT(id), {
    init: {
      method: "PATCH",
      headers: { ...buildAuthHeaders(init?.headers), "Content-Type": "application/json" },
      body: JSON.stringify(data),
      ...init,
    },
  });
}

export async function deleteGrant(
  id: string,
  tipo?: "usuario" | "role",
  init?: RequestInit,
): Promise<PermissaoGrantDeleteResponse> {
  const base = PERMISSOES_ROUTES.GRANT(id);
  const url = tipo ? `${base}?tipo=${encodeURIComponent(tipo)}` : base;
  return apiFetch<PermissaoGrantDeleteResponse>(url, {
    init: { method: "DELETE", ...init, headers: buildAuthHeaders(init?.headers) },
  });
}

// Minhas permissões
export async function getMinhasPermissoes(init?: RequestInit): Promise<MinhasPermissoesResponse> {
  return apiFetch<MinhasPermissoesResponse>(PERMISSOES_ROUTES.MINHAS, {
    init: { method: "GET", ...init, headers: buildAuthHeaders(init?.headers) },
  });
}

// Auditoria
export async function getAuditoriaRelatorio(
  params?: AuditoriaListParams,
  init?: RequestInit,
): Promise<AuditoriaListResponse> {
  const sp = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
    });
  }
  const url = sp.toString()
    ? `${PERMISSOES_ROUTES.AUDITORIA}?${sp}`
    : PERMISSOES_ROUTES.AUDITORIA;
  return apiFetch<AuditoriaListResponse>(url, {
    init: { method: "GET", ...init, headers: buildAuthHeaders(init?.headers) },
  });
}

export * from "./types";
