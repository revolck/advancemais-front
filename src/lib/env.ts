/**
 * Configuração centralizada das variáveis de ambiente
 * Garante type safety e validação das env vars
 */

interface EnvConfig {
  API_BASE_URL: string;
  NODE_ENV: string;
  IS_DEVELOPMENT: boolean;
  IS_PRODUCTION: boolean;
  SUPPORTE_PHONE: string;
}

function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key] || fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

/**
 * Configurações de ambiente validadas e tipadas
 */
export const env: EnvConfig = {
  API_BASE_URL: getEnvVar("NEXT_PUBLIC_API_BASE_URL"),
  NODE_ENV: getEnvVar("NODE_ENV", "development"),
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  SUPPORTE_PHONE: getEnvVar("NEXT_PUBLIC_SUPPORTE_PHONE"),
} as const;

/**
 * Validação das variáveis de ambiente na inicialização
 */
export function validateEnvVars(): void {
  try {
    // Testa se todas as env vars necessárias estão presentes
    const requiredVars = ["NEXT_PUBLIC_API_BASE_URL"];

    requiredVars.forEach((varName) => {
      if (!process.env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
      }
    });

    // Validação adicional da URL da API
    try {
      new URL(env.API_BASE_URL);
    } catch {
      throw new Error(`Invalid API_BASE_URL: ${env.API_BASE_URL}`);
    }

    console.log("✅ Environment variables validated successfully");
  } catch (error) {
    console.error("❌ Environment validation failed:", error);
    throw error;
  }
}
