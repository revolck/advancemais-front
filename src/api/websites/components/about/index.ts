/**
 * API Client para componente About
 * Busca dados do componente About do website
 */

import routes from "@/api/routes";
import { apiConfig, buildApiUrl, env } from "@/lib/env";
import { AboutApiResponse } from "./types";

/**
 * Helper para log de requisições (movido do api-config)
 */
function logApiRequest(url: string, method: string = "GET"): void {
  if (env.isDevelopment) {
    console.log(`🌐 API Request: ${method} ${url}`);
  }
}

/**
 * Busca dados do componente About (Server-side)
 * @returns Promise com os dados do about
 */
export async function getAboutData(): Promise<AboutApiResponse> {
  const url = buildApiUrl(routes.website.home.about());

  try {
    logApiRequest(url);

    const response = await fetch(url, {
      method: "GET",
      headers: apiConfig.headers,
      ...apiConfig.cache.medium, // 1 hora de cache
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AboutApiResponse = await response.json();

    if (env.isDevelopment) {
      console.log("✅ About data loaded:", data);
    }

    return data;
  } catch (error) {
    console.error("❌ Erro ao buscar dados do About:", error);
    throw new Error("Falha ao carregar dados do About");
  }
}

/**
 * Busca dados do componente About (Client-side)
 * Sem cache para dados dinâmicos no cliente
 */
export async function getAboutDataClient(): Promise<AboutApiResponse> {
  const url = buildApiUrl(routes.website.home.about());

  try {
    logApiRequest(url, "GET");

    const response = await fetch(url, {
      method: "GET",
      headers: apiConfig.headers,
      // No cache para client-side
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (env.isDevelopment) {
      console.log("✅ About data loaded (client):", data);
    }

    return data;
  } catch (error) {
    console.error("❌ Erro ao buscar dados do About (client):", error);
    throw new Error("Falha ao carregar dados do About");
  }
}
