import { apiFetch } from "@/api/client";
import { websiteRoutes } from "@/api/routes";
import { authHeaders, authJsonHeaders, publicHeaders } from "@/api/shared";
import type {
  TreinamentoCompanyBackendResponse,
  CreateTreinamentoCompanyPayload,
  UpdateTreinamentoCompanyPayload,
} from "./types";

export async function listTreinamentoCompany(
  init?: RequestInit,
): Promise<TreinamentoCompanyBackendResponse[]> {
  return apiFetch<TreinamentoCompanyBackendResponse[]>(
    websiteRoutes.treinamentoCompany.list(),
    {
      init: init ?? { headers: publicHeaders() },
    },
  );
}

export async function getTreinamentoCompanyById(
  id: string,
): Promise<TreinamentoCompanyBackendResponse> {
  return apiFetch<TreinamentoCompanyBackendResponse>(
    websiteRoutes.treinamentoCompany.get(id),
    { init: { headers: publicHeaders() } },
  );
}

export async function createTreinamentoCompany(
  data: CreateTreinamentoCompanyPayload,
): Promise<TreinamentoCompanyBackendResponse> {
  return apiFetch<TreinamentoCompanyBackendResponse>(
    websiteRoutes.treinamentoCompany.create(),
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

export async function updateTreinamentoCompany(
  id: string,
  data: UpdateTreinamentoCompanyPayload,
): Promise<TreinamentoCompanyBackendResponse> {
  return apiFetch<TreinamentoCompanyBackendResponse>(
    websiteRoutes.treinamentoCompany.update(id),
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

export async function deleteTreinamentoCompany(id: string): Promise<void> {
  await apiFetch<void>(websiteRoutes.treinamentoCompany.delete(id), {
    init: { method: "DELETE", headers: authHeaders() },
    cache: "no-cache",
  });
}
