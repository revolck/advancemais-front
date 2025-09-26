import { apiFetch } from "@/api/client";
import { empresasRoutes } from "@/api/routes";
import { apiConfig } from "@/lib/env";
import type { AdminCompanyVagaItem } from "./types";

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
 * Normaliza headers para garantir compatibilidade
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
    return Object.fromEntries(headers);
  }
  return headers as Record<string, string>;
}

/**
 * Busca os detalhes de uma vaga específica com candidaturas completas
 * @param vagaId - ID da vaga
 * @param init - Configurações adicionais da requisição
 * @returns Detalhes da vaga com candidaturas
 */
export async function getAdminCompanyVacancyById(
  vagaId: string,
  init?: RequestInit
): Promise<AdminCompanyVagaItem> {
  const endpoint = empresasRoutes.adminEmpresas.vagas.get(vagaId);

  return apiFetch<AdminCompanyVagaItem>(endpoint, {
    init: {
      method: "GET",
      ...init,
      headers: {
        ...apiConfig.headers,
        ...getAuthHeader(),
        ...normalizeHeaders(init?.headers),
      },
    },
    cache: "no-cache",
  });
}
