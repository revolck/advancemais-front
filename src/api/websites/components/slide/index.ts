/**
 * API Client para componente Slider
 * Busca dados do componente Slider do website
 */

import routes from "@/api/routes";
import { apiFetch } from "@/api/client";
import { apiConfig, env } from "@/lib/env";
import { sliderMockData } from "./mock";
import type { SlideBackendResponse } from "./types";
import type { SlideData } from "@/theme/website/components/slider/types";

function mapSlideResponse(data: SlideBackendResponse[]): SlideData[] {
  return data
    .sort((a, b) => a.ordem - b.ordem)
    .map((item) => ({
      id: item.ordem,
      image: item.imagemUrl,
      alt: item.imagemTitulo,
      link: item.link,
      overlay: false,
    }));
}

export async function getSliderData(): Promise<SlideData[]> {
  try {
    const raw = await apiFetch<SlideBackendResponse[]>(
      routes.website.home.slide(),
      {
        init: { headers: apiConfig.headers, ...apiConfig.cache.medium },
      },
    );

    const data = mapSlideResponse(raw);
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

export async function getSliderDataClient(): Promise<SlideData[]> {
  const endpoint = routes.website.home.slide();

  try {
    const raw = await apiFetch<SlideBackendResponse[]>(endpoint, {
      init: { headers: apiConfig.headers },
      cache: "short",
    });

    const data = mapSlideResponse(raw);
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
