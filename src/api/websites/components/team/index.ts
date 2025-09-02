import { websiteRoutes } from "@/api/routes";
import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import type { TeamBackendResponse, CreateTeamPayload, UpdateTeamPayload } from "./types";

function getAuthHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildForm(data: CreateTeamPayload | UpdateTeamPayload): { body: BodyInit; headers: Record<string, string> } {
  const baseHeaders = { Accept: apiConfig.headers.Accept, ...getAuthHeader() } as Record<string, string>;
  const form = new FormData();
  if (data.nome !== undefined) form.append("nome", data.nome);
  if (data.cargo !== undefined) form.append("cargo", data.cargo);
  if (data.photo) form.append("photo", data.photo);
  if (data.photoUrl) form.append("photoUrl", data.photoUrl);
  if (data.ordem !== undefined) form.append("ordem", String(data.ordem));
  return { body: form, headers: baseHeaders };
}

export async function listTeam(init?: RequestInit): Promise<TeamBackendResponse[]> {
  return apiFetch<TeamBackendResponse[]>(websiteRoutes.team.list(), {
    init: init ?? { headers: apiConfig.headers },
    cache: "no-cache",
  });
}

export async function createTeam(data: CreateTeamPayload): Promise<TeamBackendResponse> {
  const { body, headers } = buildForm(data);
  return apiFetch<TeamBackendResponse>(websiteRoutes.team.create(), {
    init: { method: "POST", body, headers },
    cache: "no-cache",
  });
}

export async function updateTeam(id: string, data: UpdateTeamPayload): Promise<TeamBackendResponse> {
  const { body, headers } = buildForm(data);
  return apiFetch<TeamBackendResponse>(websiteRoutes.team.update(id), {
    init: { method: "PUT", body, headers },
    cache: "no-cache",
  });
}

export async function deleteTeam(id: string): Promise<void> {
  await apiFetch<void>(websiteRoutes.team.delete(id), {
    init: { method: "DELETE", headers: { Accept: apiConfig.headers.Accept, ...getAuthHeader() } },
    cache: "no-cache",
  });
}

export async function updateTeamOrder(id: string, ordem: number): Promise<void> {
  try {
    await apiFetch<TeamBackendResponse>(websiteRoutes.team.reorder(id), {
      init: {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: apiConfig.headers.Accept, ...getAuthHeader() },
        body: JSON.stringify({ ordem: Number(ordem) }),
      },
      cache: "no-cache",
    });
    return;
  } catch {
    const { body, headers } = buildForm({ ordem: Number(ordem) });
    await apiFetch<TeamBackendResponse>(websiteRoutes.team.update(id), {
      init: { method: "PUT", body, headers },
      cache: "no-cache",
    });
  }
}

