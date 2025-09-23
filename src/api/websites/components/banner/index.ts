/**
 * API Client para componente Banners
 * Busca dados do componente Banners do website
 */

import { apiFetch } from "@/api/client";
import routes, { websiteRoutes } from "@/api/routes";
import { authHeaders, authJsonHeaders, publicHeaders } from "@/api/shared";
import { apiConfig, env } from "@/lib/env";
import { bannerMockData } from "./mock";
import type { BannerBackendResponse, CreateBannerPayload, UpdateBannerPayload, BannerStatus } from "./types";
import type { BannerItem } from "@/theme/website/components/banners/types";

function mapBannerResponse(data: BannerBackendResponse[]): BannerItem[] {
  return data
    .filter((item) => (typeof item.status === "boolean" ? item.status : String(item.status).toUpperCase() === "PUBLICADO"))
    .sort((a, b) => a.ordem - b.ordem)
    .map((item) => ({
      id: item.id,
      imagemUrl: item.imagemUrl,
      linkUrl: item.link ?? "#",
      position: item.ordem,
      alt: item.imagemTitulo,
    }));
}

export async function getBannerData(): Promise<BannerItem[]> {
  try {
    const raw = await apiFetch<BannerBackendResponse[]>(
      routes.website.banner.list(),
      {
        init: { headers: publicHeaders(), ...apiConfig.cache.medium },
      }
    );

    const data = mapBannerResponse(raw);
    console.log("✅ Banner data loaded:", data);
    return data;
  } catch (error) {
    console.error("❌ Erro ao buscar dados dos Banners:", error);
    if (env.apiFallback === "mock") {
      return bannerMockData;
    }
    throw new Error("Falha ao carregar dados dos Banners");
  }
}

export async function getBannerDataClient(): Promise<BannerItem[]> {
  const endpoint = routes.website.banner.list();

  try {
    const raw = await apiFetch<BannerBackendResponse[]>(endpoint, {
      init: { headers: publicHeaders() },
      cache: "short",
    });

    const data = mapBannerResponse(raw);
    console.log("✅ Banner data loaded (client):", data);
    return data;
  } catch (error) {
    console.error("❌ Erro ao buscar dados dos Banners (client):", error);

    if (env.apiFallback === "mock") {
      return bannerMockData;
    }

    throw new Error("Falha ao carregar dados dos Banners");
  }
}

// ----- CRUD para Banners (admin) -----

export async function listBanners(init?: RequestInit): Promise<BannerBackendResponse[]> {
  return apiFetch<BannerBackendResponse[]>(websiteRoutes.banner.list(), {
    init: init ?? { headers: publicHeaders() },
    cache: "no-cache",
  });
}

export async function getBannerById(orderId: string): Promise<BannerBackendResponse> {
  // API de consulta usa ID da ordem
  return apiFetch<BannerBackendResponse>(websiteRoutes.banner.get(orderId), {
    init: { headers: publicHeaders() },
  });
}

function buildRequest(
  data: CreateBannerPayload | UpdateBannerPayload
): { body: BodyInit; headers: Record<string, string> } {
  const form = new FormData();
  if (data.link !== undefined) form.append("link", String(data.link));
  if (data.status !== undefined) {
    const statusValue: BannerStatus =
      typeof data.status === "boolean"
        ? data.status
          ? "PUBLICADO"
          : "RASCUNHO"
        : (String(data.status).toUpperCase() as BannerStatus);
    form.append("status", statusValue);
  }
  if (data.ordem !== undefined) form.append("ordem", String(data.ordem));
  if (data.imagem) form.append("imagem", data.imagem);
  if (data.imagemUrl) form.append("imagemUrl", data.imagemUrl);
  if (data.imagemTitulo) form.append("imagemTitulo", data.imagemTitulo);

  return { body: form, headers: authHeaders() };
}

export async function createBanner(data: CreateBannerPayload): Promise<BannerBackendResponse> {
  const { body, headers } = buildRequest(data);
  return apiFetch<BannerBackendResponse>(websiteRoutes.banner.create(), {
    init: { method: "POST", body, headers },
    cache: "no-cache",
  });
}

export async function updateBanner(id: string, data: UpdateBannerPayload): Promise<BannerBackendResponse> {
  const { body, headers } = buildRequest(data);
  // API de update usa ID do banner (bannerId)
  return apiFetch<BannerBackendResponse>(websiteRoutes.banner.update(id), {
    init: { method: "PUT", body, headers },
    cache: "no-cache",
  });
}

export async function updateBannerStatus(id: string, status: boolean | string): Promise<BannerBackendResponse> {
  const statusValue: BannerStatus =
    typeof status === "boolean" ? (status ? "PUBLICADO" : "RASCUNHO") : (String(status).toUpperCase() as BannerStatus);
  const { body, headers } = buildRequest({ status: statusValue });
  return apiFetch<BannerBackendResponse>(websiteRoutes.banner.update(id), {
    init: { method: "PUT", body, headers },
    cache: "no-cache",
  });
}

export async function deleteBanner(id: string): Promise<void> {
  // API de deletar usa ID do banner (bannerId)
  await apiFetch<void>(websiteRoutes.banner.delete(id), {
    init: { method: "DELETE", headers: authHeaders() },
    cache: "no-cache",
  });
}

export async function updateBannerOrder(orderId: string, ordem: number): Promise<void> {
  const jsonHeaders = authJsonHeaders();

  const url = websiteRoutes.banner.reorder(orderId);
  const payload = { ordem: Number(ordem) };
  try {
    if (env.isDevelopment) {
      console.log("🔁 Banner Reorder (JSON)", { url, ordem: Number(ordem), orderId });
    }
    await apiFetch<BannerBackendResponse>(url, {
      init: { method: "PUT", body: JSON.stringify(payload), headers: jsonHeaders },
      cache: "no-cache",
    });
    return;
  } catch (e) {
    if (env.isDevelopment) {
      console.warn("⚠️ Banner Reorder (JSON) failed", {
        orderId,
        ordem,
        error: (e as any)?.message || String(e),
        status: (e as any)?.status,
      });
    }
    // Fallback via FormData
    try {
      if (env.isDevelopment) {
        console.log("🔁 Banner Reorder (FormData)", { url, ordem: String(ordem), orderId });
      }
      const form = new FormData();
      form.append("ordem", String(ordem));
      const headers = authHeaders();
      await apiFetch<BannerBackendResponse>(url, {
        init: { method: "PUT", body: form, headers },
        cache: "no-cache",
      });
      return;
    } catch (_) {
      // Fallback 2: via update geral requerendo bannerId — mapeia a partir da lista
      const list = await apiFetch<BannerBackendResponse[]>(websiteRoutes.banner.list(), {
        init: { headers: publicHeaders() },
        cache: "no-cache",
      });
      const found = (list || []).find((item) => item.id === orderId);
      const bannerId = found?.bannerId;
      if (!bannerId) throw _;
      const { body, headers } = buildRequest({ ordem: Number(ordem) });
      await apiFetch<BannerBackendResponse>(websiteRoutes.banner.update(bannerId), {
        init: { method: "PUT", body, headers },
        cache: "no-cache",
      });
      return;
    }
  }
}
