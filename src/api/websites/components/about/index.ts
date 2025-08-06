/**
 * API Client para componente About
 * Busca dados do componente About do website
 */

import routes from "@/api/routes";
import { apiFetch } from "@/api/client";
import { apiConfig, env } from "@/lib/env";
import { aboutMockData } from "./mock";
import { AboutApiResponse } from "./types";

/**
 * Busca dados do componente About (Server-side)
 * @returns Promise com os dados do about
 */
export async function getAboutData(): Promise<AboutApiResponse> {
  try {
    const data = await apiFetch<AboutApiResponse>(
      routes.website.home.about(),
      {
        init: { headers: apiConfig.headers, ...apiConfig.cache.medium },
        mockData: aboutMockData,
      },
    );

    if (env.isDevelopment) {
      console.debug("✅ About data loaded:", data);
    }

    return data;
  } catch (error) {
    if (env.isDevelopment) {
      console.warn("❌ Erro ao buscar dados do About:", error);
    }
    throw new Error("Falha ao carregar dados do About");
  }
}

/**
 * Busca dados do componente About (Client-side)
 * Sem cache para dados dinâmicos no cliente
 */
export async function getAboutDataClient(): Promise<AboutApiResponse> {
  try {
    const data = await apiFetch<AboutApiResponse>(
      routes.website.home.about(),
      {
        init: { headers: apiConfig.headers, cache: "no-store" },
        mockData: aboutMockData,
      },
    );

    if (env.isDevelopment) {
      console.debug("✅ About data loaded (client):", data);
    }

    return data;
  } catch (error) {
    if (env.isDevelopment) {
      console.warn("❌ Erro ao buscar dados do About (client):", error);
    }
    throw new Error("Falha ao carregar dados do About");
  }
}
