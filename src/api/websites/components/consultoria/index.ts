/**
 * API Client para componente Consultoria Empresarial
 * Busca dados do componente consultoria do website
 */

import { websiteRoutes } from "@/api/routes";
import { apiFetch } from "@/api/client";
import { apiConfig, env } from "@/lib/env";
import { consultoriaMockData } from "./mock";
import {
  ConsultoriaApiResponse,
  ConsultoriaBackendResponse,
  CreateConsultoriaPayload,
  UpdateConsultoriaPayload,
} from "./types";

function mapConsultoriaResponse(
  data: ConsultoriaBackendResponse[],
): ConsultoriaApiResponse {
  const latest = data[data.length - 1];
  return {
    src: latest?.imagemUrl ?? "",
    title: latest?.titulo ?? "",
    description: latest?.descricao ?? "",
    buttonUrl: latest?.buttonUrl ?? "",
    buttonLabel: latest?.buttonLabel ?? "",
  };
}

export async function getConsultoriaData(): Promise<ConsultoriaApiResponse> {
  try {
    const raw = await listConsultoria({
      headers: apiConfig.headers,
      ...apiConfig.cache.medium,
    });
    const data = mapConsultoriaResponse(raw);
    return data;
  } catch (error) {
    if (env.apiFallback === "mock") {
      return consultoriaMockData;
    }
    throw new Error("Falha ao carregar dados de Consultoria");
  }
}

export async function getConsultoriaDataClient(): Promise<ConsultoriaApiResponse> {
  try {
    const raw = await listConsultoria({ headers: apiConfig.headers });
    const data = mapConsultoriaResponse(raw);
    return data;
  } catch (error) {
    if (env.apiFallback === "mock") {
      return consultoriaMockData;
    }
    throw new Error("Falha ao carregar dados de Consultoria");
  }
}

export async function listConsultoria(init?: RequestInit): Promise<ConsultoriaBackendResponse[]> {
  return apiFetch<ConsultoriaBackendResponse[]>(websiteRoutes.consultoria.list(), {
    init: init ?? { headers: apiConfig.headers },
  });
}

export async function getConsultoriaById(id: string): Promise<ConsultoriaBackendResponse> {
  return apiFetch<ConsultoriaBackendResponse>(
    websiteRoutes.consultoria.get(id),
    { init: { headers: apiConfig.headers } },
  );
}

function buildRequest(
  data: CreateConsultoriaPayload | UpdateConsultoriaPayload,
): { body: BodyInit; headers: Record<string, string> } {
  const baseHeaders = {
    Accept: apiConfig.headers.Accept,
    ...getAuthHeader(),
  };

  if (data.imagem) {
    const form = new FormData();
    if (data.titulo !== undefined) form.append("titulo", data.titulo);
    if (data.descricao !== undefined) form.append("descricao", data.descricao);
    if (data.buttonUrl !== undefined) form.append("buttonUrl", data.buttonUrl);
    if (data.buttonLabel !== undefined)
      form.append("buttonLabel", data.buttonLabel);
    form.append("imagem", data.imagem);
    if (data.imagemUrl) form.append("imagemUrl", data.imagemUrl);
    if (data.imagemTitulo) form.append("imagemTitulo", data.imagemTitulo);
    return { body: form, headers: baseHeaders };
  }

  const jsonPayload: Record<string, unknown> = {};
  if (data.titulo !== undefined) jsonPayload.titulo = data.titulo;
  if (data.descricao !== undefined) jsonPayload.descricao = data.descricao;
  if (data.buttonUrl !== undefined) jsonPayload.buttonUrl = data.buttonUrl;
  if (data.buttonLabel !== undefined)
    jsonPayload.buttonLabel = data.buttonLabel;
  if (data.imagemUrl !== undefined) jsonPayload.imagemUrl = data.imagemUrl;
  if (data.imagemTitulo !== undefined)
    jsonPayload.imagemTitulo = data.imagemTitulo;

  return {
    body: JSON.stringify(jsonPayload),
    headers: { "Content-Type": "application/json", ...baseHeaders },
  };
}

function getAuthHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function createConsultoria(
  data: CreateConsultoriaPayload,
): Promise<ConsultoriaBackendResponse> {
  const { body, headers } = buildRequest(data);
  return apiFetch<ConsultoriaBackendResponse>(
    websiteRoutes.consultoria.create(),
    {
      init: {
        method: "POST",
        body,
        headers,
      },
      cache: "no-cache",
    },
  );
}

export async function updateConsultoria(
  id: string,
  data: UpdateConsultoriaPayload,
): Promise<ConsultoriaBackendResponse> {
  const { body, headers } = buildRequest(data);
  return apiFetch<ConsultoriaBackendResponse>(
    websiteRoutes.consultoria.update(id),
    {
      init: {
        method: "PUT",
        body,
        headers,
      },
      cache: "no-cache",
    },
  );
}

export async function deleteConsultoria(id: string): Promise<void> {
  await apiFetch<void>(websiteRoutes.consultoria.delete(id), {
    init: {
      method: "DELETE",
      headers: { Accept: apiConfig.headers.Accept, ...getAuthHeader() },
    },
    cache: "no-cache",
  });
}
