/**
 * API de Recrutador
 * - Empresas e vagas vinculadas
 * - Entrevistas (Google Meet via Calendar)
 */

import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import type {
  CreateRecrutadorEntrevistaPayload,
  CreateRecrutadorEntrevistaResponse,
  GetRecrutadorEntrevistaResponse,
  ListRecrutadorVagasParams,
  RecrutadorEmpresasResponse,
  RecrutadorVagaDetailResponse,
  RecrutadorVagasResponse,
} from "./types";

const RECRUTADOR_ROUTES = {
  EMPRESAS: "/api/v1/recrutador/empresas",
  VAGAS: "/api/v1/recrutador/vagas",
  VAGA_BY_ID: (id: string) => `/api/v1/recrutador/vagas/${encodeURIComponent(id)}`,
  CREATE_ENTREVISTA: (vagaId: string, candidatoId: string) =>
    `/api/v1/recrutador/vagas/${encodeURIComponent(
      vagaId
    )}/candidatos/${encodeURIComponent(candidatoId)}/entrevistas`,
  ENTREVISTA_BY_ID: (id: string) =>
    `/api/v1/recrutador/entrevistas/${encodeURIComponent(id)}`,
} as const;

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

function buildAuthHeaders(additionalHeaders?: HeadersInit): Record<string, string> {
  return {
    ...apiConfig.headers,
    ...getAuthHeader(),
    ...normalizeHeaders(additionalHeaders),
  };
}

function buildQueryString(params: Record<string, unknown>): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      if (key === "status") {
        query.set(key, value.join(","));
      } else {
        value.forEach((v) => query.append(key, String(v)));
      }
      return;
    }
    query.set(key, String(value));
  });

  return query.toString();
}

export async function getRecrutadorEmpresas(
  init?: RequestInit
): Promise<RecrutadorEmpresasResponse> {
  return apiFetch<RecrutadorEmpresasResponse>(RECRUTADOR_ROUTES.EMPRESAS, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });
}

export async function listRecrutadorVagas(
  params?: ListRecrutadorVagasParams,
  init?: RequestInit
): Promise<RecrutadorVagasResponse> {
  const queryParams: Record<string, unknown> = {};

  if (params?.empresaUsuarioId) queryParams.empresaUsuarioId = params.empresaUsuarioId;
  if (params?.page) queryParams.page = params.page;
  if (params?.pageSize) queryParams.pageSize = params.pageSize;
  if (params?.status && params.status.length > 0) {
    const hasRascunho = params.status.some(
      (s) => String(s).toUpperCase() === "RASCUNHO"
    );
    if (hasRascunho) {
      throw new Error("Filtro status=RASCUNHO não é permitido para recrutador.");
    }
    queryParams.status = params.status;
  }

  const qs = buildQueryString(queryParams);
  const url = qs ? `${RECRUTADOR_ROUTES.VAGAS}?${qs}` : RECRUTADOR_ROUTES.VAGAS;

  return apiFetch<RecrutadorVagasResponse>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });
}

export async function getRecrutadorVagaById(
  id: string,
  init?: RequestInit
): Promise<RecrutadorVagaDetailResponse> {
  return apiFetch<RecrutadorVagaDetailResponse>(RECRUTADOR_ROUTES.VAGA_BY_ID(id), {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });
}

export async function createRecrutadorEntrevista(
  vagaId: string,
  candidatoId: string,
  payload: CreateRecrutadorEntrevistaPayload,
  init?: RequestInit
): Promise<CreateRecrutadorEntrevistaResponse> {
  return apiFetch<CreateRecrutadorEntrevistaResponse>(
    RECRUTADOR_ROUTES.CREATE_ENTREVISTA(vagaId, candidatoId),
    {
      init: {
        method: "POST",
        ...init,
        headers: buildAuthHeaders({
          "Content-Type": "application/json",
          ...normalizeHeaders(init?.headers),
        }),
        body: JSON.stringify(payload),
      },
      cache: "no-cache",
    }
  );
}

export async function getRecrutadorEntrevistaById(
  id: string,
  init?: RequestInit
): Promise<GetRecrutadorEntrevistaResponse> {
  return apiFetch<GetRecrutadorEntrevistaResponse>(RECRUTADOR_ROUTES.ENTREVISTA_BY_ID(id), {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });
}

export type {
  RecrutadorEmpresa,
  RecrutadorEmpresasResponse,
  RecrutadorVagaResumo,
  RecrutadorVagasResponse,
  RecrutadorVagaDetailResponse,
  ListRecrutadorVagasParams,
  RecrutadorEntrevista,
  CreateRecrutadorEntrevistaPayload,
  CreateRecrutadorEntrevistaResponse,
  GetRecrutadorEntrevistaResponse,
} from "./types";

