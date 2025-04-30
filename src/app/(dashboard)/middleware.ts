import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Este middleware será executado apenas para rotas dentro do dashboard

  // Por enquanto, permitir acesso a todas as rotas do dashboard
  // No futuro, você pode implementar verificação de autenticação aqui
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Rotas específicas do dashboard
    '/finance/:path*',
    '/settings/:path*',
    '/analytics/:path*',
  ],
};
