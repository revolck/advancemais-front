/**
 * API Client para componente Slider
 * Busca dados do componente Slider do website
 */

import routes, { websiteRoutes } from "@/api/routes";
import { apiFetch } from "@/api/client";
import { apiConfig, env } from "@/lib/env";
import { sliderMockData } from "./mock";
import type {
  SlideBackendResponse,
  CreateSliderPayload,
  UpdateSliderPayload,
  SliderOrientation,
} from "./types";
import type { SlideData } from "@/theme/website/components/slider/types";

function mapSlideResponse(
  data: SlideBackendResponse[],
  orientation: SliderOrientation = "DESKTOP"
): SlideData[] {
  return data
    .filter((item) => item.status === "PUBLICADO" && item.orientacao === orientation)
    .sort((a, b) => a.ordem - b.ordem)
    .map((item) => ({
      id: item.ordem,
      image: item.imagemUrl,
      alt: item.imagemTitulo,
      link: item.link,
      overlay: false,
    }));
}

export async function getSliderData(orientation: SliderOrientation = "DESKTOP"): Promise<SlideData[]> {
  try {
    const raw = await apiFetch<SlideBackendResponse[]>(routes.website.slider.list(), {
      init: { headers: apiConfig.headers, ...apiConfig.cache.medium },
    });

    const data = mapSlideResponse(raw, orientation);
    console.log("✅ Slider data loaded:", data);
    return data;
  } catch (error) {
    console.error("❌ Erro ao buscar dados do Slider:", error);
    if (env.apiFallback === "mock") {
      return sliderMockData;
    }
    throw new Error("Falha ao carregar dados do Slider");
  }
}

export async function getSliderDataClient(orientation: SliderOrientation = "DESKTOP"): Promise<SlideData[]> {
  const endpoint = routes.website.slider.list();

  try {
    const raw = await apiFetch<SlideBackendResponse[]>(endpoint, {
      init: { headers: apiConfig.headers },
      cache: "short",
    });

    const data = mapSlideResponse(raw, orientation);
    console.log("✅ Slider data loaded (client):", data);
    return data;
  } catch (error) {
    console.error("❌ Erro ao buscar dados do Slider (client):", error);

    if (env.apiFallback === "mock") {
      return sliderMockData;
    }

    throw new Error("Falha ao carregar dados do Slider");
  }
}

// ----- CRUD para Slider (admin) -----

export async function listSliders(init?: RequestInit): Promise<SlideBackendResponse[]> {
  return apiFetch<SlideBackendResponse[]>(websiteRoutes.slider.list(), {
    init: init ?? { headers: apiConfig.headers },
  });
}

export async function getSliderById(id: string): Promise<SlideBackendResponse> {
  return apiFetch<SlideBackendResponse>(websiteRoutes.slider.get(id), {
    init: { headers: apiConfig.headers },
  });
}

function getAuthHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildRequest(
  data: CreateSliderPayload | UpdateSliderPayload
): { body: BodyInit; headers: Record<string, string> } {
  const baseHeaders = {
    Accept: apiConfig.headers.Accept,
    ...getAuthHeader(),
  };

  // API do Slider espera multipart/form-data mesmo para updates simples
  const form = new FormData();
  if (data.sliderName !== undefined) form.append("sliderName", data.sliderName);
  if (data.link !== undefined) form.append("link", String(data.link));
  if (data.orientacao !== undefined) form.append("orientacao", data.orientacao);
  if (data.status !== undefined) {
    const statusValue =
      typeof data.status === "boolean"
        ? data.status
          ? "PUBLICADO"
          : "RASCUNHO"
        : data.status;
    form.append("status", statusValue);
  }
  if (data.ordem !== undefined) form.append("ordem", String(data.ordem));
  if (data.imagem) form.append("imagem", data.imagem);
  if (data.imagemUrl !== undefined && data.imagemUrl)
    form.append("imagemUrl", data.imagemUrl);
  if (data.imagemTitulo !== undefined && data.imagemTitulo)
    form.append("imagemTitulo", data.imagemTitulo);

  return { body: form, headers: baseHeaders };
}

export async function createSlider(
  data: CreateSliderPayload
): Promise<SlideBackendResponse> {
  const { body, headers } = buildRequest(data);
  return apiFetch<SlideBackendResponse>(websiteRoutes.slider.create(), {
    init: { method: "POST", body, headers },
    cache: "no-cache",
  });
}

export async function updateSlider(
  id: string,
  data: UpdateSliderPayload
): Promise<SlideBackendResponse> {
  const { body, headers } = buildRequest(data);
  return apiFetch<SlideBackendResponse>(websiteRoutes.slider.update(id), {
    init: { method: "PUT", body, headers },
    cache: "no-cache",
  });
}

export async function deleteSlider(id: string): Promise<void> {
  await apiFetch<void>(websiteRoutes.slider.delete(id), {
    init: {
      method: "DELETE",
      headers: { Accept: apiConfig.headers.Accept, ...getAuthHeader() },
    },
    cache: "no-cache",
  });
}

export async function updateSliderOrder(
  id: string,
  ordem: number,
  orientacao: SliderOrientation
): Promise<void> {
  const { body, headers } = buildRequest({ ordem, orientacao });
  await apiFetch<SlideBackendResponse>(websiteRoutes.slider.update(id), {
    init: { method: "PUT", body, headers },
    cache: "no-cache",
  });
}
