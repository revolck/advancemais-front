import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import { routes } from "@/api/routes";
import type {
  VagaListApiResponse,
  VagaDetailApiResponse,
  VagaUpdateApiResponse,
  VagaDeleteApiResponse,
  VagaCreateApiResponse,
  VagaListParams,
  CreateVagaPayload,
  UpdateVagaPayload,
} from "./types";

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Normaliza headers para garantir compatibilidade
 */
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

/**
 * Constrói query string a partir de parâmetros
 */
function buildQueryString(params: Record<string, any>): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((item) => query.append(key, String(item)));
      } else {
        query.set(key, String(value));
      }
    }
  });

  return query.toString();
}

// ============================================================================
// CRUD DE VAGAS
// ============================================================================

/**
 * Lista vagas publicadas
 *
 * Retorna as vagas disponíveis para visualização. Por padrão, apenas vagas PUBLICADAS são retornadas.
 * É possível filtrar por status via query string. Consultas envolvendo os status RASCUNHO, EM_ANALISE,
 * DESPUBLICADA, PAUSADA ou ENCERRADA exigem autenticação com roles válidas.
 *
 * @param params - Parâmetros de paginação e filtros
 * @param init - Configurações adicionais da requisição
 * @returns Lista de vagas
 */
export async function listVagas(
  params?: VagaListParams,
  init?: RequestInit
): Promise<VagaListApiResponse> {
  const endpoint = routes.vagas.list();
  const queryParams: Record<string, any> = {};

  if (params?.page) queryParams.page = params.page;
  if (params?.pageSize) queryParams.pageSize = params.pageSize;
  if (params?.status) queryParams.status = params.status;
  if (params?.usuarioId) queryParams.usuarioId = params.usuarioId;

  const queryString = buildQueryString(queryParams);
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;

  return apiFetch<VagaListApiResponse>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });
}

export async function createVaga(
  data: CreateVagaPayload,
  init?: RequestInit
): Promise<VagaCreateApiResponse> {
  const endpoint = routes.vagas.list();

  return apiFetch<VagaCreateApiResponse>(endpoint, {
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
 * Obtém vaga por ID
 *
 * Recupera os detalhes de uma vaga PUBLICADA. O conteúdo é público e preserva o anonimato
 * das empresas quando configurado.
 *
 * @param id - ID da vaga
 * @param init - Configurações adicionais da requisição
 * @returns Detalhes da vaga
 */
export async function getVagaById(
  id: string,
  init?: RequestInit
): Promise<VagaDetailApiResponse> {
  const endpoint = routes.vagas.get(id);

  return apiFetch<VagaDetailApiResponse>(endpoint, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });
}

/**
 * Atualiza vaga
 *
 * Permite editar os dados de uma vaga existente, incluindo o status do fluxo.
 * Requer autenticação com perfil autorizado (roles: ADMIN, MODERADOR ou RECRUTADOR).
 *
 * @param id - ID da vaga
 * @param data - Dados a serem atualizados
 * @param init - Configurações adicionais da requisição
 * @returns Vaga atualizada
 */
export async function updateVaga(
  id: string,
  data: UpdateVagaPayload,
  init?: RequestInit
): Promise<VagaUpdateApiResponse> {
  const endpoint = routes.vagas.get(id);

  return apiFetch<VagaUpdateApiResponse>(endpoint, {
    init: {
      method: "PUT",
      ...init,
      headers: {
        ...apiConfig.headers,
        ...getAuthHeader(),
        ...normalizeHeaders(init?.headers),
      },
      body: init?.body ?? JSON.stringify(data),
    },
    cache: "no-cache",
  });
}

/**
 * Remove vaga
 *
 * Exclui uma vaga cadastrada. Requer autenticação com perfil autorizado
 * (roles: ADMIN, MODERADOR, EMPRESA ou RECRUTADOR).
 *
 * @param id - ID da vaga
 * @param init - Configurações adicionais da requisição
 * @returns Confirmação da remoção
 */
export async function deleteVaga(
  id: string,
  init?: RequestInit
): Promise<VagaDeleteApiResponse> {
  const endpoint = routes.vagas.get(id);

  return apiFetch<VagaDeleteApiResponse>(endpoint, {
    init: {
      method: "DELETE",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });
}
