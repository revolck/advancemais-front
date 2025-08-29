/**
 * API Client para componente Banners
 * Busca dados do componente Banners do website
 */

import routes from "@/api/routes";
import { apiFetch } from "@/api/client";
import { apiConfig, env } from "@/lib/env";
import { bannerMockData } from "./mock";
import type { BannerBackendResponse } from "./types";
import type { BannerItem } from "@/theme/website/components/banners/types";

function mapBannerResponse(data: BannerBackendResponse[]): BannerItem[] {
  return data
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
        init: { headers: apiConfig.headers, ...apiConfig.cache.medium },
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
      init: { headers: apiConfig.headers },
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
