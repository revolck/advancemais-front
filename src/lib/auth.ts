import { limparCookiesDeSessao } from "@/lib/auth-cookies";

export function logoutUser(): void {
  if (typeof window === "undefined") return;

  const host = window.location.hostname;
  const isLocalhost = host === "localhost" || host === "127.0.0.1";
  const baseDomain = host.replace(/^app\./, "").replace(/^auth\./, "");

  // Inclui o papel (user_role): antes ele sobrava para a próxima conta no mesmo navegador
  limparCookiesDeSessao();

  const protocol = window.location.protocol;
  const port = window.location.port ? `:${window.location.port}` : "";
  window.location.href = isLocalhost
    ? "/auth/login"
    : `${protocol}//auth.${baseDomain}${port}/login`;
}
