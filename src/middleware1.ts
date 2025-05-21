import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";

  // Identificar o tipo de subdomínio
  const isAuthSubdomain = host.startsWith("auth.");
  const isAppSubdomain = host.startsWith("app.");

  // Configura uma resposta inicial com cabeçalhos CORS
  const response = NextResponse.next();

  // Adiciona cabeçalhos CORS para permitir compartilhamento de recursos
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // === DOMÍNIO PRINCIPAL ===
  if (!isAuthSubdomain && !isAppSubdomain && pathname === "/") {
    return NextResponse.redirect(new URL("http://auth." + host));
  }

  // === SUBDOMÍNIO AUTH ===
  if (isAuthSubdomain) {
    // Apenas reescreva para auth/login se estiver na raiz do subdomínio auth
    if (pathname === "/" || pathname === "") {
      const rewriteResponse = NextResponse.rewrite(
        new URL("/auth/login", request.url)
      );

      // Copiar os cabeçalhos CORS para a resposta de reescrita
      rewriteResponse.headers.set("Access-Control-Allow-Origin", "*");
      rewriteResponse.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      rewriteResponse.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
      return rewriteResponse;
    }

    // Para qualquer outro caminho no auth subdomain, apenas passar adiante
    return response;
  }

  // === SUBDOMÍNIO APP ===
  if (isAppSubdomain) {
    // Raiz do app -> dashboard/overview
    if (pathname === "/") {
      const rewriteResponse = NextResponse.rewrite(
        new URL("/dashboard/overview", request.url)
      );
      // Copiar os cabeçalhos CORS
      rewriteResponse.headers.set("Access-Control-Allow-Origin", "*");
      rewriteResponse.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      rewriteResponse.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
      return rewriteResponse;
    }

    // Mapear rotas simplificadas para as rotas do dashboard
    const dashboardRoutes = [
      "overview",
      "users",
      "settings",
      "beneficiaries",
      "projects",
    ];

    const pathSegment = pathname.split("/")[1];

    if (pathSegment && dashboardRoutes.includes(pathSegment)) {
      const rewriteResponse = NextResponse.rewrite(
        new URL(`/dashboard/${pathSegment}`, request.url)
      );
      // Copiar os cabeçalhos CORS
      rewriteResponse.headers.set("Access-Control-Allow-Origin", "*");
      rewriteResponse.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      rewriteResponse.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
      return rewriteResponse;
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Capturar todas as rotas que precisamos processar
    "/",
    "/:path*",
  ],
};
