export function logoutUser(): void {
  if (typeof window === "undefined") return;

  const host = window.location.hostname;
  const isLocalhost = host === "localhost" || host === "127.0.0.1";
  const baseDomain = host.replace(/^app\./, "").replace(/^auth\./, "");
  const domain = isLocalhost ? host : `.${baseDomain}`;

  document.cookie = `token=; path=/; domain=${domain}; max-age=0`;
  document.cookie = `refresh_token=; path=/; domain=${domain}; max-age=0`;

  const protocol = window.location.protocol;
  const port = window.location.port ? `:${window.location.port}` : "";
  window.location.href = isLocalhost
    ? "/auth/login"
    : `${protocol}//auth.${baseDomain}${port}/login`;
}
