import { apiFetch } from "@/api/client";
import { websiteRoutes } from "@/api/routes";
import { apiConfig } from "@/lib/env";

import type { WebsiteModuleInfoResponse, WebsiteReorderPayload } from "./types";

const ACCEPT_HEADER = { Accept: apiConfig.headers.Accept } as const;
const JSON_HEADERS = {
  ...ACCEPT_HEADER,
  "Content-Type": apiConfig.headers["Content-Type"],
} as const;

export async function getWebsiteModuleInfo(): Promise<WebsiteModuleInfoResponse> {
  return apiFetch<WebsiteModuleInfoResponse>(websiteRoutes.info(), {
    init: {
      method: "GET",
      headers: ACCEPT_HEADER,
    },
    cache: "no-cache",
  });
}

export async function getWebsiteItem<T = any>(
  recurso: string,
  id: string,
): Promise<T> {
  return apiFetch<T>(websiteRoutes.item.get(recurso, id), {
    init: { method: "GET", headers: ACCEPT_HEADER },
    cache: "no-cache",
  });
}

export async function updateWebsiteItem<T = any>(
  recurso: string,
  id: string,
  payload: Partial<T>,
): Promise<T> {
  return apiFetch<T>(websiteRoutes.item.update(recurso, id), {
    init: {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
  });
}

export async function deleteWebsiteItem(
  recurso: string,
  id: string,
): Promise<void> {
  return apiFetch<void>(websiteRoutes.item.delete(recurso, id), {
    init: { method: "DELETE", headers: ACCEPT_HEADER },
    cache: "no-cache",
  });
}

// Generic reorder helper when endpoint follows /website/{recurso}/{id}/reorder
export async function reorderWebsiteItem(
  recurso: string,
  id: string,
  ordem: number,
): Promise<void> {
  const endpoint = `${websiteRoutes.item.update(recurso, id)}/reorder`;
  return apiFetch<void>(endpoint, {
    init: {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify({ ordem } satisfies WebsiteReorderPayload),
    },
    cache: "no-cache",
  });
}

export * from "./types";

