// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { validateEnvVars } from "@/lib/env";
import "@/styles/globals.css";

/**
 * Layout raiz global da aplicação
 *
 * Layout simplificado sem ThemeProvider, focado apenas no essencial.
 * Configurações de fontes e estilos são gerenciadas diretamente no globals.css
 */
export const metadata: Metadata = {
  title: {
    template: "%s | AdvanceMais",
    default: "AdvanceMais - Educação e Tecnologia",
  },
  description: "Plataforma integrada de educação, tecnologia e gestão",
  keywords: ["educação", "tecnologia", "gestão", "cursos", "AdvanceMais"],
  authors: [{ name: "AdvanceMais" }],
  robots: "index, follow",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://advancemais.com.br"
  ),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#001a57", // Usando a primary-color definida nas variáveis CSS
};

// Validar env vars na inicialização (apenas no servidor)
if (typeof window === "undefined") {
  validateEnvVars();
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="font-sans antialiased">
        <div id="root-container" className="min-h-screen">
          {children}
        </div>
        <div id="modal-portal" />
        <div id="tooltip-portal" />
      </body>
    </html>
  );
}
