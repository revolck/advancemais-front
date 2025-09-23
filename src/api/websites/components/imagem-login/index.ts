/**
 * API Client para componente Imagem de Login
 * Busca dados da imagem exibida na página de login
 */

import { apiFetch } from "@/api/client";
import { websiteRoutes } from "@/api/routes";
import { authHeaders, publicHeaders } from "@/api/shared";
import { apiConfig, env } from "@/lib/env";
import { loginImageMockData } from "./mock";
import type {
  LoginImageItem,
  LoginImageBackendResponse,
  CreateLoginImagePayload,
  UpdateLoginImagePayload,
} from "./types";

function mapLoginImageResponse(
  data: LoginImageBackendResponse[],
): LoginImageItem | null {
  const latest = data[data.length - 1];
  if (!latest) return null;
  return {
    id: latest.id,
    imagemUrl: latest.imagemUrl,
    imagemTitulo: latest.imagemTitulo,
    link: latest.link ?? undefined,
  };
}

export async function getLoginImageData(): Promise<LoginImageItem | null> {
  try {
    const raw = await listLoginImages({
      headers: publicHeaders(),
      ...apiConfig.cache.medium,
    });
    return mapLoginImageResponse(raw);
  } catch (error) {
    console.error("❌ Erro ao buscar imagem de login:", error);
    if (env.apiFallback === "mock") {
      return loginImageMockData;
    }
    throw new Error("Falha ao carregar imagem de login");
  }
}

export async function getLoginImageDataClient(): Promise<
  LoginImageItem | null
> {
  try {
    const raw = await listLoginImages({ headers: publicHeaders() });
    return mapLoginImageResponse(raw);
  } catch (error) {
    console.error("❌ Erro ao buscar imagem de login (client):", error);
    if (env.apiFallback === "mock") {
      return loginImageMockData;
    }
    throw new Error("Falha ao carregar imagem de login");
  }
}

export async function listLoginImages(
  init?: RequestInit,
): Promise<LoginImageBackendResponse[]> {
  return apiFetch<LoginImageBackendResponse[]>(
    websiteRoutes.loginImage.list(),
    { init: init ?? { headers: publicHeaders() }, cache: "no-cache" },
  );
}

export async function getLoginImageById(
  id: string,
): Promise<LoginImageBackendResponse> {
  return apiFetch<LoginImageBackendResponse>(
    websiteRoutes.loginImage.get(id),
    { init: { headers: publicHeaders() }, cache: "no-cache" },
  );
}

function buildRequest(
  data: CreateLoginImagePayload | UpdateLoginImagePayload,
): { body: BodyInit; headers: Record<string, string> } {
  const headers = authHeaders();
  const form = new FormData();
  if (data.imagem) form.append("imagem", data.imagem);
  if (data.imagemUrl) form.append("imagemUrl", data.imagemUrl);
  if (data.imagemTitulo) form.append("imagemTitulo", data.imagemTitulo);
  if (data.link) form.append("link", data.link);
  return { body: form, headers };
}

export async function createLoginImage(
  data: CreateLoginImagePayload,
): Promise<LoginImageBackendResponse> {
  const { body, headers } = buildRequest(data);
  return apiFetch<LoginImageBackendResponse>(
    websiteRoutes.loginImage.create(),
    { init: { method: "POST", body, headers }, cache: "no-cache" },
  );
}

export async function updateLoginImage(
  id: string,
  data: UpdateLoginImagePayload,
): Promise<LoginImageBackendResponse> {
  const { body, headers } = buildRequest(data);
  return apiFetch<LoginImageBackendResponse>(
    websiteRoutes.loginImage.update(id),
    { init: { method: "PUT", body, headers }, cache: "no-cache" },
  );
}

export async function deleteLoginImage(id: string): Promise<void> {
  await apiFetch<void>(websiteRoutes.loginImage.delete(id), {
    init: {
      method: "DELETE",
      headers: authHeaders(),
    },
    cache: "no-cache",
  });
}
