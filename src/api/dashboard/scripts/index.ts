import { apiFetch } from "@/api/client";
import { dashboardRoutes } from "@/api/routes";
import { apiConfig } from "@/lib/env";
import type {
  ScriptResponse,
  CreateScriptPayload,
  UpdateScriptPayload,
  ScriptListParams,
} from "@/api/scripts/types";

function getAuthHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildQuery(params?: ScriptListParams): string {
  if (!params) return "";
  const query = new URLSearchParams();
  if (params.aplicacao) query.set("aplicacao", params.aplicacao);
  if (params.orientacao) query.set("orientacao", params.orientacao);
  if (params.status) query.set("status", params.status);
  const str = query.toString();
  return str ? `?${str}` : "";
}

export async function listDashboardScripts(
  params?: ScriptListParams,
  init?: RequestInit,
): Promise<ScriptResponse[]> {
  const query = buildQuery(params);
  return apiFetch<ScriptResponse[]>(`${dashboardRoutes.scripts.list()}${query}`, {
    init: init ?? { headers: apiConfig.headers },
    cache: "no-cache",
  });
}

export async function getDashboardScriptById(id: string): Promise<ScriptResponse> {
  return apiFetch<ScriptResponse>(dashboardRoutes.scripts.get(id), {
    init: { headers: apiConfig.headers },
    cache: "no-cache",
  });
}

export async function createDashboardScript(
  payload: CreateScriptPayload,
): Promise<ScriptResponse> {
  return apiFetch<ScriptResponse>(dashboardRoutes.scripts.create(), {
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

export async function updateDashboardScript(
  id: string,
  payload: UpdateScriptPayload,
): Promise<ScriptResponse> {
  return apiFetch<ScriptResponse>(dashboardRoutes.scripts.update(id), {
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

export async function deleteDashboardScript(id: string): Promise<void> {
  await apiFetch<void>(dashboardRoutes.scripts.delete(id), {
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
