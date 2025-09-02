import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import { websiteRoutes } from "@/api/routes";
import type {
  HeaderPageBackendResponse,
  CreateHeaderPagePayload,
  UpdateHeaderPagePayload,
  HeaderPage,
} from "./types";

function getAuthHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listHeaderPages(init?: RequestInit): Promise<HeaderPageBackendResponse[]> {
  return apiFetch<HeaderPageBackendResponse[]>(websiteRoutes.headerPages.list(), {
    init: init ?? { headers: apiConfig.headers },
    cache: "no-cache",
  });
}

export async function getHeaderPageById(id: string): Promise<HeaderPageBackendResponse> {
  return apiFetch<HeaderPageBackendResponse>(websiteRoutes.headerPages.get(id), {
    init: { headers: apiConfig.headers },
  });
}

export async function createHeaderPage(data: CreateHeaderPagePayload): Promise<HeaderPageBackendResponse> {
  const headers = { "Content-Type": "application/json", Accept: apiConfig.headers.Accept, ...getAuthHeader() } as Record<string, string>;
  return apiFetch<HeaderPageBackendResponse>(websiteRoutes.headerPages.create(), {
    init: { method: "POST", body: JSON.stringify(data), headers },
    cache: "no-cache",
  });
}

export async function updateHeaderPage(id: string, data: UpdateHeaderPagePayload): Promise<HeaderPageBackendResponse> {
  const headers = { "Content-Type": "application/json", Accept: apiConfig.headers.Accept, ...getAuthHeader() } as Record<string, string>;
  return apiFetch<HeaderPageBackendResponse>(websiteRoutes.headerPages.update(id), {
    init: { method: "PUT", body: JSON.stringify(data), headers },
    cache: "no-cache",
  });
}

export async function deleteHeaderPage(id: string): Promise<void> {
  const headers = { Accept: apiConfig.headers.Accept, ...getAuthHeader() } as Record<string, string>;
  await apiFetch<void>(websiteRoutes.headerPages.delete(id), {
    init: { method: "DELETE", headers },
    cache: "no-cache",
  });
}

// Helpers
export async function getHeaderForPage(page: HeaderPage): Promise<HeaderPageBackendResponse | null> {
  const list = await listHeaderPages();
  return (list || []).find((h) => (h.page || "").toString().toUpperCase() === String(page).toUpperCase()) || null;
}

