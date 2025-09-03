import { websiteRoutes } from "@/api/routes";
import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import type {
  AdvanceAjudaBackendResponse,
  CreateAdvanceAjudaPayload,
  UpdateAdvanceAjudaPayload,
} from "./types";

function getAuthHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listAdvanceAjuda(
  init?: RequestInit,
): Promise<AdvanceAjudaBackendResponse[]> {
  return apiFetch<AdvanceAjudaBackendResponse[]>(websiteRoutes.advanceAjuda.list(), {
    init: init ?? { headers: apiConfig.headers },
  });
}

export async function getAdvanceAjudaById(
  id: string,
): Promise<AdvanceAjudaBackendResponse> {
  return apiFetch<AdvanceAjudaBackendResponse>(websiteRoutes.advanceAjuda.get(id), {
    init: { headers: apiConfig.headers },
  });
}

export async function createAdvanceAjuda(
  data: CreateAdvanceAjudaPayload,
): Promise<AdvanceAjudaBackendResponse> {
  const headers = {
    "Content-Type": "application/json",
    Accept: apiConfig.headers.Accept,
    ...getAuthHeader(),
  } as Record<string, string>;
  return apiFetch<AdvanceAjudaBackendResponse>(
    websiteRoutes.advanceAjuda.create(),
    {
      init: { method: "POST", body: JSON.stringify(data), headers },
      cache: "no-cache",
    },
  );
}

export async function updateAdvanceAjuda(
  id: string,
  data: UpdateAdvanceAjudaPayload,
): Promise<AdvanceAjudaBackendResponse> {
  const headers = {
    "Content-Type": "application/json",
    Accept: apiConfig.headers.Accept,
    ...getAuthHeader(),
  } as Record<string, string>;
  return apiFetch<AdvanceAjudaBackendResponse>(
    websiteRoutes.advanceAjuda.update(id),
    {
      init: { method: "PUT", body: JSON.stringify(data), headers },
      cache: "no-cache",
    },
  );
}

export async function deleteAdvanceAjuda(id: string): Promise<void> {
  const headers = { Accept: apiConfig.headers.Accept, ...getAuthHeader() } as Record<string, string>;
  await apiFetch<void>(websiteRoutes.advanceAjuda.delete(id), {
    init: { method: "DELETE", headers },
    cache: "no-cache",
  });
}
