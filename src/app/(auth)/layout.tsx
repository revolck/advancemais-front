import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Autenticação",
  description:
    "Acesse sua conta ou crie uma nova para utilizar nossa plataforma",
};

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Verificar se o usuário já está autenticado
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard"); // Redireciona usuários autenticados para o dashboard
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Lado esquerdo - Ilustração e informações */}
      <div className="hidden md:flex flex-col justify-between bg-primary p-8 text-primary-foreground">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-xl">AdvanceMais</span>
          </Link>
        </div>

        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{siteConfig.name}</h1>
          <p className="text-lg">{siteConfig.description}</p>

          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary-foreground/20 p-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <p>Acesso para toda sua equipe</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary-foreground/20 p-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <p>Tempo real e histórico completo</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary-foreground/20 p-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                </svg>
              </div>
              <p>Segurança e privacidade garantidas</p>
            </div>
          </div>
        </div>

        <div className="text-sm">
          &copy; {new Date().getFullYear()} {siteConfig.name}. Todos os direitos
          reservados.
        </div>
      </div>

      {/* Lado direito - Formulário de autenticação */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">{children}</div>
      </div>
    </div>
  );
}
