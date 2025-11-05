import { apiFetch } from "@/api/client";
import { vagasRoutes } from "@/api/routes";
import { apiConfig } from "@/lib/env";
import type {
  VagaProcesso,
  VagaProcessoListParams,
  VagaProcessoListResponse,
  CreateVagaProcessoPayload,
  UpdateVagaProcessoPayload,
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

function buildQuery(params: VagaProcessoListParams | undefined): string {
  if (!params) return "";
  const sp = new URLSearchParams();
  if (params.status) sp.set("status", params.status);
  if (params.origem) sp.set("origem", params.origem);
  if (params.candidatoId) sp.set("candidatoId", params.candidatoId);
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export async function listVagaProcessos(
  vagaId: string,
  params?: VagaProcessoListParams,
  init?: RequestInit,
): Promise<VagaProcessoListResponse> {
  const url = `${vagasRoutes.processos.list(vagaId)}${buildQuery(params)}`;
  return apiFetch<VagaProcessoListResponse>(url, {
    init: { method: "GET", ...init, headers: buildAuthHeaders(init?.headers) },
    cache: "no-cache",
  });
}

export async function createVagaProcesso(
  vagaId: string,
  payload: CreateVagaProcessoPayload,
  init?: RequestInit,
): Promise<VagaProcesso> {
  return apiFetch<VagaProcesso>(vagasRoutes.processos.create(vagaId), {
    init: {
      method: "POST",
      headers: buildAuthHeaders({ "Content-Type": "application/json", ...init?.headers }),
      body: JSON.stringify(payload),
      ...init,
    },
    cache: "no-cache",
  });
}

export async function getVagaProcessoById(
  vagaId: string,
  processoId: string,
  init?: RequestInit,
): Promise<VagaProcesso> {
  return apiFetch<VagaProcesso>(vagasRoutes.processos.get(vagaId, processoId), {
    init: { method: "GET", ...init, headers: buildAuthHeaders(init?.headers) },
    cache: "no-cache",
  });
}

export async function updateVagaProcesso(
  vagaId: string,
  processoId: string,
  payload: UpdateVagaProcessoPayload,
  init?: RequestInit,
): Promise<VagaProcesso> {
  return apiFetch<VagaProcesso>(vagasRoutes.processos.update(vagaId, processoId), {
    init: {
      method: "PATCH",
      headers: buildAuthHeaders({ "Content-Type": "application/json", ...init?.headers }),
      body: JSON.stringify(payload),
      ...init,
    },
    cache: "no-cache",
  });
}

export async function deleteVagaProcesso(
  vagaId: string,
  processoId: string,
  init?: RequestInit,
): Promise<void> {
  return apiFetch<void>(vagasRoutes.processos.delete(vagaId, processoId), {
    init: { method: "DELETE", ...init, headers: buildAuthHeaders(init?.headers) },
    cache: "no-cache",
  });
}

export * from "./types";

