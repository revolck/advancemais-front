import { apiConfig, buildApiUrl, logApiRequest } from "@/lib/api-config";
import { AboutApiResponse } from "./types";

/**
 * Busca dados do componente About
 * @returns Promise com os dados do about
 */
export async function getAboutData(): Promise<AboutApiResponse> {
  const url = buildApiUrl("/website/home/about");

  try {
    logApiRequest(url);

    const response = await fetch(url, {
      method: "GET",
      headers: apiConfig.defaultHeaders,
      next: apiConfig.cache.default, // 1 hora de cache
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AboutApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar dados do About:", error);
    throw new Error("Falha ao carregar dados do About");
  }
}

/**
 * Função para uso no lado do cliente
 */
export async function getAboutDataClient(): Promise<AboutApiResponse> {
  const url = buildApiUrl("/website/home/about");

  try {
    logApiRequest(url, "GET");

    const response = await fetch(url, {
      headers: apiConfig.defaultHeaders,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar dados do About (client):", error);
    throw new Error("Falha ao carregar dados do About");
  }
}
