/**
 * API Client para componente About
 * Busca dados do componente About do website
 */

import { apiFetch } from "@/api/client";
import { websiteRoutes } from "@/api/routes";
import { authHeaders, authJsonHeaders, publicHeaders } from "@/api/shared";
import { apiConfig, env } from "@/lib/env";
import { aboutMockData } from "./mock";
import {
  AboutApiResponse,
  AboutBackendResponse,
  CreateAboutPayload,
  UpdateAboutPayload,
} from "./types";

function mapAboutResponse(data: AboutBackendResponse[]): AboutApiResponse {
  const latest = data[data.length - 1];
  return {
    src: latest?.imagemUrl ?? "",
    title: latest?.titulo ?? "",
    description: latest?.descricao ?? "",
  };
}

/**
 * Busca dados do componente About (Server-side)
 * @returns Promise com os dados do about
 */
export async function getAboutData(): Promise<AboutApiResponse> {
  try {
    const raw = await listAbout({
      headers: publicHeaders(),
      ...apiConfig.cache.medium,
    });

    const data = mapAboutResponse(raw);
    console.log("✅ About data loaded:", data);
    return data;
  } catch (error) {
    console.error("❌ Erro ao buscar dados do About:", error);
    if (env.apiFallback === "mock") {
      return aboutMockData;
    }
    throw new Error("Falha ao carregar dados do About");
  }
}

/**
 * Busca dados do componente About (Client-side)
 * Usa o cliente API com cache e suporte a mock
 */
export async function getAboutDataClient(): Promise<AboutApiResponse> {
  try {
    const raw = await listAbout({ headers: publicHeaders() });

    const data = mapAboutResponse(raw);
    console.log("✅ About data loaded (client):", data);
    return data;
  } catch (error) {
    console.error("❌ Erro ao buscar dados do About (client):", error);

    if (env.apiFallback === "mock") {
      return aboutMockData;
    }

    throw new Error("Falha ao carregar dados do About");
  }
}

export async function listAbout(
  init?: RequestInit,
): Promise<AboutBackendResponse[]> {
  return apiFetch<AboutBackendResponse[]>(websiteRoutes.about.list(), {
    init: init ?? { headers: publicHeaders() },
  });
}

export async function getAboutById(
  id: string,
): Promise<AboutBackendResponse> {
  return apiFetch<AboutBackendResponse>(
    websiteRoutes.about.get(id),
    { init: { headers: publicHeaders() } },
  );
}

function buildRequest(
  data: CreateAboutPayload | UpdateAboutPayload,
): { body: BodyInit; headers: Record<string, string> } {
  if (data.imagem) {
    const form = new FormData();
    if (data.titulo !== undefined) form.append("titulo", data.titulo);
    if (data.descricao !== undefined) form.append("descricao", data.descricao);
    form.append("imagem", data.imagem);
    if (data.imagemUrl) form.append("imagemUrl", data.imagemUrl);
    if (data.imagemTitulo) form.append("imagemTitulo", data.imagemTitulo);
    return { body: form, headers: authHeaders() };
  }

  const jsonPayload: Record<string, unknown> = {};
  if (data.titulo !== undefined) jsonPayload.titulo = data.titulo;
  if (data.descricao !== undefined) jsonPayload.descricao = data.descricao;
  if (data.imagemUrl !== undefined) jsonPayload.imagemUrl = data.imagemUrl;
  if (data.imagemTitulo !== undefined)
    jsonPayload.imagemTitulo = data.imagemTitulo;

  return {
    body: JSON.stringify(jsonPayload),
    headers: authJsonHeaders(),
  };
}

export async function createAbout(
  data: CreateAboutPayload,
): Promise<AboutBackendResponse> {
  const { body, headers } = buildRequest(data);
  return apiFetch<AboutBackendResponse>(websiteRoutes.about.create(), {
    init: {
      method: "POST",
      body,
      headers,
    },
    cache: "no-cache",
  });
}

export async function updateAbout(
  id: string,
  data: UpdateAboutPayload,
): Promise<AboutBackendResponse> {
  const { body, headers } = buildRequest(data);
  return apiFetch<AboutBackendResponse>(websiteRoutes.about.update(id), {
    init: {
      method: "PUT",
      body,
      headers,
    },
    cache: "no-cache",
  });
}

export async function deleteAbout(id: string): Promise<void> {
  await apiFetch<void>(websiteRoutes.about.delete(id), {
    init: {
      method: "DELETE",
      headers: authHeaders(),
    },
    cache: "no-cache",
  });
}
