import { websiteRoutes } from "@/api/routes";
import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import type {
  RecrutamentoSelecaoBackendResponse,
  CreateRecrutamentoSelecaoPayload,
  UpdateRecrutamentoSelecaoPayload,
} from "./types";

function getAuthHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listRecrutamentoSelecao(
  init?: RequestInit,
): Promise<RecrutamentoSelecaoBackendResponse[]> {
  return apiFetch<RecrutamentoSelecaoBackendResponse[]>(
    websiteRoutes.recrutamentoSelecao.list(),
    {
      init: init ?? { headers: apiConfig.headers },
    },
  );
}

export async function getRecrutamentoSelecaoById(
  id: string,
): Promise<RecrutamentoSelecaoBackendResponse> {
  return apiFetch<RecrutamentoSelecaoBackendResponse>(
    websiteRoutes.recrutamentoSelecao.get(id),
    { init: { headers: apiConfig.headers } },
  );
}

export async function createRecrutamentoSelecao(
  data: CreateRecrutamentoSelecaoPayload,
): Promise<RecrutamentoSelecaoBackendResponse> {
  const headers = {
    "Content-Type": "application/json",
    Accept: apiConfig.headers.Accept,
    ...getAuthHeader(),
  } as Record<string, string>;
  return apiFetch<RecrutamentoSelecaoBackendResponse>(
    websiteRoutes.recrutamentoSelecao.create(),
    {
      init: { method: "POST", body: JSON.stringify(data), headers },
      cache: "no-cache",
    },
  );
}

export async function updateRecrutamentoSelecao(
  id: string,
  data: UpdateRecrutamentoSelecaoPayload,
): Promise<RecrutamentoSelecaoBackendResponse> {
  const headers = {
    "Content-Type": "application/json",
    Accept: apiConfig.headers.Accept,
    ...getAuthHeader(),
  } as Record<string, string>;
  return apiFetch<RecrutamentoSelecaoBackendResponse>(
    websiteRoutes.recrutamentoSelecao.update(id),
    {
      init: { method: "PUT", body: JSON.stringify(data), headers },
      cache: "no-cache",
    },
  );
}

export async function deleteRecrutamentoSelecao(id: string): Promise<void> {
  const headers = { Accept: apiConfig.headers.Accept, ...getAuthHeader() } as Record<string, string>;
  await apiFetch<void>(websiteRoutes.recrutamentoSelecao.delete(id), {
    init: { method: "DELETE", headers },
    cache: "no-cache",
  });
}
