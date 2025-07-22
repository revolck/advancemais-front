import { env } from "./env";

/**
 * Configurações centralizadas para APIs
 */
export const apiConfig = {
  baseURL: env.API_BASE_URL,
  timeout: 10000, // 10 segundos
  retries: 3,

  // Headers padrão para todas as requisições
  defaultHeaders: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },

  // Configurações de cache para Next.js
  cache: {
    default: { revalidate: 3600 }, // 1 hora
    short: { revalidate: 300 }, // 5 minutos
    long: { revalidate: 86400 }, // 24 horas
    none: { revalidate: 0 }, // Sem cache
  },
} as const;

/**
 * Helper para construir URLs completas da API
 */
export function buildApiUrl(endpoint: string): string {
  // Remove barras duplicadas
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  const cleanBaseUrl = apiConfig.baseURL.endsWith("/")
    ? apiConfig.baseURL.slice(0, -1)
    : apiConfig.baseURL;

  return `${cleanBaseUrl}/${cleanEndpoint}`;
}

/**
 * Helper para log de requisições em desenvolvimento
 */
export function logApiRequest(url: string, method: string = "GET"): void {
  if (env.IS_DEVELOPMENT) {
    console.log(`🌐 API Request: ${method} ${url}`);
  }
}
