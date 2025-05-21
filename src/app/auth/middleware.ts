// src/app/auth/middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Não redirecionamos mais /auth/login para a raiz
  // Isso estava causando problemas com os estilos
  // Apenas permitimos que a rota /auth/login seja renderizada normalmente

  // Apenas gerencie redirecionamentos para outras rotas de autenticação, se necessário
  if (pathname.startsWith("/auth/") && pathname !== "/auth/login") {
    // Aqui você pode adicionar lógica específica para outras rotas de autenticação
    // Por exemplo, redirecionar rotas protegidas para login
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Específico para o subdomínio auth
    "/auth/:path*",
  ],
};
