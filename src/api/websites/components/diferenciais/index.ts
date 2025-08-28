import { websiteRoutes } from "@/api/routes";
import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import type {
  DiferenciaisBackendResponse,
  CreateDiferenciaisPayload,
  UpdateDiferenciaisPayload,
} from "./types";

export async function listDiferenciais(
  init?: RequestInit,
): Promise<DiferenciaisBackendResponse[]> {
  return apiFetch<DiferenciaisBackendResponse[]>(
    websiteRoutes.diferenciais.list(),
    { init: init ?? { headers: apiConfig.headers } },
  );
}

export async function getDiferenciaisById(
  id: string,
): Promise<DiferenciaisBackendResponse> {
  return apiFetch<DiferenciaisBackendResponse>(
    websiteRoutes.diferenciais.get(id),
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

export async function createDiferenciais(
  data: CreateDiferenciaisPayload,
): Promise<DiferenciaisBackendResponse> {
  return apiFetch<DiferenciaisBackendResponse>(
    websiteRoutes.diferenciais.create(),
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

export async function updateDiferenciais(
  id: string,
  data: UpdateDiferenciaisPayload,
): Promise<DiferenciaisBackendResponse> {
  return apiFetch<DiferenciaisBackendResponse>(
    websiteRoutes.diferenciais.update(id),
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

export async function deleteDiferenciais(id: string): Promise<void> {
  await apiFetch<void>(websiteRoutes.diferenciais.delete(id), {
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
