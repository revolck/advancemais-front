// src/app/website/middleware.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware específico para o Website
 *
 * Responsável por:
 * - Gerenciar rotas do site institucional
 * - Aplicar redirects de SEO
 * - Controlar cache de páginas estáticas
 * - Implementar A/B testing (se necessário)
 * - Gerenciar redirects temporários e permanentes
 */

// Tipos para configuração
type RedirectConfig = Record<string, string>;

interface WebsiteConfig {
  availablePages: string[];
  permanentRedirects: RedirectConfig;
  temporaryRedirects: RedirectConfig;
  staticPages: string[];
  dynamicPages: string[];
}

// Configurações do website
const WEBSITE_CONFIG: WebsiteConfig = {
  // Páginas disponíveis no website
  availablePages: [
    "/",
    "/sobre",
    "/contato",
    "/cursos",
    "/solucoes",
    "/plataforma",
    "/suporte",
    "/privacidade",
    "/termos",
    "/cookies",
    "/ouvidoria",
    "/faq",
    "/components", // Página de demonstração de componentes
  ],

  // Redirects permanentes (301)
  permanentRedirects: {
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
  } as RedirectConfig,

  // Redirects temporários (302)
  temporaryRedirects: {
    // Exemplo: '/promocao': '/cursos'
  } as RedirectConfig,

  // Páginas que requerem cache especial
  staticPages: ["/", "/sobre", "/privacidade", "/termos", "/cookies"],

  // Páginas dinâmicas que não devem ser cacheadas
  dynamicPages: ["/contato", "/suporte"],
};

/**
 * Verifica se a página existe no website
 */
function isValidWebsitePage(pathname: string): boolean {
  return WEBSITE_CONFIG.availablePages.includes(pathname);
}

/**
 * Verifica se existe um redirect permanente para a rota
 */
function getPermanentRedirect(pathname: string): string | null {
  return WEBSITE_CONFIG.permanentRedirects[pathname] || null;
}

/**
 * Verifica se existe um redirect temporário para a rota
 */
function getTemporaryRedirect(pathname: string): string | null {
  return WEBSITE_CONFIG.temporaryRedirects[pathname] || null;
}

/**
 * Aplica headers de cache baseado no tipo de página
 */
function applyCacheHeaders(
  response: NextResponse,
  pathname: string
): NextResponse {
  if (WEBSITE_CONFIG.staticPages.includes(pathname)) {
    // Cache longo para páginas estáticas
    response.headers.set(
      "Cache-Control",
      "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400"
    );
  } else if (WEBSITE_CONFIG.dynamicPages.includes(pathname)) {
    // Sem cache para páginas dinâmicas
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );
  } else {
    // Cache médio para outras páginas
    response.headers.set(
      "Cache-Control",
      "public, max-age=1800, s-maxage=3600, stale-while-revalidate=3600"
    );
  }

  return response;
}

/**
 * Aplica headers de SEO e segurança
 */
function applySEOHeaders(
  response: NextResponse,
  pathname: string
): NextResponse {
  // Headers de segurança
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Headers específicos para SEO
  if (pathname === "/") {
    response.headers.set("X-Robots-Tag", "index, follow, max-snippet:-1");
  } else if (["/privacidade", "/termos", "/cookies"].includes(pathname)) {
    response.headers.set("X-Robots-Tag", "noindex, follow");
  } else {
    response.headers.set("X-Robots-Tag", "index, follow");
  }

  return response;
}

/**
 * Implementa A/B testing (se necessário)
 */
function handleABTesting(
  request: NextRequest,
  pathname: string
): string | null {
  // Exemplo de A/B testing para página inicial
  if (pathname === "/" && process.env.ENABLE_AB_TESTING === "true") {
    const abTestCookie = request.cookies.get("ab_test_variant");

    if (!abTestCookie) {
      // Atribuir variante aleatoriamente
      const variant = Math.random() < 0.5 ? "A" : "B";
      // Retorna informação para definir cookie na resposta
      return variant;
    }
  }

  return null;
}

/**
 * Middleware do website
 */
export function websiteMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Log para desenvolvimento
  if (process.env.NODE_ENV === "development") {
    console.log(`[Website Middleware] Processing: ${pathname}`);
  }

  // Verificar redirects permanentes
  const permanentRedirectUrl = getPermanentRedirect(pathname);
  if (permanentRedirectUrl) {
    const redirectUrl = new URL(permanentRedirectUrl, request.url);

    console.log(
      `[Website] Permanent redirect: ${pathname} -> ${redirectUrl.pathname}`
    );

    return NextResponse.redirect(redirectUrl, { status: 301 });
  }

  // Verificar redirects temporários
  const temporaryRedirectUrl = getTemporaryRedirect(pathname);
  if (temporaryRedirectUrl) {
    const redirectUrl = new URL(temporaryRedirectUrl, request.url);

    console.log(
      `[Website] Temporary redirect: ${pathname} -> ${redirectUrl.pathname}`
    );

    return NextResponse.redirect(redirectUrl, { status: 302 });
  }

  // Verificar se é uma página válida
  if (!isValidWebsitePage(pathname)) {
    // Redirecionar para 404 personalizado do website
    const notFoundUrl = new URL("/website/not-found", request.url);
    return NextResponse.rewrite(notFoundUrl);
  }

  // Processar A/B testing
  const abVariant = handleABTesting(request, pathname);

  // Criar resposta
  let response = NextResponse.next();

  // Aplicar headers de cache
  response = applyCacheHeaders(response, pathname);

  // Aplicar headers de SEO e segurança
  response = applySEOHeaders(response, pathname);

  // Definir cookie de A/B testing se necessário
  if (abVariant) {
    response.cookies.set("ab_test_variant", abVariant, {
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    response.headers.set("X-AB-Test-Variant", abVariant);
  }

  // Headers personalizados para analytics
  response.headers.set("X-Page-Type", "website");
  response.headers.set("X-Pathname", pathname);

  return response;
}

/**
 * Configuração do matcher para o website
 */
export const config = {
  matcher: [
    // Processar todas as rotas do website
    "/((?!api|_next/static|_next/image|favicon.ico|images|logos|icons).*)",
  ],
};
