import { websiteRoutes } from "@/api/routes";
import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import type {
  SistemaBackendResponse,
  CreateSistemaPayload,
  UpdateSistemaPayload,
} from "./types";

function getAuthHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listSistema(init?: RequestInit): Promise<SistemaBackendResponse[]> {
  return apiFetch<SistemaBackendResponse[]>(websiteRoutes.sistema.list(), {
    init: init ?? { headers: apiConfig.headers },
  });
}

export async function getSistemaById(id: string): Promise<SistemaBackendResponse> {
  return apiFetch<SistemaBackendResponse>(websiteRoutes.sistema.get(id), {
    init: { headers: apiConfig.headers },
  });
}

export async function createSistema(
  data: CreateSistemaPayload,
): Promise<SistemaBackendResponse> {
  return apiFetch<SistemaBackendResponse>(websiteRoutes.sistema.create(), {
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
  });
}

export async function updateSistema(
  id: string,
  data: UpdateSistemaPayload,
): Promise<SistemaBackendResponse> {
  return apiFetch<SistemaBackendResponse>(websiteRoutes.sistema.update(id), {
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
  });
}

export async function deleteSistema(id: string): Promise<void> {
  await apiFetch<void>(websiteRoutes.sistema.delete(id), {
    init: {
      method: "DELETE",
      headers: { Accept: apiConfig.headers.Accept, ...getAuthHeader() },
    },
    cache: "no-cache",
  });
}
