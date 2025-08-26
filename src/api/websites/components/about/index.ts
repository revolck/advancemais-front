/**
 * API Client para componente About
 * Busca dados do componente About do website
 */

import routes from "@/api/routes";
import { apiFetch } from "@/api/client";
import { apiConfig, env } from "@/lib/env";
import { aboutMockData } from "./mock";
import {
  AboutApiResponse,
  AboutBackendResponse,
  CreateAboutPayload,
  UpdateAboutPayload,
} from "./types";

function mapAboutResponse(data: AboutBackendResponse[]): AboutApiResponse {
  const first = data[0];
  return {
    src: first?.imagemUrl ?? "",
    title: first?.titulo ?? "",
    description: first?.descricao ?? "",
  };
}

/**
 * Busca dados do componente About (Server-side)
 * @returns Promise com os dados do about
 */
export async function getAboutData(): Promise<AboutApiResponse> {
  try {
    const raw = await listAbout({
      headers: apiConfig.headers,
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
    const raw = await listAbout({ headers: apiConfig.headers });

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
  return apiFetch<AboutBackendResponse[]>(routes.website.home.about.list(), {
    init: init ?? { headers: apiConfig.headers },
  });
}

export async function getAboutById(
  id: string,
): Promise<AboutBackendResponse> {
  return apiFetch<AboutBackendResponse>(
    routes.website.home.about.get(id),
    { init: { headers: apiConfig.headers } },
  );
}

function buildFormData(
  data: CreateAboutPayload | UpdateAboutPayload,
): FormData {
  const form = new FormData();
  if (data.titulo !== undefined) form.append("titulo", data.titulo);
  if (data.descricao !== undefined) form.append("descricao", data.descricao);
  if (data.imagem) form.append("imagem", data.imagem);
  if (data.imagemUrl) form.append("imagemUrl", data.imagemUrl);
  return form;
}

export async function createAbout(
  data: CreateAboutPayload,
): Promise<AboutBackendResponse> {
  const form = buildFormData(data);
  return apiFetch<AboutBackendResponse>(routes.website.home.about.create(), {
    init: {
      method: "POST",
      body: form,
      headers: { Accept: apiConfig.headers.Accept },
    },
    cache: "no-cache",
  });
}

export async function updateAbout(
  id: string,
  data: UpdateAboutPayload,
): Promise<AboutBackendResponse> {
  const form = buildFormData(data);
  return apiFetch<AboutBackendResponse>(
    routes.website.home.about.update(id),
    {
      init: {
        method: "PUT",
        body: form,
        headers: { Accept: apiConfig.headers.Accept },
      },
      cache: "no-cache",
    },
  );
}

export async function deleteAbout(id: string): Promise<void> {
  await apiFetch<void>(routes.website.home.about.delete(id), {
    init: {
      method: "DELETE",
      headers: { Accept: apiConfig.headers.Accept },
    },
    cache: "no-cache",
  });
}
