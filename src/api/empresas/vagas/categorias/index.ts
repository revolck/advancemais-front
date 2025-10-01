/**
 * API de Categorias e Subcategorias de Vagas Corporativas
 */

import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import { empresaVagasCategoriasRoutes } from "./routes";
import type {
  EmpresaVagaCategoria,
  EmpresaVagaSubcategoria,
  CreateEmpresaVagaCategoriaPayload,
  UpdateEmpresaVagaCategoriaPayload,
  CreateEmpresaVagaSubcategoriaPayload,
  UpdateEmpresaVagaSubcategoriaPayload,
  EmpresaVagaCategoriasListApiResponse,
  EmpresaVagaCategoriaDetailApiResponse,
  EmpresaVagaSubcategoriaDetailApiResponse,
  EmpresaVagaCategoriaCreateApiResponse,
  EmpresaVagaSubcategoriaCreateApiResponse,
  EmpresaVagaCategoriasListParams,
  EmpresaVagaErrorResponse,
} from "./types";

// ============================================================================
// UTILITÁRIOS DE AUTENTICAÇÃO
// ============================================================================

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

// ============================================================================
// CATEGORIAS
// ============================================================================

export async function listEmpresaVagaCategorias(
  params?: EmpresaVagaCategoriasListParams,
  init?: RequestInit
): Promise<EmpresaVagaCategoriasListApiResponse> {
  const endpoint = empresaVagasCategoriasRoutes.list();
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.append("search", params.search);
  if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder);

  const url = searchParams.size > 0 ? `${endpoint}?${searchParams}` : endpoint;

  return apiFetch<EmpresaVagaCategoriasListApiResponse>(url, {
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

export async function getEmpresaVagaCategoria(
  categoriaId: string,
  init?: RequestInit
): Promise<EmpresaVagaCategoriaDetailApiResponse> {
  const endpoint = empresaVagasCategoriasRoutes.detail(categoriaId);

  return apiFetch<EmpresaVagaCategoriaDetailApiResponse>(endpoint, {
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

export async function createEmpresaVagaCategoria(
  data: CreateEmpresaVagaCategoriaPayload,
  init?: RequestInit
): Promise<EmpresaVagaCategoriaCreateApiResponse> {
  const endpoint = empresaVagasCategoriasRoutes.create();

  return apiFetch<EmpresaVagaCategoriaCreateApiResponse>(endpoint, {
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

export async function updateEmpresaVagaCategoria(
  categoriaId: string,
  data: UpdateEmpresaVagaCategoriaPayload,
  init?: RequestInit
): Promise<EmpresaVagaCategoriaDetailApiResponse> {
  const endpoint = empresaVagasCategoriasRoutes.update(categoriaId);

  return apiFetch<EmpresaVagaCategoriaDetailApiResponse>(endpoint, {
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

export async function deleteEmpresaVagaCategoria(
  categoriaId: string,
  init?: RequestInit
): Promise<void | EmpresaVagaErrorResponse> {
  const endpoint = empresaVagasCategoriasRoutes.delete(categoriaId);

  return apiFetch<void | EmpresaVagaErrorResponse>(endpoint, {
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

// ============================================================================
// SUBCATEGORIAS
// ============================================================================

export async function listEmpresaVagaSubcategorias(
  categoriaId: string,
  init?: RequestInit
): Promise<EmpresaVagaSubcategoria[]> {
  const endpoint = empresaVagasCategoriasRoutes.subcategorias.list(categoriaId);

  const response = await apiFetch<EmpresaVagaSubcategoria[] | { data: EmpresaVagaSubcategoria[] }>(
    endpoint,
    {
      init: {
        method: "GET",
        ...init,
        headers: buildAuthHeaders({
          Accept: "application/json",
          ...init?.headers,
        }),
      },
      cache: "no-cache",
    }
  );

  if (Array.isArray(response)) {
    return response;
  }

  if (response && "data" in response) {
    return response.data;
  }

  return [];
}

export async function getEmpresaVagaSubcategoria(
  subcategoriaId: string,
  init?: RequestInit
): Promise<EmpresaVagaSubcategoriaDetailApiResponse> {
  const endpoint = empresaVagasCategoriasRoutes.subcategorias.detail(
    subcategoriaId
  );

  return apiFetch<EmpresaVagaSubcategoriaDetailApiResponse>(endpoint, {
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

export async function createEmpresaVagaSubcategoria(
  categoriaId: string,
  data: CreateEmpresaVagaSubcategoriaPayload,
  init?: RequestInit
): Promise<EmpresaVagaSubcategoriaCreateApiResponse> {
  const endpoint = empresaVagasCategoriasRoutes.subcategorias.create(
    categoriaId
  );

  return apiFetch<EmpresaVagaSubcategoriaCreateApiResponse>(endpoint, {
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

export async function updateEmpresaVagaSubcategoria(
  subcategoriaId: string,
  data: UpdateEmpresaVagaSubcategoriaPayload,
  init?: RequestInit
): Promise<EmpresaVagaSubcategoriaDetailApiResponse> {
  const endpoint = empresaVagasCategoriasRoutes.subcategorias.update(
    subcategoriaId
  );

  return apiFetch<EmpresaVagaSubcategoriaDetailApiResponse>(endpoint, {
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

export async function deleteEmpresaVagaSubcategoria(
  subcategoriaId: string,
  init?: RequestInit
): Promise<void | EmpresaVagaErrorResponse> {
  const endpoint = empresaVagasCategoriasRoutes.subcategorias.delete(
    subcategoriaId
  );

  return apiFetch<void | EmpresaVagaErrorResponse>(endpoint, {
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

