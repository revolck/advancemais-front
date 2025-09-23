import { apiFetch } from "@/api/client";
import { dashboardRoutes } from "@/api/routes";
import { authHeaders, authJsonHeaders, buildQueryString, publicHeaders } from "@/api/shared";
import type {
  ScriptResponse,
  CreateScriptPayload,
  UpdateScriptPayload,
  ScriptListParams,
} from "@/api/scripts/types";

export async function listDashboardScripts(
  params?: ScriptListParams,
  init?: RequestInit,
): Promise<ScriptResponse[]> {
  const query = buildQueryString({
    aplicacao: params?.aplicacao,
    orientacao: params?.orientacao,
    status: params?.status,
  });
  return apiFetch<ScriptResponse[]>(`${dashboardRoutes.scripts.list()}${query}`, {
    init: init ?? { headers: publicHeaders() },
    cache: "no-cache",
  });
}

export async function getDashboardScriptById(id: string): Promise<ScriptResponse> {
  return apiFetch<ScriptResponse>(dashboardRoutes.scripts.get(id), {
    init: { headers: publicHeaders() },
    cache: "no-cache",
  });
}

export async function createDashboardScript(
  payload: CreateScriptPayload,
): Promise<ScriptResponse> {
  return apiFetch<ScriptResponse>(dashboardRoutes.scripts.create(), {
    init: {
      method: "POST",
      headers: authJsonHeaders(),
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
  });
}

export async function updateDashboardScript(
  id: string,
  payload: UpdateScriptPayload,
): Promise<ScriptResponse> {
  return apiFetch<ScriptResponse>(dashboardRoutes.scripts.update(id), {
    init: {
      method: "PUT",
      headers: authJsonHeaders(),
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
  });
}

export async function deleteDashboardScript(id: string): Promise<void> {
  await apiFetch<void>(dashboardRoutes.scripts.delete(id), {
    init: {
      method: "DELETE",
      headers: authHeaders(),
    },
    cache: "no-cache",
  });
}
