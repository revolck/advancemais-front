import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;

  // Recursos estáticos e APIs não são processados pelo middleware
  const publicPaths = ['/api/', '/_next/', '/images/', '/favicon.ico'];

  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Se o hostname começar com "app." (subdomínio app), acesse o dashboard
  if (hostname.startsWith('app.')) {
    // Reescrever a URL para acessar as páginas em (dashboard)
    // sem mostrar "dashboard" na URL do navegador
    const url = request.nextUrl.clone();

    // Se a raiz do app (app.localhost:3001/), redirecionar para analytics
    if (pathname === '/') {
      url.pathname = '/analytics';
      return NextResponse.redirect(url);
    }

    // Reescrever internamente para o Next.js processar a rota correta
    // Exemplo: app.localhost:3001/analytics -> (dashboard)/analytics
    return NextResponse.rewrite(new URL(`/${pathname}`, request.url));
  }

  // Para o site principal (sem subdomínio app)
  // Se alguém tentar acessar /dashboard, redirecione para o subdomínio
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    const url = new URL(request.url);
    url.hostname = `app.${url.hostname}`;
    // Remover "dashboard" da URL
    url.pathname = pathname.replace('/dashboard', '') || '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|fonts|images|favicon.ico).*)'],
};
