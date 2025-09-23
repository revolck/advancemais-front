import { apiFetch } from "@/api/client";
import { websiteRoutes } from "@/api/routes";
import { authHeaders, authJsonHeaders, publicHeaders } from "@/api/shared";
import type {
  SistemaBackendResponse,
  CreateSistemaPayload,
  UpdateSistemaPayload,
} from "./types";

export async function listSistema(init?: RequestInit): Promise<SistemaBackendResponse[]> {
  return apiFetch<SistemaBackendResponse[]>(websiteRoutes.sistema.list(), {
    init: init ?? { headers: publicHeaders() },
  });
}

export async function getSistemaById(id: string): Promise<SistemaBackendResponse> {
  return apiFetch<SistemaBackendResponse>(websiteRoutes.sistema.get(id), {
    init: { headers: publicHeaders() },
  });
}

export async function createSistema(
  data: CreateSistemaPayload,
): Promise<SistemaBackendResponse> {
  return apiFetch<SistemaBackendResponse>(websiteRoutes.sistema.create(), {
    init: {
      method: "POST",
      headers: authJsonHeaders(),
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
      headers: authJsonHeaders(),
      body: JSON.stringify(data),
    },
    cache: "no-cache",
  });
}

export async function deleteSistema(id: string): Promise<void> {
  await apiFetch<void>(websiteRoutes.sistema.delete(id), {
    init: {
      method: "DELETE",
      headers: authHeaders(),
    },
    cache: "no-cache",
  });
}
