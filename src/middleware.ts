import { NextRequest, NextResponse } from "next/server";

// Defina as rotas que não precisam de autenticação
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
];

// Defina as rotas que são APIs
const apiRoutes = ["/api/"];

// Middleware para proteção de rotas e segurança
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  const isApiRoute = apiRoutes.some((route) => pathname.startsWith(route));
  const authToken = request.cookies.get("auth-token")?.value;

  // Adiciona cabeçalhos de segurança para todas as respostas
  const response = NextResponse.next();

  // Cabeçalhos de segurança básicos para todas as rotas
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // Adiciona Content-Security-Policy para rotas não-API
  if (!isApiRoute) {
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'"
    );
  }

  // Verificação de autenticação para rotas protegidas (não-públicas)
  if (!isPublicRoute && !authToken) {
    // Se for uma requisição de API, retorna 401
    if (isApiRoute) {
      return NextResponse.json(
        { success: false, message: "Autenticação necessária" },
        { status: 401 }
      );
    }

    // Redireciona para a página de login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

// Configuração para quais caminhos o middleware deve ser executado
export const config = {
  matcher: [
    // Aplica a todas as rotas exceto arquivos estáticos e imagens
    "/((?!_next/static|_next/image|favicon.ico|public/|images/).*)",
  ],
};
