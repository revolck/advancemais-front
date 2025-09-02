/**
 * API Client para componente SobreEmpresa
 * Fornece operações para gerenciar o conteúdo "Sobre a Empresa"
 */

import { websiteRoutes } from "@/api/routes";
import { apiFetch } from "@/api/client";
import { apiConfig, env } from "@/lib/env";
import { sobreEmpresaMockData } from "./mock";
import {
  type SobreEmpresaBackendResponse,
  type CreateSobreEmpresaPayload,
  type UpdateSobreEmpresaPayload,
  type AccordionSectionData,
} from "./types";

function mapSobreEmpresa(
  data: SobreEmpresaBackendResponse[],
): AccordionSectionData[] {
  if (!data.length) return [];
  const latest = data[data.length - 1];
  return [
    {
      id: latest.id,
      title: latest.titulo,
      description: latest.descricao,
      videoUrl: latest.videoUrl || "",
      videoType: latest.videoUrl?.includes("youtube")
        ? "youtube"
        : latest.videoUrl?.includes("vimeo")
        ? "vimeo"
        : latest.videoUrl?.endsWith(".mp4")
        ? "mp4"
        : "url",
      items: [
        {
          id: `${latest.id}-missao`,
          value: "missao",
          trigger: "Missão",
          content: latest.descricaoMissao,
          order: 1,
          isActive: true,
        },
        {
          id: `${latest.id}-visao`,
          value: "visao",
          trigger: "Visão",
          content: latest.descricaoVisao,
          order: 2,
          isActive: true,
        },
        {
          id: `${latest.id}-valores`,
          value: "valores",
          trigger: "Valores",
          content: latest.descricaoValores,
          order: 3,
          isActive: true,
        },
      ],
      order: 1,
      isActive: true,
    },
  ];
}

export async function getSobreEmpresaDataClient(): Promise<AccordionSectionData[]> {
  try {
    const raw = await listSobreEmpresa({ headers: apiConfig.headers });
    return mapSobreEmpresa(raw);
  } catch (error) {
    if (env.apiFallback === "mock") {
      return sobreEmpresaMockData;
    }
    throw new Error("Falha ao carregar dados de SobreEmpresa");
  }
}

export async function listSobreEmpresa(
  init?: RequestInit,
): Promise<SobreEmpresaBackendResponse[]> {
  return apiFetch<SobreEmpresaBackendResponse[]>(
    websiteRoutes.sobreEmpresa.list(),
    { init: init ?? { headers: apiConfig.headers } },
  );
}

export async function getSobreEmpresaById(
  id: string,
): Promise<SobreEmpresaBackendResponse> {
  return apiFetch<SobreEmpresaBackendResponse>(
    websiteRoutes.sobreEmpresa.get(id),
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

export async function createSobreEmpresa(
  data: CreateSobreEmpresaPayload,
): Promise<SobreEmpresaBackendResponse> {
  return apiFetch<SobreEmpresaBackendResponse>(
    websiteRoutes.sobreEmpresa.create(),
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

export async function updateSobreEmpresa(
  id: string,
  data: UpdateSobreEmpresaPayload,
): Promise<SobreEmpresaBackendResponse> {
  return apiFetch<SobreEmpresaBackendResponse>(
    websiteRoutes.sobreEmpresa.update(id),
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

export async function deleteSobreEmpresa(id: string): Promise<void> {
  await apiFetch<void>(websiteRoutes.sobreEmpresa.delete(id), {
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
