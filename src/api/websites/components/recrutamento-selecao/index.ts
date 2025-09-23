import { apiFetch } from "@/api/client";
import { websiteRoutes } from "@/api/routes";
import { authHeaders, authJsonHeaders, publicHeaders } from "@/api/shared";
import type {
  RecrutamentoSelecaoBackendResponse,
  CreateRecrutamentoSelecaoPayload,
  UpdateRecrutamentoSelecaoPayload,
} from "./types";

export async function listRecrutamentoSelecao(
  init?: RequestInit,
): Promise<RecrutamentoSelecaoBackendResponse[]> {
  return apiFetch<RecrutamentoSelecaoBackendResponse[]>(
    websiteRoutes.recrutamentoSelecao.list(),
    {
      init: init ?? { headers: publicHeaders() },
    },
  );
}

export async function getRecrutamentoSelecaoById(
  id: string,
): Promise<RecrutamentoSelecaoBackendResponse> {
  return apiFetch<RecrutamentoSelecaoBackendResponse>(
    websiteRoutes.recrutamentoSelecao.get(id),
    { init: { headers: publicHeaders() } },
  );
}

export async function createRecrutamentoSelecao(
  data: CreateRecrutamentoSelecaoPayload,
): Promise<RecrutamentoSelecaoBackendResponse> {
  return apiFetch<RecrutamentoSelecaoBackendResponse>(
    websiteRoutes.recrutamentoSelecao.create(),
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

export async function updateRecrutamentoSelecao(
  id: string,
  data: UpdateRecrutamentoSelecaoPayload,
): Promise<RecrutamentoSelecaoBackendResponse> {
  return apiFetch<RecrutamentoSelecaoBackendResponse>(
    websiteRoutes.recrutamentoSelecao.update(id),
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

export async function deleteRecrutamentoSelecao(id: string): Promise<void> {
  await apiFetch<void>(websiteRoutes.recrutamentoSelecao.delete(id), {
    init: { method: "DELETE", headers: authHeaders() },
    cache: "no-cache",
  });
}
