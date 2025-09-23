import { apiFetch } from "@/api/client";
import { websiteRoutes } from "@/api/routes";
import { authHeaders, authJsonHeaders, buildQueryString, publicHeaders } from "@/api/shared";
import type {
  ScriptResponse,
  CreateScriptPayload,
  UpdateScriptPayload,
  ScriptListParams,
} from "@/api/scripts/types";

export async function listWebsiteScripts(
  params?: ScriptListParams,
  init?: RequestInit,
): Promise<ScriptResponse[]> {
  const query = buildQueryString({
    aplicacao: params?.aplicacao,
    orientacao: params?.orientacao,
    status: params?.status,
  });
  return apiFetch<ScriptResponse[]>(`${websiteRoutes.scripts.list()}${query}`, {
    init: init ?? { headers: publicHeaders() },
    cache: "no-cache",
  });
}

export async function getWebsiteScriptById(id: string): Promise<ScriptResponse> {
  return apiFetch<ScriptResponse>(websiteRoutes.scripts.get(id), {
    init: { headers: publicHeaders() },
    cache: "no-cache",
  });
}

export async function createWebsiteScript(
  payload: CreateScriptPayload,
): Promise<ScriptResponse> {
  return apiFetch<ScriptResponse>(websiteRoutes.scripts.create(), {
    init: {
      method: "POST",
      headers: authJsonHeaders(),
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
  });
}

export async function updateWebsiteScript(
  id: string,
  payload: UpdateScriptPayload,
): Promise<ScriptResponse> {
  return apiFetch<ScriptResponse>(websiteRoutes.scripts.update(id), {
    init: {
      method: "PUT",
      headers: authJsonHeaders(),
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
  });
}

export async function deleteWebsiteScript(id: string): Promise<void> {
  await apiFetch<void>(websiteRoutes.scripts.delete(id), {
    init: {
      method: "DELETE",
      headers: authHeaders(),
    },
    cache: "no-cache",
  });
}
