/**
 * Configuração de Environment Variables
 * Centralizada, tipada e com fallbacks seguros
 */

type Environment = "development" | "production" | "test";

interface AppConfig {
  // API
  readonly apiBaseUrl: string;
  readonly baseUrl: string;

  // App Info
  readonly appName: string;
  readonly supportPhone: string;

  // Environment
  readonly nodeEnv: Environment;
  readonly isDevelopment: boolean;
  readonly isProduction: boolean;
  readonly isTest: boolean;
}

/**
 * Helper para obter variável de ambiente com fallback
 */
function getEnvVar(key: string, fallback: string = ""): string {
  const value = process.env[key];

  if (!value && !fallback) {
    console.warn(`⚠️  Environment variable ${key} is not defined`);
    return "";
  }

  return value || fallback;
}

/**
 * Configuração da aplicação
 */
export const env: AppConfig = {
  // API Configuration
  apiBaseUrl: getEnvVar(
    "NEXT_PUBLIC_API_BASE_URL",
    "https://api.advancemais.com.br"
  ),
  baseUrl: getEnvVar("NEXT_PUBLIC_BASE_URL", "https://advancemais.com.br"),

  // App Configuration
  appName: getEnvVar("NEXT_PUBLIC_APP_NAME", "AdvanceMais"),
  supportPhone: getEnvVar("NEXT_PUBLIC_SUPPORT_PHONE", "82994360962"),

  // Environment
  nodeEnv: (process.env.NODE_ENV as Environment) || "development",
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
} as const;

/**
 * Validação opcional das variáveis críticas
 * Apenas para produção ou quando explicitamente chamada
 */
export function validateEnv(): void {
  const requiredVars = ["NEXT_PUBLIC_API_BASE_URL", "NEXT_PUBLIC_BASE_URL"];

  const missing = requiredVars.filter((key) => !process.env[key]);

  if (missing.length > 0 && env.isProduction) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  if (env.isDevelopment) {
    console.log("🌍 Environment loaded:", {
      nodeEnv: env.nodeEnv,
      apiBaseUrl: env.apiBaseUrl,
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
  const cleanBaseUrl = env.apiBaseUrl.endsWith("/")
    ? env.apiBaseUrl.slice(0, -1)
    : env.apiBaseUrl;

  return `${cleanBaseUrl}/${cleanEndpoint}`;
}
