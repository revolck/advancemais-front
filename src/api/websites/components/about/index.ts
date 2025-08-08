/**
 * API Client para componente About
 * Busca dados do componente About do website
 */

import routes from "@/api/routes";
import { apiFetch } from "@/api/client";
import { apiConfig, env } from "@/lib/env";
import { aboutMockData } from "./mock";
import { AboutApiResponse, AboutBackendResponse } from "./types";

function mapAboutResponse(data: AboutBackendResponse[]): AboutApiResponse {
  const first = data[0];
  return {
    src: first?.imagemUrl ?? "",
    title: first?.titulo ?? "",
    description: first?.descricao ?? "",
  };
}

/**
 * Busca dados do componente About (Server-side)
 * @returns Promise com os dados do about
 */
export async function getAboutData(): Promise<AboutApiResponse> {
  try {
    const raw = await apiFetch<AboutBackendResponse[]>(
      routes.website.home.about(),
      {
        init: { headers: apiConfig.headers, ...apiConfig.cache.medium },
      },
    );

    const data = mapAboutResponse(raw);
    console.log("✅ About data loaded:", data);
    return data;
  } catch (error) {
    console.error("❌ Erro ao buscar dados do About:", error);
    if (env.apiFallback === "mock") {
      return aboutMockData;
    }
    throw new Error("Falha ao carregar dados do About");
  }
}

/**
 * Busca dados do componente About (Client-side)
 * Usa o cliente API com cache e suporte a mock
 */
export async function getAboutDataClient(): Promise<AboutApiResponse> {
  const endpoint = routes.website.home.about();

  try {
    const raw = await apiFetch<AboutBackendResponse[]>(endpoint, {
      init: { headers: apiConfig.headers },
      cache: "short",
    });

    const data = mapAboutResponse(raw);
    console.log("✅ About data loaded (client):", data);
    return data;
  } catch (error) {
    console.error("❌ Erro ao buscar dados do About (client):", error);

    if (env.apiFallback === "mock") {
      return aboutMockData;
    }

    throw new Error("Falha ao carregar dados do About");
  }
}
