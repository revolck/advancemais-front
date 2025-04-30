import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Aqui você pode adicionar lógicas específicas para o site
  // Como redirecionamentos, verificação de idioma, etc.

  // Por exemplo, redirecionar URLs antigas para novas
  if (pathname === '/antiga-pagina') {
    return NextResponse.redirect(new URL('/nova-pagina', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Aplicar apenas às rotas do website (adicione padrões conforme necessário)
    '/((?!api|_next|dashboard|login|register|auth).*)',
  ],
};
