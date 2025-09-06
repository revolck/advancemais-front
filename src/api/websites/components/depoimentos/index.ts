import { websiteRoutes } from "@/api/routes";
import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import type {
  DepoimentoBackendResponse,
  CreateDepoimentoPayload,
  UpdateDepoimentoPayload,
} from "./types";

function getAuthHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listDepoimentos(
  init?: RequestInit,
  status?: "PUBLICADO" | "RASCUNHO",
): Promise<DepoimentoBackendResponse[]> {
  const url = status
    ? `${websiteRoutes.depoimentos.list()}?status=${encodeURIComponent(status)}`
    : websiteRoutes.depoimentos.list();
  return apiFetch<DepoimentoBackendResponse[]>(url, {
    init: init ?? { headers: apiConfig.headers },
    cache: "no-cache",
  });
}

export async function getDepoimentoById(id: string): Promise<DepoimentoBackendResponse> {
  return apiFetch<DepoimentoBackendResponse>(websiteRoutes.depoimentos.get(id), {
    init: { headers: apiConfig.headers },
    cache: "no-cache",
  });
}

export async function createDepoimento(
  data: CreateDepoimentoPayload,
): Promise<DepoimentoBackendResponse> {
  const payload: Record<string, unknown> = {};
  if (data.depoimento !== undefined) payload.depoimento = data.depoimento;
  if (data.nome !== undefined) payload.nome = data.nome;
  if (data.cargo !== undefined) payload.cargo = data.cargo;
  if (data.fotoUrl !== undefined) payload.fotoUrl = data.fotoUrl;
  if (data.status !== undefined) payload.status = data.status;
  if (data.ordem !== undefined) payload.ordem = Number(data.ordem);

  return apiFetch<DepoimentoBackendResponse>(websiteRoutes.depoimentos.create(), {
    init: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: apiConfig.headers.Accept,
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
  });
}

export async function updateDepoimento(
  id: string,
  data: UpdateDepoimentoPayload,
): Promise<DepoimentoBackendResponse> {
  const payload: Record<string, unknown> = {};
  if (data.depoimento !== undefined) payload.depoimento = data.depoimento;
  if (data.nome !== undefined) payload.nome = data.nome;
  if (data.cargo !== undefined) payload.cargo = data.cargo;
  if (data.fotoUrl !== undefined) payload.fotoUrl = data.fotoUrl;
  if (data.status !== undefined) payload.status = data.status;
  if (data.ordem !== undefined) payload.ordem = Number(data.ordem);

  return apiFetch<DepoimentoBackendResponse>(websiteRoutes.depoimentos.update(id), {
    init: {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: apiConfig.headers.Accept,
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
  });
}

export async function deleteDepoimento(id: string): Promise<void> {
  await apiFetch<void>(websiteRoutes.depoimentos.delete(id), {
    init: {
      method: "DELETE",
      headers: { Accept: apiConfig.headers.Accept, ...getAuthHeader() },
    },
    cache: "no-cache",
  });
}

export async function updateDepoimentoOrder(
  id: string,
  ordem: number,
): Promise<void> {
  await apiFetch<DepoimentoBackendResponse>(websiteRoutes.depoimentos.reorder(id), {
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
  });
}

export async function updateDepoimentoStatus(
  id: string,
  status: boolean | string,
): Promise<DepoimentoBackendResponse> {
  const payload = { status };
  return apiFetch<DepoimentoBackendResponse>(websiteRoutes.depoimentos.update(id), {
    init: {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: apiConfig.headers.Accept,
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
  });
}
