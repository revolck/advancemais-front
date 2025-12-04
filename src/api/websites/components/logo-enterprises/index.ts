import { websiteRoutes } from "@/api/routes";
import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import type {
  LogoEnterpriseBackendResponse,
  CreateLogoEnterprisePayload,
  UpdateLogoEnterprisePayload,
  LogoEnterpriseStatus,
} from "./types";

function getAuthHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildRequest(
  data: CreateLogoEnterprisePayload | UpdateLogoEnterprisePayload
): { body: BodyInit; headers: Record<string, string> } {
  const baseHeaders = {
    Accept: apiConfig.headers.Accept,
    ...getAuthHeader(),
  } as Record<string, string>;

  const form = new FormData();
  if (data.nome !== undefined) form.append("nome", data.nome);
  if (data.website !== undefined) form.append("website", data.website);
  if (data.status !== undefined) {
    const statusValue: LogoEnterpriseStatus =
      typeof data.status === "boolean"
        ? data.status
          ? "PUBLICADO"
          : "RASCUNHO"
        : (String(data.status).toUpperCase() as LogoEnterpriseStatus);
    form.append("status", statusValue);
  }
  if (data.ordem !== undefined) form.append("ordem", String(data.ordem));
  if (data.imagem) form.append("imagem", data.imagem);
  if (data.imagemUrl) form.append("imagemUrl", data.imagemUrl);
  if (data.imagemAlt) form.append("imagemAlt", data.imagemAlt);

  return { body: form, headers: baseHeaders };
}

export async function listLogoEnterprises(
  init?: RequestInit
): Promise<LogoEnterpriseBackendResponse[]> {
  return apiFetch<LogoEnterpriseBackendResponse[]>(
    websiteRoutes.logoEnterprises.list(),
    {
      init: init ?? { headers: apiConfig.headers },
      cache: "no-cache",
      skipLogoutOn401: true, // Permite acesso público sem autenticação
    }
  );
}

export async function getLogoEnterpriseById(
  orderId: string
): Promise<LogoEnterpriseBackendResponse> {
  return apiFetch<LogoEnterpriseBackendResponse>(
    websiteRoutes.logoEnterprises.get(orderId),
    { 
      init: { headers: apiConfig.headers }, 
      cache: "no-cache",
      skipLogoutOn401: true, // Permite acesso público sem autenticação
    }
  );
}

export async function createLogoEnterprise(
  data: CreateLogoEnterprisePayload
): Promise<LogoEnterpriseBackendResponse> {
  const { body, headers } = buildRequest(data);
  return apiFetch<LogoEnterpriseBackendResponse>(
    websiteRoutes.logoEnterprises.create(),
    {
      init: { method: "POST", body, headers },
      cache: "no-cache",
    }
  );
}

export async function updateLogoEnterprise(
  id: string,
  data: UpdateLogoEnterprisePayload
): Promise<LogoEnterpriseBackendResponse> {
  const { body, headers } = buildRequest(data);
  return apiFetch<LogoEnterpriseBackendResponse>(
    websiteRoutes.logoEnterprises.update(id),
    {
      init: { method: "PUT", body, headers },
      cache: "no-cache",
    }
  );
}

export async function deleteLogoEnterprise(id: string): Promise<void> {
  await apiFetch<void>(websiteRoutes.logoEnterprises.delete(id), {
    init: {
      method: "DELETE",
      headers: { Accept: apiConfig.headers.Accept, ...getAuthHeader() },
    },
    cache: "no-cache",
  });
}

export async function updateLogoEnterpriseOrder(
  orderId: string,
  ordem: number
): Promise<void> {
  await apiFetch<LogoEnterpriseBackendResponse>(
    websiteRoutes.logoEnterprises.reorder(orderId),
    {
      init: {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: apiConfig.headers.Accept,
          ...getAuthHeader(),
        },
        body: JSON.stringify({ ordem: Number(ordem) }),
      },
      cache: "no-cache",
    }
  );
}
