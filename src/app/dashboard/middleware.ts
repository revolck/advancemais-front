// src/app/dashboard/middleware.ts
import { NextRequest, NextResponse } from "next/server";

// Lista de módulos disponíveis
const SYSTEM_MODULES = [
  "overview",
  "beneficiaries",
  "projects",
  "users",
  "settings",
];

// Matriz de permissões por função
const ROLE_PERMISSIONS = {
  admin: [...SYSTEM_MODULES],
  manager: ["overview", "beneficiaries", "projects"],
  operator: ["beneficiaries", "projects"],
  viewer: ["overview"],
};

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

  // Se estamos na raiz do app, redirecionar para analytics
  if (pathname === "/") {
    return NextResponse.rewrite(new URL("/dashboard/overview", request.url));
  }

  // Extrair o módulo solicitado da URL
  let requestedModule = pathname.split("/")[1];

  // Verificar se temos um módulo válido
  if (requestedModule && SYSTEM_MODULES.includes(requestedModule)) {
    // Verificação de acesso baseado em função
    const userRole = request.cookies.get("dev_role")?.value || "viewer";
    const allowedModules =
      ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || [];

    // Se não tem permissão para o módulo
    if (!allowedModules.includes(requestedModule)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Remapear para o caminho correto no dashboard
    return NextResponse.rewrite(
      new URL(`/dashboard/${requestedModule}`, request.url)
    );
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

    if (!request.cookies.has("dev_role")) {
      response.cookies.set("dev_role", "admin", {
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
