import { websiteRoutes } from "@/api/routes";
import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import type {
  TreinamentosInCompanyBackendResponse,
  CreateTreinamentosInCompanyPayload,
  UpdateTreinamentosInCompanyPayload,
} from "./types";

function getAuthHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listTreinamentosInCompany(
  init?: RequestInit,
): Promise<TreinamentosInCompanyBackendResponse[]> {
  return apiFetch<TreinamentosInCompanyBackendResponse[]>(
    websiteRoutes.treinamentosInCompany.list(),
    {
      init: init ?? { headers: apiConfig.headers },
    },
  );
}

export async function getTreinamentosInCompanyById(
  id: string,
): Promise<TreinamentosInCompanyBackendResponse> {
  return apiFetch<TreinamentosInCompanyBackendResponse>(
    websiteRoutes.treinamentosInCompany.get(id),
    { init: { headers: apiConfig.headers } },
  );
}

export async function createTreinamentosInCompany(
  data: CreateTreinamentosInCompanyPayload,
): Promise<TreinamentosInCompanyBackendResponse> {
  const headers = {
    "Content-Type": "application/json",
    Accept: apiConfig.headers.Accept,
    ...getAuthHeader(),
  } as Record<string, string>;
  return apiFetch<TreinamentosInCompanyBackendResponse>(
    websiteRoutes.treinamentosInCompany.create(),
    {
      init: { method: "POST", body: JSON.stringify(data), headers },
      cache: "no-cache",
    },
  );
}

export async function updateTreinamentosInCompany(
  id: string,
  data: UpdateTreinamentosInCompanyPayload,
): Promise<TreinamentosInCompanyBackendResponse> {
  const headers = {
    "Content-Type": "application/json",
    Accept: apiConfig.headers.Accept,
    ...getAuthHeader(),
  } as Record<string, string>;
  return apiFetch<TreinamentosInCompanyBackendResponse>(
    websiteRoutes.treinamentosInCompany.update(id),
    {
      init: { method: "PUT", body: JSON.stringify(data), headers },
      cache: "no-cache",
    },
  );
}

export async function deleteTreinamentosInCompany(id: string): Promise<void> {
  const headers = { Accept: apiConfig.headers.Accept, ...getAuthHeader() } as Record<string, string>;
  await apiFetch<void>(websiteRoutes.treinamentosInCompany.delete(id), {
    init: { method: "DELETE", headers },
    cache: "no-cache",
  });
}

