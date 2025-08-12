// src/app/auth/middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";

  // Extrai hostname e porta
  const [hostname, port] = host.split(":");
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
  const baseDomain = hostname
    .replace(/^app\./, "")
    .replace(/^auth\./, "");

  // Garante que as rotas de autenticação utilizem o subdomínio auth.
  const isAuthSubdomain = hostname.startsWith("auth.");
  if (!isAuthSubdomain && !isLocalhost) {
    const url = request.nextUrl.clone();
    url.hostname = `auth.${baseDomain}`;
    if (port) url.port = port;
    return NextResponse.redirect(url);
  }

  // Se o usuário já estiver autenticado, redirecionar para o dashboard
  const isAuthenticated =
    request.cookies.has("token") || request.cookies.has("refresh_token");

  if (isAuthenticated && !isLocalhost) {
    const appUrl = request.nextUrl.clone();
    appUrl.hostname = `app.${baseDomain}`;
    appUrl.pathname = "/";
    if (port) appUrl.port = port;
    return NextResponse.redirect(appUrl);
  }

  // Não redirecionamos mais /auth/login para a raiz, permitindo renderização normal
  if (pathname.startsWith("/auth/") && pathname !== "/auth/login") {
    // Aqui você pode adicionar lógica específica para outras rotas de autenticação
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Específico para o subdomínio auth
    "/auth/:path*",
  ],
};
