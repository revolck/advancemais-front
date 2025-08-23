// src/app/dashboard/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@/config/roles";
import { canAccessRoute } from "@/config/dashboardRoutes";

export function dashboardMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";

  // Extrai hostname e porta
  const [hostname, port] = host.split(":");
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
  const baseDomain = hostname
    .replace(/^www\./, "")
    .replace(/^app\./, "")
    .replace(/^auth\./, "");

  // Garante que o dashboard seja acessado via subdomínio app.
  const isAppSubdomain = hostname.startsWith("app.");
  if (!isAppSubdomain && !isLocalhost) {
    const url = request.nextUrl.clone();
    url.hostname = `app.${baseDomain}`;
    if (port) url.port = port;
    return NextResponse.redirect(url);
  }

  // Verifica autenticação básica através de cookies
  const isAuthenticated =
    request.cookies.has("token") || request.cookies.has("refresh_token");

  if (!isAuthenticated && !isLocalhost) {
    const authUrl = request.nextUrl.clone();
    authUrl.hostname = `auth.${baseDomain}`;
    authUrl.pathname = "/login";
    if (port) authUrl.port = port;
    return NextResponse.redirect(authUrl);
  }

  // Se estamos na raiz do app, redirecionar para visão geral
  if (pathname === "/") {
    return NextResponse.rewrite(new URL("/admin/overview", request.url));
  }

  // Verificação de acesso baseado em função
  const userRole =
    (request.cookies.get("user_role")?.value as UserRole) ||
    UserRole.ALUNO_CANDIDATO;

  if (!canAccessRoute(pathname, userRole)) {
    const url = new URL("/?denied=1", request.url);
    return NextResponse.redirect(url);
  }

  // Configurações de desenvolvimento
  if (process.env.NODE_ENV === "development") {
    const response = NextResponse.next();

    if (!request.cookies.has("tenant_id")) {
      response.cookies.set("tenant_id", "development-tenant", {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      response.cookies.set("tenant_name", "Empresa Demonstração", {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    if (!request.cookies.has("user_role")) {
      response.cookies.set("user_role", UserRole.ADMIN, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Específico para o subdomínio app
    "/",
    "/:path*",
  ],
};
