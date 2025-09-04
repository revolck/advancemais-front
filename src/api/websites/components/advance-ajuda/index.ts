import { websiteRoutes } from "@/api/routes";
import { apiFetch } from "@/api/client";
import { apiConfig, env } from "@/lib/env";
import type {
  AdvanceAjudaBackendResponse,
  CreateAdvanceAjudaPayload,
  UpdateAdvanceAjudaPayload,
} from "./types";
import type { AdvanceAjudaData } from "@/theme/website/components/advance-ajuda/types";

function mapAdvanceAjudaResponse(
  data: AdvanceAjudaBackendResponse[],
): AdvanceAjudaData[] {
  return (data || []).map((item) => ({
    id: item.id,
    title: item.titulo,
    description: item.descricao,
    imageUrl: item.imagemUrl || "",
    imageAlt: item.imagemTitulo || "",
    benefits: [
      {
        id: `${item.id}-1`,
        title: item.titulo1,
        description: item.descricao1,
        order: 1,
      },
      {
        id: `${item.id}-2`,
        title: item.titulo2,
        description: item.descricao2,
        order: 2,
      },
      {
        id: `${item.id}-3`,
        title: item.titulo3,
        description: item.descricao3,
        order: 3,
      },
    ],
  }));
}

export async function getAdvanceAjudaData(): Promise<AdvanceAjudaData[]> {
  try {
    const raw = await listAdvanceAjuda({
      headers: apiConfig.headers,
      ...apiConfig.cache.medium,
    });
    return mapAdvanceAjudaResponse(raw);
  } catch (error) {
    if (env.apiFallback === "mock") {
      return [];
    }
    throw error;
  }
}

export async function getAdvanceAjudaDataClient(): Promise<AdvanceAjudaData[]> {
  try {
    const raw = await listAdvanceAjuda({ headers: apiConfig.headers });
    return mapAdvanceAjudaResponse(raw);
  } catch (error) {
    if (env.apiFallback === "mock") {
      return [];
    }
    throw error;
  }
}

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
