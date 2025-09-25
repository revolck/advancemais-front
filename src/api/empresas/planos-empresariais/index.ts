import { empresasRoutes } from "@/api/routes";
import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import type {
  PlanoEmpresarialBackendResponse,
  CreatePlanoEmpresarialPayload,
  UpdatePlanoEmpresarialPayload,
  PlanoEmpresarialListApiResponse,
  PlanoEmpresarialDetailApiResponse,
  PlanoEmpresarialCreateApiResponse,
  PlanoEmpresarialUpdateApiResponse,
  PlanoEmpresarialDeleteApiResponse,
} from "./types";

/**
 * Lista todos os planos empresariais disponíveis.
 * Endpoint público, não requer autenticação.
 *
 * @returns Lista de planos empresariais ou erro
 */
export async function listPlanosEmpresariais(): Promise<PlanoEmpresarialListApiResponse> {
  return apiFetch<PlanoEmpresarialListApiResponse>(
    empresasRoutes.planosEmpresariais.list(),
    {
      init: {
        method: "GET",
        headers: apiConfig.headers,
      },
      cache: "no-cache",
    }
  );
}

/**
 * Obtém um plano empresarial específico por ID.
 *
 * @param id - ID do plano empresarial
 * @returns Dados do plano ou erro
 */
export async function getPlanoEmpresarialById(
  id: string
): Promise<PlanoEmpresarialDetailApiResponse> {
  return apiFetch<PlanoEmpresarialDetailApiResponse>(
    empresasRoutes.planosEmpresariais.get(id),
    {
      init: {
        method: "GET",
        headers: apiConfig.headers,
      },
      cache: "no-cache",
    }
  );
}

/**
 * Cria um novo plano empresarial.
 * Requer autenticação e permissões de ADMIN ou MODERADOR.
 *
 * @param data - Dados do plano a ser criado
 * @returns Plano criado ou erro
 */
export async function createPlanoEmpresarial(
  data: CreatePlanoEmpresarialPayload
): Promise<PlanoEmpresarialCreateApiResponse> {
  return apiFetch<PlanoEmpresarialCreateApiResponse>(
    empresasRoutes.planosEmpresariais.create(),
    {
      init: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: apiConfig.headers.Accept,
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      },
      cache: "no-cache",
    }
  );
}

/**
 * Atualiza um plano empresarial existente.
 * Requer autenticação e permissões de ADMIN ou MODERADOR.
 *
 * @param id - ID do plano a ser atualizado
 * @param data - Dados atualizados do plano
 * @returns Plano atualizado ou erro
 */
export async function updatePlanoEmpresarial(
  id: string,
  data: UpdatePlanoEmpresarialPayload
): Promise<PlanoEmpresarialUpdateApiResponse> {
  return apiFetch<PlanoEmpresarialUpdateApiResponse>(
    empresasRoutes.planosEmpresariais.update(id),
    {
      init: {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: apiConfig.headers.Accept,
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      },
      cache: "no-cache",
    }
  );
}

/**
 * Remove um plano empresarial.
 * Requer autenticação e permissões de ADMIN ou MODERADOR.
 *
 * @param id - ID do plano a ser removido
 * @returns void ou erro
 */
export async function deletePlanoEmpresarial(
  id: string
): Promise<PlanoEmpresarialDeleteApiResponse> {
  return apiFetch<PlanoEmpresarialDeleteApiResponse>(
    empresasRoutes.planosEmpresariais.delete(id),
    {
      init: {
        method: "DELETE",
        headers: {
          Accept: apiConfig.headers.Accept,
          ...getAuthHeader(),
        },
      },
      cache: "no-cache",
    }
  );
}

/**
 * Obtém o header de autorização do token armazenado no cookie.
 *
 * @returns Objeto com header Authorization ou objeto vazio
 */
function getAuthHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return token ? { Authorization: `Bearer ${token}` } : {};
}
