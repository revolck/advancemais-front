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

function mapSlideResponse(data: SlideBackendResponse[], orientation: "DESKTOP" | "MOBILE" = "DESKTOP"): SlideData[] {
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

export async function getSliderData(orientation: "DESKTOP" | "MOBILE" = "DESKTOP"): Promise<SlideData[]> {
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

export async function getSliderDataClient(orientation: "DESKTOP" | "MOBILE" = "DESKTOP"): Promise<SlideData[]> {
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
