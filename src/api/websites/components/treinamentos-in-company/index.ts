import { apiFetch } from "@/api/client";
import { websiteRoutes } from "@/api/routes";
import { authHeaders, authJsonHeaders, publicHeaders } from "@/api/shared";
import type {
  TreinamentosInCompanyBackendResponse,
  CreateTreinamentosInCompanyPayload,
  UpdateTreinamentosInCompanyPayload,
} from "./types";

export async function listTreinamentosInCompany(
  init?: RequestInit,
): Promise<TreinamentosInCompanyBackendResponse[]> {
  return apiFetch<TreinamentosInCompanyBackendResponse[]>(
    websiteRoutes.treinamentosInCompany.list(),
    {
      init: init ?? { headers: publicHeaders() },
    },
  );
}

export async function getTreinamentosInCompanyById(
  id: string,
): Promise<TreinamentosInCompanyBackendResponse> {
  return apiFetch<TreinamentosInCompanyBackendResponse>(
    websiteRoutes.treinamentosInCompany.get(id),
    { init: { headers: publicHeaders() } },
  );
}

export async function createTreinamentosInCompany(
  data: CreateTreinamentosInCompanyPayload,
): Promise<TreinamentosInCompanyBackendResponse> {
  return apiFetch<TreinamentosInCompanyBackendResponse>(
    websiteRoutes.treinamentosInCompany.create(),
    {
      init: {
        method: "POST",
        body: JSON.stringify(data),
        headers: authJsonHeaders(),
      },
      cache: "no-cache",
    },
  );
}

export async function updateTreinamentosInCompany(
  id: string,
  data: UpdateTreinamentosInCompanyPayload,
): Promise<TreinamentosInCompanyBackendResponse> {
  return apiFetch<TreinamentosInCompanyBackendResponse>(
    websiteRoutes.treinamentosInCompany.update(id),
    {
      init: {
        method: "PUT",
        body: JSON.stringify(data),
        headers: authJsonHeaders(),
      },
      cache: "no-cache",
    },
  );
}

export async function deleteTreinamentosInCompany(id: string): Promise<void> {
  await apiFetch<void>(websiteRoutes.treinamentosInCompany.delete(id), {
    init: { method: "DELETE", headers: authHeaders() },
    cache: "no-cache",
  });
}

