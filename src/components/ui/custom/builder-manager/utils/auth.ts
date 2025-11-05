import { apiConfig } from "@/lib/env";

/**
 * Constrói headers de autenticação para requisições API
 */
export function buildAuthHeaders(): Record<string, string> {
  if (typeof document === "undefined") {
    return { Accept: apiConfig.headers.Accept } as any;
  }

  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  return token
    ? { Accept: apiConfig.headers.Accept, Authorization: `Bearer ${token}` }
    : { Accept: apiConfig.headers.Accept };
}
