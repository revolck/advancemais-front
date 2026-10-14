/**
 * Cookies de sessão compartilhados entre app. e auth. (domínio .advancemais.com).
 * Centraliza leitura/limpeza para não sobrar papel de uma conta anterior.
 */

/** Domínio compartilhado (ex.: .advancemais.com); em localhost usa o próprio host */
export function dominioDosCookies(): string | null {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return host;
  return `.${host.replace(/^app\./, "").replace(/^auth\./, "")}`;
}

export function lerCookie(nome: string): string | null {
  if (typeof document === "undefined") return null;
  const linha = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${nome}=`));
  if (!linha) return null;
  const valor = linha.slice(nome.length + 1);
  try {
    return decodeURIComponent(valor);
  } catch {
    return valor;
  }
}

/** Apaga o cookie no domínio compartilhado e a cópia "só deste host" (versões antigas) */
export function apagarCookie(nome: string): void {
  if (typeof document === "undefined") return;
  const dominio = dominioDosCookies();
  document.cookie = `${nome}=; path=/; max-age=0`;
  if (dominio) document.cookie = `${nome}=; path=/; domain=${dominio}; max-age=0`;
}

/** Sai da conta: token, refresh e papel (o papel antes ficava para a próxima conta) */
export function limparCookiesDeSessao(): void {
  ["token", "refresh_token", "user_role"].forEach(apagarCookie);
}

/** Grava o papel no domínio compartilhado, removendo cópias antigas que confundiam a leitura */
export function gravarPapel(papel: string, maxAgeSegundos?: number): void {
  if (typeof document === "undefined") return;
  const dominio = dominioDosCookies();
  document.cookie = "user_role=; path=/; max-age=0";
  const maxAge = maxAgeSegundos ? `; max-age=${maxAgeSegundos}` : "";
  document.cookie = `user_role=${papel}; path=/${dominio ? `; domain=${dominio}` : ""}${maxAge}`;
  window.dispatchEvent(new Event("role-updated"));
}

/** Id da conta dentro do JWT (payload.id/sub); sem token, null */
export function contaDoToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    ) as { id?: string; sub?: string; userId?: string };
    return json.id ?? json.sub ?? json.userId ?? token;
  } catch {
    return token;
  }
}
