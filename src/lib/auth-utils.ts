/**
 * Utilitários de autenticação
 */

/**
 * Lê o token do browser (cookie)
 */
function readBrowserToken(): string | null {
  if (typeof window === "undefined") return null;

  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  return cookie || null;
}

/**
 * Constrói headers de autenticação com token JWT
 */
export function buildAuthHeaders(token?: string): Record<string, string> {
  const resolvedToken = token ?? readBrowserToken();

  if (!resolvedToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${resolvedToken}`,
  };
}
