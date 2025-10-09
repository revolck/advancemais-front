// src/app/dashboard/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@/config/roles";
import { canAccessRoute } from "@/config/dashboardRoutes";
import { composeDashboardLoginUrl } from "@/lib/auth/server";

export function dashboardMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostHeader = request.headers.get("host") || "";
  const protocol = request.nextUrl.protocol || "https:";
  let hostname = "app.advancemais.com";
  let port: string | undefined;

  if (hostHeader) {
    try {
      const url = new URL(`${protocol}//${hostHeader}`);
      hostname = url.hostname || hostname;
      port = url.port || undefined;
    } catch {
      const parts = hostHeader.split(":");
      hostname = parts[0] || hostname;
      port = parts[1];
    }
  }
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

  if (!isAuthenticated) {
    const redirectPath = `${pathname}${request.nextUrl.search}`;

    const loginUrl = composeDashboardLoginUrl({
      hostname,
      protocol,
      port,
      redirectPath,
    });

    const response = NextResponse.redirect(loginUrl);

    if (isLocalhost) {
      response.headers.set("location", loginUrl);
    }

    return response;
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
