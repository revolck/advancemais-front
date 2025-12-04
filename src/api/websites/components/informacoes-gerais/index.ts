import { websiteRoutes } from "@/api/routes";
import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import type {
  InformacoesGeraisBackendResponse,
  CreateInformacoesGeraisPayload,
  UpdateInformacoesGeraisPayload,
} from "./types";

function getAuthHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listInformacoesGerais(
  init?: RequestInit,
): Promise<InformacoesGeraisBackendResponse[]> {
  return apiFetch<InformacoesGeraisBackendResponse[]>(
    websiteRoutes.informacoesGerais.list(),
    { 
      init: init ?? { headers: apiConfig.headers },
      skipLogoutOn401: true, // Permite acesso público sem autenticação
    },
  );
}

export async function getInformacoesGeraisById(
  id: string,
): Promise<InformacoesGeraisBackendResponse> {
  return apiFetch<InformacoesGeraisBackendResponse>(
    websiteRoutes.informacoesGerais.get(id),
    { init: { headers: apiConfig.headers } },
  );
}

export async function createInformacoesGerais(
  data: CreateInformacoesGeraisPayload,
): Promise<InformacoesGeraisBackendResponse> {
  return apiFetch<InformacoesGeraisBackendResponse>(
    websiteRoutes.informacoesGerais.create(),
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
    },
  );
}

export async function updateInformacoesGerais(
  id: string,
  data: UpdateInformacoesGeraisPayload,
): Promise<InformacoesGeraisBackendResponse> {
  return apiFetch<InformacoesGeraisBackendResponse>(
    websiteRoutes.informacoesGerais.update(id),
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
    },
  );
}

export async function deleteInformacoesGerais(id: string): Promise<void> {
  await apiFetch<void>(websiteRoutes.informacoesGerais.delete(id), {
    init: {
      method: "DELETE",
      headers: { Accept: apiConfig.headers.Accept, ...getAuthHeader() },
    },
    cache: "no-cache",
  });
}
