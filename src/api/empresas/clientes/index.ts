import { apiFetch } from "@/api/client";
import { empresasRoutes } from "@/api/routes";
import { apiConfig } from "@/lib/env";
import type {
  EmpresaClientePlano,
  EmpresaClientePlanoListParams,
  EmpresaClientePlanoCreatePayload,
  EmpresaClientePlanoUpdatePayload,
  EmpresaClientePlanoListResponse,
  EmpresaClientePlanoDetailResponse,
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

function buildQuery(params: Record<string, any>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export async function listClientesPlanos(
  params?: EmpresaClientePlanoListParams,
  init?: RequestInit,
): Promise<EmpresaClientePlanoListResponse> {
  const qs = params ? buildQuery(params) : "";
  const url = `${empresasRoutes.clientes.list()}${qs}`;
  return apiFetch<EmpresaClientePlanoListResponse>(url, {
    init: { method: "GET", ...init, headers: buildAuthHeaders(init?.headers) },
    cache: "no-cache",
  });
}

export async function createClientePlano(
  payload: EmpresaClientePlanoCreatePayload,
  init?: RequestInit,
): Promise<EmpresaClientePlanoDetailResponse> {
  return apiFetch<EmpresaClientePlanoDetailResponse>(empresasRoutes.clientes.create(), {
    init: {
      method: "POST",
      headers: buildAuthHeaders({ "Content-Type": "application/json", ...init?.headers }),
      body: JSON.stringify(payload),
      ...init,
    },
    cache: "no-cache",
  });
}

export async function getClientePlanoById(
  id: string,
  init?: RequestInit,
): Promise<EmpresaClientePlanoDetailResponse> {
  return apiFetch<EmpresaClientePlanoDetailResponse>(empresasRoutes.clientes.get(id), {
    init: { method: "GET", ...init, headers: buildAuthHeaders(init?.headers) },
    cache: "no-cache",
  });
}

export async function updateClientePlano(
  id: string,
  payload: EmpresaClientePlanoUpdatePayload,
  init?: RequestInit,
): Promise<EmpresaClientePlanoDetailResponse> {
  return apiFetch<EmpresaClientePlanoDetailResponse>(empresasRoutes.clientes.update(id), {
    init: {
      method: "PUT",
      headers: buildAuthHeaders({ "Content-Type": "application/json", ...init?.headers }),
      body: JSON.stringify(payload),
      ...init,
    },
    cache: "no-cache",
  });
}

export async function deleteClientePlano(id: string, init?: RequestInit): Promise<void> {
  return apiFetch<void>(empresasRoutes.clientes.delete(id), {
    init: { method: "DELETE", ...init, headers: buildAuthHeaders(init?.headers) },
    cache: "no-cache",
  });
}

export * from "./types";

