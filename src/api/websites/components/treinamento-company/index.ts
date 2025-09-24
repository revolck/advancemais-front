import { websiteRoutes } from "@/api/routes";
import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import type {
  TreinamentoCompanyBackendResponse,
  CreateTreinamentoCompanyPayload,
  UpdateTreinamentoCompanyPayload,
} from "./types";

function getAuthHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listTreinamentoCompany(
  init?: RequestInit,
): Promise<TreinamentoCompanyBackendResponse[]> {
  return apiFetch<TreinamentoCompanyBackendResponse[]>(
    websiteRoutes.treinamentoCompany.list(),
    {
      init: init ?? { headers: apiConfig.headers },
    },
  );
}

export async function getTreinamentoCompanyById(
  id: string,
): Promise<TreinamentoCompanyBackendResponse> {
  return apiFetch<TreinamentoCompanyBackendResponse>(
    websiteRoutes.treinamentoCompany.get(id),
    { init: { headers: apiConfig.headers } },
  );
}

export async function createTreinamentoCompany(
  data: CreateTreinamentoCompanyPayload,
): Promise<TreinamentoCompanyBackendResponse> {
  const headers = {
    "Content-Type": "application/json",
    Accept: apiConfig.headers.Accept,
    ...getAuthHeader(),
  } as Record<string, string>;
  return apiFetch<TreinamentoCompanyBackendResponse>(
    websiteRoutes.treinamentoCompany.create(),
    {
      init: { method: "POST", body: JSON.stringify(data), headers },
      cache: "no-cache",
    },
  );
}

export async function updateTreinamentoCompany(
  id: string,
  data: UpdateTreinamentoCompanyPayload,
): Promise<TreinamentoCompanyBackendResponse> {
  const headers = {
    "Content-Type": "application/json",
    Accept: apiConfig.headers.Accept,
    ...getAuthHeader(),
  } as Record<string, string>;
  return apiFetch<TreinamentoCompanyBackendResponse>(
    websiteRoutes.treinamentoCompany.update(id),
    {
      init: { method: "PUT", body: JSON.stringify(data), headers },
      cache: "no-cache",
    },
  );
}

export async function deleteTreinamentoCompany(id: string): Promise<void> {
  const headers = { Accept: apiConfig.headers.Accept, ...getAuthHeader() } as Record<string, string>;
  await apiFetch<void>(websiteRoutes.treinamentoCompany.delete(id), {
    init: { method: "DELETE", headers },
    cache: "no-cache",
  });
}
