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
  SliderStatus,
} from "./types";
import type { SlideData } from "@/theme/website/components/slider/types";

// Helpers para lidar com variações de valores vindos do backend
function normalizeOrientation(value: string | undefined): "DESKTOP" | "TABLET_MOBILE" | undefined {
  if (!value) return undefined;
  const v = String(value).toUpperCase().replace(/\s+/g, "_");
  if (v.includes("DESKTOP")) return "DESKTOP";
  if (v.includes("MOBILE") || v.includes("TABLET")) return "TABLET_MOBILE";
  return undefined;
}

function isPublished(status: string | boolean | undefined): boolean {
  if (typeof status === "boolean") return status;
  if (!status) return false;
  const s = String(status).toUpperCase();
  return s === "PUBLICADO" || s === "PUBLISHED" || s === "PUBLIC";
}

function mapSlideResponse(
  data: SlideBackendResponse[],
  orientation: SliderOrientation = "DESKTOP"
): SlideData[] {
  const target = normalizeOrientation(orientation);
  return data
    .filter((item) => isPublished(item.status) && normalizeOrientation(item.orientacao as string) === target)
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
  // Admin views must bypass in-memory cache to avoid stale ordering
  return apiFetch<SlideBackendResponse[]>(websiteRoutes.slider.list(), {
    init: init ?? { headers: apiConfig.headers },
    cache: "no-cache",
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

/**
 * Atualiza apenas o status do slider
 * API original aceita boolean ou string ("PUBLICADO" | "RASCUNHO")
 * Alguns ambientes retornavam erro 500 ao enviar JSON puro, portanto
 * enviamos os dados via `FormData` como nas demais operações.
 */
export async function updateSliderStatus(
  id: string,
  status: boolean | string,
  orientacao?: SliderOrientation
): Promise<SlideBackendResponse> {
  const statusValue: SliderStatus =
    typeof status === "boolean"
      ? status
        ? "PUBLICADO"
        : "RASCUNHO"
      : (status.toUpperCase() as SliderStatus);

  const { body, headers } = buildRequest({ status: statusValue, orientacao });

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

export async function updateSliderOrder(id: string, ordem: number): Promise<void> {
  const jsonHeaders = {
    Accept: apiConfig.headers.Accept,
    "Content-Type": "application/json",
    ...getAuthHeader(),
  } as Record<string, string>;

  const url = websiteRoutes.slider.reorder(id);
  const payload = { ordem: Number(ordem) };

  try {
    if (env.isDevelopment) {
      console.log("🔁 Reorder (JSON)", { url, ordem: Number(ordem), orderId: id });
    }
    await apiFetch<SlideBackendResponse>(url, {
      init: { method: "PUT", body: JSON.stringify(payload), headers: jsonHeaders },
      cache: "no-cache",
    });
    return;
  } catch (e) {
    if (env.isDevelopment) {
      console.warn("⚠️ Reorder (JSON) failed", {
        orderId: id,
        ordem,
        error: (e as any)?.message || String(e),
        status: (e as any)?.status,
      });
    }
    // Fallback 1: alguns ambientes podem não estar com JSON parser nesta rota
    try {
      if (env.isDevelopment) {
        console.log("🔁 Reorder (FormData)", { url, ordem: String(ordem), orderId: id });
      }
      const form = new FormData();
      form.append("ordem", String(ordem));
      const headers = { Accept: apiConfig.headers.Accept, ...getAuthHeader() } as Record<string, string>;
      await apiFetch<SlideBackendResponse>(url, {
        init: { method: "PUT", body: form, headers },
        cache: "no-cache",
      });
      return;
    } catch (_) {
      if (env.isDevelopment) {
        console.warn("⚠️ Reorder (FormData) failed, trying generic update", {
          orderId: id,
          ordem,
        });
      }
      // Fallback 2: como último recurso, faz update geral pelo sliderId
      // 1) Busca lista para mapear orderId -> sliderId e orientacao
      const list = await apiFetch<SlideBackendResponse[]>(websiteRoutes.slider.list(), {
        init: { headers: apiConfig.headers },
        cache: "no-cache",
      });
      const found = (list || []).find((item) => item.id === id);
      const sliderId = found?.sliderId;
      const orientacao = (found?.orientacao as SliderOrientation) || undefined;
      if (env.isDevelopment) {
        console.log("🧭 Reorder mapping", {
          orderId: id,
          resolvedSliderId: sliderId,
          orientacao,
          found,
        });
      }
      if (!sliderId) throw e;

      // 2) Usa o endpoint de update geral com FormData (mesmo formato do toggle)
      const { body, headers } = buildRequest({ ordem: Number(ordem), orientacao });
      if (env.isDevelopment) {
        console.log("🔁 Reorder via generic update", {
          endpoint: websiteRoutes.slider.update(sliderId),
          ordem: Number(ordem),
          sliderId,
          orientacao,
        });
      }
      await apiFetch<SlideBackendResponse>(websiteRoutes.slider.update(sliderId), {
        init: { method: "PUT", body, headers },
        cache: "no-cache",
      });
      return;
    }
  }
}
