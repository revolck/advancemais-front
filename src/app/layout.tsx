// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/providers/theme-provider";
import "@/styles/globals.css";
import "@/styles/theme.css";

/**
 * Layout raiz global da aplicação
 *
 * Este layout é o mais alto nível e contém apenas as configurações
 * essenciais que são compartilhadas entre website e dashboard.
 *
 * Cada seção (website/dashboard) tem seu próprio layout específico
 * com suas particularidades de header, footer, etc.
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
  themeColor: "#00257D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div id="root-container" className="min-h-screen">
            {children}
          </div>
          <div id="modal-portal" />
          <div id="tooltip-portal" />
        </ThemeProvider>
      </body>
    </html>
  );
}
