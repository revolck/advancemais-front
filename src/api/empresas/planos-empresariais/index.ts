import { empresasRoutes } from "@/api/routes";
import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import type {
  PlanoEmpresarialBackendResponse,
  CreatePlanoEmpresarialPayload,
  UpdatePlanoEmpresarialPayload,
} from "./types";

export async function listPlanosEmpresariais(
  init?: RequestInit,
): Promise<PlanoEmpresarialBackendResponse[]> {
  return apiFetch<PlanoEmpresarialBackendResponse[]>(
    empresasRoutes.planosEmpresariais.list(),
    { init: init ?? { headers: apiConfig.headers } },
  );
}

export async function getPlanoEmpresarialById(
  id: string,
): Promise<PlanoEmpresarialBackendResponse> {
  return apiFetch<PlanoEmpresarialBackendResponse>(
    empresasRoutes.planosEmpresariais.get(id),
    { init: { headers: apiConfig.headers } },
  );
}

function getAuthHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function createPlanoEmpresarial(
  data: CreatePlanoEmpresarialPayload,
): Promise<PlanoEmpresarialBackendResponse> {
  return apiFetch<PlanoEmpresarialBackendResponse>(
    empresasRoutes.planosEmpresariais.create(),
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

export async function updatePlanoEmpresarial(
  id: string,
  data: UpdatePlanoEmpresarialPayload,
): Promise<PlanoEmpresarialBackendResponse> {
  return apiFetch<PlanoEmpresarialBackendResponse>(
    empresasRoutes.planosEmpresariais.update(id),
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

export async function deletePlanoEmpresarial(id: string): Promise<void> {
  await apiFetch<void>(empresasRoutes.planosEmpresariais.delete(id), {
    init: {
      method: "DELETE",
      headers: {
        Accept: apiConfig.headers.Accept,
        ...getAuthHeader(),
      },
    },
    cache: "no-cache",
  });
}
