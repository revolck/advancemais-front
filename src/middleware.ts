import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;

  // Recursos estáticos e APIs não são processados pelo middleware
  const publicPaths = ['/api/', '/_next/', '/images/', '/favicon.ico'];

  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
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

  // Se o hostname começar com "app." (subdomínio app), permita que o roteamento interno do Next.js funcione
  if (hostname.startsWith('app.')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|fonts|images|favicon.ico).*)'],
};
