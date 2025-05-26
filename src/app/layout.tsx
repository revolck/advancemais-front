import type { Metadata } from "next";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToasterCustom } from "@/components/ui/custom/toast";
import HeaderWithBackground from "@/theme/website/header";
import WebsiteFooter from "@/theme/website/footer";
import "@/styles/globals.css";
import "@/styles/theme.css";

export const metadata: Metadata = {
  title: "IntegreApp - Plataforma de Gestão Integrada",
  description: "Solução completa para gestão empresarial e social",
  keywords: ["gestão", "plataforma", "integrada", "empresarial", "social"],
  authors: [{ name: "IntegreApp Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "IntegreApp - Plataforma de Gestão Integrada",
    description: "Solução completa para gestão empresarial e social",
    type: "website",
    locale: "pt_BR",
  },
};

/**
 * Layout principal da aplicação
 *
 * Configura o tema, elementos globais e estrutura básica
 * Implementa ThemeProvider para suporte ao modo claro/escuro
 * Usa o header refatorado com animação de fundo otimizada
 * Inclui o footer responsivo com navegação e redes sociais
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Meta tags e outros elementos de cabeçalho são gerenciados pelo Next.js */}
      </head>
      <body className="min-h-screen font-sans antialiased bg-gray-50 dark:bg-gray-900">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Header refatorado com background animation */}
          <HeaderWithBackground />

          {/* Conteúdo principal da aplicação */}
          <main className="relative z-10 min-h-screen">{children}</main>

          {/* Footer responsivo */}
          <WebsiteFooter />

          {/* Container centralizado de notificações do sistema */}
          <ToasterCustom
            position="top-right"
            theme="system"
            richColors={true}
            closeButton={false}
            maxToasts={5}
            gap={8}
            defaultDuration={5000}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
