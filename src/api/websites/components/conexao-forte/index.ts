import { websiteRoutes } from "@/api/routes";
import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import type {
  ConexaoForteBackendResponse,
  CreateConexaoFortePayload,
  UpdateConexaoFortePayload,
} from "./types";

function getAuthHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listConexaoForte(
  init?: RequestInit,
): Promise<ConexaoForteBackendResponse[]> {
  return apiFetch<ConexaoForteBackendResponse[]>(
    websiteRoutes.conexaoForte.list(),
    {
      init: init ?? { headers: apiConfig.headers },
    },
  );
}

export async function getConexaoForteById(
  id: string,
): Promise<ConexaoForteBackendResponse> {
  return apiFetch<ConexaoForteBackendResponse>(
    websiteRoutes.conexaoForte.get(id),
    { init: { headers: apiConfig.headers } },
  );
}

export async function createConexaoForte(
  data: CreateConexaoFortePayload,
): Promise<ConexaoForteBackendResponse> {
  const headers = {
    "Content-Type": "application/json",
    Accept: apiConfig.headers.Accept,
    ...getAuthHeader(),
  } as Record<string, string>;
  return apiFetch<ConexaoForteBackendResponse>(
    websiteRoutes.conexaoForte.create(),
    {
      init: { method: "POST", body: JSON.stringify(data), headers },
      cache: "no-cache",
    },
  );
}

export async function updateConexaoForte(
  id: string,
  data: UpdateConexaoFortePayload,
): Promise<ConexaoForteBackendResponse> {
  const headers = {
    "Content-Type": "application/json",
    Accept: apiConfig.headers.Accept,
    ...getAuthHeader(),
  } as Record<string, string>;
  return apiFetch<ConexaoForteBackendResponse>(
    websiteRoutes.conexaoForte.update(id),
    {
      init: { method: "PUT", body: JSON.stringify(data), headers },
      cache: "no-cache",
    },
  );
}

export async function deleteConexaoForte(id: string): Promise<void> {
  const headers = { Accept: apiConfig.headers.Accept, ...getAuthHeader() } as Record<string, string>;
  await apiFetch<void>(websiteRoutes.conexaoForte.delete(id), {
    init: { method: "DELETE", headers },
    cache: "no-cache",
  });
}
