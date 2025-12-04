import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@/config/roles";

/**
 * Middleware principal da aplicação
 *
 * IMPORTANTE: Este arquivo deve estar em src/middleware.ts para ser reconhecido pelo Next.js
 *
 * Responsável por:
 * - Detectar e rotear entre website e dashboard
 * - Configurar cookies de desenvolvimento
 * - Gerenciar redirects do website
 * - Aplicar configurações globais
 */

// Configurações do sistema
const SYSTEM_CONFIG = {
  // Rotas que pertencem ao dashboard/CMS
  dashboardRoutes: [
    "/dashboard",
    "/analytics",
    "/overview",
    "/beneficiaries",
    "/projects",
    "/users",
    "/settings",
    "/perfil",
  ],

  // Rotas que pertencem ao website
  websiteRoutes: [
    "/",
    "/sobre",
    "/recrutamento",
    "/fale-conosco",
    "/cursos",
    "/solucoes",
    "/plataforma",
    "/suporte",
    "/privacidade",
    "/termos",
    "/cookies",
    "/components",
    "/checkout",
    "/planos",
  ],

  // Rotas de autenticação (neutras)
  authRoutes: ["/auth"],

  // Redirects do website
  websiteRedirects: {
    "/home": "/",
    "/inicio": "/",
    "/quem-somos": "/sobre",
    "/empresa": "/sobre",
    "/fale-conosco": "/contato",
    "/entre-em-contato": "/contato",
    "/politica-privacidade": "/privacidade",
    "/politica-de-privacidade": "/privacidade",
    "/termos-de-uso": "/termos",
    "/termos-servico": "/termos",
    "/ajuda": "/suporte",
    "/help": "/suporte",
    "/planos": "/recrutamento",
  },
};

/**
 * Detecta se a rota pertence ao dashboard
 */
function isDashboardRoute(pathname: string): boolean {
  return SYSTEM_CONFIG.dashboardRoutes.some((route) =>
    pathname.startsWith(route)
  );
}

/**
 * Detecta se a rota pertence ao website
 */
function isWebsiteRoute(pathname: string): boolean {
  // Se for exatamente "/" ou começar com uma rota de website
  if (pathname === "/") return true;

  return SYSTEM_CONFIG.websiteRoutes.some((route) =>
    pathname.startsWith(route)
  );
}

/**
 * Detecta se a rota é de autenticação
 */
function isAuthRoute(pathname: string): boolean {
  return SYSTEM_CONFIG.authRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Verifica se existe um redirect para a rota
 */
function getWebsiteRedirect(pathname: string): string | null {
  const redirects = SYSTEM_CONFIG.websiteRedirects as Record<string, string>;
  return redirects[pathname] || null;
}

/**
 * Configura cookies de desenvolvimento
 */
function setupDevCookies(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  if (process.env.NODE_ENV === "development") {
    // Tenant para desenvolvimento
    const existingTenant = request.cookies.get("tenant_id");
    if (!existingTenant) {
      response.cookies.set("tenant_id", "dev-tenant", {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 dias
      });
      response.cookies.set("tenant_name", "Empresa Demonstração", {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    // Role padrão para desenvolvimento
    // IMPORTANTE: Verifica o cookie no REQUEST primeiro (não no response)
    // Isso preserva o cookie definido pelo login ou manualmente
    const existingRole = request.cookies.get("user_role")?.value;
    const validRoles = Object.values(UserRole);

    if (!existingRole || !validRoles.includes(existingRole as UserRole)) {
      // Só define como ADMIN se não houver cookie válido
      response.cookies.set("user_role", UserRole.ADMIN, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: false,
        sameSite: "lax",
      });
    } else {
      // Preserva o cookie existente (importante para manter o role do login)
      response.cookies.set("user_role", existingRole, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: false,
        sameSite: "lax",
      });
    }
  }

  return response;
}

/**
 * Aplica headers de SEO e cache para o website
 */
function applyWebsiteHeaders(
  response: NextResponse,
  pathname: string
): NextResponse {
  // Headers de segurança
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Headers de cache para páginas estáticas
  const staticPages = ["/", "/sobre", "/privacidade", "/termos"];
  if (staticPages.includes(pathname)) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400"
    );
  }

  // Headers específicos para SEO
  if (pathname === "/") {
    response.headers.set("X-Robots-Tag", "index, follow, max-snippet:-1");
  } else if (["/privacidade", "/termos", "/cookies"].includes(pathname)) {
    response.headers.set("X-Robots-Tag", "noindex, follow");
  } else {
    response.headers.set("X-Robots-Tag", "index, follow");
  }

  // Identificador para analytics
  response.headers.set("X-Page-Type", "website");

  return response;
}

/**
 * Middleware principal
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";
  const [hostname] = host.split(":");
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
  const baseDomain = hostname
    .replace(/^www\./, "")
    .replace(/^app\./, "")
    .replace(/^auth\./, "");

  // Normaliza hosts com prefixo www
  if (hostname.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.hostname = hostname.replace(/^www\./, "");
    return NextResponse.redirect(url);
  }

  // Tratamento inicial para subdomínios específicos
  if (hostname.startsWith("auth.")) {
    const isAuthenticated =
      request.cookies.has("token") || request.cookies.has("refresh_token");

    if (isAuthenticated && (pathname === "/" || pathname === "/login")) {
      const appUrl = request.nextUrl.clone();
      appUrl.hostname = `app.${baseDomain}`;
      appUrl.pathname = "/";
      return NextResponse.redirect(appUrl);
    }

    const url = request.nextUrl.clone();
    if (pathname === "/" || pathname === "") {
      url.pathname = "/auth/login";
      return setupDevCookies(request, NextResponse.rewrite(url));
    }

    if (!pathname.startsWith("/auth/")) {
      url.pathname = `/auth${pathname}`;
      return setupDevCookies(request, NextResponse.rewrite(url));
    }

    return setupDevCookies(request, NextResponse.next());
  }

  // Subdomínio do dashboard (app.)
  // Garante que todas as rotas sejam servidas a partir de /dashboard
  if (hostname.startsWith("app.")) {
    const isAuthenticated =
      request.cookies.has("token") || request.cookies.has("refresh_token");

    if (!isAuthenticated && !isLocalhost) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.hostname = `auth.${baseDomain}`;
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(loginUrl);
    }

    // Rotas que não precisam do prefixo /dashboard
    const routesWithoutDashboardPrefix = ["/perfil"];

    if (
      !pathname.startsWith("/dashboard") &&
      !routesWithoutDashboardPrefix.includes(pathname)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = `/dashboard${pathname === "/" ? "" : pathname}`;
      return setupDevCookies(request, NextResponse.rewrite(url));
    }
    return setupDevCookies(request, NextResponse.next());
  }

  // Log para desenvolvimento
  if (process.env.NODE_ENV === "development") {
    console.log(`[Middleware] ${request.method} ${pathname}`);
  }

  // Verificar redirects do website PRIMEIRO
  const redirectTo = getWebsiteRedirect(pathname);
  if (redirectTo) {
    console.log(`[Middleware] Redirect: ${pathname} -> ${redirectTo}`);

    const redirectUrl = new URL(redirectTo, request.url);
    return NextResponse.redirect(redirectUrl, { status: 301 });
  }

  // Roteamento baseado no pathname
  if (isDashboardRoute(pathname)) {
    // Rota do dashboard - manter como está
    const response = NextResponse.next();
    return setupDevCookies(request, response);
  }

  if (isAuthRoute(pathname)) {
    // Rotas de autenticação - manter como estão
    const response = NextResponse.next();
    return setupDevCookies(request, response);
  }

  if (isWebsiteRoute(pathname) || pathname === "/") {
    // Rotas do website - reescrever para /website/[...slug]
    let websitePath: string;

    if (pathname === "/") {
      // Rota raiz vai para /website/page.tsx
      websitePath = "/website";
    } else {
      // Outras rotas vão para /website/[pasta]/page.tsx
      websitePath = `/website${pathname}`;
    }

    console.log(`[Middleware] Website rewrite: ${pathname} -> ${websitePath}`);

    const response = NextResponse.rewrite(new URL(websitePath, request.url));

    // Aplicar headers específicos do website
    const responseWithHeaders = applyWebsiteHeaders(response, pathname);

    return setupDevCookies(request, responseWithHeaders);
  }

  // Para rotas não reconhecidas, próximo
  const response = NextResponse.next();
  return setupDevCookies(request, response);
}

/**
 * Configuração do matcher
 * Define quais rotas o middleware deve processar
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, logos, icons)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|logos|icons|manifest.json|empty-state).*)",
  ],
};
