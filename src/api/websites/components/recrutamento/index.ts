/**
 * API Client para componente Recrutamento Empresarial
 * Busca dados do componente recrutamento do website
 */

import { apiFetch } from "@/api/client";
import { websiteRoutes } from "@/api/routes";
import { authHeaders, authJsonHeaders, publicHeaders } from "@/api/shared";
import { apiConfig, env } from "@/lib/env";
import { recrutamentoMockData } from "./mock";
import {
  RecrutamentoApiResponse,
  RecrutamentoBackendResponse,
  CreateRecrutamentoPayload,
  UpdateRecrutamentoPayload,
} from "./types";

function mapRecrutamentoResponse(
  data: RecrutamentoBackendResponse[],
): RecrutamentoApiResponse {
  const latest = data[data.length - 1];
  return {
    src: latest?.imagemUrl ?? "",
    title: latest?.titulo ?? "",
    description: latest?.descricao ?? "",
    buttonUrl: latest?.buttonUrl ?? "",
    buttonLabel: latest?.buttonLabel ?? "",
  };
}

export async function getRecrutamentoData(): Promise<RecrutamentoApiResponse> {
  try {
    const raw = await listRecrutamento({
      headers: publicHeaders(),
      ...apiConfig.cache.medium,
    });
    const data = mapRecrutamentoResponse(raw);
    return data;
  } catch (error) {
    if (env.apiFallback === "mock") {
      return recrutamentoMockData;
    }
    throw new Error("Falha ao carregar dados de Recrutamento");
  }
}

export async function getRecrutamentoDataClient(): Promise<RecrutamentoApiResponse> {
  try {
    const raw = await listRecrutamento({ headers: publicHeaders() });
    const data = mapRecrutamentoResponse(raw);
    return data;
  } catch (error) {
    if (env.apiFallback === "mock") {
      return recrutamentoMockData;
    }
    throw new Error("Falha ao carregar dados de Recrutamento");
  }
}

export async function listRecrutamento(init?: RequestInit): Promise<RecrutamentoBackendResponse[]> {
  return apiFetch<RecrutamentoBackendResponse[]>(websiteRoutes.recrutamento.list(), {
    init: init ?? { headers: publicHeaders() },
  });
}

export async function getRecrutamentoById(id: string): Promise<RecrutamentoBackendResponse> {
  return apiFetch<RecrutamentoBackendResponse>(
    websiteRoutes.recrutamento.get(id),
    { init: { headers: publicHeaders() } },
  );
}

function buildRequest(
  data: CreateRecrutamentoPayload | UpdateRecrutamentoPayload,
): { body: BodyInit; headers: Record<string, string> } {
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
    return { body: form, headers: authHeaders() };
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
    headers: authJsonHeaders(),
  };
}

export async function createRecrutamento(
  data: CreateRecrutamentoPayload,
): Promise<RecrutamentoBackendResponse> {
  const { body, headers } = buildRequest(data);
  return apiFetch<RecrutamentoBackendResponse>(
    websiteRoutes.recrutamento.create(),
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

export async function updateRecrutamento(
  id: string,
  data: UpdateRecrutamentoPayload,
): Promise<RecrutamentoBackendResponse> {
  const { body, headers } = buildRequest(data);
  return apiFetch<RecrutamentoBackendResponse>(
    websiteRoutes.recrutamento.update(id),
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

export async function deleteRecrutamento(id: string): Promise<void> {
  await apiFetch<void>(websiteRoutes.recrutamento.delete(id), {
    init: {
      method: "DELETE",
      headers: authHeaders(),
    },
    cache: "no-cache",
  });
}
