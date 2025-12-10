/**
 * API de Categorias de Cursos
 */

import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import { categoriasRoutes } from "./routes";
import type {
  CategoriaCurso,
  SubcategoriaCurso,
  CreateCategoriaPayload,
  UpdateCategoriaPayload,
  CreateSubcategoriaPayload,
  UpdateSubcategoriaPayload,
  CategoriasListApiResponse,
  CategoriaDetailApiResponse,
  SubcategoriaDetailApiResponse,
  CategoriaCreateApiResponse,
  SubcategoriaCreateApiResponse,
  CategoriasListParams,
  SubcategoriasListParams,
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
  additionalHeaders?: HeadersInit,
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

/**
 * Lista todas as categorias de cursos
 */
export async function listCategorias(
  params?: CategoriasListParams,
  init?: RequestInit,
): Promise<CategoriasListApiResponse> {
  const endpoint = categoriasRoutes.list();
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.pageSize)
    searchParams.append("pageSize", params.pageSize.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder);

  const url = searchParams.toString()
    ? `${endpoint}?${searchParams}`
    : endpoint;

  return apiFetch<CategoriasListApiResponse>(url, {
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
 * Obtém detalhes de uma categoria específica
 */
export async function getCategoria(
  id: number,
  init?: RequestInit,
): Promise<CategoriaDetailApiResponse> {
  const endpoint = categoriasRoutes.detail(id);

  return apiFetch<CategoriaDetailApiResponse>(endpoint, {
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
 * Cria uma nova categoria de curso
 */
export async function createCategoria(
  data: CreateCategoriaPayload,
  init?: RequestInit,
): Promise<CategoriaCreateApiResponse> {
  const endpoint = categoriasRoutes.create();

  return apiFetch<CategoriaCreateApiResponse>(endpoint, {
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
 * Atualiza uma categoria existente
 */
export async function updateCategoria(
  id: number,
  data: UpdateCategoriaPayload,
  init?: RequestInit,
): Promise<CategoriaDetailApiResponse> {
  const endpoint = categoriasRoutes.update(id);

  return apiFetch<CategoriaDetailApiResponse>(endpoint, {
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
 * Remove uma categoria
 */
export async function deleteCategoria(
  id: number,
  init?: RequestInit,
): Promise<void> {
  const endpoint = categoriasRoutes.delete(id);

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

// ============================================================================
// SUBCATEGORIAS
// ============================================================================

/**
 * Lista subcategorias de uma categoria específica
 */
export async function listSubcategorias(
  categoriaId: number,
  params?: SubcategoriasListParams,
  init?: RequestInit,
): Promise<SubcategoriaCurso[]> {
  const endpoint = categoriasRoutes.subcategorias.list(categoriaId);
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.pageSize)
    searchParams.append("pageSize", params.pageSize.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder);

  const url = searchParams.toString()
    ? `${endpoint}?${searchParams}`
    : endpoint;

  const response = await apiFetch<{ data: SubcategoriaCurso[] }>(url, {
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

  return response.data;
}

/**
 * Obtém detalhes de uma subcategoria específica
 */
export async function getSubcategoria(
  id: number,
  init?: RequestInit,
): Promise<SubcategoriaDetailApiResponse> {
  const endpoint = categoriasRoutes.subcategorias.detail(id);

  return apiFetch<SubcategoriaDetailApiResponse>(endpoint, {
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
 * Cria uma nova subcategoria vinculada a uma categoria
 */
export async function createSubcategoria(
  categoriaId: number,
  data: CreateSubcategoriaPayload,
  init?: RequestInit,
): Promise<SubcategoriaCreateApiResponse> {
  const endpoint = categoriasRoutes.subcategorias.create(categoriaId);

  return apiFetch<SubcategoriaCreateApiResponse>(endpoint, {
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
 * Atualiza uma subcategoria existente
 */
export async function updateSubcategoria(
  id: number,
  data: UpdateSubcategoriaPayload,
  init?: RequestInit,
): Promise<SubcategoriaDetailApiResponse> {
  const endpoint = categoriasRoutes.subcategorias.update(id);

  return apiFetch<SubcategoriaDetailApiResponse>(endpoint, {
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
 * Remove uma subcategoria
 */
export async function deleteSubcategoria(
  id: number,
  init?: RequestInit,
): Promise<void> {
  const endpoint = categoriasRoutes.subcategorias.delete(id);

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
