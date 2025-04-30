import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Este middleware será executado apenas para rotas dentro do dashboard

  // *** EXEMPLO DE VERIFICAÇÃO DE ROLES (COMENTADO) ***
  // No futuro, você poderá implementar algo assim:

  /*
  // Obter a sessão do usuário
  const session = await getSession(request)
  
  // Verificar se o usuário está autenticado
  if (!session) {
    return NextResponse.redirect('/login')
  }
  
  // Mapeamento de páginas para roles necessárias
  const pageRoles = {
    '/dashboard/users': ['ADMIN', 'SUPER_ADMIN'],
    '/dashboard/settings': ['ADMIN', 'SUPER_ADMIN'],
    '/dashboard/reports': ['ADMIN', 'MANAGER', 'ANALYST'],
    // ... outras rotas e roles
  }
  
  // Verificar se o usuário tem permissão para acessar a página
  const userRoles = session.user.roles || []
  const requiredRoles = pageRoles[pathname]
  
  if (requiredRoles && !requiredRoles.some(role => userRoles.includes(role))) {
    // Redirecionar para uma página de acesso negado
    return NextResponse.redirect('/dashboard/access-denied')
  }
  */

  // Por enquanto, permitir acesso a todas as rotas do dashboard
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
