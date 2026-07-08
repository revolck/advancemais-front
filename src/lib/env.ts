/**
 * Configuração de Environment Variables
 * Centralizada, tipada e com fallbacks seguros
 */

type Environment = "development" | "production" | "test";
const NODE_ENV: Environment =
  (process.env.NODE_ENV as Environment) || "development";

export type ApiFallback = "loading" | "skeleton" | "mock";

interface AppConfig {
  // API
  readonly apiBaseUrl: string;
  readonly apiVersion: string;
  readonly baseUrl: string;
  readonly apiFallback: ApiFallback;

  // App Info
  readonly appName: string;
  readonly supportPhone: string;

  // Mercado Pago
  readonly mercadoPagoPublicKey: string;

  // Environment
  readonly nodeEnv: Environment;
  readonly isDevelopment: boolean;
  readonly isProduction: boolean;
  readonly isTest: boolean;
}

interface ServerEnv {
  readonly blobToken: string;
}

/**
 * Helper para obter variável de ambiente com fallback.
 * Utiliza acesso direto às variáveis para garantir que o Next.js
 * inclua os valores no bundle do cliente.
 */
function getEnvVar(
  value: string | undefined,
  key: string,
  fallback: string = ""
): string {
  if (!value && !fallback) {
    if (NODE_ENV === "production") {
      console.warn(`⚠️  Environment variable ${key} is not defined`);
    }
    return "";
  }

  return value || fallback;
}

/**
 * Configuração da aplicação
 */
export const env: AppConfig = {
  // API Configuration
  // Base da API. Quando vazio, usa o mesmo domínio do front com rewrites.
  apiBaseUrl: getEnvVar(
    process.env.NEXT_PUBLIC_API_BASE_URL,
    "NEXT_PUBLIC_API_BASE_URL",
    NODE_ENV === "development" ? "http://localhost:3000" : ""
  ),
  apiVersion: getEnvVar(
    process.env.NEXT_PUBLIC_API_VERSION,
    "NEXT_PUBLIC_API_VERSION",
    "v1"
  ),
  baseUrl: getEnvVar(
    process.env.NEXT_PUBLIC_BASE_URL,
    "NEXT_PUBLIC_BASE_URL",
    "https://advancemais.com"
  ),
  apiFallback: getEnvVar(
    process.env.NEXT_PUBLIC_API_FALLBACK,
    "NEXT_PUBLIC_API_FALLBACK",
    "loading"
  ) as ApiFallback,

  // App Configuration
  appName: getEnvVar(
    process.env.NEXT_PUBLIC_APP_NAME,
    "NEXT_PUBLIC_APP_NAME",
    "Advance+"
  ),
  supportPhone: getEnvVar(
    process.env.NEXT_PUBLIC_SUPPORT_PHONE,
    "NEXT_PUBLIC_SUPPORT_PHONE",
    "82994360962"
  ),

  // Mercado Pago
  mercadoPagoPublicKey: getEnvVar(
    process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY,
    "NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY",
    "TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  ),

  // Environment
  nodeEnv: NODE_ENV,
  isDevelopment: NODE_ENV === "development",
  isProduction: NODE_ENV === "production",
  isTest: NODE_ENV === "test",
} as const;

export const serverEnv: ServerEnv = {
  blobToken: getEnvVar(
    process.env.BLOB_READ_WRITE_TOKEN,
    "BLOB_READ_WRITE_TOKEN"
  ),
} as const;

/**
 * Validação opcional das variáveis críticas
 * Apenas para produção ou quando explicitamente chamada
 */
export function validateEnv(): void {
  const missing: string[] = [];
  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    missing.push("NEXT_PUBLIC_API_BASE_URL");
  }
  if (!process.env.NEXT_PUBLIC_BASE_URL) {
    missing.push("NEXT_PUBLIC_BASE_URL");
  }
  if (!serverEnv.blobToken) {
    missing.push("BLOB_READ_WRITE_TOKEN");
  }

  if (missing.length > 0 && env.isProduction) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  if (env.isDevelopment) {
    console.log("🌍 Environment loaded:", {
      nodeEnv: env.nodeEnv,
      apiBaseUrl: env.apiBaseUrl,
      apiVersion: env.apiVersion,
      baseUrl: env.baseUrl,
    });
  }
}

/**
 * Configuração específica para APIs
 */
export const apiConfig = {
  baseURL: env.apiBaseUrl,
  timeout: 10000,
  retries: 3,

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },

  // Cache strategies
  cache: {
    short: { next: { revalidate: 300 } }, // 5 min
    medium: { next: { revalidate: 3600 } }, // 1 hour
    long: { next: { revalidate: 86400 } }, // 24 hours
    none: { next: { revalidate: 0 } }, // No cache
  },
} as const;

/**
 * Helper para construir URLs da API
 */
export function buildApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;

  if (typeof window !== "undefined" && cleanEndpoint.startsWith("api/")) {
    return `/${cleanEndpoint}`;
  }

  const cleanBaseUrl = env.apiBaseUrl.endsWith("/")
    ? env.apiBaseUrl.slice(0, -1)
    : env.apiBaseUrl;

  // Avoid double /api when base already includes "/api" and the endpoint also starts with "api/"
  // Example: base = https://api.domain.com/api and endpoint = /api/v1/empresas -> https://api.domain.com/api/v1/empresas
  if (cleanBaseUrl.endsWith("/api") && cleanEndpoint.startsWith("api/")) {
    return `${cleanBaseUrl}/${cleanEndpoint.slice(4)}`; // remove leading "api/" from endpoint
  }

  return `${cleanBaseUrl}/${cleanEndpoint}`;
}
