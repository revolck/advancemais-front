// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { AppProviders } from "./providers";
import { ConsentAwareVercelAnalytics } from "@/components/cookies/ConsentAwareVercelAnalytics";

/**
 * Layout raiz global da aplicação
 *
 * Layout simplificado sem ThemeProvider, focado apenas no essencial.
 * Configurações de fontes e estilos são gerenciadas diretamente no globals.css
 */

export const metadata: Metadata = {
  title: {
    template: "%s | Advance+",
    default: "Advance+ | Educação e Tecnologia",
  },
  description: "Plataforma integrada de educação, tecnologia e gestão",
  keywords: ["educação", "tecnologia", "gestão", "cursos", "Advance+"],
  authors: [{ name: "Advance+" }],
  robots: "index, follow",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://advancemais.com"
  ),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#001a57", // Usando a primary-color definida nas variáveis CSS
};

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
        <AppProviders>
          <div id="root-container" className="min-h-screen">
            {children}
          </div>
          <ConsentAwareVercelAnalytics />
        </AppProviders>
        <div id="modal-portal" />
        <div id="tooltip-portal" />
      </body>
    </html>
  );
}
