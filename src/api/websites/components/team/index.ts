import { websiteRoutes } from "@/api/routes";
import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import type {
  TeamBackendResponse,
  CreateTeamPayload,
  UpdateTeamPayload,
} from "./types";

function getAuthHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listTeam(
  init?: RequestInit,
  status?: "PUBLICADO" | "RASCUNHO",
): Promise<TeamBackendResponse[]> {
  const url = status
    ? `${websiteRoutes.team.list()}?status=${encodeURIComponent(status)}`
    : websiteRoutes.team.list();
  return apiFetch<TeamBackendResponse[]>(url, {
    init: init ?? { headers: apiConfig.headers },
    cache: "no-cache",
  });
}

export async function getTeamById(id: string): Promise<TeamBackendResponse> {
  return apiFetch<TeamBackendResponse>(websiteRoutes.team.get(id), {
    init: { headers: apiConfig.headers },
    cache: "no-cache",
  });
}

export async function createTeam(
  data: CreateTeamPayload,
): Promise<TeamBackendResponse> {
  const payload: Record<string, unknown> = {};
  if (data.nome !== undefined) payload.nome = data.nome;
  if (data.cargo !== undefined) payload.cargo = data.cargo;
  if (data.photoUrl !== undefined) payload.photoUrl = data.photoUrl;
  if (data.status !== undefined) payload.status = data.status;
  if (data.ordem !== undefined) payload.ordem = Number(data.ordem);

  return apiFetch<TeamBackendResponse>(websiteRoutes.team.create(), {
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

export async function updateTeam(
  id: string,
  data: UpdateTeamPayload,
): Promise<TeamBackendResponse> {
  const payload: Record<string, unknown> = {};
  if (data.nome !== undefined) payload.nome = data.nome;
  if (data.cargo !== undefined) payload.cargo = data.cargo;
  if (data.photoUrl !== undefined) payload.photoUrl = data.photoUrl;
  if (data.status !== undefined) payload.status = data.status;
  if (data.ordem !== undefined) payload.ordem = Number(data.ordem);

  return apiFetch<TeamBackendResponse>(websiteRoutes.team.update(id), {
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

export async function deleteTeam(id: string): Promise<void> {
  await apiFetch<void>(websiteRoutes.team.delete(id), {
    init: {
      method: "DELETE",
      headers: { Accept: apiConfig.headers.Accept, ...getAuthHeader() },
    },
    cache: "no-cache",
  });
}

export async function updateTeamOrder(
  id: string,
  ordem: number,
): Promise<void> {
  await apiFetch<TeamBackendResponse>(websiteRoutes.team.reorder(id), {
    init: {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: apiConfig.headers.Accept,
        ...getAuthHeader(),
      },
      body: JSON.stringify({ ordem: Number(ordem) }),
    },
    cache: "no-cache",
  });
}
