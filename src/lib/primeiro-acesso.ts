/**
 * Primeiro acesso com senha provisória: enquanto o usuário não troca a senha,
 * a API responde 403 PASSWORD_CHANGE_REQUIRED nas rotas autenticadas.
 */
export const PASSWORD_CHANGE_REQUIRED = "PASSWORD_CHANGE_REQUIRED";

const PRIMEIRO_ACESSO_PATH = "/primeiro-acesso";

function isLocalhost(host: string): boolean {
  return host === "localhost" || host === "127.0.0.1";
}

/** URL da página de troca de senha (no subdomínio auth em produção) */
export function getPrimeiroAcessoUrl(): string {
  if (typeof window === "undefined") return `/auth${PRIMEIRO_ACESSO_PATH}`;

  const { hostname, protocol, port } = window.location;
  if (isLocalhost(hostname)) return `/auth${PRIMEIRO_ACESSO_PATH}`;

  const baseDomain = hostname.replace(/^(app|auth|academia)\./, "");
  const portSuffix = port ? `:${port}` : "";
  return `${protocol}//auth.${baseDomain}${portSuffix}${PRIMEIRO_ACESSO_PATH}`;
}

/** URL do painel após concluir o primeiro acesso */
export function getDashboardUrl(): string {
  if (typeof window === "undefined") return "/";

  const { hostname, protocol, port } = window.location;
  if (isLocalhost(hostname)) return "/dashboard";

  const baseDomain = hostname.replace(/^(app|auth|academia)\./, "");
  const portSuffix = port ? `:${port}` : "";
  return `${protocol}//app.${baseDomain}${portSuffix}/`;
}

export function isOnPrimeiroAcessoPage(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.pathname
    .replace(/\/+$/, "")
    .endsWith(PRIMEIRO_ACESSO_PATH);
}

/** Redireciona para a troca de senha (sem loop se já estiver na página) */
export function redirectToPrimeiroAcesso(): void {
  if (typeof window === "undefined" || isOnPrimeiroAcessoPage()) return;
  window.location.href = getPrimeiroAcessoUrl();
}
